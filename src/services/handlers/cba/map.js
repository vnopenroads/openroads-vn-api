'use strict'
const fetch = require('node-fetch');
const knex = require('connection');
const utils = require('../utils.js');
var Boom = require('@hapi/boom');
const config = require('config/config').config;
const configHandler = require('./user-config.js');
const snapshotHandler = require('./snapshots.js');
const JSON5 = require('json5')

exports.getDistrictBoundaries = function (query) {
    let province_id = 294; // query.snapshot_id;
    return knex.raw(`
    select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
        )
    from ( SELECT id, name_en, ST_Simplify(geom, 0.01)
           FROM admin_boundaries
           WHERE parent_id = ${province_id}
         ) as t;
    `);
}

exports.getProvinceBoundary = function (query) {
    let province_id = 294; // query.snapshot_id;
    return knex.raw(`
        select json_build_object('type', 
                                 'FeatureCollection', 
                                 'features', 
                                 json_agg(ST_AsGeoJSON(t.*)::json)
                                ),
                ST_AsText(st_centroid(st_collect(t.geom))) as centroid
        from (SELECT id, name_en, ST_Simplify(geom, 0.01) as geom
              FROM admin_boundaries
              WHERE id = ${province_id}
             ) as t;
    `);
}

exports.getRoadAssets = function (query) {
    return knex.raw(`
        select json_build_object('type', 'FeatureCollection', 
                                 'features', json_agg(ST_AsGeoJSON(t.*)::json)
                                )
        from (SELECT l.way_id, eirr, npv, work_year, l.geom
              FROM cba_snapshot_results r
              LEFT JOIN lines_with_admin l
                     ON l.way_id = r.way_id
              WHERE cba_road_snapshot_id = ${query.snapshot_id}
              AND cba_user_config_id = ${query.config_id}
             ) as t;
    `);
}
