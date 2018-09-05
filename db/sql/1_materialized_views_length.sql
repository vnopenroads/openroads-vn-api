--
-- Create materialized views for calculating WON and GPROMM length. This is used in the openroads-vn-tiler at a later stage.
--

CREATE MATERIALIZED VIEW points AS
SELECT wn.way_id,
    ST_MAKEPOINT(
    n.longitude::FLOAT / 10000000,
    n.latitude::FLOAT / 10000000
    ) AS geom
FROM current_way_nodes AS wn
LEFT JOIN current_ways AS w ON wn.way_id = w.id
LEFT JOIN current_nodes AS n ON wn.node_id = n.id
WHERE w.visible IS TRUE
ORDER BY way_id,
    sequence_id;

CREATE index points_geom_idx on points using gist(geom);

CREATE MATERIALIZED VIEW lines AS
SELECT way_id,
    ST_MAKELINE(ARRAY_AGG(geom)) AS geom
FROM points
GROUP BY way_id;

CREATE index lines_geom_idx on lines using gist(geom);

CREATE MATERIALIZED VIEW lines_admin AS
SELECT l.way_id, l.geom,
AVG(ST_LENGTH(l.geom::GEOGRAPHY)) / 1000 AS length,
a.id as district, a.parent_id as province
FROM lines l
FULL JOIN admin_boundaries a ON ST_contains(a.geom, l.geom) WHERE a.type='district'
GROUP BY way_id, l.geom, a.id, a.parent_id;