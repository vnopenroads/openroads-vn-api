# Openroads db
This is a dockerfile to create the openroads database.

## Running the base image
The base image has no data, only the openroads schema:

```
make db
docker run -p 5432:5432 openroads-db:base
```

# Running the test image
The test image has admin boundaries, stats at the time of generation, and some other sample data

```
make test-db
docker run -p 5432:5432 open-roads-db:test
```