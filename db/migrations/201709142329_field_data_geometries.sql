--
-- Name: field_data_geometries; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TYPE field_data_type AS ENUM ('RoadLabPro', 'RouteShoot');

CREATE TABLE field_data_geometries (
	id SERIAL PRIMARY KEY,
	geom geometry NOT NULL,
	type field_data_type NOT NULL,
	road_id text REFERENCES road_properties
);

CREATE INDEX field_data_geometries_geom_idx ON field_data_geometries USING GIST (geom);
CREATE INDEX field_data_geometries_road_idx ON field_data_geometries USING btree (road_id);
