'use strict';

var Boom = require('@hapi/boom');
const { times } = require('lodash');
var knex = require('../../connection');
var UserConfig = require('../../models/cba/user-config.js')

function createErrorHandler(res) {
    return (e) => {
        console.log(e);
        if (e.message.includes('duplicate')) {
            res(Boom.conflict(e));
        } else {
            res(Boom.notImplemented(e.message));
        }
    };
};

function allGood(res) {
    return (_) => { res({ success: true, message: 'ok' }); };
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
    return rv;
}

function insertConfig(req, res) {
    knex(UserConfig.tableName)
        .insert(buildData(req.payload, true))
        .then(allGood(res))
        .catch(createErrorHandler(res));
}

function selectQuery(res, id, fields) {
    knex(UserConfig.tableName)
        .select(fields)
        .where({ id })
        .first()
        .then((results) => { res(results); })
        .catch(createErrorHandler(res));
}

function updateConfig(req, res) {
    var id = req.params.id;
    knex(UserConfig.tableName)
        .where({ id })
        .update(buildData(req.payload, false))
        .then(allGood(res))
        .catch(createErrorHandler(res));
}

function wrapHandler(f, req, res) {
    try {
        f(req, res);
    } catch (err) {
        console.log("Caught an error in a wrapped function");
        console.log(err);
        res(Boom.wrap(err));
    }
}

module.exports = [
    {
        method: 'GET',
        path: '/cba/user_configs',
        handler: function (req, res) {
            knex(UserConfig.tableName)
                .select('*')
                .then((results) => { res(results); })
                .catch(createErrorHandler(res));
        }
    }, {
        method: 'GET',
        path: '/cba/user_configs/{id}',
        handler: function (req, res) {
            selectQuery(res, req.params.id, ['discount_rate', 'economic_factor']);
        }
    }, {
        method: 'GET',
        path: '/cba/user_configs/{id}/traffic_levels',
        handler: function (req, res) {
            selectQuery(res, req.params.id, ['traffic_levels']);
        }
    }, {
        method: 'POST',
        path: '/cba/user_configs/{id}/update',
        handler: function (req, res) {
            wrapHandler(updateConfig, req, res);
        }
    }, {
        method: 'POST',
        path: '/cba/user_configs/create',
        handler: function (req, res) {
            wrapHandler(insertConfig, req, res);
        }
    }
];

