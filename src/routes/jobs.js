const Queue = require('bull');
const rlpGeomQueue = require('../util/queue');
var Boom = require('@hapi/boom');

module.exports = [
  /**
   * @api {GET} /job/:id Get status of job
   * @apiGroup Job
   * @apiName GetJobStatus
   * @apiDescription Gets the status of a background job, by id
   **/
  {
    method: 'GET',
    path: '/job/{jobID}',
    handler: req => {
      const jobID = req.params.jobID;
      return rlpGeomQueue.getJob(jobID)
        .catch(_ => Boom.notFound(`Job ID (${jobID}) not found`));

    }
  }
];
