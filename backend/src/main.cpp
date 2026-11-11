#include <cstdlib>
#include <iostream>
#include <string>

#include <libpq-fe.h>
#include "httplib.h"

int main() {
    const char* database_url = std::getenv("DATABASE_URL");
    if (database_url == nullptr || database_url[0] == '\0') {
        std::cerr << "DATABASE_URL is not set. Check your Docker Compose environment.\n";
        return 1;
    }

    httplib::Server server;

    // Allow the React frontend to call this API from a different origin
    // (needed when running in Docker / locally on separate ports).
    // Harmless in JupyterHub, where the proxy makes everything same-origin.
    server.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Methods", "GET, OPTIONS"},
        {"Access-Control-Allow-Headers", "Content-Type"}
    });

    // Return the total number of tracked lots from Supabase
server.Get("/api/stats/lots", [database_url](const httplib::Request&, httplib::Response& res) {
    PGconn* conn = PQconnectdb(database_url);

    if (PQstatus(conn) != CONNECTION_OK) {
        res.status = 503;
        res.set_content(R"({"error":"Database connection unavailable"})", "application/json");
        PQfinish(conn);
        return;
    }

    PGresult* result = PQexec(conn, "SELECT COUNT(*) FROM public.lots");

    if (PQresultStatus(result) != PGRES_TUPLES_OK) {
        res.status = 500;
        res.set_content(R"({"error":"Database query failed"})", "application/json");
    } else {
        std::string count = PQgetvalue(result, 0, 0);
        res.set_content("{\"tracked_lots\":" + count + "}", "application/json");
    }

    PQclear(result);
    PQfinish(conn);
});

    server.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_content(R"({"status":"ok","service":"S.P.R.E.A.D. API"})", "application/json");
    });

    server.Get("/api/summary",
    [database_url](const httplib::Request&,
                   httplib::Response& res) {

    PGconn* conn = PQconnectdb(database_url);

    if (PQstatus(conn) != CONNECTION_OK) {
        res.status = 503;
        res.set_content(
            R"({"error":"Database unavailable"})",
            "application/json"
        );
        PQfinish(conn);
        return;
    }

    PGresult* result = PQexec(conn, R"SQL(
        SELECT
            (SELECT COUNT(*) FROM public.illness_reports)
                AS reported_cases,
            (SELECT COUNT(*) FROM public.lots)
                AS tracked_lots,
            (SELECT COUNT(*) FROM public.locations)
                AS locations
    )SQL");

    if (PQresultStatus(result) == PGRES_TUPLES_OK &&
        PQntuples(result) > 0) {

        std::string json =
            "{\"reported_cases\":" +
            std::string(PQgetvalue(result, 0, 0)) +
            ",\"tracked_lots\":" +
            std::string(PQgetvalue(result, 0, 1)) +
            ",\"locations\":" +
            std::string(PQgetvalue(result, 0, 2)) +
            "}";

        res.set_content(json, "application/json");
    } else {
        res.status = 500;
        res.set_content(
            R"({"error":"Summary query failed"})",
            "application/json"
        );
    }

    PQclear(result);
    PQfinish(conn);
});

    server.Get(R"(/api/lots/(\d+))", [database_url](const httplib::Request& req, httplib::Response& res) {
        const std::string lot_id = req.matches[1].str();
        PGconn* conn = PQconnectdb(database_url);
        if (PQstatus(conn) != CONNECTION_OK) {
            std::cerr << "PostgreSQL connection failed: " << PQerrorMessage(conn);
            res.status = 503;
            res.set_content(R"({"error":"Database connection unavailable"})", "application/json");
            PQfinish(conn);
            return;
        }

        const char* values[1] = {lot_id.c_str()};
        const char* sql = R"SQL(
            SELECT row_to_json(record)::text
            FROM (
                SELECT l.lot_id, l.lot_code, fp.product_name,
                       loc.location_name AS production_location,
                       l.production_date, l.expiration_date
                FROM public.lots AS l
                JOIN public.food_products AS fp ON fp.product_id = l.product_id
                JOIN public.locations AS loc ON loc.location_id = l.production_location_id
                WHERE l.lot_id = $1::integer
            ) AS record
        )SQL";
        PGresult* result = PQexecParams(conn, sql, 1, nullptr, values, nullptr, nullptr, 0);
        if (PQresultStatus(result) != PGRES_TUPLES_OK) {
            std::cerr << "Lot query failed: " << PQerrorMessage(conn);
            res.status = 500;
            res.set_content(R"({"error":"Database query failed"})", "application/json");
        } else if (PQntuples(result) == 0) {
            res.status = 404;
            res.set_content(R"({"error":"Lot not found"})", "application/json");
        } else {
            res.set_content(PQgetvalue(result, 0, 0), "application/json");
        }
        PQclear(result);
        PQfinish(conn);
    });


    // Case records contain *candidate* lot matches, not proof of causation.
    server.Get("/api/illness-reports", [database_url](const httplib::Request&, httplib::Response& res) {
        PGconn* conn = PQconnectdb(database_url);
        if (PQstatus(conn) != CONNECTION_OK) {
            res.status = 503;
            res.set_content(R"({"error":"Database unavailable"})", "application/json");
            PQfinish(conn);
            return;
        }
        const char* sql = R"SQL(
            SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.illness_id, t.exposure_id), '[]'::json)::text
            FROM (
                SELECT ir.illness_id, e.exposure_id, ir.report_date, ir.onset_date,
                       ir.outcome, ir.outbreak_id,
                       loc.location_name,
                       COALESCE(known_lot.lot_code, candidate.lot_code) AS lot_code,
                       CASE WHEN e.exposure_id IS NULL THEN 'No exposure reported'
                            WHEN e.lot_id IS NOT NULL THEN 'Identified lot (causation unconfirmed)'
                            WHEN candidate.lot_code IS NOT NULL THEN 'Suspected match'
                            ELSE 'Lot unknown' END AS status
                FROM public.illness_reports ir
                LEFT JOIN public.exposures e ON e.illness_id = ir.illness_id
                LEFT JOIN public.locations loc ON loc.location_id = e.location_id
                LEFT JOIN public.lots known_lot ON known_lot.lot_id = e.lot_id
                LEFT JOIN LATERAL (
                    SELECT l.lot_code
                    FROM public.lots l
                    JOIN public.shipment_items si ON si.lot_id = l.lot_id
                    JOIN public.shipments s ON s.shipment_id = si.shipment_id
                    WHERE l.product_id = e.product_id
                      AND s.destination_location_id = e.location_id
                      AND s.arrival_date IS NOT NULL
                      AND e.exposure_date IS NOT NULL
                      AND s.arrival_date <= e.exposure_date
                    ORDER BY s.arrival_date DESC, l.lot_id
                    LIMIT 1
                ) candidate ON e.lot_id IS NULL
            ) t
        )SQL";
        PGresult* result = PQexec(conn, sql);
        if (PQresultStatus(result) == PGRES_TUPLES_OK && PQntuples(result) == 1) {
            res.set_content(PQgetvalue(result, 0, 0), "application/json");
        } else {
            std::cerr << "Illness report query failed: " << PQerrorMessage(conn);
            res.status = 500;
            res.set_content(R"({"error":"Illness report query failed"})", "application/json");
        }
        PQclear(result);
        PQfinish(conn);
    });

    // Map markers indicate *reported exposure locations*, not confirmed outbreak origins.
    server.Get("/api/outbreak-locations", [database_url](const httplib::Request&, httplib::Response& res) {
        PGconn* conn = PQconnectdb(database_url);
        if (PQstatus(conn) != CONNECTION_OK) {
            res.status = 503;
            res.set_content(R"({"error":"Database unavailable"})", "application/json");
            PQfinish(conn);
            return;
        }
        PGresult* result = PQexec(conn, R"SQL(
            SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.location_name), '[]'::json)::text
            FROM (
                SELECT loc.location_id, loc.location_name, loc.latitude, loc.longitude,
                       COUNT(DISTINCT e.illness_id) AS reported_cases
                FROM public.exposures e
                JOIN public.locations loc ON loc.location_id = e.location_id
                WHERE loc.latitude IS NOT NULL AND loc.longitude IS NOT NULL
                GROUP BY loc.location_id, loc.location_name, loc.latitude, loc.longitude
            ) t
        )SQL");
        if (PQresultStatus(result) == PGRES_TUPLES_OK && PQntuples(result) == 1) {
            res.set_content(PQgetvalue(result, 0, 0), "application/json");
        } else {
            std::cerr << "Map query failed: " << PQerrorMessage(conn);
            res.status = 500;
            res.set_content(R"({"error":"Map query failed"})", "application/json");
        }
        PQclear(result);
        PQfinish(conn);
    });

    // Return each shipment leg carrying the specified lot.
    server.Get(R"(/api/lots/(\d+)/shipments)", [database_url](const httplib::Request& req, httplib::Response& res) {
        const std::string lot_id = req.matches[1].str();
        PGconn* conn = PQconnectdb(database_url);
        if (PQstatus(conn) != CONNECTION_OK) {
            res.status = 503;
            res.set_content(R"({"error":"Database unavailable"})", "application/json");
            PQfinish(conn);
            return;
        }
        const char* params[1] = { lot_id.c_str() };
        PGresult* result = PQexecParams(conn, R"SQL(
            SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.ship_date, t.shipment_id), '[]'::json)::text
            FROM (
                SELECT s.shipment_id, s.ship_date, s.arrival_date, s.shipment_status,
                       orig.location_name AS origin, dest.location_name AS destination,
                       orig.location_type AS origin_type, dest.location_type AS destination_type,
                       si.quantity_shipped, si.quantity_unit
                FROM public.shipment_items si
                JOIN public.shipments s ON s.shipment_id = si.shipment_id
                JOIN public.locations orig ON orig.location_id = s.origin_location_id
                JOIN public.locations dest ON dest.location_id = s.destination_location_id
                WHERE si.lot_id = $1::integer
            ) t
        )SQL", 1, nullptr, params, nullptr, nullptr, 0);
        if (PQresultStatus(result) == PGRES_TUPLES_OK && PQntuples(result) == 1) {
            res.set_content(PQgetvalue(result, 0, 0), "application/json");
        } else {
            std::cerr << "Shipments query failed: " << PQerrorMessage(conn);
            res.status = 500;
            res.set_content(R"({"error":"Shipments query failed"})", "application/json");
        }
        PQclear(result);
        PQfinish(conn);
    });

    // Leave the existing product endpoint as a demonstration until its query is migrated.
    server.Get(R"(/api/products/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        const std::string product_id = req.matches[1].str();
        const std::string json = "{\"product_id\":" + product_id +
            ",\"product_name\":\"Chicken Breast\",\"status\":\"safe\"}";
        res.set_content(json, "application/json");
    });

    std::cout << "S.P.R.E.A.D. API running on port 8080..." << std::endl;
    server.listen("0.0.0.0", 8080);
    return 0;
}
