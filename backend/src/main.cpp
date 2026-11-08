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

    server.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_content(R"({"status":"ok","service":"S.P.R.E.A.D. API"})", "application/json");
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
