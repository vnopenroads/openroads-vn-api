const Queue = require('bull');
const rlpGeomQueue = new Queue('RLP geometries');
var Boom = require('boom');

function jobHandler(req, res) {
  const jobID = req.params.jobID;
  rlpGeomQueue.getJob(jobID)
    .then(data => {
      res(data);
    })
    .catch(e => {
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