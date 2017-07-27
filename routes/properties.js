'use strict'

var Boom = require('boom');

var knex = require('../connection.js');
var rp = require('request-promise');
var api = 'http://localhost:4000/';
var queryWays = require('../services/query-ways');
var flattenDeep = require('lodash.flattendeep');
var groupBy = require('lodash.groupby')
var includes = require('lodash.includes');
var assign = require('lodash.assign');
var reduce = require('lodash.reduce');
Promise = require('bluebird');
module.exports = [
  /**
   * @api {get} /ids Return all VProMMS ids in the database
   *
   * @apiSuccess {Array} ids IDs
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/ids
   *
   * @apiSuccessExample {json} Success-Response:
   *  [1, 2, 3, 4]
   */
  {
    method: 'GET',
    path: '/properties',
    handler: function (req, res) {
      let desired;
      if (req.query) {

      }
      rp(api + 'ids')
      .then((ids) => {
        ids = JSON.parse(ids)
        return knex.select('way_id')
          .from('current_way_tags')
          .whereIn('v', ids)
        .then((wayIds) => {
          wayIds = flattenDeep(wayIds);
          wayIds = wayIds.map((wayId) => { return wayId.way_id});
          return knex.select('*')
            .from('current_way_tags')
            .whereIn('way_id', wayIds)
          .then((results) => {
            results = groupBy(
              results,
              (result) => {
                return result.way_id
              }
            )
            const finResults = {};
            Object.keys(results).map((key) => {
              let vpromms = results[key].filter((resultObj) => {
                return (resultObj.k === 'or_vpromms' && resultObj.v !== '');
              })[0]
              if (vpromms) {
                let data;
                if (req.query.keys) {
                  const desired = req.query.keys.split(',');
                  data = results[key].filter((resultObj) => {
                    return includes(desired, resultObj.k);
                  }).map((data) => {
                    const key = data.k
                    const val = data.v
                    const returnObj = {};
                    returnObj[key] = val;
                    return returnObj;
                  })
                } else {
                  data = {};
                }
                data = reduce(data, (dataObj, d) => {
                  return assign(dataObj, d)
                }, {})
                vpromms = vpromms.v;
                finResults[vpromms] = data;
              }
            });
            res(finResults);
          });
        })
      })
    }
  }
];
