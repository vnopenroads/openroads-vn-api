'use strict';
const Boom = require('boom');
const knex = require('../connection.js');


const validateId = (id) => /^\d{3}([A-ZĐ]{2}|00)\d{5}$/.test(id);


function getHandler (req, res) {
  const PAGE_SIZE = 20;
  const sortOrder = req.query.sortOrder || 'asc';
  const page = parseInt(req.query.page) || 1;
  const province = req.query.province;
  const district = req.query.district;

  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    return res(Boom.badData(`Expected 'sortOrder' query param to be either 'asc', 'desc', or not included.  Got ${req.query.sortOrder}`));
  }

  if (isNaN(page)) {
    return res(Boom.badData(`Expected 'page' query param to be a number, or not included.  Got ${req.query.page}`));
  }


  knex('road_properties')
    .select('road_properties.id', 'osm_tag.v as hasOSMData')
    .modify(function(queryBuilder) {
      if (province && district) {
        queryBuilder.whereRaw(`id LIKE '${province}_${district}%'`);
      } else if (province) {
        queryBuilder.whereRaw(`id LIKE '${province}%'`);
      }
    })
    .leftJoin(knex.raw(`(SELECT DISTINCT v FROM current_way_tags WHERE k = 'or_vpromms') as osm_tag`), 'road_properties.id', 'osm_tag.v')
    .orderBy('id', sortOrder)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
  .then(function(response) {
    return res(
      response.map((road) => ({
        ...road, hasOSMData: !!road.hasOSMData
      }))
    ).type('application/json');
  })
  .catch(function(err) {
    console.error('Error GET /properties/roads', err);
    return res(Boom.badImplementation());
  });
}


function createHandler(req, res) {
  if (!validateId(req.params.road_id)) {
    return res(Boom.badData());
  }

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

    console.error('Error PUT /properties/roads/{road_id}', err);
    return res(Boom.badImplementation());
  });
}

function moveHandler(req, res) {
  if (!validateId(req.payload.id)) {
    return res(Boom.badData());
  }

  return knex('road_properties')
    .where({ id: req.params.road_id })
    .update({
      id: req.payload.id
    })
  .then(function(response) {
    if (response === 0) {
      // no road_properties rows were updated, meaning id does not exist
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
    if (err.constraint === 'road_properties_pkey') {
      return res(Boom.conflict());
    }

    if (err.message === '404') {
      return res(Boom.notFound());
    }

    console.error('Error POST /properties/roads/{road_id}/move', err);
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
    console.error('Error: DELETE /properties/roads/{road_id}', err);
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
  }
];
