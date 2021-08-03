const cba = require('../../services/handlers/cba.js')

module.exports = [
  /**
   * @api {get} /cba/roads?province=XX&district=YY&page=ZZ&sortOrder=asc Get Roads in CBA format
   * @apiGroup CBA
   * @apiName Get Roads
   * @apiVersion 0.3.0
   *
   * @apiParam {String} province filter by province
   * @apiParam {String} district filter by district
   * @apiParam {Number} page request page number
   * @apiParam {String} sortField [id|hasOSMData]
   * @apiParam {String} sortOrder [asc|desc]
   *
   * @apiSuccessExample {JSON} Success-Response
   * [
   *   {
   *     "id": "212TH00002",
   *     "hasOSMData": true,
   *     "properties": { ... }
   *   },
   *   {
   *     "id": "212TH00004",
   *     "hasOSMData": false,
   *     "properties": { ... }
   *   },
   *   ...
   * ]
   *
   * @apiExample {curl} Example Usage:
   *  curl -X GET localhost:4000/cba/roads?page=1&sortField=id&sortOrder=asc&province=21&district=TH&status=pending|reviewed
   */
  {
    method: 'GET',
    path: '/cba/roads',
    handler: cba.getRoads
  },

  /**
   * @api {PUT} /cba/roads/:id Create road
   * @apiGroup CBA
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
   *  curl -X POST http://localhost:4000/properties/roads/123
   */
  {
    method: 'POST',
    path: '/cba/road_archives/{archive_id}',
    handler: cba.saveRoadArchive
  }

]