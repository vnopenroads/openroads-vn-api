'use strict';

var Boom = require('@hapi/boom');
const configTableName = 'cba_user_configs';
var knex = require('../../../connection');

function createErrorHandler() {
    return (e) => {
        console.log(e);
        if (e.message.includes('duplicate')) {
            return Boom.conflict(e);
        } else {
            return Boom.notImplemented(e.message);
        }
    };
};
exports.createErrorHandler = createErrorHandler;

function allGood() {
    return { success: true, message: 'ok' };
}

function buildData(payload, creation) {
    var data = { updated_at: new Date().toISOString() };
    if (creation) {
        data['created_at'] = data['updated_at'];
        data['name'] = payload.name;
    }
    var rv = { ...data, ...payload };
    if (rv['traffic_levels']) {
        rv['traffic_levels'] = JSON.stringify(rv['traffic_levels'])
    }
    console.log(rv);
    return rv;
}

exports.insertConfig = function (req, res) {
    return knex(configTableName)
        .insert(buildData(req.payload, true))
        .then(allGood)
        .catch(createErrorHandler());
}

exports.duplicateConfig = function (req) {
    var sql = `
        INSERT INTO "${configTableName}" 
                    ("name", "discount_rate", "economic_factor", "starting_year", 
                    "growth_rates", "traffic_levels", "road_works", 
                    "recurrent_maintenance")
        SELECT '${req.payload.new_name}', discount_rate, economic_factor, starting_year, 
                    growth_rates, traffic_levels, road_works, 
                    recurrent_maintenance
        FROM ${configTableName}
        WHERE id = ${req.payload.config_id}`;
    return knex.raw(sql).then(allGood).catch(createErrorHandler());
}

exports.selectQuery = function (id, fields) {
    return knex(configTableName)
        .select(fields)
        .where({ id })
        .first()
        .catch(createErrorHandler());
}

exports.updateConfig = function (req, res) {
    var id = req.params.id;
    return knex(configTableName)
        .where({ id })
        .update(buildData(req.payload, false))
        .then(allGood())
        .catch(createErrorHandler());
}

exports.renameConfig = function (req) {
    return knex(configTableName)
        .where({ id: req.payload.config_id })
        .update({ name: req.payload.new_name })
        .then(allGood())
        .catch(createErrorHandler());
}

exports.deleteConfig = function (req) {
    return knex(configTableName)
        .where({ id: req.payload.config_id })
        .delete()
        .then(allGood())
        .catch(createErrorHandler());
}

exports.wrapHandler = function (f, req, res) {
    try {
        return f(req, res);
    } catch (err) {
        console.log("Caught an error in a wrapped function");
        console.log(err);
        return Boom.boomify(err);
    }
}

