'use strict';

var knex = require('./connection');
var assert = require('assert');
var readFileSync = require('fs').readFileSync;
Promise = require('bluebird');

/**
 * given a knex db connect object, initializes schema for db to which it is connected
 * @func initSchema
 * @param {object} databaseConnection knex connection object
 */
exports.initSchema = function (databaseConnection) {
  return Promise(function(resolve, reject) {
    // insert db schema by chaining each of the table's schema functions together
    macrocosmSchema(knex, Promise)
    .then(function() { return propertiesSchema(knex, Promise); })
    .then(function() { return adminBoundariesSchema(knex, Promise); })
    .then(function() { return fieldDataSchema(knex, Promise); })
    .then(function() { return roadStatsSchema(knex, Promise); })
    .then(function() { return knex.destroy() })
    .then(function() { return resolve()})
    .catch(function(e) { 
      throw new Error(e) 
      return reject()
    })
  })
}
  

/**
 * given a db url, returns a knex obj to connect a pg client
 * @func dbConnect
 * @param {string} connection 
 */
exports.dbConnect = function (connection) { 
  return require('knex')({
    client: 'pg',
    connection: connection,
    debug: false,
    pool: {
      min: 2,
      max: 10
    }
  });
}

/**
 * makes macrocosm schema
 * @func macrocosmSchema
 */
function macrocosmSchema (knex, Promise) {
  // statements to add macrocosm schema
  return knex.raw(readFileSync('../sql/macrocosm-db.sql').toString())
  .then(function() {})
  .catch(function(e) { throw new Error(e); });
}

/**
 * makes admin boundaries table 
 * @func adminBoundariesSchema schema
 */
function adminBoundariesSchema (knex, Promise) {
  // statements to add adminBoundariesSchema
  return knex.raw(readFileSync('../sql/201709141932_admin_boundaries.sql').toString())
  .then(function() {})
  .catch(function(e) { throw new Error(e); });
}

/**
 * makes properties schema
 * @func propertiesSchema
 */
function propertiesSchema (knex, Promise) {
  return knex.raw(readFileSync('../sql/201709142003_properties.sql').toString())
  .then(function() {})
  .catch(function(e) { throw new Error(e)});
}

/**
 * makes field data schema
 * @func fieldDataSchema
 */
function fieldDataSchema (knex, Promise) {
  return knex.raw(readFileSync('../sql/201709142329_field_data_geometries.sql').toString())
  .then(function() {})
  .catch(function(e) { throw new Error(e); });
}

/**
 * makes road stats schema
 * @func roadStatsSchema
 */
function roadStatsSchema (knex, Promise) {
  return knex.raw(readFileSync('../sql/201709142341_road_stats.sql').toString())
  .then(function() {})
  .catch(function(e) { throw new Error(e); });
}
