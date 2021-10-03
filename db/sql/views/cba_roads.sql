DROP VIEW v_roads_cba;
CREATE OR REPLACE VIEW v_roads_cba AS
WITH vpromms AS (SELECT way_id, v AS vp_id from current_way_tags WHERE k = 'or_vpromms'),
     len AS (SELECT id AS vp_id, properties ->> 'length' AS length FROM road_properties),
     cond1      AS (SELECT way_id, normalise_condition(v) AS cond1 FROM current_way_tags WHERE k = 'or_condition'),
     cond2      AS (SELECT way_id, normalise_condition(v) AS cond2 FROM current_way_tags WHERE k = 'or_section_pavement_condition'),
     surface1   AS (SELECT way_id, normalise_surface(v) as surface1 FROM get_specific_tag('or_section_surface')),
     surface2   AS (SELECT way_id, normalise_surface(v) as surface2 FROM get_specific_tag('surface')),
     width      AS (SELECT way_id, normalise_width(v) as width FROM get_specific_tag('or_width')),
     pave_age   AS (SELECT way_id, normalise_age(v) as pave_age FROM get_specific_tag('or_section_pavement_age')),
     traffic    AS (SELECT way_id, v AS traffic_level FROM get_specific_tag('or_section_traffic')),
     road_class AS (SELECT way_id, normalise_road_class(v) AS road_class FROM get_specific_tag('or_link_class')),
     road_type  AS (SELECT way_id, v AS road_type FROM get_specific_tag('or_section_pavement')),
     lanes      AS (SELECT way_id, v AS lanes     FROM get_specific_tag('or_section_lanes')),
     terrain    AS (SELECT way_id, v AS terrain   FROM get_specific_tag('or_section_terrain')),
     aadt_mcyc  AS (SELECT way_id, v AS aadt_mcyc FROM get_specific_tag('or_section_motorcycle')),
     aadt_sc    AS (SELECT way_id, v AS aadt_sc   FROM get_specific_tag('or_section_small_car')),
     aadt_mc    AS (SELECT way_id, v AS aadt_mc   FROM get_specific_tag('or_section_medium_car')),
     aadt_dv    AS (SELECT way_id, v AS aadt_dv   FROM get_specific_tag('or_section_delivery_vehicle')),
     aadt_4wd   AS (SELECT way_id, v AS aadt_4wd  FROM get_specific_tag('or_section_four_wheel')),
     aadt_lt    AS (SELECT way_id, v AS aadt_lt   FROM get_specific_tag('or_section_light_truck')),
     aadt_mt    AS (SELECT way_id, v AS aadt_mt   FROM get_specific_tag('or_section_medium_truck')),
     aadt_ht    AS (SELECT way_id, v AS aadt_ht   FROM get_specific_tag('or_section_heavy_truck')),
     aadt_at    AS (SELECT way_id, v AS aadt_at   FROM get_specific_tag('or_section_articulated_truck')),
     aadt_sb    AS (SELECT way_id, v AS aadt_sb   FROM get_specific_tag('or_section_small_bus')),
     aadt_mb    AS (SELECT way_id, v AS aadt_mb   FROM get_specific_tag('or_section_medium_bus')),
     aadt_lb    AS (SELECT way_id, v AS aadt_lb   FROM get_specific_tag('or_section_large_bus'))
SELECT l.way_id, vpromms.vp_id, l.province, l.district, len.length as vp_length, l.length, 
       coalesce(surface1, surface2) as surface_type, coalesce(cond1,cond2) as condition, 
       pave_age, traffic_level, road_class, road_type, width, cast(lanes as int), terrain,
       cast(aadt_mcyc as text), cast(aadt_sc as text), cast(aadt_mc as text), cast(aadt_dv as text), 
       cast(aadt_lt as text), cast(aadt_mt as text), cast(aadt_ht as text), cast(aadt_at as text), 
       cast(aadt_sb as text), cast(aadt_mb as text), cast(aadt_lb as text)
FROM lines_with_admin l
LEFT JOIN vpromms ON l.way_id = vpromms.way_id
LEFT JOIN len ON vpromms.vp_id = len.vp_id
LEFT JOIN cond1 ON l.way_id = cond1.way_id
LEFT JOIN cond2 ON l.way_id = cond2.way_id
LEFT JOIN surface1 ON l.way_id = surface1.way_id
LEFT JOIN surface2 ON l.way_id = surface2.way_id
LEFT JOIN width ON l.way_id = width.way_id
LEFT JOIN pave_age ON l.way_id = pave_age.way_id
LEFT JOIN traffic ON l.way_id = traffic.way_id
LEFT JOIN road_class ON l.way_id = road_class.way_id
LEFT JOIN road_type ON l.way_id = road_type.way_id
LEFT JOIN lanes ON l.way_id = lanes.way_id
LEFT JOIN terrain ON l.way_id = terrain.way_id
LEFT JOIN aadt_mcyc ON l.way_id = aadt_mcyc.way_id
LEFT JOIN aadt_sc ON l.way_id = aadt_sc.way_id
LEFT JOIN aadt_mc ON l.way_id = aadt_mc.way_id
LEFT JOIN aadt_dv ON l.way_id = aadt_dv.way_id
LEFT JOIN aadt_4wd ON l.way_id = aadt_4wd.way_id
LEFT JOIN aadt_lt ON l.way_id = aadt_lt.way_id
LEFT JOIN aadt_mt ON l.way_id = aadt_mt.way_id
LEFT JOIN aadt_ht ON l.way_id = aadt_ht.way_id
LEFT JOIN aadt_at ON l.way_id = aadt_at.way_id
LEFT JOIN aadt_sb ON l.way_id = aadt_sb.way_id
LEFT JOIN aadt_mb ON l.way_id = aadt_mb.way_id
LEFT JOIN aadt_lb ON l.way_id = aadt_lb.way_id
WHERE l.length>0
;


SELECT v,count(*) from get_specific_tag('or_section_surface') group by v;