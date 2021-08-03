--
-- Name: road_stats; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE road_stats (
	id text PRIMARY KEY,
	admin_id int REFERENCES admin_boundaries,
	stats jsonb
);

CREATE INDEX road_stats_road_idx ON road_stats USING btree (id);
CREATE INDEX road_sttats_admin_idx ON road_stats USING btree (admin_id);
