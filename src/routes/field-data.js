'use strict';

var knex = require('../connection.js');
var Boom = require('@hapi/boom');
var groupGeometriesById = require('../services/field-data').groupGeometriesById;
var makeGeomsFC = require('../services/field-data').makeGeomsFC;

module.exports = [
  {
    /**
     * @api {get} /field/ids List of VProMMs ids with field data
     * @apiGroup Field
     * @apiName Field ids
     * @apiDescription Returns a list of VPromms ids with field data
     * @apiVersion 0.1.0
     *
     * @apiExample {curl} Example Usage:
     *   curl http://localhost:4000/field/ids
     * @apiSuccessExample {array} Success-Response:
     *   ["024BX00040","022BX00029", ...]
     */
    method: 'GET',
    path: '/field/ids',
    handler: () =>
      knex('field_data_geometries')
        .distinct('road_id')
        .select('road_id as id')
        .whereNotNull('road_id')
        .then(roads => roads.map(road => road.id))
  },
  {
    /**
    * @api {get} /field/ids/all List of all VPRoMM ids with and without field data
    * @apiGroup Field
    * @apiName All field ids
    * @apiDescription Returns a list of all VPRomm ids in the system
    * @apiVersion 0.1.0
    *
    * @apiExample {curl} Example Usage:
    *   curl http://localhost:4000/field/ids/all
    * @apiSuccessExample {array} Success-Response:
    *   ["024BX00040","022BX00029", ...]
    */
    method: 'GET',
    path: '/field/ids/all',
    handler: () => knex('road_properties')
      .distinct('id')
      .select('id as id')
      .whereNotNull('id')
      .then(roads => roads.map(road => road.id))
  }
];

