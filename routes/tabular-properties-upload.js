'use strict';

const _ = require('lodash');
const csvParse = require('d3-dsv').csvParse;
const Boom = require('boom');
const knex = require('../connection.js');

function upload (req, res) {
  var parsed;
  try {
    parsed = csvParse(req.payload.toString());
  } catch (e) {
    return res(Boom.badRequest('No CSV provided, or cannot parse CSV'));
  }
  if (parsed.columns.length === 0) {
    return res(Boom.badRequest('CSV must contain data'));
  }
  if (new Set(parsed.columns).size < parsed.columns.length) {
    return res(Boom.badRequest('CSV cannot have duplicate column names'));
  }

  const roadIdName = parsed.columns[0];
  const roadIds = parsed.map(p => p[roadIdName]);
  knex.select()
    .from('road_properties')
    .whereIn('id', roadIds)
    .then(existingRoads => {
      const existingIds = existingRoads.map(er => er.id);
      const newIds = _.difference(roadIds, existingIds);

      Promise.all(
        existingRoads.map(road =>
          knex('road_properties').where('id', road.id).update(
            'properties',
            Object.assign({}, road.properties, _.omit(parsed.find(p => p[roadIdName]), roadIdName))
          )
        ).concat(newIds.map(id =>
          knex('road_properties').insert({
            id,
            properties: _.omit(parsed.find(p => p[roadIdName]), roadIdName)
          })
        ))
      ).then(() => res({
        tabular: {
          new_roads: {
            count: newIds.length,
            ids: newIds
          },
          updated_roads: {
            count: existingIds.length,
            ids: existingIds
          }
        }
      }));
    });
};

module.exports = [
  /**
   * @api {POST} /tabular Upload properties by road ID
   * @apiGroup Properties
   * @apiName UploadTabular
   * @apiDescription Upload tabular properties, with each row a road ID
   * Return a list of which roads were created, versus updated
   * in the road_properties table
   *
   * Upload CSV data in the following form. The first column header
   * doesn't matter, and all other column headers will be used as
   * the property name for that value in ORMA. All values are imported
   * as strings. Do not quote headers or values unless they contain commas.
   * <pre><code>
   * road ID,your property,another property,Yet Another Property
   * 123AB87654,concrete,52,high
   * 001ZZ33333,gravel,990,high
   * 987NA00001,earth,1.23,medium
   * </code></pre>
   *
   * @apiVersion 0.3.0
   *
   * @apiParam {Object} properties CSV of properties by road ID
   *
   * @apiSuccess {Object} tabular Tabular response object
   * @apiSuccess {Object} tabular.new_roads Roads that weren't already in the `road_properties` table
   * @apiSuccess {Number} tabular.new_roads.count Number of new roads
   * @apiSuccess {Array} tabular.new_roads.road_ids List of which roads these were
   * @apiSuccess {Object} tabular.updated_roads Roads that were already in the `road_properties` table
   * @apiSuccess {Number} tabular.updated_roads.count Number of updated roads
   * @apiSuccess {Array} tabular.updated_roads.road_ids List of which roads these were
   *
   * @apiExample {curl} Example Usage:
   *  curl -d 'road ID,your property,another property,Yet Another Property
   *  123AB87654,concrete,52,high
   *  001ZZ33333,gravel,990,high
   *  987NA00001,earth,1.23,medium' -H 'Content-Type: text/csv' http://localhost:4000/tabular
   *
   * @apiSuccessExample {json} Success-Response:
   *  {
   *    "tabular": {
   *      "new_roads": {
   *        "count": 2,
   *        "ids": ["123AB87654", "987NA00001"]
   *      },
   *      "updated_roads": {
   *        "count": 1,
   *        "ids": ["001ZZ33333"]
   *      }
   *    }
   *  }
   */
  {
    method: 'POST',
    path: '/tabular',
    handler: upload,
    config: {
      payload: {
        allow: 'text/csv',
        parse: false
      }
    }
  }
];
