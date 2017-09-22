const _ = require('lodash');
const geojsontoosm = require('geojsontoosm');
const knex = require('../connection.js');
const knexPostgis = require('knex-postgis');
const libxml = require('libxmljs');
const unzip = require('unzip2');
const parseGeometries = require('../services/rlp-geometries');
const uploadChangeset = require('./osc-upload').handler;

const st = knexPostgis(knex);

async function geometriesHandler (req, res) {
  const filenamePattern = /^.*\/RoadPath.*.csv$/;

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
      // Create `road_property` rows for roads that aren't known yet
      const knownRoads = await knex.select('id').from('road_properties').map(r => r.id);
      Promise.all(
        // Remove duplicate road IDs for the `road_property` write
        _.uniqBy(fileReads, fr => fr.road_id)
        .map(fr => {
          if (fr.road_id && !knownRoads.includes(fr.road_id)) {
            return knex.insert({
              id: fr.road_id,
              properties: {}
            }).into('road_properties')
          } else {
            return Promise.resolve()
          }
        })
      )
      .then(() => Promise.all(fileReads.map(fr =>
        // Add roads to the `field_data_geometries` table
        // TO-DO: detect if a road is already present, maybe using
        // datetime and road ID, or by comparing geometry or all fields?
        knex.insert({
          road_id: fr.road_id,
          type: fr.type,
          geom: st.geomFromGeoJSON(JSON.stringify(fr.geom.geometry))
        }).into('field_data_geometries')
      )))
      .then(() => {
        // Add roads to the production geometries tables, OSM format
        // TO-DO: if a road was already present in field gemoetries,
        // do not ingest it into the production geometries
        const features = fileReads.map(fr =>
          Object.assign(fr.geom, {properties: fr.road_id ? {or_vpromms_id: fr.road_id} : {}})
        );
        // Need to replace the `<osm>` top-level tag with `<osmChange><create>`
        const osm = libxml.parseXmlString(geojsontoosm(features))
          .root().childNodes().map(n => n.toString()).join('');
        const changeset = `<osmChange version="0.6" generator="OpenRoads">\n<create>\n${osm}\n</create>\n</osmChange>`;

        return Promise.resolve(uploadChangeset({payload: changeset}, res));
      })
    })
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
   *  curl --form file=rlp.zip http://localhost:4000/fielddata/geometries/rlp
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
   */  {
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
  }
];
