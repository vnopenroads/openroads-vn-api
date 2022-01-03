--
-- Name: road_properties; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE road_properties (
	id text PRIMARY KEY,
	properties jsonb NOT NULL
);

CREATE INDEX road_properties_idx ON road_properties USING btree (id);

--
-- Name: point_properties; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TYPE point_property_source AS ENUM ('RoadLabPro', 'RouteShoot', 'manual');

CREATE TABLE point_properties (
	id SERIAL PRIMARY KEY,
	geom geometry NOT NULL,
	source point_property_source NOT NULL,
	datetime timestamp NOT NULL,
	road_id text REFERENCES road_properties,
	properties jsonb NOT NULL
);

CREATE INDEX point_properties_geom_idx ON point_properties USING GIST (geom);
CREATE INDEX point_properties_datetime_idx ON point_properties USING btree (datetime);
CREATE INDEX point_properties_road_idx ON point_properties USING btree (road_id);
