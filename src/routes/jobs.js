const Queue = require('bull');
const rlpGeomQueue = require('../util/queue');
var Boom = require('@hapi/boom');

function jobHandler(req, res) {
  const jobID = req.params.jobID;
  return rlpGeomQueue.getJob(jobID)
    .catch(e => {
      console.error(e);
      res(Boom.notFound('Job ID not found'));
    });
}


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
    handler: jobHandler
  }
];
