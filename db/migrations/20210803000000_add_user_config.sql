--
-- Name: cba_user_config; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

DROP TABLE cba_user_configs;

CREATE TABLE cba_user_configs (
	id SERIAL PRIMARY KEY,
    name text UNIQUE,
    discount_rate float NOT NULL,
    economic_factor float NOT NULL,
    traffic_levels jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX cba_user_configs_idx ON cba_user_configs USING btree (id);

INSERT INTO cba_user_configs
  VALUES (1, 'default', 1.5, 0.2, '[{"volume": 25.0, "motor-cycle": 0.75, "small-car": 0.02, "medium-car": 0.05, "delivery": 0.01, "4-wheel": 0.01, "light-truck": 0.12, "medium-truck": 0.03, "heavy-truck": 0.0, "small-bus": 0.01, "medium-bus": 0.0, "large-bus": 0.0}, {"volume": 75.0, "motor-cycle": 0.75, "small-car": 0.02, "medium-car": 0.05, "delivery": 0.01, "4-wheel": 0.01, "light-truck": 0.12, "medium-truck": 0.03, "heavy-truck": 0.0, "small-bus": 0.01, "medium-bus": 0.0, "large-bus": 0.0}]'),
         (2, 'Config2', 2.5, 1.2, '[{"volume": 50.0, "motor-cycle": 50.0}]');


       
