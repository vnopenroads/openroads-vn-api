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

function createHandler(req, res) {
  knex('road_properties')
    .insert({
      id: req.params.road_id,
      properties: {}
    })
  .then(function(response) {
    return res({ id: req.params.road_id }).type('application/json');
  })
  .catch(function(err) {
    if (err.constraint === 'road_properties_pkey') {
      return res(Boom.conflict());
    }

    return res(Boom.badImplementation());
  });
}

function moveHandler(req, res) {
  return knex('road_properties')
    .where({ id: req.params.road_id })
    .update({
      id: req.payload.id
    })
  .then(function(response) {
    if (response === 0) {
      // no road_properties rows were updated, meaning no road_properties row w/ id exists
      // return a 404 Not Found
      throw new Error('404');
    }
    return response;
  })
  .then(function() {
    return knex('current_way_tags')
      .where({
        k: 'or_vpromms',
        v: req.params.road_id
      })
      .update({
        v: req.payload.id
      });
  })
  .then(function(response) {
    return res({ id: req.payload.id }).type('application/json');
  })
  .catch(function(err) {
    console.error('Error /properties/roads/{road_id}/move', err);
    if (err.message === '404') {
      return res(Boom.notFound());
    }
    return res(Boom.badImplementation());
  });
}

function deleteHandler(req, res) {
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
    if (response === 0) {
      return res(Boom.notFound());
    }

    res();
  })
  .catch(function(err) {
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
  /**
   * @api {PUT} /properties/roads/:id Create road
   * @apiGroup Properties
   * @apiName Create road
   * @apiVersion 0.3.0
   *
   * @apiParam {String} id new road id
   *
   * @apiErrorExample {json} Error-Response
   *     HTTP/1.1 409 Conflict
   *     {
   *       message: "road already exists"
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
   * @api {POST} /properties/roads/:id/move Rename road id
   * @apiGroup Properties
   * @apiName Rename road id
   * @apiVersion 0.3.0
   *
   * @apiParam {String} id new road id
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
  }
];
