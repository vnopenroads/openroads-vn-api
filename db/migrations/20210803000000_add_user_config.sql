--
-- Name: cba_user_config; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

DROP TABLE cba_user_configs;

CREATE TABLE cba_user_configs (
	id SERIAL PRIMARY KEY,
    name text UNIQUE,
    discount_rate float NOT NULL,
    economic_factor float NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX cba_user_configs_idx ON cba_user_configs USING btree (id);

