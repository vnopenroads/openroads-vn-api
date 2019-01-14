'use strict';

var knex = require('../connection');

module.exports = [
  {
    /**
     * @api {get} /roads/ids List of VProMMs ids with road geometries
     * @apiGroup Road Ids
     * @apiName Road Ids
     * @apiDescription Returns a list of VPromms ids with road geometries
     * @apiVersion 0.1.0
     *
     * @apiExample {curl} Example Usage:
     *   curl http://localhost:4000/roads/ids
     * @apiSuccessExample {array} Success-Response:
     *   ["024BX00040","022BX00029", ...]
     */
    
    method: 'GET',
    path: '/roads/ids',
    handler: function(req, res) {
      knex('current_way_tags')
        .distinct('v')
        .select('v')
        .where('k', 'or_vpromms')
        .then(vpromms => res(vpromms.map(vpromm => vpromm.v)));
    }
  }
];