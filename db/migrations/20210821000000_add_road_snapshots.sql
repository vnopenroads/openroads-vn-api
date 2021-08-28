--
-- Name: cba_user_config; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

-- Metadata table to manage road snapshots
DROP TABLE cba_road_snapshots;
CREATE TABLE cba_road_snapshots (
  	id SERIAL PRIMARY KEY,
    name text,
    province_name text NOT NULL DEFAULT '',
    province_id float NOT NULL DEFAULT -1,
    district_name text NOT NULL DEFAULT '',
    district_id float NOT NULL DEFAULT -1,
    num_records int NOT NULL DEFAULT 0,
    valid_records int NOT NULL DEFAULT 0,
    invalid_reasons jsonb DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX cba_road_snapshots_idx ON cba_road_snapshots USING btree (id);

INSERT INTO cba_road_snapshots(name, province_name, province_id, num_records, valid_records)
VALUES ('Ha Giang 202108', 'Ha Ziang', 294, 1884, 980),
       ('Ha Gaing 202104', 'Ha Ziang', 294, 1884, 655);


-- And the data table to store the snapshotted records
DROP TABLE cba_road_snapshots_data;
CREATE TABLE cba_road_snapshots_data (
  	id SERIAL PRIMARY KEY,
    cba_road_snapshot_id bigint,
    way_id bigint,
    vp_id character varying(255),
    province integer,
    district integer,
    vp_length text,
    length double precision,
    surface_type text,
    condition text,
    pave_age double precision,
    traffic_level character varying,
    road_type character varying,
    width double precision,
    lanes text,
    terrain character varying,
    aadt_mcyc text,
    aadt_sc text,
    aadt_mc text,
    aadt_dv text,
    aadt_lt text,
    aadt_mt text,
    aadt_ht text,
    aadt_at text,
    aadt_sb text,
    aadt_mb text,
    aadt_lb text
);
CREATE INDEX cba_road_snapshots_data_idx ON cba_road_snapshots USING btree (id);


INSERT INTO cba_road_snapshots_data (cba_road_snapshot_id, way_id, vp_id, province, district, vp_length, length, surface_type, condition, pave_age, 
                                     traffic_level, road_type, width, lanes, terrain, aadt_mcyc, aadt_sc,aadt_mc,aadt_dv,aadt_lt,
                                     aadt_mt, aadt_ht, aadt_at,aadt_sb, aadt_mb,aadt_lb )
SELECT 1 as cba_road_snapshot_id, 
       way_id, vp_id, province, district, vp_length, length,
       surface_type, condition, pave_age, traffic_level, road_type, width, lanes, terrain,
       aadt_mcyc, aadt_sc, aadt_mc, aadt_dv, aadt_lt, aadt_mt, aadt_ht, aadt_at, aadt_sb, aadt_mb, aadt_lb
FROM v_roads_cba
WHERE province = 294
;
