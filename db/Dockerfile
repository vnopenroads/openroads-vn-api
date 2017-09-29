FROM mdillon/postgis:9.4-alpine

RUN mkdir -p /docker-entrypoint-initdb.d
RUN mkdir -p /init
ADD data/*.csv /init/
# Initialize the database using all SQL commands in the directory
ADD sql/*.sql /docker-entrypoint-initdb.d/
