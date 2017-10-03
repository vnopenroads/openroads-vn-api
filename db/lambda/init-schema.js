'use strict';

Promise = require('bluebird');

/**
 * makes macrocosm schema
 * @func macrocosmSchema
 */
function macrocosmSchema (knex, Promise) {
  // statements to add macrocosm schema
  return knex.raw(`
    CREATE TYPE nwr_enum AS ENUM (
      'Node',
      'Way',
      'Relation'
    );
    CREATE TYPE user_role_enum AS ENUM (
        'administrator',
        'moderator'
    );
    CREATE TYPE user_status_enum AS ENUM (
        'pending',
        'active',
        'confirmed',
        'suspended',
        'deleted'
    );
    CREATE TABLE changeset_tags (
        changeset_id bigint NOT NULL,
        k character varying(255) DEFAULT ''::character varying NOT NULL,
        v character varying(255) DEFAULT ''::character varying NOT NULL
    );
    CREATE TABLE changesets (
        id bigint NOT NULL,
        user_id bigint NOT NULL,
        created_at timestamp without time zone NOT NULL,
        min_lat integer,
        max_lat integer,
        min_lon integer,
        max_lon integer,
        closed_at timestamp without time zone NOT NULL,
        num_changes integer DEFAULT 0 NOT NULL
    );
    CREATE SEQUENCE changesets_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE changesets_id_seq OWNED BY changesets.id;
    CREATE TABLE current_node_tags (
        node_id bigint NOT NULL,
        k character varying(255) DEFAULT ''::character varying NOT NULL,
        v character varying(255) DEFAULT ''::character varying NOT NULL
    );
    CREATE TABLE current_nodes (
        id bigint NOT NULL,
        latitude integer NOT NULL,
        longitude integer NOT NULL,
        changeset_id bigint NOT NULL,
        visible boolean NOT NULL,
        "timestamp" timestamp without time zone NOT NULL,
        tile bigint NOT NULL,
        version bigint NOT NULL
    );
    CREATE SEQUENCE current_nodes_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE current_nodes_id_seq OWNED BY current_nodes.id;
    CREATE TABLE current_relation_members (
        relation_id bigint NOT NULL,
        member_type nwr_enum NOT NULL,
        member_id bigint NOT NULL,
        member_role character varying(255) NOT NULL,
        sequence_id integer DEFAULT 0 NOT NULL
    );
    CREATE TABLE current_relation_tags (
        relation_id bigint NOT NULL,
        k character varying(255) DEFAULT ''::character varying NOT NULL,
        v character varying(255) DEFAULT ''::character varying NOT NULL
    );
    CREATE TABLE current_relations (
        id bigint NOT NULL,
        changeset_id bigint NOT NULL,
        "timestamp" timestamp without time zone NOT NULL,
        visible boolean NOT NULL,
        version bigint NOT NULL
    );
    CREATE SEQUENCE current_relations_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE current_relations_id_seq OWNED BY current_relations.id;
    CREATE TABLE current_way_nodes (
        way_id bigint NOT NULL,
        node_id bigint NOT NULL,
        sequence_id bigint NOT NULL
    );
    CREATE TABLE current_way_tags (
        way_id bigint NOT NULL,
        k character varying(255) DEFAULT ''::character varying NOT NULL,
        v character varying(255) DEFAULT ''::character varying NOT NULL
    );
    CREATE TABLE current_ways (
        id bigint NOT NULL,
        changeset_id bigint NOT NULL,
        "timestamp" timestamp without time zone NOT NULL,
        visible boolean NOT NULL,
        version bigint NOT NULL
    );
    CREATE SEQUENCE current_ways_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE current_ways_id_seq OWNED BY current_ways.id;
    CREATE TABLE node_tags (
        node_id bigint NOT NULL,
        version bigint NOT NULL,
        k character varying(255) DEFAULT ''::character varying NOT NULL,
        v character varying(255) DEFAULT ''::character varying NOT NULL
    );
    CREATE TABLE nodes (
        node_id bigint NOT NULL,
        latitude integer NOT NULL,
        longitude integer NOT NULL,
        changeset_id bigint NOT NULL,
        visible boolean NOT NULL,
        "timestamp" timestamp without time zone NOT NULL,
        tile bigint NOT NULL,
        version bigint NOT NULL,
        redaction_id integer
    );
    CREATE TABLE oauth_nonces (
        id integer NOT NULL,
        nonce character varying(255),
        "timestamp" integer,
        created_at timestamp without time zone,
        updated_at timestamp without time zone
    );
    CREATE SEQUENCE oauth_nonces_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE oauth_nonces_id_seq OWNED BY oauth_nonces.id;
    CREATE TABLE oauth_tokens (
        id integer NOT NULL,
        user_id integer,
        type character varying(20),
        client_application_id integer,
        token character varying(50),
        secret character varying(50),
        authorized_at timestamp without time zone,
        invalidated_at timestamp without time zone,
        created_at timestamp without time zone,
        updated_at timestamp without time zone,
        allow_read_prefs boolean DEFAULT false NOT NULL,
        allow_write_prefs boolean DEFAULT false NOT NULL,
        allow_write_diary boolean DEFAULT false NOT NULL,
        allow_write_api boolean DEFAULT false NOT NULL,
        allow_read_gpx boolean DEFAULT false NOT NULL,
        allow_write_gpx boolean DEFAULT false NOT NULL,
        callback_url character varying(255),
        verifier character varying(20)
    );
    CREATE SEQUENCE oauth_tokens_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE oauth_tokens_id_seq OWNED BY oauth_tokens.id;
    CREATE TABLE relation_members (
        relation_id bigint DEFAULT 0 NOT NULL,
        member_type nwr_enum NOT NULL,
        member_id bigint NOT NULL,
        member_role character varying(255) NOT NULL,
        version bigint DEFAULT 0 NOT NULL,
        sequence_id integer DEFAULT 0 NOT NULL
    );
    CREATE TABLE relation_tags (
        relation_id bigint DEFAULT 0 NOT NULL,
        k character varying(255) DEFAULT ''::character varying NOT NULL,
        v character varying(255) DEFAULT ''::character varying NOT NULL,
        version bigint NOT NULL
    );
    CREATE TABLE relations (
        relation_id bigint DEFAULT 0 NOT NULL,
        changeset_id bigint NOT NULL,
        "timestamp" timestamp without time zone NOT NULL,
        version bigint NOT NULL,
        visible boolean DEFAULT true NOT NULL,
        redaction_id integer
    );
    CREATE TABLE schema_migrations (
        version character varying(255) NOT NULL
    );
    CREATE TABLE sessions (
        id integer NOT NULL,
        session_id character varying(255),
        data text,
        created_at timestamp without time zone,
        updated_at timestamp without time zone
    );
    CREATE SEQUENCE sessions_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE sessions_id_seq OWNED BY sessions.id;
    CREATE TABLE user_blocks (
        id integer NOT NULL,
        user_id bigint NOT NULL,
        creator_id bigint NOT NULL,
        reason text NOT NULL,
        ends_at timestamp without time zone NOT NULL,
        needs_view boolean DEFAULT false NOT NULL,
        revoker_id bigint,
        created_at timestamp without time zone,
        updated_at timestamp without time zone
    );
    CREATE SEQUENCE user_blocks_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE user_blocks_id_seq OWNED BY user_blocks.id;
    CREATE TABLE user_preferences (
        user_id bigint NOT NULL,
        k character varying(255) NOT NULL,
        v character varying(255) NOT NULL
    );
    CREATE TABLE user_roles (
        id integer NOT NULL,
        user_id bigint NOT NULL,
        created_at timestamp without time zone,
        updated_at timestamp without time zone,
        role user_role_enum NOT NULL,
        granter_id bigint NOT NULL
    );
    CREATE SEQUENCE user_roles_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE user_roles_id_seq OWNED BY user_roles.id;
    CREATE TABLE user_tokens (
        id bigint NOT NULL,
        user_id bigint NOT NULL,
        token character varying(255) NOT NULL,
        expiry timestamp without time zone NOT NULL,
        referer text
    );
    CREATE SEQUENCE user_tokens_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE user_tokens_id_seq OWNED BY user_tokens.id;
    CREATE TABLE users (
        email character varying(255) NOT NULL,
        id bigint NOT NULL,
        pass_crypt character varying(255) NOT NULL,
        creation_time timestamp without time zone NOT NULL,
        display_name character varying(255) DEFAULT ''::character varying NOT NULL,
        data_public boolean DEFAULT false NOT NULL,
        description text DEFAULT ''::text NOT NULL,
        home_lat double precision,
        home_lon double precision,
        home_zoom smallint DEFAULT 3,
        nearby integer DEFAULT 50,
        pass_salt character varying(255),
        image text,
        email_valid boolean DEFAULT false NOT NULL,
        new_email character varying(255),
        creation_ip character varying(255),
        languages character varying(255),
        status user_status_enum DEFAULT 'pending'::user_status_enum NOT NULL,
        terms_agreed timestamp without time zone,
        consider_pd boolean DEFAULT false NOT NULL,
        preferred_editor character varying(255),
        terms_seen boolean DEFAULT false NOT NULL,
        openid_url character varying(255)
    );
    CREATE SEQUENCE users_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE users_id_seq OWNED BY users.id;
    CREATE TABLE way_nodes (
        way_id bigint NOT NULL,
        node_id bigint NOT NULL,
        version bigint NOT NULL,
        sequence_id bigint NOT NULL
    );
    CREATE TABLE way_tags (
        way_id bigint DEFAULT 0 NOT NULL,
        k character varying(255) NOT NULL,
        v character varying(255) NOT NULL,
        version bigint NOT NULL
    );
    CREATE TABLE ways (
        way_id bigint DEFAULT 0 NOT NULL,
        changeset_id bigint NOT NULL,
        "timestamp" timestamp without time zone NOT NULL,
        version bigint NOT NULL,
        visible boolean DEFAULT true NOT NULL,
        redaction_id integer
    );
    ALTER TABLE changesets ALTER COLUMN id SET DEFAULT nextval('changesets_id_seq'::regclass);
    ALTER TABLE current_nodes ALTER COLUMN id SET DEFAULT nextval('current_nodes_id_seq'::regclass);
    ALTER TABLE current_relations ALTER COLUMN id SET DEFAULT nextval('current_relations_id_seq'::regclass);
    ALTER TABLE current_ways ALTER COLUMN id SET DEFAULT nextval('current_ways_id_seq'::regclass);
    ALTER TABLE oauth_nonces ALTER COLUMN id SET DEFAULT nextval('oauth_nonces_id_seq'::regclass);
    ALTER TABLE oauth_tokens ALTER COLUMN id SET DEFAULT nextval('oauth_tokens_id_seq'::regclass);
    ALTER TABLE sessions ALTER COLUMN id SET DEFAULT nextval('sessions_id_seq'::regclass);
    ALTER TABLE user_blocks ALTER COLUMN id SET DEFAULT nextval('user_blocks_id_seq'::regclass);
    ALTER TABLE user_roles ALTER COLUMN id SET DEFAULT nextval('user_roles_id_seq'::regclass);
    ALTER TABLE user_tokens ALTER COLUMN id SET DEFAULT nextval('user_tokens_id_seq'::regclass);
    ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);
    ALTER TABLE ONLY changesets
        ADD CONSTRAINT changesets_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY current_node_tags
        ADD CONSTRAINT current_node_tags_pkey PRIMARY KEY (node_id, k);
    ALTER TABLE ONLY current_nodes
        ADD CONSTRAINT current_nodes_pkey1 PRIMARY KEY (id);
    ALTER TABLE ONLY current_relation_members
        ADD CONSTRAINT current_relation_members_pkey PRIMARY KEY (relation_id, member_type, member_id, member_role, sequence_id);
    ALTER TABLE ONLY current_relation_tags
        ADD CONSTRAINT current_relation_tags_pkey PRIMARY KEY (relation_id, k);
    ALTER TABLE ONLY current_relations
        ADD CONSTRAINT current_relations_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY current_way_nodes
        ADD CONSTRAINT current_way_nodes_pkey PRIMARY KEY (way_id, sequence_id);
    ALTER TABLE ONLY current_way_tags
        ADD CONSTRAINT current_way_tags_pkey PRIMARY KEY (way_id, k);
    ALTER TABLE ONLY current_ways
        ADD CONSTRAINT current_ways_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY node_tags
        ADD CONSTRAINT node_tags_pkey PRIMARY KEY (node_id, version, k);
    ALTER TABLE ONLY nodes
        ADD CONSTRAINT nodes_pkey PRIMARY KEY (node_id, version);
    ALTER TABLE ONLY oauth_nonces
        ADD CONSTRAINT oauth_nonces_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY oauth_tokens
        ADD CONSTRAINT oauth_tokens_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY relation_members
        ADD CONSTRAINT relation_members_pkey PRIMARY KEY (relation_id, version, member_type, member_id, member_role, sequence_id);
    ALTER TABLE ONLY relation_tags
        ADD CONSTRAINT relation_tags_pkey PRIMARY KEY (relation_id, version, k);
    ALTER TABLE ONLY relations
        ADD CONSTRAINT relations_pkey PRIMARY KEY (relation_id, version);
    ALTER TABLE ONLY sessions
        ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY user_blocks
        ADD CONSTRAINT user_blocks_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY user_preferences
        ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id, k);
    ALTER TABLE ONLY user_roles
        ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY user_tokens
        ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY users
        ADD CONSTRAINT users_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY way_nodes
        ADD CONSTRAINT way_nodes_pkey PRIMARY KEY (way_id, version, sequence_id);
    ALTER TABLE ONLY way_tags
        ADD CONSTRAINT way_tags_pkey PRIMARY KEY (way_id, version, k);
    ALTER TABLE ONLY ways
        ADD CONSTRAINT ways_pkey PRIMARY KEY (way_id, version);
    CREATE INDEX changeset_tags_id_idx ON changeset_tags USING btree (changeset_id);
    CREATE EXTENSION btree_gist;
    CREATE INDEX changesets_bbox_idx ON changesets USING gist (min_lat, max_lat, min_lon, max_lon);
    CREATE INDEX changesets_closed_at_idx ON changesets USING btree (closed_at);
    CREATE INDEX changesets_created_at_idx ON changesets USING btree (created_at);
    CREATE INDEX changesets_user_id_created_at_idx ON changesets USING btree (user_id, created_at);
    CREATE INDEX changesets_user_id_id_idx ON changesets USING btree (user_id, id);
    CREATE INDEX current_nodes_tile_idx ON current_nodes USING btree (tile);
    CREATE INDEX current_nodes_timestamp_idx ON current_nodes USING btree ("timestamp");
    CREATE INDEX current_relation_members_member_idx ON current_relation_members USING btree (member_type, member_id);
    CREATE INDEX current_relation_tags_id_idx ON current_relation_tags USING btree (relation_id);
    CREATE INDEX current_relation_tags_v_idx ON current_relation_tags USING btree (v);
    CREATE INDEX current_relations_timestamp_idx ON current_relations USING btree ("timestamp");
    CREATE INDEX current_way_nodes_node_idx ON current_way_nodes USING btree (node_id);
    CREATE INDEX current_way_tags_id_idx ON current_way_tags USING btree (way_id);
    CREATE INDEX current_way_tags_v_idx ON current_way_tags USING btree (v);
    CREATE INDEX current_ways_timestamp_idx ON current_ways USING btree ("timestamp");
    CREATE UNIQUE INDEX index_oauth_nonces_on_nonce_and_timestamp ON oauth_nonces USING btree (nonce, "timestamp");
    CREATE UNIQUE INDEX index_oauth_tokens_on_token ON oauth_tokens USING btree (token);
    CREATE INDEX index_user_blocks_on_user_id ON user_blocks USING btree (user_id);
    CREATE INDEX nodes_changeset_id_idx ON nodes USING btree (changeset_id);
    CREATE INDEX nodes_tile_idx ON nodes USING btree (tile);
    CREATE INDEX nodes_timestamp_idx ON nodes USING btree ("timestamp");
    CREATE INDEX nodes_uid_idx ON nodes USING btree (node_id);
    CREATE INDEX relation_members_member_idx ON relation_members USING btree (member_type, member_id);
    CREATE INDEX relation_tags_id_version_idx ON relation_tags USING btree (relation_id, version);
    CREATE INDEX relations_changeset_id_idx ON relations USING btree (changeset_id);
    CREATE INDEX relations_timestamp_idx ON relations USING btree ("timestamp");
    CREATE UNIQUE INDEX sessions_session_id_idx ON sessions USING btree (session_id);
    CREATE UNIQUE INDEX unique_schema_migrations ON schema_migrations USING btree (version);
    CREATE UNIQUE INDEX user_openid_url_idx ON users USING btree (openid_url);
    CREATE UNIQUE INDEX user_roles_id_role_unique ON user_roles USING btree (user_id, role);
    CREATE UNIQUE INDEX user_tokens_token_idx ON user_tokens USING btree (token);
    CREATE INDEX user_tokens_user_id_idx ON user_tokens USING btree (user_id);
    CREATE UNIQUE INDEX users_display_name_idx ON users USING btree (display_name);
    CREATE UNIQUE INDEX users_email_idx ON users USING btree (email);
    CREATE INDEX way_nodes_node_idx ON way_nodes USING btree (node_id);
    CREATE INDEX way_tags_id_version_idx ON way_tags USING btree (way_id, version);
    CREATE INDEX ways_changeset_id_idx ON ways USING btree (changeset_id);
    CREATE INDEX ways_timestamp_idx ON ways USING btree ("timestamp");
    ALTER TABLE ONLY changeset_tags
        ADD CONSTRAINT changeset_tags_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);
    ALTER TABLE ONLY changesets
        ADD CONSTRAINT changesets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
    ALTER TABLE ONLY current_node_tags
        ADD CONSTRAINT current_node_tags_id_fkey FOREIGN KEY (node_id) REFERENCES current_nodes(id);
    ALTER TABLE ONLY current_nodes
        ADD CONSTRAINT current_nodes_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);
    ALTER TABLE ONLY current_relation_members
        ADD CONSTRAINT current_relation_members_id_fkey FOREIGN KEY (relation_id) REFERENCES current_relations(id);
    ALTER TABLE ONLY current_relation_tags
        ADD CONSTRAINT current_relation_tags_id_fkey FOREIGN KEY (relation_id) REFERENCES current_relations(id);
    ALTER TABLE ONLY current_relations
        ADD CONSTRAINT current_relations_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);
    ALTER TABLE ONLY current_way_nodes
        ADD CONSTRAINT current_way_nodes_id_fkey FOREIGN KEY (way_id) REFERENCES current_ways(id);
    ALTER TABLE ONLY current_way_nodes
        ADD CONSTRAINT current_way_nodes_node_id_fkey FOREIGN KEY (node_id) REFERENCES current_nodes(id);
    ALTER TABLE ONLY current_way_tags
        ADD CONSTRAINT current_way_tags_id_fkey FOREIGN KEY (way_id) REFERENCES current_ways(id);
    ALTER TABLE ONLY current_ways
        ADD CONSTRAINT current_ways_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);
    ALTER TABLE ONLY node_tags
        ADD CONSTRAINT node_tags_id_fkey FOREIGN KEY (node_id, version) REFERENCES nodes(node_id, version);
    ALTER TABLE ONLY nodes
        ADD CONSTRAINT nodes_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);
    ALTER TABLE ONLY oauth_tokens
        ADD CONSTRAINT oauth_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
    ALTER TABLE ONLY relation_members
        ADD CONSTRAINT relation_members_id_fkey FOREIGN KEY (relation_id, version) REFERENCES relations(relation_id, version);
    ALTER TABLE ONLY relation_tags
        ADD CONSTRAINT relation_tags_id_fkey FOREIGN KEY (relation_id, version) REFERENCES relations(relation_id, version);
    ALTER TABLE ONLY relations
        ADD CONSTRAINT relations_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);
    ALTER TABLE ONLY user_blocks
        ADD CONSTRAINT user_blocks_moderator_id_fkey FOREIGN KEY (creator_id) REFERENCES users(id);
    ALTER TABLE ONLY user_blocks
        ADD CONSTRAINT user_blocks_revoker_id_fkey FOREIGN KEY (revoker_id) REFERENCES users(id);
    ALTER TABLE ONLY user_blocks
        ADD CONSTRAINT user_blocks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
    ALTER TABLE ONLY user_preferences
        ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
    ALTER TABLE ONLY user_roles
        ADD CONSTRAINT user_roles_granter_id_fkey FOREIGN KEY (granter_id) REFERENCES users(id);
    ALTER TABLE ONLY user_roles
        ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
    ALTER TABLE ONLY user_tokens
        ADD CONSTRAINT user_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
    ALTER TABLE ONLY way_nodes
        ADD CONSTRAINT way_nodes_id_fkey FOREIGN KEY (way_id, version) REFERENCES ways(way_id, version);
    ALTER TABLE ONLY way_tags
        ADD CONSTRAINT way_tags_id_fkey FOREIGN KEY (way_id, version) REFERENCES ways(way_id, version);
    ALTER TABLE ONLY ways
        ADD CONSTRAINT ways_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);
  `)
  .then(function() {})
  .catch(function(e) { throw new Error(e); });
}

/**
 * makes admin boundaries table 
 * @func adminBoundariesSchema schema
 */
function adminBoundariesSchema (knex, Promise) {
  // statements to add adminBoundariesSchema
  return knex.raw(`
    CREATE EXTENSION postgis;    CREATE TYPE admin_level AS ENUM ('nation', 'province', 'district', 'commune');
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
  `)
  .then(function() {})
  .catch(function(e) { throw new Error(e); });
}

/**
 * makes properties schema
 * @func propertiesSchema
 */
function propertiesSchema (knex, Promise) {
  return knex.raw(`
    CREATE TABLE road_properties (
      id text PRIMARY KEY,
      properties jsonb NOT NULL
    );
    CREATE INDEX road_properties_idx ON road_properties USING btree (id);
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
  `)
  .then(function() {})
  .catch(function(e) { throw new Error(e)});
}

/**
 * makes field data schema
 * @func fieldDataSchema
 */
function fieldDataSchema (knex, Promise) {
  return knex.raw(`
    CREATE TYPE field_data_type AS ENUM ('RoadLabPro', 'RouteShoot');
    CREATE TABLE field_data_geometries (
      id SERIAL PRIMARY KEY,
      geom geometry NOT NULL,
      type field_data_type NOT NULL,
      road_id text REFERENCES road_properties
    );
    CREATE INDEX field_data_geometries_geom_idx ON field_data_geometries USING GIST (geom);
    CREATE INDEX field_data_geometries_road_idx ON field_data_geometries USING btree (road_id);
  `)
  .then(function() {})
  .catch(function(e) { throw new Error(e); });
}

/**
 * makes road stats schema
 * @func roadStatsSchema
 */
function roadStatsSchema (knex, Promise) {
  return knex.raw(`
    CREATE TABLE road_stats (
      id text PRIMARY KEY,
      admin_id int REFERENCES admin_boundaries,
      stats jsonb
    );
    CREATE INDEX road_stats_road_idx ON road_stats USING btree (id);
    CREATE INDEX road_sttats_admin_idx ON road_stats USING btree (admin_id);
  `)
  .then(function() {})
  .catch(function(e) { throw new Error(e); });
}


// insert db schema by chaining each of the table's schema functions together
macrocosmSchema(knex, Promise)
.then(function() { return adminBoundariesSchema(knex, Promise); })
.then(function() { return propertiesSchema(knex, Promise); })
.then(function() { return fieldDataSchema(knex, Promise); })
.then(function() { return roadStatsSchema(knex, Promise); })
.catch(function(e) { throw new Error(e); })
.finally(function() { return knex.destroy(); });