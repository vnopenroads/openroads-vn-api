#!/usr/bin/env bash

set -eu

foo() {

    docker run -d \
           --name openroads-api-db \
           -e POSTGRES_PASSWORD=orma \
           -e POSTGRES_USER=orma \
           -e POSTGRES_DB=orma \
           -e PGDATA=/var/lib/postgresql/data/pgdata \
           -p 5432:5432 \
           -v $(pwd)/docker_db/data:/var/lib/postgresql/data \
           postgis/postgis
}

main () {
    docker run -d \
           --name openroads-prod-db \
           -e POSTGRES_PASSWORD=orma \
           -e POSTGRES_USER=orma \
           -e POSTGRES_DB=orma \
           -e PGDATA=/var/lib/postgresql/data/pgdata \
           -p 5432:5432 \
           -v $(pwd)/data.prod_copy:/var/lib/postgresql/data \
           postgis/postgis
}

main "$@"
