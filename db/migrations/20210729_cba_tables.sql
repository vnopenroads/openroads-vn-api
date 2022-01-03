-- CREATE TYPE admin_level AS ENUM ('nation', 'province', 'district', 'commune');

DROP TABLE road_archives;


CREATE TABLE road_archives (
	id int PRIMARY KEY,
	name_en text,
	name_vn text,
    road_data jsonb not null
);
CREATE INDEX road_archives_idx ON road_archives USING btree (id);

COMMIT;

