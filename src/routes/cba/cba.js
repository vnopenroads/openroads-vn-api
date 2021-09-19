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
    path: '/cba/roads/live',
    handler: cba.getRoads
  },
  {
    method: 'GET',
    path: '/cba/roads/snapshots',
    handler: cba.getSnapshots
  },
  {
    method: 'GET',
    path: '/cba/roads/snapshot/{snapshot_id}/stats',
    handler: (req, res) => cba.getSnapshotStats(req.params.snapshot_id)
  },
  {
    method: 'GET',
    path: '/cba/roads/snapshot/{snapshot_id}/stats/surface_type',
    handler: (req, res) => cba.getSnapshotSurfaceTypeStats(req.params.snapshot_id)
  },
  {
    method: 'GET',
    path: '/cba/roads/snapshot/{snapshot_id}',
    handler: (req, res) => cba.getSnapshotRoads(req.params.snapshot_id)
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
    path: '/cba/roads/snapshots/take',
    handler: cba.createSnapshot
  },

  {
    method: 'GET',
    path: '/cba/run',
    handler: (req, res) => cba.runSnapshot(req)
  },

  {
    method: 'GET',
    path: '/cba/results',
    handler: (req, res) => cba.getResults(req)
  },

  {
    method: 'GET',
    path: '/cba/results/delete',
    handler: (req, res) => cba.deleteResult(req)
  },

  {
    method: 'GET',
    path: '/cba/results/kpis',
    handler: (req, res) => cba.getResultKpis(req)
  }

]