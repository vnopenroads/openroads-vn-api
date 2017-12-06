# OpenRoads Vietnam API
[![CircleCI](https://circleci.com/gh/orma/openroads-vn-api.svg?style=svg)](https://circleci.com/gh/orma/openroads-vn-api)

This is the API supporting the OpenRoads Vietnam website, which lives in the `orma/openroads-vn-api` repo. The core of its functionality is as a fork of [Macrocosm](https://github.com/developmentseed/macrocosm), a partial OSM v0.6 API. There are additional tables and functionality built on top of this, catered to the needs of the OpenRoads dashboards and platform overall.

API documentation is built from the docstrings in `routes/*.js`, and deployed with the API, available at the root route: http://api.openroads-vn.com/ in production, or http://localhost:4000/ when running locally.

This repo also includes the database schema and other related components, in the `db` directory.

## Running locally

### Quickstart without Docker

`yarn install` should cover all Node dependencies. Use the Node version currently listed in the `package.json`.

Run the database with `yarn docker-start-db`, set the `DATABASE_URL` environment variable accordingly (to `postgres://postgres:postgres@localhost:5433/openroads`), and run the API using `yarn start`.

### Quickstart using Docker
This repo comes with Docker configuration to spin up the API and a database in a containerized, consistent way.

To set up your environment, make sure `docker` and `docker-compose` are installed. Then, run `yarn docker-start` to bring up the `db` and `api` services.

### Running tests
The following command creates an empty postgres db, and runs the tests against it.

```sh
yarn docker-test
```

### Building the documentation

```sh
yarn gendoc
```

(The .js and .json files that are built should _not_ be committed to git. Production documentation is built and deployed by the CI system.)

## Deployment to production

To deploy to production, simply increment the version number in `package.json`, update the version in the AWS configuration in `aws/app/config.yml` accordingly, and then push to `master`.

This `aws/app/config.yml` is also used to track the package/container versions of two other project components: `orma/openroads-vn-iD` and `orma/openroads-vn-tiler`. Additional info about how this AWS CloudFormation deployment works can be found in `aws/README.md`.
