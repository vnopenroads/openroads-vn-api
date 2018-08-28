'use strict';

const _ = require('lodash');
const geojsontoosm = require('geojsontoosm');
const knex = require('../connection.js');
const knexPostgis = require('knex-postgis');
const libxml = require('libxmljs');
const unzip = require('unzip2');
const pFilter = require('p-filter');
const { parseGeometries } = require('../services/rlp-geometries');
const { parseProperties } = require('../services/rlp-properties');
const toGeojson = require('../services/osm-data-to-geojson');
const queryBbox = require('../services/query-bbox');
const turfPointsWithinPolygon = require('@turf/points-within-polygon').default;
const turfHelpers = require('@turf/helpers');
const uploadChangeset = require('./osc-upload').handler;
const {
  NO_ID,
  ONLY_PROPERTIES
} = require('../util/road-id-utils');
const { geometriesEqualAtPrecision } = require('../util/geometry-utils');
const errors = require('../util/errors');
const turfBuffer = require('@turf/buffer').default;
const turfBbox = require('@turf/bbox');
const st = knexPostgis(knex);
const rlpGeomQueue = require('../queue');

const POSTGIS_SIGNIFICANT_DECIMAL_PLACES = 7;


rlpGeomQueue.process(async function (job) {
  return new Promise(async (resolve, reject) => {
    let fileReads = job.data.fileReads;
    const fieldDataRoadIds = job.data.fieldDataRoadIds;
      // Ignore any roads that were ingested earlier
    const existingFieldData = await knex
      .select(st.asGeoJSON('geom').as('geom'), 'road_id', 'type')
      .from('field_data_geometries')
      .whereIn('road_id', fieldDataRoadIds)
      .orWhereNull('road_id')
      .map(efd => Object.assign(efd, { geom: JSON.parse(efd.geom) }));
    fileReads = fileReads.reduce((all, fr) => {
      const match = existingFieldData.find(efd =>
        geometriesEqualAtPrecision(efd.geom, fr.geom.geometry, POSTGIS_SIGNIFICANT_DECIMAL_PLACES) &&
        _.isEqual(efd.datetime, fr.datetime) &&
        efd.road_id === fr.road_id
      );
      if (!match) { all = all.concat(fr); }
      return all;
    }, []);
    
    if (!fileReads.length) { return resolve('No roads imported. Data for this VProMM + Timestamp already ingested') }

    return Promise.all(fileReads.map(fr =>
      // Add roads to the `field_data_geometries` table
      knex.insert({
        road_id: fr.road_id,
        type: fr.type,
        geom: st.geomFromGeoJSON(JSON.stringify(fr.geom.geometry))
      }).into('field_data_geometries')
    ))
    .then(async () => {
      // Filter out geometries that already exist in macrocosm
      fileReads = await pFilter(fileReads, existingGeomFilter);
      if (fileReads.length === 0) {
        // FIXME: not propagating.
        return resolve('No roads imported. Overlapping geometries exist in system.');
      }
      // Add roads to the production geometries tables, OSM format
      const features = fileReads.map(fr => {
        // All geometries should be tagged with a `highway` value
        // `road` is temporary until we can do better classification here
        const properties = {highway: 'road'};
        if (fr.road_id) { properties.or_vpromms = fr.road_id; }
        return Object.assign(fr.geom, {properties: properties});
      });


      // Need to replace the `<osm>` top-level tag with `<osmChange><create>`
      const osm = libxml.parseXmlString(geojsontoosm(features))
        .root().childNodes().map(n => n.toString()).join('');
      const changeset = `<osmChange version="0.6" generator="OpenRoads">\n<create>\n${osm}\n</create>\n</osmChange>`;

      uploadChangeset({payload: changeset}, resolve);
    });
  });
});

/*
  This function accepts a `fileRead` object, with a `.geom` property.
  It needs to return a promise that resolves to either `true` or `false`.

  `true` indicates that the rlp geometry should be added to the changeset,
  and `false` if it is a duplicate of an existing geometry and needs to be
  filtered out.
*/
async function existingGeomFilter(fr) {
  const geom = fr.geom;
  // get a buffer of the RLP geom, and find bbox.
  const geomBuffer = turfBuffer(geom, 0.03, {units: 'kilometers'});
  const geomBbox = turfBbox(geomBuffer);
  const bbox = {
    minLat: geomBbox[1],
    minLon: geomBbox[0],
    maxLat: geomBbox[3],
    maxLon: geomBbox[2]
  };

  // find all near features as geojson
  const nearFeatures = await queryBbox(knex, bbox);
  const geojson = toGeojson(nearFeatures);
  let hasMatch = false;
  // for each near ways, find the way with at least 40% of the nodes are overlapping.
  if (geojson.features.length) {
    geojson.features.forEach(way => {
      const nodes = turfHelpers.featureCollection(way.geometry.coordinates);
      const pointsWithinGeom = turfPointsWithinPolygon(nodes, geomBuffer);
      const matchRate = (pointsWithinGeom.features.length / way.geometry.coordinates.length) * 100;
      if (matchRate > 40) {
        hasMatch = true;
      }
    });
  }
  return !hasMatch;
}

async function geometriesHandler(req, res) {
  console.error('upload received');
  const frontendUrl = process.env.FRONTEND_URL || 'http://openroads-vn.com/';
  const payload = req.payload;
  const filenamePattern = /^.*\/RoadPath.*\.csv$/;
  const existingRoadIds = await knex.select('id').from('road_properties').map(r => r.id);

  let fileReads = [];
  let badPaths = [];
  // console.log('file', payload['file']);
  payload[Object.keys(req.payload)[0]]
    .pipe(unzip.Parse())
    .on('entry', async e => {
      if (e.type === 'File' && filenamePattern.test(e.path)) {
        const read = await parseGeometries(e.path, e, existingRoadIds);
        if (!read.road_id) {
          badPaths = badPaths.concat(e.path);
        }
        fileReads = fileReads.concat(read);
      } else {
        // Avoid memory consumption by unneeded files
        e.autodrain();
      }
    })
    .on('close', async () => {
      // Prevent ingest of bad data
      const fieldDataRoadIds = [...new Set(fileReads.map(r => r.road_id))];
      if (fieldDataRoadIds.includes(ONLY_PROPERTIES)) { return res(errors.cannotUseOnlyProperties); }
      if (badPaths.length) { return res(errors.badPaths(badPaths)); }

      // Ignore any duplicate input road geometries
      fileReads = fileReads.reduce((all, fr) => {
        if (!all.find(one => _.isEqual(one, fr))) { all = all.concat(fr); }
        return all;
      }, []);

      // Strip the `NO_ID` so that it doesn't appear in the database
      fileReads = fileReads.map(fr => {
        if (fr.road_id === NO_ID) { fr.road_id = null; }
        return fr;
      });

      const job = rlpGeomQueue.add({
        fileReads,
        fieldDataRoadIds
      }).then(job => {
        // res({job: job.id});
        res.redirect(`${frontendUrl}#/en/jobs/${job.id}`);
      });
    });
}

async function propertiesHandler (req, res) {
  // Some CSV filenames start with "RoadIntervals", others with just "Intervals"
  const filenamePattern = /^.*\/(Road)?Intervals.*\.csv$/;
  const existingRoadIds = await knex.select('id').from('road_properties').map(r => r.id);

  let rows = [];
  let badPaths = [];
  req.payload[Object.keys(req.payload)[0]]
    .pipe(unzip.Parse())
    .on('entry', async e => {
      if (e.type === 'File' && filenamePattern.test(e.path)) {
        const read = await parseProperties(e.path, e, existingRoadIds);
        if (!read[0].road_id) {
          badPaths = badPaths.concat(e.path);
        }
        rows = rows.concat(read);
      } else {
        // Avoid memory consumption by unneeded files
        e.autodrain();
      }
    })
    .on('close', async () => {
      // Prevent ingest of bad data
      const fieldDataRoadIds = [...new Set(rows.map(r => r.road_id))];
      if (badPaths.length) { return res(errors.badPaths(badPaths)); }

      // Strip the `NO_ID` and `ONLY_PROPERTIES` so that they
      // don't appear in the database
      rows = rows.map(r => {
        if (r.road_id === NO_ID || r.road_id === ONLY_PROPERTIES) { r.road_id = null; }
        return r;
      });

      // This could be replaced by using a `WHERE NOT IN` clause in the `INSERT`
      const existingPointProperties = await knex
        .select(
          st.asGeoJSON('geom').as('geom'),
          'source', 'datetime', 'road_id', 'properties'
        )
        .from('point_properties')
        .whereIn('road_id', fieldDataRoadIds)
        .orWhereNull('road_id')
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
   * or great-granparent's directory name. If a road truly has no ID,
   * then assign an ID of `NO_ID`.
   *
   * For compatibility reasons, the ZIP must be uploaded in multi-part
   * form data, not with a standard file POST; see the example below.
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
        // Increase the maximum upload size to 4 MB, from default of 1 MB
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
   * or great-granparent's directory name. If a road truly has no ID,
   * then assign an ID of `NO_ID`. If this is a run to collect IRI for
   * many roads at a time, then assign an ID of `ONLY_PROPERTIES`.
   *
   * For compatibility reasons, the ZIP must be uploaded in multi-part
   * form data, not with a standard file POST; see the example below.
   * All properties will be ingested as string data, regardless of
   * whether they're boolean, numeric, or string.
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
        // Increase the maximum upload size to 4 MB, from default of 1 MB
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
