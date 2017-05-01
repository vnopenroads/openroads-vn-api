var knex = require('../connection.js');

module.exports = [
  /**
   * @api {get} /ids Return all VProMMS ids in the database
   *
   * @apiSuccess {Array<number>} ids
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/ids
   *
   * @apiSuccessExample {json} Success-Response:
   *  [1, 2, 3, 4]
   */
  {
    method: 'GET',
    path: '/ids',
    handler: function (req, res) {
      knex('current_way_tags')
        .where('k', 'or_vpromms')
        .distinct('v')
        .select('v')
      .then(res);
    }
  }
];
