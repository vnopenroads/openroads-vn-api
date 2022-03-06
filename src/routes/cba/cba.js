const knex = require('connection');
const snapshotHandler = require('../../services/handlers/cba/snapshots.js')
const resultsHandler = require('../../services/handlers/cba/results.js')
const mapHandler = require('../../services/handlers/cba/map.js')

module.exports = [
  {
    method: 'GET',
    path: '/cba/roads/live',
    handler: snapshotHandler.getRoads
  },
  {
    method: 'GET',
    path: '/cba/roads/snapshots',
    handler: snapshotHandler.getSnapshots
  },
  {
    method: 'GET',
    path: '/cba/roads/snapshot/{snapshot_id}/stats',
    handler: (req, res) => snapshotHandler.getSnapshotStats(req.params.snapshot_id)
  },
  {
    method: 'GET',
    path: '/cba/roads/snapshot/{snapshot_id}/stats/surface_type',
    handler: (req, res) => snapshotHandler.getSnapshotSurfaceTypeStats(req.params.snapshot_id)
  },
  {
    method: 'GET',
    path: '/cba/roads/snapshot/{snapshot_id}',
    handler: (req, res) => snapshotHandler.getSnapshotRoads(req.params.snapshot_id)
  },
  {
    method: 'POST',
    path: '/cba/roads/snapshots/take',
    handler: snapshotHandler.createSnapshot
  },
  {
    method: 'GET',
    path: '/cba/roads/snapshot/{snapshot_id}/delete',
    handler: (req, res) => snapshotHandler.deleteSnapshot(req.params.snapshot_id)
  },

  // CBA Running and Results
  {
    method: 'GET',
    path: '/cba/run',
    handler: (req, res) => resultsHandler.runSnapshot(req)
  },
  {
    method: 'GET',
    path: '/cba/results',
    handler: (req, res) => resultsHandler.getResults(req)
  },
  {
    method: 'GET',
    path: '/cba/results/delete',
    handler: (req, res) => resultsHandler.deleteResult(req)
  },
  {
    method: 'GET',
    path: '/cba/results/kpis',
    handler: (req, res) => resultsHandler.getResultKpis(req)
  },


  // Mapping Functionality
  {
    method: 'GET',
    path: '/cba/map/districts',
    handler: (req, res) => mapHandler.getDistrictBoundaries(req.query)
  },
  {
    method: 'GET',
    path: '/cba/map/province',
    handler: (req, res) => mapHandler.getProvinceBoundary(req.query)
  },
  {
    method: 'GET',
    path: '/cba/map/road_assets',
    handler: (req, res) => mapHandler.getRoadAssets(req.query)
  }

]