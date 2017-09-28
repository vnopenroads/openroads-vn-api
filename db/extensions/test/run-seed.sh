#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  COPY users FROM '/init/users.csv' DELIMITER ',' CSV HEADER;
  COPY changesets FROM '/init/changesets.csv' DELIMITER ',' CSV HEADER;
  COPY current_nodes FROM '/init/current_nodes.csv' DELIMITER ',' CSV HEADER;
  COPY current_ways FROM '/init/current_ways.csv' DELIMITER ',' CSV HEADER;
  COPY current_way_nodes FROM '/init/current_way_nodes.csv' DELIMITER ',' CSV HEADER;
  COPY current_way_tags FROM '/init/current_way_tags.csv' DELIMITER ',' CSV HEADER;
  COPY admin_boundaries FROM '/init/admin_boudaries.csv' DELIMITER ',' CSV HEADER;
EOSQL