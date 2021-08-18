#!/usr/bin/env bash

set -eu

main() {
    ssh cba-worldbank "mkdir -p ~/openroads-vn-api/current/db/tmp_cba"
    scp .//db/migrations/20210803000000_add_user_config.sql \
             .//db/sql/functions/cba.sql \
             .//db/sql/views/cba_roads.sql \
             cba-worldbank:~/openroads-vn-api/current/db/tmp_cba/

    ssh cba-worldbank "find ~/openroads-vn-api/current/db/tmp_cba/ -iname '*.sql' -exec psql -U orma -h localhost -d orma -f {} \;"
}

main "$@"