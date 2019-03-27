'use strict';

const _ = require('lodash');
const geojsontoosm = require('geojsontoosm');
const knex = require('../connection.js');
const knexPostgis = require('knex-postgis');
const libxml = require('libxmljs');
const unzip = require('unzip2');
const GJV = require('geojson-validation');
// const pFilter = require('p-filter');
const pMap = require('p-map');
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
    if (job.data.hasErrors) {
      return resolve({
        type: 'error',
        message: job.data.errMessage
      });
    }
    let fileReads = job.data.fileReads;
    const fieldDataRoadIds = job.data.fieldDataRoadIds;
      // Ignore any roads that were ingested earlier

    try {
      const existingFieldData = await knex
        .select(st.asGeoJSON('geom').as('geom'), 'road_id', 'type')
        .from('field_data_geometries')
        .whereIn('road_id', fieldDataRoadIds)
        .orWhereNull('road_id')
        .map(efd => Object.assign(efd, { geom: JSON.parse(efd.geom) }));
      fileReads = fileReads.filter(fr => {
        return fr.geom.geometry.coordinates && fr.geom.geometry.coordinates.length > 0;
      });
      fileReads.map(fr => {
        if (!GJV.valid(fr.geom.geometry)) {
          throw new Error('Invalid geometry');
        }
      });
      fileReads = fileReads.reduce((all, fr) => {
        const match = existingFieldData.find(efd =>
          geometriesEqualAtPrecision(efd.geom, fr.geom.geometry, POSTGIS_SIGNIFICANT_DECIMAL_PLACES) &&
          _.isEqual(efd.datetime, fr.datetime) &&
          efd.road_id === fr.road_id
        );
        if (!match) { all = all.concat(fr); }
        return all;
      }, []);
    } catch (err) {
      return resolve({
        type: 'error',
        message: 'Error while processing geometries in uploaded file.'
      })
    }

    if (!fileReads.length) { 
      return resolve({
        message: 'No roads imported. Data for this VProMM + Timestamp already ingested',
        type: 'error'
      });
    }

    return Promise.all(fileReads.map(fr => {
      // Add roads to the `field_data_geometries` table
      return knex.insert({
        road_id: fr.road_id,
        type: fr.type, 
        geom: st.geomFromGeoJSON(JSON.stringify(fr.geom.geometry))
      }).into('field_data_geometries')
    }))
    .then(async () => {

      // Filter out geometries that already exist in macrocosm
      // fileReads = await pFilter(fileReads, existingGeomFilter);
      
      const osmChanges = await getOSMChanges(fileReads);
      const creates = osmChanges.map(c => c.create).filter(c => !!c);

      const modifications = osmChanges.map(c => c.modify).reduce((memo, modification) => {
        return memo.concat(modification);
      }, []);

      return pMap(modifications, patchVpromm, { concurrency: 4 })        
      .then(() => {

        if (creates.length > 0) {
          // Get osmChange XML for create actions
          const featuresToAdd = creates.map(fr => {
            // All geometries should be tagged with a `highway` value
            // `road` is temporary until we can do better classification here
            const properties = {highway: 'road'};
            if (fr.road_id) { properties.or_vpromms = fr.road_id; }
            return Object.assign(fr.geom, {properties: properties});
          });

          const osmCreate = libxml.parseXmlString(geojsontoosm(featuresToAdd))
            .root().childNodes().map(n => n.toString()).join('');
          // FIXME: convert `ways` in `modifications` array into `osmChange` XML

          // if (fileReads.length === 0) {
          //   return resolve({
          //     message: 'No roads imported. Overlapping geometries exist in system.',
          //     type: 'error'
          //   });
          // }
          
          // Add roads to the production geometries tables, OSM format
          const changeset = `<osmChange version="0.6" generator="OpenRoads">\n<create>\n${osmCreate}\n</create>\n</osmChange>`;

          uploadChangeset({payload: changeset}, function(apiResponse) { resolve(apiResponse) });
        } else {
          return resolve({
            'type': 'success',
            'message': `Vpromm added to ${modifications.length} ways`
          });
        }
      })
      .catch(e => {
        return resolve({
          'type': 'error',
          'message': 'Error while processing uploaded file.'
        })
      });
    })
    .catch(e => {
      return resolve({
        'type': 'error',
        'message': 'Error while processing geometry for uploaded file.'
      })
    })
  });
});


async function patchVpromm(way) {
  const wayId = parseInt(way.meta.id, 10);
  const vpromm = way.properties.or_vpromms;
  return knex('current_way_tags')
    .insert({
      way_id: wayId,
      k: 'or_vpromms',
      v: vpromm
    })
  .then(function(response) {
    if (response === 0) {
      throw new Error('404');
    }
    return true;
  })
  .catch(e => {
    console.error('error', e);
  });
}



async function getOSMChanges(fileReads) {
  return pMap(fileReads, async (fr) => {
    const geom = fr.geom;
    // get a buffer of the RLP geom, and find bbox.
    const geomBuffer = turfBuffer(geom, 0.01, {units: 'kilometers'});
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

    let ret = {
      create: fr,
      modify: []
    };

    geojson.features.forEach(way => {
      const nodes = turfHelpers.featureCollection(way.geometry.coordinates);
      const pointsWithinGeom = turfPointsWithinPolygon(nodes, geomBuffer);
      const matchRate = (pointsWithinGeom.features.length / way.geometry.coordinates.length) * 100;
      if (matchRate > 60) {
        ret.create = false;
        const modification = getVprommModification(way, fr.road_id);
        if (modification) {
          ret.modify.push(modification);
        }
      }      
    });

    return ret;

  });
}

function getVprommModification(way, roadId) {
  // if the way already has a vpromm, or if roadId is null, don't do anything
  if (way.properties.or_vpromms || !roadId) {
    return false;
  }
  way.properties.or_vpromms = roadId;
  return way;
}


function getGeometriesRLPVersion(fileObject) {
  const filenamePatternV1 = /^.*\/RoadPath.*\.csv$/;
  const filenamePatternV2 = /^.*\/.*_Link.*_Path_.*\.csv$/;

  if (filenamePatternV1.test(fileObject.path)) return 'v1';
  if (filenamePatternV2.test(fileObject.path)) return 'v2';

  return false;
}

async function geometriesHandler(req, res) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://openroads-vn.com/';
  const payload = req.payload;
  const filenamePattern = /^.*\/RoadPath.*\.csv$/;
  const existingRoadIds = await knex.select('id').from('road_properties').map(r => r.id);

  let fileReads = [];
  let badPaths = [];
  let hasErrors = false;
  let errMessage = null;
  payload[Object.keys(req.payload)[0]]
    .pipe(unzip.Parse())
    .on('entry', async e => {
      const version = getGeometriesRLPVersion(e);
      if (version) {
        const read = await parseGeometries(e.path, e, existingRoadIds, version);
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
      if (fieldDataRoadIds.includes(ONLY_PROPERTIES)) {
        hasErrors = true;
        errMessage = 'Data includes only properties.';
      }
      if (badPaths.length) {
        hasErrors = true;
        errMessage = 'Road ID does not exist in system, please add it. If you are sure it exists, bad filenames exist in zipfile.'
      }

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
        fieldDataRoadIds,
        hasErrors,
        errMessage
      }).then(job => {
        // res({job: job.id});
        res.redirect(`${frontendUrl}#/en/jobs/${job.id}`);
      });
    });
}


/*
  Returns false if this is not an RLP properties file.
  If it is a properties file, returns `v1` or `v2` for version
*/
function getPropertiesRLPVersion(fileObject) {
  if (!fileObject.type === 'File') return false;

  // Some CSV filenames start with "RoadIntervals", others with just "Intervals"
  const filenamePatternV1 = /^.*\/(Road)?Intervals.*\.csv$/;
  const filenamePatternV2 = /^.*\/.*_Link.*_Roughness_.*\.csv$/;

  if (filenamePatternV1.test(fileObject.path)) return 'v1';
  if (filenamePatternV2.test(fileObject.path)) return 'v2';

  return false; 
}

async function propertiesHandler (req, res) {

  const existingRoadIds = await knex.select('id').from('road_properties').map(r => r.id);  

  let rows = [];
  let badPaths = [];
  req.payload[Object.keys(req.payload)[0]]
    .pipe(unzip.Parse())
    .on('entry', async e => {
      try {
        const version = getPropertiesRLPVersion(e);
        console.log('RLP version', version);
        if (version) {
          const read = await parseProperties(e.path, e, existingRoadIds, version);
          if (read[0] && !read[0].road_id) {
            badPaths = badPaths.concat(e.path);
          }
          rows = rows.concat(read);
        } else {
          // Avoid memory consumption by unneeded files
          e.autodrain();
        }
      } catch (e) {
        return res(errors.propertiesUnknownError)
      }
    })
    .on('close', async () => {
      // Prevent ingest of bad data
      const fieldDataRoadIds = [...new Set(rows.map(r => r.road_id))];
      if (badPaths.length) { return res(errors.badPaths(badPaths)); }
      if (fieldDataRoadIds.length === 0) { return res(errors.noCSV); }

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
        console.log('r', r);
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
      .then(() => res(fieldDataRoadIds))
      .catch((e) => res(errors.propertiesUnknownError))
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
