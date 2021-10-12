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

-- INSERT INTO cba_road_snapshots(name, province_name, province_id, num_records, valid_records)
-- VALUES ('Ha Giang 2021 October', 'Ha Ziang', 294, 1884, 1005);


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
    road_class double precision,
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


DROP TABLE cba_road_snapshots_data;

SELECT 1 as cba_road_snapshot_id, *
INTO cba_road_snapshots_data
FROM v_roads_cba
WHERE province = 294
;


DROP TABLE cba_snapshot_results;

CREATE TABLE cba_snapshot_results (
  	id SERIAL PRIMARY KEY,
    cba_road_snapshot_id bigint,
    cba_user_config_id bigint,
    way_id bigint,
    eirr double precision,
    esa_loading double precision,
    npv double precision,
    npv_cost double precision,
    npv_km double precision,
    truck_percent double precision,
    vehicle_utilization double precision,
    work_class text,
    work_cost double precision,
    work_cost_km double precision,
    work_name text,
    work_type text,
    work_year int
);
CREATE INDEX cba_snapshot_results_idx ON cba_snapshot_results USING btree (cba_road_snapshot_id);
 