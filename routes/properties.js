'use strict';

const _ = require('lodash');
const knex = require('../connection.js');

function handler (req, res) {
  knex('road_properties')
    .select('*')
    .then(result => res(result.reduce(
      (all, one) => {
        const properties = req.query.keys ?
          _.pick(one.properties, req.query.keys.split(',')) :
          one.properties;
        all[one.id] = properties;
        return all;
      }, {}
    )));
}

module.exports = [
  /**
   * @api {get} /properties/roads Properties by road ID
   * @apiGroup Properties
   *
   * @apiSuccess {Object} with nested objects for each of the keys in the query string. If no query string is passed, nested objects are blank
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/properties/roads?key=source,iri_mean
   *
   * @apiSuccessExample {json} Success-Response:
   *  {
   *    '123AB87654': {
   *      'source': 'RoadLab',
   *      'iri_mean': 3.42
   *     }
   *  },
   *  ...
   */
  {
    method: 'GET',
    path: '/properties/roads',
    handler: handler
  }
];
