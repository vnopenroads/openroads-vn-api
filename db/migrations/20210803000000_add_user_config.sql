--
-- Name: cba_user_config; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

-- DROP TABLE cba_user_config;

CREATE TABLE cba_user_config (
	id SERIAL PRIMARY KEY,
    name text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX cba_user_config_idx ON cba_user_config USING btree (id);

