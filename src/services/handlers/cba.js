'use strict'
const fetch = require('node-fetch');
const knex = require('connection');
const utils = require('./utils.js');
const config = require('config/config').config;
var Boom = require('@hapi/boom');

exports.getSnapshots = async function (req, res) {
    return knex('cba_road_snapshots')
        .select('*')
        .catch(utils.errorHandler);
}

exports.getSnapshotStats = function (snapshotId) {
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
            .limit(200)
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
                            console.log(raw_response);
                            let response = JSON.parse(raw_response);
                            console.log(response);
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
        .limit(200)
        .then((response) => response.map(utils.convertToPythonFormat));
}
exports.getSnapshotRoads = getSnapshotRoads;

function checkResultQuery(query) {
    let snapshot_id = query.snapshot_id;
    let config_id = query.config_id;
    if (!snapshot_id || !config_id) {
        return Boom.badRequest("You must provide a snapshot_id and config_id");
    }
    return { snapshot_id, config_id }
}

exports.runSnapshot = function (req) {
    var params = checkResultQuery(req.query)
    console.log("Running CBA analysis of snapshot " + params.snapshot_id);
    if (Boom.isBoom(params)) { return params; };
    return getSnapshotRoads(params.snapshot_id)
        .then((response) => {
            var url = `${config.cba_api}/run_sections`;
            var opts = {
                method: 'POST',
                body: JSON.stringify(response),
                headers: { 'Content-Type': 'application/json' }
            };
            return fetch(url, opts)
                .then((response) => response.json())
                .then((body) => {
                    const insertFn = (e) => prepCbaResultRow(params.snapshot_id, params.config_id, e);
                    const rows = body['data'].map(insertFn);
                    return deleteResultFn(params.snapshot_id, params.config_id)
                        .then(() => knex.batchInsert('cba_snapshot_results', rows, 500))
                        .catch(function (error) { console.log(error); });
                });
        });
}

function deleteResultFn(snapshot_id, config_id) {
    return knex('cba_snapshot_results')
        .where('cba_road_snapshot_id', '=', snapshot_id)
        .where('cba_user_config_id', '=', config_id)
        .del()
}

exports.deleteResult = function (req) {
    var params = checkResultQuery(req.query)
    if (Boom.isBoom(params)) { return params; };
    return deleteResultFn(params.snapshot_id, params.config_id);
}

exports.getRoads = function (req, res) {
    const province = req.query.province;
    const district = req.query.district;
    const limit = req.query.limit;

    return knex('v_roads_cba as t')
        .select('t.way_id as id', 't.vp_id', 't.length', 't.vp_length', 't.province', 't.district', 't.surface_type',
            't.road_type', 't.lanes', 't.width', 't.condition', 't.traffic_level', 't.terrain')
        .modify(function (queryBuilder) {
            if (province) { queryBuilder.andWhere('province', province); }
            if (district) { queryBuilder.andWhere('district', district); }
            if (limit) { queryBuilder.limit(limit); }
        })
        .then((roads) => roads.map(utils.convertToPythonFormat));
};


function prepCbaResultRow(snapshot_id, config_id, e) {
    return {
        cba_road_snapshot_id: snapshot_id,
        cba_user_config_id: config_id,
        way_id: e['orma_way_id'],
        eirr: e['eirr'],
        esa_loading: e['esa_loading'],
        npv: e['npv'],
        npv_cost: e['npv_cost'],
        npv_km: e['npv_km'],
        truck_percent: e['truck_percent'],
        vehicle_utilization: e['vehicle_utilization'],
        work_class: e['work_class'],
        work_cost: e['work_cost'],
        work_cost_km: e['work_cost_km'],
        work_name: e['work_name'],
        work_type: e['work_type'],
        work_year: e['work_year']
    }
}

exports.getResults = function (req, res) {
    if (req.query.snapshot_id && req.query.config_id) {
        return knex('cba_snapshot_results')
            .where('cba_road_snapshot_id', '=', req.query.snapshot_id)
            .where('cba_user_config_id', '=', req.query.config_id)
    }
    else {
        return knex('cba_snapshot_results')
            .distinct('cba_road_snapshot_id as snapshot_id',
                'cba_user_config_id as config_id')
    }
}

exports.getResultKpis = function (req, res) {
    if (!req.query.snapshot_id || !req.query.config_id) {
        return Boom.badRequest("You must provide a snapshot_id and config_id");
    }

    return knex('cba_snapshot_results')
        .where('cba_road_snapshot_id', '=', req.query.snapshot_id)
        .where('cba_user_config_id', '=', req.query.config_id)
        .sum({ cost: 'work_cost', npv: 'npv' })
        .catch(utils.errorHandler);
}