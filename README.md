# OpenRoads Vietnam API
[![CircleCI](https://circleci.com/gh/orma/openroads-vn-api.svg?style=svg)](https://circleci.com/gh/orma/openroads-vn-api)

This is the API supporting the OpenRoads Vietnam website, which lives in the `orma/openroads-vn-api` repo. The core of its functionality is as a fork of [Macrocosm](https://github.com/developmentseed/macrocosm), a partial OSM v0.6 API. There are additional tables and functionality built on top of this, catered to the needs of the OpenRoads dashboards and platform overall.

API documentation is built from the docstrings in `routes/*.js`, and deployed with the API, available at the root route: http://api.openroads-vn.com/ in production, or http://localhost:4000/ when running locally.

This repo also includes the database schema and other related components, in the `db` directory.

## Database schema

The core of the database is in the OSM schema. Specifically in this case, roads are stored in `current_ways`, and nodes of those roads are stored in `current_nodes`. `changesets` and `users` core tables are also used, to a lesser extent.

In addition to these OSM tables, there are a few non-OSM tables that help handle project needs:

- `road_properties` tracks key-value properties about roads, _whether a road exists 0, 1, or several times in the geometries_
  - This gives us a list of all roads that exist in the VPRoMMS road ID system, so we can have a "denominator" when showing data in the Assets table
  - This also stores key-value information about the road, which exists and is know _separately_ from the road geometries, which may be created or deleted without altering fundamentals about the road
- `point_properties` holds field data on roughness ([IRI](https://en.wikipedia.org/wiki/International_Roughness_Index)) and other metrics
  - This data is collected at particular points during a drive, and doesn't pertain to a full road
  - This data is conflated onto by background workers (`orma/openroads-vn-workers` repo), to produce vector tiles so that the point properties can be visualized on their related line segments
- `tasks` contains cases of machine-suspected geometry issues, such as duplicate roads or possible intersections, that are awaiting human approval in the Tasks front-end interface
- `admin_boundaries` stores the boundaries of administrative areas for the country, at different levels

## Whole of Network Import

Whole of Network import is an administrative task at the beginning of setting up an instance of ORMA. This imports road network in it's complete form with minimum or no asset information. The utility `utils/won-import.sh` supports importing a shapefile on road network. The script creates a changeset from all the geometries, and uploads to the ORMA instance. For example:

`cd utils; ./won-import.sh data.shp http://orma-api.url`

To translate properties of the shapefile into ORMA attributes, see the `translations` directory.
## Running locally

### Quickstart without Docker

`yarn install` should cover all Node dependencies. Use the Node version currently listed in the `package.json`.

Run the database with `yarn docker-start-db`, set the `DATABASE_URL` environment variable accordingly (to `postgres://postgres:postgres@localhost:5433/openroads`), and run the API using `yarn start`.

### Quickstart using Docker
This repo comes with Docker configuration to spin up the API and a database in a containerized, consistent way.

To set up your environment, make sure `docker` and `docker-compose` are installed. Then, run `yarn docker-start` to bring up the `db` and `api` services.

*Note*

If you are facing 👇 errors running `yarn docker-start`:

```
ERROR: Couldn't find env file: /Users/<user>/apps/openroads-vn-api/.env
error An unexpected error occurred: "Command failed.
```

To solve the error, you just need to create an empty `.env` file in the repository.


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
