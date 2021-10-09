'use strict'
const fetch = require('node-fetch');
const knex = require('connection');
const utils = require('../utils.js');
var Boom = require('@hapi/boom');
const config = require('config/config').config;
const configHandler = require('./user-config.js');
const snapshotHandler = require('./snapshots.js');
const JSON5 = require('json5')

function checkResultQuery(query) {
    let snapshot_id = query.snapshot_id;
    let config_id = query.config_id;
    if (!snapshot_id || !config_id) {
        return Boom.badRequest("You must provide a snapshot_id and config_id");
    }
    return { snapshot_id, config_id }
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

exports.runSnapshot = async function (req) {
    var params = checkResultQuery(req.query)
    console.log("Running CBA analysis of snapshot " + params.snapshot_id + " with config: " + params.config_id);
    if (Boom.isBoom(params)) { return params; };
    var assets = await snapshotHandler.getSnapshotRoads(params.snapshot_id);
    var url = `${config.cba_api}/run_sections`;
    var cbaConfig = await configHandler.selectQuery(params.config_id, ['discount_rate', 'economic_factor', 'growth_rates', 'traffic_levels']);
    console.log("=--------=");
    console.log(cbaConfig);
    console.log("=--------=");
    var opts = {
        method: 'POST',
        body: JSON.stringify({ config: cbaConfig, assets: assets }),
        headers: { 'Content-Type': 'application/json' }
    };

    var body = await fetch(url, opts).then((response) => response.text())
    var body_ = JSON5.parse(body);
    const insertFn = (e) => prepCbaResultRow(params.snapshot_id, params.config_id, e);
    const rows = body_['data'].map(insertFn);
    return deleteResultFn(params.snapshot_id, params.config_id)
        .then(() => knex.batchInsert('cba_snapshot_results', rows, 500))
        .catch(function (error) { console.log(error); });
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