-- S.P.R.E.A.D. Data Quality Validation
-- Read-only: does not modify any records.

SELECT
    'Shipment arrives before departure' AS issue,
    COUNT(*) AS affected_records
FROM public.shipments
WHERE arrival_date < ship_date

UNION ALL

SELECT
    'Lot expires before production',
    COUNT(*)
FROM public.lots
WHERE expiration_date < production_date

UNION ALL

SELECT
    'Invalid shipment quantity',
    COUNT(*)
FROM public.shipment_items
WHERE quantity_shipped <= 0

UNION ALL

SELECT
    'Invalid production quantity',
    COUNT(*)
FROM public.lots
WHERE quantity_produced < 0

UNION ALL

SELECT
    'Shipment has same origin and destination',
    COUNT(*)
FROM public.shipments
WHERE origin_location_id = destination_location_id

UNION ALL

SELECT
    'Location missing coordinates',
    COUNT(*)
FROM public.locations
WHERE latitude IS NULL
   OR longitude IS NULL

UNION ALL

SELECT
    'Exposure lot/product mismatch',
    COUNT(*)
FROM public.exposures e
JOIN public.lots l
    ON e.lot_id = l.lot_id
WHERE e.product_id IS NOT NULL
  AND e.product_id <> l.product_id;
