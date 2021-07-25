CREATE OR REPLACE FUNCTION normalise_condition(x text) RETURNS text AS $$
DECLARE
  xx text := lower(x);
BEGIN
  IF xx = '1' THEN RETURN 1;
  ELSIF xx = '2' THEN RETURN 2;
  ELSIF xx = '3' THEN RETURN 3;
  ELSIF xx = '4' THEN RETURN 4;
  ELSIF xx = '5' THEN RETURN 5;
  ELSIF xx = 'very good' THEN RETURN 1;
  ELSIF xx = 'good' THEN RETURN 2;
  ELSIF xx = 'fair' THEN RETURN 3;
  ELSIF xx = 'poor' OR xx = 'bad' THEN RETURN 4;
  ELSIF xx = 'very poor' THEN RETURN 5;
  ELSE RETURN x;
  END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;

CREATE OR REPLACE FUNCTION normalise_link_class(x text) RETURNS text AS $$
DECLARE
  xx text := lower(x);
BEGIN
  IF xx = 'class i' THEN RETURN 1;
  ELSIF xx = 'class ii' THEN RETURN 2;
  ELSIF xx = 'class iii' THEN RETURN 3;
  ELSIF xx = 'class iv' THEN RETURN 4;
  ELSIF xx = 'class v' THEN RETURN 5;
  ELSIF xx = 'class vi' THEN RETURN 6;
  ELSIF xx = 'a' THEN RETURN 7;
  ELSIF xx = 'b' THEN RETURN 8;
  ELSIF xx = 'c' THEN RETURN 9;
  ELSIF xx = 'd' THEN RETURN 10;
  ELSE RETURN x;
END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;

CREATE OR REPLACE FUNCTION normalise_surface(x text) RETURNS text AS $$
DECLARE
  xx text := lower(x);
BEGIN
  IF xx = '1' OR xx = '2' OR xx = '3' THEN RETURN 1;
  ELSIF xx = '4' OR xx = '5' THEN RETURN 2;
  ELSIF xx = 'concrete' OR xx = 'asphalt' OR xx = 'paved' OR xx = 'concrete:lanes' THEN RETURN 1;
  ELSIF xx = 'ground' OR xx = 'unpaved' OR xx = 'earth' THEN RETURN 2;
  ELSE RETURN x;
  END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;
select normalise_surface('paved');


DROP VIEW V_roads_cba;

CREATE OR REPLACE VIEW V_roads_cba AS
WITH vpromms AS (SELECT way_id, v AS vp_id from current_way_tags WHERE k = 'or_vpromms'),
     len AS (SELECT id AS vp_id, properties ->> 'length' AS length FROM road_properties),
     surface AS (SELECT way_id, normalise_surface(v) AS surface FROM current_way_tags WHERE k = 'surface'),
     cond AS (SELECT way_id, normalise_condition(v) AS condition FROM current_way_tags WHERE k = 'or_section_pavement_condition' OR k = 'or_condition'),
     aadt_mcyc as (SELECT way_id, v as aadt_mcyc FROM get_specific_tag('or_section_motorcycle')),
     aadt_sc as (SELECT way_id, v as aadt_sc FROM get_specific_tag('or_section_small_car')),
     aadt_mc as (SELECT way_id, v as aadt_mc FROM get_specific_tag('or_section_medium_car')),
     aadt_dv as (SELECT way_id, v as aadt_dv FROM get_specific_tag('or_section_delivery_vehicle')),
     aadt_lt as (SELECT way_id, v as aadt_lt FROM get_specific_tag('or_section_light_truck')),
     aadt_mt as (SELECT way_id, v as aadt_mt FROM get_specific_tag('or_section_medium_truck')),
     aadt_ht as (SELECT way_id, v as aadt_ht FROM get_specific_tag('or_section_heavy_truck')),
     aadt_at as (SELECT way_id, v as aadt_at FROM get_specific_tag('or_section_articulated_truck')),
     aadt_sb as (SELECT way_id, v as aadt_sb FROM get_specific_tag('or_section_small_bus')),
     aadt_mb as (SELECT way_id, v as aadt_mb FROM get_specific_tag('or_section_medium_bus')),
     aadt_lb as (SELECT way_id, v as aadt_lb FROM get_specific_tag('or_section_large_bus')),
     lanes as (SELECT way_id, v as lanes FROM get_specific_tag('or_section_lanes'))
SELECT l.way_id, vpromms.vp_id, l.province, l.district, len.length as vp_length, l.length, surface, condition, lanes,
       aadt_mcyc, aadt_sc, aadt_mc, aadt_dv, aadt_lt, aadt_mt, aadt_ht, aadt_at, aadt_sb, aadt_mb, aadt_lb
FROM lines_with_admin l
LEFT JOIN vpromms ON l.way_id = vpromms.way_id
LEFT JOIN len ON vpromms.vp_id = len.vp_id
LEFT JOIN surface ON l.way_id = surface.way_id
LEFT JOIN cond ON l.way_id = cond.way_id
LEFT JOIN aadt_mcyc ON l.way_id = aadt_mcyc.way_id
LEFT JOIN aadt_sc ON l.way_id = aadt_sc.way_id
LEFT JOIN aadt_mc ON l.way_id = aadt_mc.way_id
LEFT JOIN aadt_dv ON l.way_id = aadt_dv.way_id
LEFT JOIN aadt_lt ON l.way_id = aadt_lt.way_id
LEFT JOIN aadt_mt ON l.way_id = aadt_mt.way_id
LEFT JOIN aadt_ht ON l.way_id = aadt_ht.way_id
LEFT JOIN aadt_at ON l.way_id = aadt_at.way_id
LEFT JOIN aadt_sb ON l.way_id = aadt_sb.way_id
LEFT JOIN aadt_mb ON l.way_id = aadt_mb.way_id
LEFT JOIN aadt_lb ON l.way_id = aadt_lb.way_id
LEFT JOIN lanes ON l.way_id = lanes.way_id
WHERE l.length>0
;


CREATE OR REPLACE FUNCTION get_specific_tag(_property_name text)
  RETURNS TABLE ( way_id bigint, v character varying(255))
  LANGUAGE plpgsql AS
$func$
BEGIN
  RETURN QUERY
    SELECT cwt.way_id, cwt.v FROM current_way_tags cwt WHERE cwt.k = _property_name;
  END
$func$;
