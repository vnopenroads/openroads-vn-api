var knex = require('../connection.js');

module.exports = [
  /**
   * @api {get} /ids Return all road IDs
   *
   * @apiSuccess {Array} ids IDs
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/ids
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
    path: '/ids',
    handler: function (req, res) {
      knex('road_properties')
        .select('id')
        .map(entry => entry.id)
      .then(res);
    }
  }
];
