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
  ELSIF xx = 'poor' OR xx = 'bad' OR xx = 'bad;poor' OR xx = '3;4' THEN RETURN 4;
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
  IF xx = '1' OR xx = 'concrete' OR xx = 'concrete:lanes' THEN RETURN 1;
  ELSIF xx = '2' OR xx = 'asphalt' THEN RETURN 2;
  ELSIF xx = '3' OR xx = 'paved' THEN RETURN 3;
  ELSIF xx = '4' OR xx = 'gravel' OR xx = 'unpaved' THEN RETURN 4;
  ELSIF xx = '5' OR xx = 'earth' OR xx = 'ground' THEN RETURN 5;
  ELSIF xx = '6' OR xx = 'macadam' THEN RETURN 6;
  ELSIF xx = '7' OR xx = 'cobblestone' THEN RETURN 7;
  ELSE RETURN 0;
  END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;

CREATE OR REPLACE FUNCTION normalise_width(xx text) RETURNS float AS $$
DECLARE
BEGIN
  IF xx = '6+' OR xx = '6;5' THEN RETURN 6.0;
  ELSE RETURN cast(xx as float);
  END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;


CREATE OR REPLACE FUNCTION normalise_age(x text) RETURNS float AS $$
DECLARE
  xx float := cast(x as float);
  current_year int := date_part('year', now()); 
  reference_year int := 2019;
BEGIN
  IF xx >= 1900 THEN RETURN current_year - xx;
  ELSE RETURN xx + current_year - reference_year;
  END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;


CREATE OR REPLACE FUNCTION normalise_road_class(x text) RETURNS float AS $$
DECLARE
  xx text := lower(x);
BEGIN
  IF xx = 'class i'      THEN RETURN 1.0;
  ELSIF xx = 'class ii'  THEN RETURN 2.0;
  ELSIF xx = 'class iii' THEN RETURN 3.0;
  ELSIF xx = 'class iv'  THEN RETURN 4.0;
  ELSIF xx = 'class v'   THEN RETURN 5.0;
  ELSIF xx = 'class vi'  THEN RETURN 6.0;
  ELSIF xx = 'a'         THEN RETURN 7.0;
  ELSIF xx = 'b'         THEN RETURN 8.0;
  ELSIF xx = 'c'         THEN RETURN 9.0;
  ELSIF xx = 'd'         THEN RETURN 10.0;
  ELSE RETURN cast(xx as float);
  END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;


CREATE OR REPLACE FUNCTION get_specific_tag(_property_name text)
  RETURNS TABLE ( way_id bigint, v character varying(255))
  LANGUAGE plpgsql AS
$func$
BEGIN
  RETURN QUERY
    SELECT cwt.way_id, cwt.v FROM current_way_tags cwt WHERE cwt.k = _property_name;
  END
$func$;
