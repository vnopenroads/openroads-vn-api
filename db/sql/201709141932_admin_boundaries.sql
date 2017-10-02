CREATE EXTENSION postgis;

--
-- Name: admin_boundaries; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TYPE admin_level AS ENUM ('nation', 'province', 'district', 'commune');

CREATE TABLE admin_boundaries (
	id int PRIMARY KEY,
	geom geometry NOT NULL,
	parent_id int,
	type admin_level NOT NULL, 
	name_en text NOT NULL,
	name_vn text
);

CREATE INDEX admin_boundaries_idx ON admin_boundaries USING btree (id);
CREATE INDEX admin_boundaries_geom_idx ON admin_boundaries USING GIST (geom);
