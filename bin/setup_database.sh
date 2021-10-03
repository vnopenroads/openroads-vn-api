#!/usr/bin/env bash

set -eu

main() {
    local env=$1
    if [[ "${env}" == "local" ]]; then
        setup_local
    elif [[ "${env}" == "uat" ]]; then
        setup_uat
    else 
        echo "no such environment: ${env}"
        exit 1
    fi
}

SQL_FILES=".//db/migrations/20210803000000_add_user_config.sql .//db/migrations/20210821000000_add_road_snapshots.sql .//db/sql/functions/cba.sql .//db/sql/views/cba_roads.sql"
setup_local() {

    for i in $SQL_FILES; do 
        psql -h localhost -U orma orma -f $i
    done
}

setup_uat() {
    ssh cba-worldbank "mkdir -p ~/openroads-vn-api/current/db/tmp_cba"
    scp ${SQL_FILES} cba-worldbank:~/openroads-vn-api/current/db/tmp_cba/

    ssh cba-worldbank "find ~/openroads-vn-api/current/db/tmp_cba/ -iname '*.sql' -exec psql -U orma -h localhost -d orma -f {} \;"
}

main "$@"