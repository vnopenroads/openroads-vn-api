'use strict';

const _ = require('lodash');
const Boom = require('boom');
const knex = require('../connection.js');

function getHandler (req, res) {
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

function getIdsHandler(req, res) {
  knex('road_properties')
    .select('id')
    .map(entry => entry.id)
  .then(res);
}

function deleteHandler (req, res) {
  // This method will have issues if commas are used in road IDs
  const idsToDelete = req.query.ids && req.query.ids.split(',');
  if (!idsToDelete) {
    return res(Boom.badRequest('Must provide a querystring list of road `ids` to delete'));
  }
  if (new Set(idsToDelete).size < idsToDelete.length) {
    return res(Boom.badRequest('Cannot have duplicate road `ids`'));
  }

  knex('road_properties')
    .whereIn('id', idsToDelete)
    .select('id')
    .then(idsInDB => {
      if (idsInDB.length < idsToDelete.length) {
        return res(Boom.badRequest(`Some requested road IDs not present in database: ${JSON.stringify(_.difference(idsToDelete, idsInDB))}`));
      } else {
        knex('road_properties')
          .whereIn('id', idsToDelete)
          .delete()
          .then(() => res(idsToDelete));
      }
    });
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
    handler: getHandler
  },
  /**
   * @api {get} /properties/roads/ids All road IDs
   * @apiGroup Properties
   *
   * @apiSuccess {Array} ids IDs
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/properties/roads/ids
   *
   * @apiSuccessExample {json} Success-Response:
   *  [
   *    "001ZZ33333",
   *    "123AB87654",
   *    "987NA00001"
   *  ]
   */
  {
    method: 'GET',
    path: '/properties/roads/ids',
    handler: getIdsHandler
  },
  /**
   * @api {DELETE} /properties/roads Delete road IDs
   * @apiVersion 0.3.0
   * @apiGroup Properties
   *
   * @apiParam {Object} properties CSV of properties by road ID
   *
   * @apiSuccess {Array} deleted Array of IDs successfully deleted
   *
   * @apiExample {curl} Example Usage:
   *  curl -X DELETE http://localhost:4000/properties/roads?ids=123AB87654,999XX01010
   *
   * @apiSuccessExample {json} Success-Response:
   *  ["123AB87654", "999XX01010"]
   */
  {
    method: 'DELETE',
    path: '/properties/roads',
    handler: deleteHandler
  }
];
