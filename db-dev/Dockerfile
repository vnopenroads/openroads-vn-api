FROM mdillon/postgis:9.6-alpine
# additional libs needed for wget
RUN apk update && apk add ca-certificates wget && update-ca-certificates   
# make needed directories. 
# the first is for adding tables and sql data
# the second is for housing csvs downed from s3 
# the third is for the script that downs the csvs from s3.
RUN mkdir -p /docker-entrypoint-initdb.d
RUN mkdir -p /init
ADD init-db.sh .
RUN cat ./init-db.sh >> /docker-entrypoint-initdb.d/postgis.sh
COPY snapshot/*.sql /docker-entrypoint-initdb.d/sql/
