'use strict';

const https = require('https');
const url = require('url');
const get = require('lodash').get;
const initSchema = require('./init-schema').initSchema;
const dbConnect = require('./init-schema').dbConnect;
Promise = require('bluebird');

/**
 * given an event and context, gets db url
 * @func handler
 * @param {object} event 
 * @param {*} context 
 * @param {func} cb 
 */
exports.handler = function(event, context, cb) {
  const es = get(event, 'ResourceProperties.ElasticSearch');
  const db = get(event, 'ResourceProperties.database');
  const requestType = get(event, 'RequestType');

  const actions = [
    bootstrapElasticSearch(get(es, 'host')),
    bootstrapDBConnection(get(db, 'url'))
  ];
  
  return Promise.all(actions).then((results) => {
    const dbURL = results[1];
    const dbConnection = dbConnect(dbURL);
    // initSchema. If there are no errors, send a SUCCESS response. Otherwise, send a FAILED response.
    initSchema(dbConnection)
    .then(() => { return sendResponse(event, 'SUCCESS', {}, cb); })
    .catch((e) => {
      console.error(e);
      return sendResponse(event, 'FAILED', null, cb);
    });
  });
}

async function bootstrapElasticSearch(host, index = 'openroads-db-index') {
  if (!host) {
    return;
  }

  const esClient = await Search.es(host);

  // check if the index exists
  const exists = await esClient.indices.exists({ index });

  if (!exists) {
    // add mapping
    await esClient.indices.create({
      index,
      body: { mappings }
    });
    console.log(`index ${index} created and mappings added.`);
  }
  else {
    console.log(`index ${index} already exists`);
  }

  return;
}

/**
 * @func bootstrapDBConnection
 */
function bootstrapDBConnection(db) {
  if (!db) {
    return new Promise((resolve) => resolve());
  }
  return new Promise ((resolve) => resolve(db))
}

/**
 * sends response of elastic search
 * @func sendResponse
 * @param {object} event
 * @param {*} status
 * @param {object} data
 * @param {func} cb
 */
function sendResponse(event, status, data = {}, cb = () => {}) {
  const body = JSON.stringify({
    Status: status,
    PhysicalResourceId: physicalId,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: data
  });

  console.log('RESPONSE BODY:\n', body);

  const parsedUrl = url.parse(event.ResponseURL);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'PUT',
    headers: {
      'content-type': '',
      'content-length': body.length
    }
  };

  console.log('SENDING RESPONSE...\n');

  const request = https.request(options, (response) => {
    console.log(`STATUS: ${response.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
    // Tell AWS Lambda that the function execution is done
    cb();
  });

  request.on('error', (error) => {
    console.log(`sendResponse Error: ${error}`);
    // Tell AWS Lambda that the function execution is done
    cb(error);
  });

  // write data to request body
  request.write(body);
  request.end();
}
