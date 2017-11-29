'use strict';

const _ = require('lodash');
const geojsontoosm = require('geojsontoosm');
const knex = require('../connection.js');
const knexPostgis = require('knex-postgis');
const libxml = require('libxmljs');
const unzip = require('unzip2');
const parseGeometries = require('../services/rlp-geometries');
const parseProperties = require('../services/rlp-properties');
const uploadChangeset = require('./osc-upload').handler;
const errors = require('../util/errors');

const st = knexPostgis(knex);

const POSTGIS_SIGNIFICANT_DECIMAL_PLACES = 7;
const geometriesEqualAtPrecision = (x, y, decimalPrecision) => {
  // Geometries are slightly simplified when added to PostGIS,
  // so truncate before comparison to accommodate accordingly
  const isCoordinatePair = c =>
    c.length === 2 &&
    typeof c[0] === 'number' &&
    typeof c[1] === 'number';
  const truncateValue = (val, prec) => Math.trunc(val * Math.pow(10, prec));
  const compareCoordinatePair = (a, b) =>
    truncateValue(a[0], decimalPrecision) === truncateValue(b[0], decimalPrecision) &&
    truncateValue(a[1], decimalPrecision) === truncateValue(b[1], decimalPrecision);
  const compareArray = (a, b) =>
    a.length === b.length &&
    isCoordinatePair(a)
      ? compareCoordinatePair(a, b)
      : a.every((aArr, index) => compareArray(aArr, b[index]));

  return x.type === y.type &&
    compareArray(x.coordinates, y.coordinates);
}

async function geometriesHandler (req, res) {
  const filenamePattern = /^.*\/RoadPath.*\.csv$/;

  let fileReads = [];
  req.payload[Object.keys(req.payload)[0]]
    .pipe(unzip.Parse())
    .on('entry', async e => {
      if (e.type === 'File' && filenamePattern.test(e.path)) {
        const read = await parseGeometries(e.path, e);
        fileReads = fileReads.concat(read);
      } else {
        // Avoid memory consumption by unneeded files
        e.autodrain();
      }
    })
    .on('close', async () => {
      // Prevent ingest of bad data
      const fieldDataRoadIds = [...new Set(fileReads.map(r => r.road_id))];
      if (fieldDataRoadIds.includes(null)) { return res(errors.nullRoadIds); }

      const existingRoadIds = await knex.select('id').from('road_properties').map(r => r.id);
      const idsNewToDB = _.difference(fieldDataRoadIds, existingRoadIds);
      if (idsNewToDB.length) { return res(errors.unknownRoadIds(idsNewToDB)); }

      // Ignore any duplicate input road geometries
      fileReads = fileReads.reduce((all, fr) => {
        if (!all.find(one => _.isEqual(one, fr))) { all = all.concat(fr); }
        return all;
      }, []);

      // Ignore any roads that were ingested earlier
      const existingFieldData = await knex
        .select(st.asGeoJSON('geom').as('geom'), 'road_id', 'type')
        .from('field_data_geometries')
        .whereIn('road_id', fieldDataRoadIds);
      fileReads = fileReads.reduce((all, fr) => {
        const match = existingFieldData.find(efd =>
          geometriesEqualAtPrecision(efd.geom, fr.geom.geometry, POSTGIS_SIGNIFICANT_DECIMAL_PLACES) &&
          _.isEqual(efd.datetime, fr.datetime) &&
          efd.road_id === fr.road_id
        );
        if (match) { all = all.concat(fr); }
        return all;
      }, []);

      if (fileReads.length) {
        Promise.all(fileReads.map(fr =>
          // Add roads to the `field_data_geometries` table
          knex.insert({
            road_id: fr.road_id,
            type: fr.type,
            geom: st.geomFromGeoJSON(JSON.stringify(fr.geom.geometry))
          }).into('field_data_geometries')
        ))
        .then(() => {
          // Add roads to the production geometries tables, OSM format
          const features = fileReads.map(fr => {
            // All geometries should be tagged with a `highway` value
            // `road` is temporary until we can do better classification here
            const properties = {highway: 'road'}
            if (fr.road_id) { properties.or_vpromms = fr.road_id; }
            return Object.assign(fr.geom, {properties: properties})
          });
          // Need to replace the `<osm>` top-level tag with `<osmChange><create>`
          const osm = libxml.parseXmlString(geojsontoosm(features))
            .root().childNodes().map(n => n.toString()).join('');
          const changeset = `<osmChange version="0.6" generator="OpenRoads">\n<create>\n${osm}\n</create>\n</osmChange>`;

          return Promise.resolve(uploadChangeset({payload: changeset}, res));
        });
      } else {
        return res(errors.alreadyIngested);
      }
    });
}

async function propertiesHandler (req, res) {
  // Some CSV filenames start with "RoadIntervals", others with just "Intervals"
  const filenamePattern = /^.*\/(Road)?Intervals.*\.csv$/;

  let rows = [];
  req.payload[Object.keys(req.payload)[0]]
    .pipe(unzip.Parse())
    .on('entry', async e => {
      if (e.type === 'File' && filenamePattern.test(e.path)) {
        const read = await parseProperties(e.path, e);
        rows = rows.concat(read);
      } else {
        // Avoid memory consumption by unneeded files
        e.autodrain();
      }
    })
    .on('close', async () => {
      // Prevent ingest of bad data
      const fieldDataRoadIds = [...new Set(rows.map(r => r.road_id))];
      if (fieldDataRoadIds.includes(null)) { return res(errors.nullRoadIds); }

      const existingRoadIds = await knex.select('id').from('road_properties').map(r => r.id);
      const idsNewToDB = _.difference(fieldDataRoadIds, existingRoadIds);
      if (idsNewToDB.length) { return res(errors.unknownRoadIds(idsNewToDB)); }

      // This could be replaced by using a `WHERE NOT IN` clause in the `INSERT`
      const existingPointProperties = await knex
        .select(
          st.asGeoJSON('geom').as('geom'),
          'source', 'datetime', 'road_id', 'properties'
        )
        .from('point_properties')
        .whereIn('road_id', fieldDataRoadIds)
        .map(p => Object.assign(p, {geom: JSON.parse(p.geom)}));

      Promise.all(rows.map(r => {
        // Add observations to the `point_properties` table,
        // if they don't already exist there
        const match = existingPointProperties.find(p =>
          geometriesEqualAtPrecision(p.geom, r.geom, POSTGIS_SIGNIFICANT_DECIMAL_PLACES) &&
          _.isEqual(p.datetime, r.datetime) &&
          p.road_id === r.road_id
        );
        return match
          ? Promise.resolve()
          : knex.insert({
            geom: st.geomFromGeoJSON(JSON.stringify(r.geom)),
            source: r.source,
            datetime: r.datetime,
            road_id: r.road_id,
            properties: r.properties
          }).into('point_properties');
      }))
      .then(() => res(fieldDataRoadIds));
    });
}

module.exports = [
  /**
   * @api {POST} /fielddata/geometries/rlp Upload RoadLabPro geometries
   * @apiVersion 0.3.0
   * @apiGroup Field Data
   * @apiName UploadRLPGeometries
   * @apiDescription Upload a ZIP containing one or many RoadLabPro
   * runs. Ingests the geometries from all `RoadPath_*` CSV files,
   * archiving them as raw field data, and adding them to the display
   * geometries. Performs basic cleaning during parsing. Returns an
   * OSM changeset summary.
   *
   * Uploaded ZIP should not include ZIPs within. Furthermore, it is
   * expected that the road ID will be within the parent, grandparent,
   * or great-granparent's directory name. For compatibility reasons,
   * the ZIP must be uploaded in multi-part form data, not with a standard
   * file POST; see the example below.
   *
   * @apiParam {Object} geometries ZIP of RoadLabPro field data
   *
   * @apiSuccess {Object} changeset Changeset object
   * @apiSuccess {String} changeset.id Changeset ID.
   * @apiSuccess {String} changeset.user_id Changeset User ID.
   * @apiSuccess {Date} changeset.created_at Changeset Date of creation.
   * @apiSuccess {Number} changeset.min_lat Min Latitude of bounding box.
   * @apiSuccess {Number} changeset.max_lat Max Latitude of bounding box.
   * @apiSuccess {Number} changeset.min_lon Min Longitude of bounding box.
   * @apiSuccess {Number} changeset.max_lon Max Longitude of bounding box.
   * @apiSuccess {Date} changeset.closed_at Changeset Date of creation.
   * @apiSuccess {number} changeset.num_changes Number of edits in this changeset.
   *
   * @apiExample {curl} Example Usage:
   *  curl --form file=@rlp.zip http://localhost:4000/fielddata/geometries/rlp
   *
   * @apiSuccessExample {json} Success-Response:
   *  {"changeset":
   *    {
   *     "id":"1",
   *     "user_id":"2254600",
   *     "created_at":"2015-03-13T03:51:39.000Z",
   *     "min_lat":97923478,
   *     "max_lat":97923478,
   *     "min_lon":1239780018,
   *     "max_lon":1239780018,
   *     "closed_at":"2015-04-21T18:44:51.858Z",
   *     "num_changes":31076
   *     }
   *  }
   */
  {
    method: 'POST',
    path: '/fielddata/geometries/rlp',
    handler: geometriesHandler,
    config: {
      payload: {
        // Increase the maximum upload size to 4 GB, from default of 1 GB
        maxBytes: 4194304,
        output: 'stream',
        uploads: '/tmp',
        // Using a normal file POST not working as expected, so have to
        // use multipart upload (even if just ingesting the one file)
        allow: 'multipart/form-data'
      }
    }
  },

  /**
   * @api {POST} /fielddata/properties/rlp Upload RoadLabPro properties
   * @apiVersion 0.3.0
   * @apiGroup Field Data
   * @apiName UploadRLPProperties
   * @apiDescription Upload a ZIP containing one or many RoadLabPro
   * runs. Ingests the point-properties from all `Intervals_*` CSV files.
   * Returns a list of all road IDs that were ingested.
   *
   * Uploaded ZIP should not include ZIPs within. Furthermore, it is
   * expected that the road ID will be within the parent, grandparent,
   * or great-granparent's directory name. For compatibility reasons,
   * the ZIP must be uploaded in multi-part form data, not with a standard
   * file POST; see the example below. All properties will be ingested
   * as string data, regardless of whether they're boolean, numeric, or string.
   *
   * @apiExample {curl} Example Usage:
   *  curl --form file=@rlp.zip http://localhost:4000/fielddata/properties/rlp
   *
   * @apiParam {Object} properties ZIP of RoadLabPro field data
   *
   * @apiSuccess {Array} added Road IDs for which point-properties were uploaded
   *
   * @apiSuccessExample {json} Success-Response:
   *  [
   *    "001ZZ33333",
   *    "123AB87654",
   *    "987NA00001"
   *  ]
   */
  {
    method: 'POST',
    path: '/fielddata/properties/rlp',
    handler: propertiesHandler,
    config: {
      payload: {
        // Increase the maximum upload size to 4 GB, from default of 1 GB
        maxBytes: 4194304,
        output: 'stream',
        uploads: '/tmp',
        // Using a normal file POST not working as expected, so have to
        // use multipart upload (even if just ingesting the one file)
        allow: 'multipart/form-data'
      }
    }
  }
];
