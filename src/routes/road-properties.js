'use strict';
const Boom = require('@hapi/boom');
const { applyPatch, validate } = require('fast-json-patch');
const knex = require('../connection.js');
const { groupBy, some, get, map, each,
  flatMap, uniq, uniqBy } = require('lodash');
const utils = require('../services/handlers/utils.js')

const validateId = (id) => /^\d{3}([A-ZĐ]{2}|00)\d{5}$/.test(id);
const PAGE_SIZE = 20;



function getHandler(req, res) {
  const sortField = req.query.sortField || 'id';
  const sortOrder = req.query.sortOrder || 'asc';
  const page = req.query.page === undefined ? 1 : parseInt(req.query.page);
  const province = req.query.province;
  const district = req.query.district;
  const status = req.query.status;

  utils.checkStandardQueryParams(sortField, sortOrder, page);

  return knex('road_properties as roads')
    .select('roads.id', 'roads.properties', 'roads.status')
    .distinct('roads.id')
    .modify(function (queryBuilder) {
      if (status) {
        queryBuilder.andWhere('status', status);
      }
      if (province && district) {
        queryBuilder.whereRaw(`id LIKE '${province}_${district}%'`);
      } else if (province) {
        queryBuilder.whereRaw(`id LIKE '${province}%'`);
      }
    })
    .orderBy(sortField, sortOrder)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .then((roads) => {
      const ids = roads.map(e => e.id);
      return knex('current_way_tags')
        .select('v')
        .whereIn('v', ids)
        .andWhere('k', 'or_vpromms')
        .leftJoin('current_ways', 'current_way_tags.way_id', 'current_ways.id')
        .where('visible', true)
        .then((visibleVpromms) => {
          const vprommsWithOSM = uniq(flatMap(visibleVpromms, (v) => {
            return v.v;
          }));
          let results = roads.map((r) => {
            let hasOSMData = vprommsWithOSM.indexOf(r.id) > -1 ? true : false;
            let status = r.status === null ? 'pending' : r.status;
            return { 'id': r.id, 'properties': r.properties, 'hasOSMData': hasOSMData, 'status': status };
          });
          return results;
        });
    });
}


function getByIdHandler(req, res) {
  const provinceCode = req.params.road_id.substring(0, 2);
  const districtCode = req.params.road_id.substring(3, 5);

  return knex('road_properties AS roads')
    .select('roads.id', 'roads.properties', 'roads.status', 'tags.v', 'ways.visible', 'ways.way_id')
    .distinct('roads.id')
    .leftJoin(knex.raw(`(SELECT way_id, v FROM current_way_tags WHERE k = 'or_vpromms') AS tags`), 'roads.id', 'tags.v')
    .leftJoin(knex.raw(`(SELECT id AS way_id, visible FROM current_ways WHERE visible = true) AS ways`), 'tags.way_id', 'ways.way_id')
    .where({ id: req.params.road_id })
    .then(function ([row]) {
      if (row === undefined) {
        throw 'Not Found';
      }
      return knex('admin_boundaries AS admin')
        .select('name_en', 'id')
        .where({ type: 'province', code: provinceCode })
        .then(function ([province]) {
          row['province'] = {
            id: province ? province.id : null,
            name: province ? province.name_en : null
          };
          return row;
        });
    })
    .then(function (row) {
      return knex('admin_boundaries AS admin')
        .select('name_en', 'id')
        .where({ type: 'district', code: districtCode, parent_id: row.province.id })
        .then(function ([district]) {
          row['district'] = {
            id: district ? district.id : null,
            name: district ? district.name_en : null
          };
          return row;
        });
    })
    .then(function (row) {
      if (row === undefined) { return Boom.notFound(); }
      return {
        id: row.id,
        properties: row.properties,
        hasOSMData: !!row.visible,
        status: row.status,
        way_id: row.way_id,
        province: row.province,
        district: row.district
      };
    })
    .catch(function (err) {
      console.error('Error GET /properties/roads/{road_id}', err);
      if (err === 'Not Found') {
        return Boom.notFound();
      }
      return Boom.badImplementation();
    });
}


function getByIdGeoJSONHandler(req, res) {
  const id = req.params.road_id;

  const shouldDownload = typeof req.query.download != 'undefined';

  return knex('current_way_tags AS cwt')
    .select('current_way_tags.way_id', 'current_way_tags.k', 'current_way_tags.v')
    .where('cwt.v', id)
    .leftJoin('current_way_tags', 'current_way_tags.way_id', 'cwt.way_id')
    .then((rows) => {
      const wayTags = groupBy(rows, row => get(row, 'way_id'));
      const getWayTags = (wayId) => {
        return wayTags[wayId].reduce((result, tag) => {
          result[tag.k] = tag.v;
          return result;
        }, { 'id': id, 'way_id': wayId });
      };

      return knex.raw(`
      SELECT
          cw.id AS way_id, cwt.k, cwt.v,
          ST_ASTEXT(ST_MAKEPOINT(
              cn.longitude::FLOAT / 10000000,
              cn.latitude::FLOAT / 10000000
          )) AS point
      FROM current_way_tags AS cwt
      LEFT JOIN current_ways AS cw
          ON cwt.way_id = cw.id
      LEFT JOIN current_way_nodes AS cwn
          ON cw.id = cwn.way_id
      LEFT JOIN current_nodes AS cn
          ON cwn.node_id = cn.id
      WHERE cwt.k = 'or_vpromms' AND
          cw.visible AND
          cwt.v = '${id}'
      ORDER BY cw.id,
          cwn.sequence_id
    `)
        .then(function ({ rows }) {
          const features = map(
            groupBy(rows, row => get(row, 'way_id')),
            (wayPoints, way_id) => ({
              type: 'Feature',
              properties: getWayTags(way_id),
              geometry: {
                type: 'LineString',
                coordinates: map(wayPoints, ({ point }) => ([
                  parseFloat(/[0-9\.]+/.exec(point)[0]),
                  parseFloat(/ [0-9\.]+/.exec(point)[0])
                ]))
              }
            })
          );

          return {
            type: 'FeatureCollection',
            features
          };

          // TODO-CBA: Handle this function
          if (shouldDownload) {
            return response
              .header('Content-Disposition', `attachment; filename=${id}.geojson`);
          }
          return response;
        })
        .catch(function (err) {
          console.error('Error GET /field/geometries/{id}', err);
          return Boom.badImplementation();
        });
    });

};


function getCountHandler(req, res) {
  const province = req.query.province;
  const district = req.query.district || '';


  return knex('road_properties as roads')
    .select('roads.id', 'ways.visible AS hasOSMData')
    .distinct('roads.id')
    .leftJoin(knex.raw(`(SELECT way_id, v FROM current_way_tags WHERE k = 'or_vpromms') AS tags`), 'roads.id', 'tags.v')
    .leftJoin(knex.raw(`(SELECT id AS way_id, visible FROM current_ways WHERE visible = true) AS ways`), 'tags.way_id', 'ways.way_id')
    .orderBy('roads.id', 'asc')
    .modify(function (queryBuilder) {
      if (province && district) {
        queryBuilder.whereRaw(`id LIKE '${province}_${district}%'`);
      } else if (province) {
        queryBuilder.whereRaw(`id LIKE '${province}%'`);
      }

      queryBuilder.distinct('id');
    })
    .then(function (rows) {
      let dedupeRows = uniqBy(rows, 'id');
      console.log(rows.length, dedupeRows.length);
      const total = {
        count: dedupeRows.length,
        osmCount: dedupeRows.filter(({ hasOSMData }) => hasOSMData).length
      };
      const province = {};
      const provinceRows = groupBy(dedupeRows, (r) => {
        return r.id.substr(0, 2);
      });

      each(provinceRows, (p, pcode) => {
        province[pcode] = {};
        province[pcode].count = provinceRows[pcode].length;
        province[pcode].osmCount = provinceRows[pcode].filter((r) => {
          return r.hasOSMData;
        }).length;
        province[pcode].district = {};

        const districtRows = groupBy(p, (d) => {
          return d.id.substr(3, 2);
        });
        each(districtRows, (d, dcode) => {
          province[pcode].district[dcode] = {};
          province[pcode].district[dcode].count = districtRows[dcode].length;
          province[pcode].district[dcode].osmCount = districtRows[dcode].filter((r) => {
            return r.hasOSMData;
          }).length;
        });
      });
      total['province'] = province;
      return total;
    })
    .catch(function (err) {
      console.error('Error GET /properties/roads/count', err);
      return Boom.badImplementation();
    });
}

function createHandler(req, res) {
  if (!validateId(req.params.road_id)) {
    return Boom.badData('Invalid VPROMM ID');
  }

  // check if province exists
  const provinceCode = req.params.road_id.substring(0, 2);
  return knex('admin_boundaries')
    .select('id')
    .where('type', 'province')
    .andWhere('code', provinceCode)
    .then(function (rows) {
      if (rows.length) {
        return knex('road_properties')
          .insert({ id: req.params.road_id, properties: {} })
          .then(() => ({ id: req.params.road_id }))
          .catch(function (err) {
            if (err.constraint === 'road_properties_pkey') {
              return Boom.conflict('Road already exists');
            }
            console.error('Error PUT /properties/roads/{road_id}', err);
            return Boom.badImplementation('Unknown error');
          });
      } else {
        return Boom.notFound('Invalid province code');
      }
    });
}

function moveHandler(req, res) {
  if (!validateId(req.payload.id)) {
    return Boom.badData();
  }

  return knex('road_properties')
    .where({ id: req.params.road_id })
    .update({
      id: req.payload.id
    })
    .then(function (response) {
      if (response === 0) {
        // no road_properties rows were updated, meaning id does not exist
        // return a 404 Not Found
        throw new Error('404');
      }
      return response;
    })
    .then(function () {
      return knex('current_way_tags')
        .where({ k: 'or_vpromms', v: req.params.road_id })
        .update({ v: req.payload.id });
    })
    .then(() => ({ id: req.payload.id }))
    .catch(function (err) {
      if (err.constraint === 'road_properties_pkey') { return Boom.conflict(); }
      if (err.message === '404') { return Boom.notFound(); }

      console.error('Error POST /properties/roads/{road_id}/move', err);
      return Boom.badImplementation();
    })
}

function deleteHandler(req, res) {
  return knex('field_data_geometries')
    .where('road_id', req.params.road_id)
    .update({ road_id: null })
    .then(() => knex('point_properties').where('road_id', req.params.road_id).update({ road_id: null }))
    .then(() => knex('road_properties').where('id', req.params.road_id).delete())
    .then(response => {
      if (response === 0) { return Boom.notFound(); }
      return {};
    }).catch(function (err) {
      console.error('Error: DELETE /properties/roads/{road_id}', err);
      return Boom.badImplementation();
    });
}


function patchPropertyHandler(req, res) {
  if (
    validate(req.payload) !== undefined ||
    some(req.payload, ({ path }) => path.match(/\//g).length > 1)
  ) {
    return Boom.badData();
  }

  return knex('road_properties')
    .select('id', 'properties')
    .where({ id: req.params.road_id })
    .then(function ([response]) {
      if (response === undefined) { return Boom.notFound(); }

      return knex('road_properties')
        .where({ id: req.params.road_id })
        .update({ properties: applyPatch(response.properties, req.payload).newDocument })
        .then(() => { });
    })
    .catch(function (err) {
      console.error('Error: PUT /properties/roads/{road_id}', err);
      return Boom.badImplementation();
    });
}

function statusHandler(req, res) {

  const possibleStatus = ['pending', 'reviewed'];
  if (possibleStatus.indexOf(req.payload.status) === -1) {
    console.error('Error POST /properties/roads/{road_id}/status', 'status should be pending or reviewed');
    return Boom.badData('status should be pending or reviewed');
  }

  return knex('road_properties')
    .where({ id: req.params.road_id })
    .update({ status: req.payload.status })
    .then(function (response) {
      if (response === 0) {
        // no road_properties rows were updated, meaning id does not exist
        // return a 404 Not Found
        throw new Error('404');
      }
      return response;
    })
    .then(() => ({ id: req.params.road_id }))
    .catch(function (err) {
      if (err.message === '404') { return Boom.notFound(); }

      console.error('Error POST /properties/roads/{road_id}/status', err);
      return Boom.badImplementation();
    });
}

module.exports = [
  /**
   * @api {get} /properties/roads?province=XX&district=YY&page=ZZ&sortOrder=asc Get Roads
   * @apiGroup Properties
   * @apiName Get Roads
   * @apiVersion 0.3.0
   *
   * @apiParam {String} province filter by province
   * @apiParam {String} district filter by district
   * @apiParam {Number} page request page number
   * @apiParam {String} sortField [id|hasOSMData]
   * @apiParam {String} sortOrder [asc|desc]
   *
   * @apiSuccessExample {JSON} Success-Response
   * [
   *   {
   *     "id": "212TH00002",
   *     "hasOSMData": true,
   *     "properties": { ... }
   *   },
   *   {
   *     "id": "212TH00004",
   *     "hasOSMData": false,
   *     "properties": { ... }
   *   },
   *   ...
   * ]
   *
   * @apiExample {curl} Example Usage:
   *  curl -X GET localhost:4000/properties/roads?page=1&sortField=id&sortOrder=asc&province=21&district=TH&status=pending|reviewed
   */
  {
    method: 'GET',
    path: '/properties/roads',
    handler: getHandler
  },
  /**
   * @api {get} /properties/roads/:id Get Road
   * @apiGroup Properties
   * @apiName Get Road
   * @apiVersion 0.3.0
   *
   * @apiSuccessExample {JSON} Success-Response
   * {
   *   "id": "212TH00030",
   *   "hasOSMData": true,
   *   "properties": { ... }
   * }
   *
   * @apiExample {curl} Example Usage:
   *  curl -X GET localhost:4000/properties/roads/212TH00030
   */
  {
    method: 'GET',
    path: '/properties/roads/{road_id}',
    handler: getByIdHandler
  },
  /**
   * @api {get} /properties/roads/:id.geojson Get Road GeoJSON
   * @apiGroup Properties
   * @apiName Get Road As GeoJSON
   * @apiVersion 0.3.0
   *
   * @apiSuccessExample {JSON} Success-Response
   * {
   *     "type": "FeatureCollection",
   *     "features": [
   *         {
   *             "type": "Feature",
   *             "properties": { "id": "212TH00030" },
   *             "geometry": {
   *                 "type": "LineString",
   *                 "coordinates": [...]
   *             }
   *        }
   *     ]
   * }
   *
   * @apiExample {curl} Example Usage:
   *  curl -X GET localhost:4000/properties/roads/212TH00030.geojson
   */
  {
    method: 'GET',
    path: '/properties/roads/{road_id}.geojson',
    handler: getByIdGeoJSONHandler
  },
  /**
   * @api {get} /properties/roads/count?province=XX&district=YY Get Road Counts
   * @apiGroup Properties
   * @apiName Get Road Count
   * @apiVersion 0.3.0
   *
   * @apiSuccessExample {JSON} Success-Response
   * {
   *   "count": 2805,
   *   "osmCount": 252,
   *   "pageCount": 141,
   *   "pageSize": 20
   * }
   *
   * @apiExample {curl} Example Usage:
   *  curl -X GET localhost:4000/properties/roads/count?province=21
   */
  {
    method: 'GET',
    path: '/properties/roads/count',
    handler: getCountHandler
  },

  /**
   * @api {PUT} /properties/roads/:id Create road
   * @apiGroup Properties
   * @apiName Create road
   * @apiVersion 0.3.0
   *
   * @apiParam {String} id new road id
   *
   * @apiErrorExample {json} Error-Response
   *     Road already exists
   *     HTTP/1.1 409 Conflict
   *     {
   *       error: "Conflict",
   *     }
   * @apiErrorExample {json} Error-Response
   *     Road id is invalid
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       error: "Unprocessable Entity"
   *     }
   *
   * @apiExample {curl} Example Usage:
   *  curl -X PUT http://localhost:4000/properties/roads/123
   */
  {
    method: 'PUT',
    path: '/properties/roads/{road_id}',
    handler: createHandler
  },
  /**
   * @api {PATCH} /properties/roads/:id Patch road properties
   * @apiGroup Properties
   * @apiName Patch road properties
   * @apiVersion 0.3.0
   *
   * @apiParam {String} id road id
   * @apiParam {String} json-patch patch operations to apply to road properties.  See https://tools.ietf.org/html/rfc6902 for spec details.
   *
   * @apiErrorExample {json} Error-Response
   *     Patch operations are invalid
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       error: "Unprocessable Entity"
   *     }
   *
   * @apiExample {curl} Example Usage:
   *  curl -X PATCH- H "Content-Type: application/json-patch+json" -d '[{"op": "replace", path: "/Risk Score", value: "2"}]' http://localhost:4000/properties/roads/123
   */
  {
    method: 'PATCH',
    path: '/properties/roads/{road_id}',
    handler: patchPropertyHandler
  },
  /**
   * @api {POST} /properties/roads/:id/move Rename road id
   * @apiGroup Properties
   * @apiName Rename road id
   * @apiVersion 0.3.0
   *
   * @apiParam {String} id new road id
   *
   * @apiErrorExample {json} Error-Response
   *     Road already exists
   *     HTTP/1.1 409 Conflict
   *     {
   *       error: "Conflict",
   *     }
   * @apiErrorExample {json} Error-Response
   *     Road id is invalid
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       error: "Unprocessable Entity"
   *     }
   *
   * @apiExample {curl} Example Usage:
   *  curl -X POST -H "Content-Type: application/json" -d '{"id": "456"}' http://localhost:4000/properties/roads/123/move
   */
  {
    method: 'POST',
    path: '/properties/roads/{road_id}/move',
    handler: moveHandler
  },
  /**
   * @api {DELETE} /properties/roads/:id Delete road
   * @apiGroup Properties
   * @apiName Delete road
   * @apiVersion 0.3.0
   *
   * @apiParam {String} id road id
   *
   * @apiExample {curl} Example Usage:
   *  curl -X DELETE http://localhost:4000/properties/roads/456
   */
  {
    method: 'DELETE',
    path: '/properties/roads/{road_id}',
    handler: deleteHandler
  },
  /**
   * @api {POST} /properties/roads/:id/status Change status of a road
   * @apiGroup Properties
   * @apiName Change status of a road
   * @apiVersion 0.3.0
   *
   * @apiParam {String} status
   *
   * @apiErrorExample {json} Error-Response
   *     Road id is invalid
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       error: "Unprocessable Entity"
   *     }
   *
   * @apiExample {curl} Example Usage:
   *  curl -X POST -H "Content-Type: application/json" -d '{"status": "reviewed"}' http://localhost:4000/properties/roads/123/status
   */
  {
    method: 'POST',
    path: '/properties/roads/{road_id}/status',
    handler: statusHandler
  }
];
