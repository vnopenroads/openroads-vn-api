'use strict';

var Boom = require('boom');
const knex = require('../connection');
const queryWays = require('../services/query-ways');
const toGeoJSON = require('../services/osm-data-to-geojson');

const properties = ['id', 'way_id', 'neighbors', 'provinces', 'updated_at', 'districts'];

async function getNextTask (req, res) {
  const skip = req.query.skip ? req.query.skip.split(',') : [];
  const province = req.query.province;
  const district = req.query.district;
  const task = await knex.select(properties)
  .from('tasks')
  .where('pending', false)
  .whereNotIn('id', skip)
  .modify(function(queryBuilder) {
    if (province) {
      queryBuilder.whereRaw(`provinces @> '{${province}}'`);
    }else if (district) {
      queryBuilder.whereRaw(`districts @> '{${district}}'`);
    }
  })
  .orderByRaw('random()')
  .limit(1);

  if (!task.length) return res(Boom.notFound('There are no pending tasks'));
  const ids = [task[0].way_id].concat(task[0].neighbors);
  let boundaryType = 'province';
  let taskProviceOrDistrict = task[0].provinces[0];

  // In case the district required
  if (district) {
    boundaryType = 'district';
    taskProviceOrDistrict = task[0].districts[0];
  }

  knex('admin_boundaries AS admin')
  .select('name_en', 'id')
  .where({type: boundaryType, id: taskProviceOrDistrict })
  .then(function(boundary) {
    task[0].boundary = boundary[0];
    task[0].boundary.type = boundaryType;
    queryWays(knex, ids, true).then(function (ways) {
      return res({
        id: task[0].id,
        updated_at: task[0].updated_at,
        province: task[0].province,
        boundary: task[0].boundary,
        data: toGeoJSON(ways)
      }).type('application/json');
    }).catch(function () {
      return res(Boom.badImplementation('Could not retrieve task'));
    });
  });
}

async function getTask (req, res) {
  const task = await knex.select(properties)
  .from('tasks')
  .where('id', req.params.taskId);
  if (!task.length) return res(Boom.notFound('No task with that ID'));
  const ids = [task[0].way_id].concat(task[0].neighbors);
  queryWays(knex, ids, true).then(function (ways) {
    return res({
      id: task[0].id,
      updated_at: task[0].updated_at,
      data: toGeoJSON(ways)
    }).type('application/json');
  }).catch(function () {
    return res(Boom.badImplementation('Could not retrieve task'));
  });
}

async function getTaskCount (req, res) {
  const province = req.query.province;
  const district = req.query.district;
  if (province && district) {
    return res(Boom.badImplementation('Cannot query both district and province'));
  }
  const [{ count }] = await knex('tasks')
  .where('pending', false)
  .modify(function(queryBuilder) {
    if (province) {
      queryBuilder.whereRaw(`provinces @> '{${province}}'`);
    }
    if (district) {
      queryBuilder.whereRaw(`districts @> '{${district}}'`);
    }
  })
  .count();

  res({ count: Number(count) }).type('application/json');
}

async function setTaskPending (req, res) {
  console.log('Setting tasks to pending', req.payload.way_ids.join(', '));
  knex('tasks').whereIn('way_id', req.payload.way_ids).update({pending: true})
  .then(function () {
    return res(req.params.taskId);
  }).catch(function () {
    return res(Boom.badImplementation('Could not update task'));
  });
}

module.exports = [
  {
    /**
     * @api {get} /tasks/next GeoJSON - Get the next available task
     * @apiGroup Tasks
     * @apiName GetNextTask
     * @apiVersion 0.3.0
     *
     * @apiParam {Array} skip List of task ID's to exclude from this response.
     *
     * @apiSuccess {GeoJSON} data FeatureCollection of Roads that require merging and/or joining.
     * @apiSuccess {Integer} id Current task ID
     *
     * @apiExample {curl} Example Usage:
     *    curl http://localhost:4000/tasks/next?skip=2
     *
     * @apiSuccessExample {json} Success-Response:
     *  {
     *  "id": 1,
     *  "data": {
     *    "type": "FeatureCollection",
     *      "properties": {},
     *      "features": [
     *        {
     *          "type": "Feature",
     *          "properties": {
     *            "highway": "secondary",
     *            "or_vpromms_id": "213TT00008"
     *          },
     *          "meta": {
     *            "id": "87",
     *            "changeset": "1",
     *            "timestamp": "2017-10-04T21:48:20.702Z",
     *            "version": "1"
     *          },
     *          "geometry": {
     *            "type": "LineString",
     *            "coordinates": [[123.8149137,9.5920337],
     *              ...
     *            ]}
     *        },
     *      ...]
     *    }
     *  }
     */
    method: 'GET',
    path: '/tasks/next',
    handler: getNextTask
  },

  {
    /**
     * @api {get} /tasks/:id GeoJSON - Get a specific task
     * @apiGroup Tasks
     * @apiName GetTask
     * @apiVersion 0.3.0
     *
     * @apiSuccess {GeoJSON} data FeatureCollection of Roads that require merging and/or joining.
     * @apiSuccess {Integer} id current task ID
     *
     * @apiExample {curl} Example Usage:
     *    curl http://localhost:4000/tasks/1
     *
     * @apiSuccessExample {json} Success-Response:
     *  {
     *  "id": 1,
     *  "data": {
     *    "type": "FeatureCollection",
     *      "properties": {},
     *      "features": [
     *        {
     *          "type": "Feature",
     *          "properties": {
     *            "highway": "secondary",
     *            "or_vpromms_id": "213TT00008"
     *          },
     *          "meta": {
     *            "id": "87",
     *            "changeset": "1",
     *            "timestamp": "2017-10-04T21:48:20.702Z",
     *            "version": "1"
     *          },
     *          "geometry": {
     *            "type": "LineString",
     *            "coordinates": [[123.8149137,9.5920337],
     *              ...
     *            ]}
     *        },
     *      ...]
     *    }
     *  }
     */
    method: 'GET',
    path: '/tasks/{taskId}',
    handler: getTask
  },

  {
    /**
     * @api {get} /tasks/count GeoJSON - Get the count of remaining tasks
     * @apiGroup Tasks
     * @apiName GetTaskCount
     * @apiVersion 0.3.0
     *
     * @apiSuccess {Integer} count Count of remaining tasks
     *
     * @apiExample {curl} Example Usage:
     *    curl http://localhost:4000/tasks/count
     *
     * @apiSuccessExample {json} Success-Response:
     *  {
     *    "count": 100
     *  }
     */
    method: 'GET',
    path: '/tasks/count',
    handler: getTaskCount
  },

  {
    /**
     * @api {PUT} /tasks/pending Update a list of tasks' status to 'pending'
     * @apiGroup Tasks
     * @apiName UpdateTask
     * @apiVersion 0.3.0
     * @apiDescription Set a task status to pending.
     * Returns the updated task ID.
     *
     * @apiParam {Array} way_ids comma-separated list of way ids to set as 'pending'
     *
     * @apiExample {curl} Example Usage:
     *  curl -X PUT -H "Content-Type: application/json" -d '{"way_ids": [1, 2, 3]}' http://localhost:4000/tasks/pending
     */
    method: 'PUT',
    path: '/tasks/pending',
    handler: setTaskPending
  }
];
