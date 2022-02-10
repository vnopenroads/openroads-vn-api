'use strict';

const _ = require('lodash');
const csvParse = import('d3-dsv').csvParse;
const errors = require('../util/errors');
const { NO_ID } = require('../util/road-id-utils');
const knex = require('../connection.js');

function upload(req) {
  var parsed;
  try {
    parsed = csvParse(req.payload.toString());
  } catch (e) {
    return errors.noCSV;
  }
  if (parsed.columns.length === 0) { return errors.noCSVRows; }
  if (new Set(parsed.columns).size < parsed.columns.length) { return errors.noDuplicateTabularHeaders; }

  const roadIdName = parsed.columns[0];
  const roadIds = parsed.map(p => p[roadIdName]);

  if (parsed.columns.some(c => c.includes('"') || c.includes(','))) { return errors.noQuotesInTabularHeader; }
  if (roadIds.some(id => id.includes('"'))) { return errors.noExtraQuotesInTabular; }
  if (roadIds.includes(null)) { return errors.nullRoadIds; }
  if (roadIds.includes(NO_ID)) { return errors.cannotUseNoId; }

  knex.select()
    .from('road_properties')
    .whereIn('id', roadIds)
    .then(existingRoads => {
      const existingIds = existingRoads.map(er => er.id);
      const newIds = _.difference(roadIds, existingIds);
      if (newIds.length) { return errors.unknownRoadIds(newIds); }

      Promise.all(
        existingRoads.map(road =>
          knex('road_properties').where('id', road.id).update(
            'properties',
            Object.assign({}, road.properties, _.omit(parsed.find(p => road.id === p[roadIdName]), roadIdName))
          )
        )
      ).then(() => existingIds);
    });
};

module.exports = [
  /**
   * @api {POST} /properties/roads/tabular Upload properties by road ID
   * @apiVersion 0.3.0
   * @apiGroup Properties
   * @apiName UploadTabular
   * @apiDescription Upload tabular properties, with each row a road ID
   * Return a list of which roads were updated in the `road_properties` table
   *
   * Upload CSV data in the following form: The first column should
   * contain the road ID; accordingly, the first column's header
   * doesn't matter. All other column headers will be used as
   * the property name for that value in ORMA. All values are imported
   * as strings. Commas and quotes not allowed in header cells. Do not
   * use quotes in any cells, unless they contain a comma.
   *
   * @apiParam {Object} properties CSV of properties by road ID
   *
   * @apiSuccess {Array} added Road IDs for which point-properties were uploaded
   *
   * @apiExample {curl} Example Usage:
   *  curl --data-binary 'road ID,your property,another property,Yet Another Property
   *  123AB87654,concrete,52,high
   *  001ZZ33333,gravel,990,high
   *  987NA00001,earth,1.23,medium' -H 'Content-Type: text/csv' http://localhost:4000/properties/roads/tabular
   *
   * @apiSuccessExample {json} Success-Response:
   *  [
   *    "001ZZ33333",
   *    "123AB87654",
   *    "987NA00001"
   *  ]
   *
   */
  {
    method: 'POST',
    path: '/properties/roads/tabular',
    handler: upload,
    config: {
      payload: {
        maxBytes: 4194304,
        allow: 'text/csv',
        parse: false
      }
    }
  }
];
