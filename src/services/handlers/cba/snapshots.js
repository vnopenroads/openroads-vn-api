'use strict'
const fetch = require('node-fetch');
const knex = require('connection');
const utils = require('../utils.js');
const config = require('config/config').config;
var Boom = require('@hapi/boom');

exports.getSnapshots = async function (req, res) {
    return knex('cba_road_snapshots')
        .select('*')
        .catch(utils.errorHandler);
}

exports.getSnapshotStats = async function (snapshotId) {
    console.log(snapshotId);
    var count = await knex('cba_road_snapshots').where('id', snapshotId).count().first();
    if (count.count == 0) {
        return Boom.badRequest("No such snapshotId: " + snapshotId);
    }

    return knex('cba_road_snapshots')
        .select('*')
        .where('id', snapshotId)
        .first()
        .catch(utils.errorHandler);
}

exports.getSnapshotSurfaceTypeStats = function (snapshotId) {
    return knex('cba_road_snapshots_data')
        .select('surface_type')
        .sum({ 'length': 'length' })
        .groupBy('surface_type')
        .where('cba_road_snapshot_id', snapshotId)
        .catch(utils.errorHandler);
}

var select_columns = `way_id, vp_id, province, district, vp_length, length, surface_type, 
                      condition, pave_age, traffic_level, road_type, width, lanes, terrain, aadt_mcyc, aadt_sc,
                      aadt_mc,aadt_dv,aadt_lt,aadt_mt, aadt_ht, aadt_at,aadt_sb, aadt_mb,aadt_lb`;
var insert_columns = `cba_road_snapshot_id, ${select_columns}`;

function copySnapshotData(id, payload) {
    var sql = `
      INSERT INTO cba_road_snapshots_data(${insert_columns})
      SELECT ${id} as cba_road_snapshot_id, ${select_columns} 
      FROM v_roads_cba
    `;
    var prom;
    if (payload.province_id) {
        prom = knex.raw(`${sql} WHERE province = ?`, [payload.province_id]);
    } else {
        prom = knex.raw(sql);
    }
    return prom;
}

function retrieveSnapshotMeta(id) {
    console.log("Generating meta data for " + id);
    return (result) => {
        return knex('cba_road_snapshots_data')
            .select('*')
            .where('cba_road_snapshot_id', '=', id)
            .then((response) => {
                var url = `${config.cba_api}/evaluate_assets`;
                var opts = {
                    method: 'POST',
                    body: JSON.stringify(response.map(utils.convertToPythonFormat)),
                    headers: { 'Content-Type': 'application/json' }
                };
                return fetch(url, opts)
                    .then((response) => response.text())
                    .then((raw_response) => {
                        try {
                            let response = JSON.parse(raw_response);
                            var total = response['stats']['valid'] + response['stats']['invalid'];
                            return knex('cba_road_snapshots')
                                .update({
                                    num_records: total,
                                    valid_records: response['stats']['valid'],
                                    invalid_reasons: response['invalids']
                                })
                                .where({ id });
                        } catch (err) {
                            console.error("Error:", err);
                            console.error("Response body:", raw_response);
                            return Boom.internal("Error in response from CBA API");
                        }
                    });
            });
    }
}

function delete1() {
    return knex('cba_road_snapshots').where('id', '>', 2).del();
}
function delete2() {
    return knex('cba_road_snapshots_data').where('cba_road_snapshot_id', '>', 2).del();
}

exports.createSnapshot = function (req, res) {

    return delete1()
        .then(delete2)
        .then(() => knex('cba_road_snapshots').insert(req.payload, 'id'))
        .then((result) => {
            var [snapshotId] = result;
            console.log(`Got snapshotId: ${snapshotId}`);
            return copySnapshotData(snapshotId, req.payload)
                .then(retrieveSnapshotMeta(snapshotId));
        })
        .catch(utils.errorHandler);
}

function getSnapshotRoads(id) {
    console.log("SnapshotId: " + id);
    return knex('cba_road_snapshots_data')
        .select('*')
        .where('cba_road_snapshot_id', '=', id)
        // .limit(500)
        .then((response) => response.map(utils.convertToPythonFormat));
}
exports.getSnapshotRoads = getSnapshotRoads;

exports.getRoads = function (req, res) {
    const province = req.query.province;
    const district = req.query.district;
    const limit = req.query.limit;

    return knex('v_roads_cba as t')
        .select('t.way_id as id', 't.vp_id', 't.length', 't.vp_length', 't.province', 't.district', 't.surface_type',
            't.road_class', 't.road_type', 't.lanes', 't.width', 't.condition', 't.traffic_level', 't.terrain')
        .modify(function (queryBuilder) {
            if (province) { queryBuilder.andWhere('province', province); }
            if (district) { queryBuilder.andWhere('district', district); }
            if (limit) { queryBuilder.limit(limit); }
        })
        .then((roads) => roads.map(utils.convertToPythonFormat));
};





