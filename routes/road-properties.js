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
  return knex('field_data_geometries')
    .where('road_id', req.params.road_id)
    .update({
      road_id: null
    })
  .then(function() {
    return knex('point_properties')
      .where('road_id', req.params.road_id)
      .update({
        road_id: null
      });
  })
  .then(function() {
    return knex('road_properties')
      .where('id', req.params.road_id)
      .delete();
  })
  .then(function(response) {
    console.log('response', res);
    if (response === 0) {
      return res(Boom.notFound());
    }

    res();
  })
  .catch(function(err) {
    console.log('error', err);
    return res(Boom.badImplementation());
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
  {
    method: 'DELETE',
    path: '/properties/roads/{road_id}',
    handler: deleteHandler
  }
];
