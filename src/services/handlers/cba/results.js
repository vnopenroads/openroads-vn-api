'use strict'
var fetch = undefined;
import('node-fetch').then(e => fetch = e.default);

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
        length: e['length'],
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
        work_year: e['work_year'],
        iri_base: JSON.stringify(e['iri_base']),
        iri_projection: JSON.stringify(e['iri_projection']),
        capital_cost: JSON.stringify(e['capital_cost']),
        repair_cost: JSON.stringify(e['repair_cost']),
        maintenance_cost: JSON.stringify(e['maintenance_cost']),
        user_cost: JSON.stringify(e['user_cost'])
    }
}

exports.runSnapshot = async function (req) {
    var params = checkResultQuery(req.query)
    console.log("Running CBA analysis of snapshot " + params.snapshot_id + " with config: " + params.config_id);
    if (Boom.isBoom(params)) { return params; };
    var assets = await snapshotHandler.getSnapshotRoads(params.snapshot_id);
    var url = `${config.cba_api}/run_sections`;
    var cbaConfig = await configHandler.selectQuery(params.config_id, ['discount_rate', 'economic_factor', 'growth_rates', 'traffic_levels', 'road_works']);
    console.log("=--------=");
    console.log(cbaConfig);
    console.log("=--------=");
    var opts = {
        method: 'POST',
        body: JSON.stringify({ config: cbaConfig, assets: assets }),
        headers: { 'Content-Type': 'application/json' }
    };

    var body = await fetch(url, opts).then((response) => response.text())
    var body_ = undefined;
    try {
        body_ = JSON5.parse(body);
    } catch (err) {
        console.log(err);
        console.log(body);
        return Boom.badRequest(`Couldn't parse body: ${body}`);
    }

    const insertFn = (e) => prepCbaResultRow(params.snapshot_id, params.config_id, e);
    const rows = body_['data'].map(insertFn);
    console.log(body_['data']);
    console.log(rows[0]);
    return deleteResultFn(params.snapshot_id, params.config_id)
        .then(() => knex.batchInsert('cba_snapshot_results', rows, 1))
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

exports.getResultKpis = async function (req, res) {
    if (!req.query.snapshot_id || !req.query.config_id) {
        return Boom.badRequest("You must provide a snapshot_id and config_id");
    }

    var results = () => knex('cba_snapshot_results')
        .where('cba_road_snapshot_id', '=', req.query.snapshot_id)
        .where('cba_user_config_id', '=', req.query.config_id);

    var r1 = await results()
        .where('npv', '>', 0)
        .sum({ cost: 'work_cost', npv: 'npv' })
        .count({ positive_npv: 'npv' })
        .catch(utils.errorHandler);
    var { cost, npv, positive_npv } = r1[0];

    var costYr = async (yr) => {
        var r = await results()
            .where('npv', '>', 0)
            .where('work_year', '<=', yr)
            .sum({ cost_for_year: 'work_cost' })
            .catch(utils.errorHandler);
        var { cost_for_year } = r[0];
        return cost_for_year || 0;
    };
    var countYr = async (yr) => {
        var r = await results()
            .where('npv', '>', 0)
            .where('work_year', '<=', yr)
            .count({ count_for_year: 'work_cost' })
            .catch(utils.errorHandler);
        var { count_for_year } = r[0];
        return count_for_year || 0;
    };


    var cost1yr = await costYr(1);
    var cost3yr = await costYr(3);
    var cost5yr = await costYr(5);
    var count1yr = await countYr(1);
    var count3yr = await countYr(3);
    var count5yr = await countYr(5);

    var r2 = await knex('cba_road_snapshots')
        .where({ id: req.query.snapshot_id })
        .select('num_records as num_assets', 'valid_records as valid_assets')
    var { num_assets, valid_assets } = r2[0];
    var invalid_assets = num_assets - valid_assets;

    var r3 = await results().where('npv', '=', 0).count();
    var negative_npv = parseInt(r3[0].count);
    positive_npv = parseInt(positive_npv);

    var r3b = await results()
        .where('npv', '>', 0)
        .where('work_year', '<=', 5)
        .count({ 'medium_term': 'work_year' })
    console.log(r3b);
    var medium_term = parseInt(r3b[0].medium_term)
    var long_term = positive_npv - medium_term;

    var r4 = await knex('cba_road_snapshots')
        .where('id', '=', req.query.snapshot_id)
        .select('province_id as provinceId', 'district_id as districtId')

    var r5 = await knex('cba_user_configs')
        .where('id', '=', req.query.config_id)
        .select('starting_year as startingYear')

    return {
        cost, cost1yr, cost3yr, cost5yr, count1yr, count3yr, count5yr, npv, ...r4[0], ...r5[0],
        assetBreakdown: {
            num_assets, positive_npv, negative_npv, valid_assets, invalid_assets, medium_term, long_term
        }
    };
}