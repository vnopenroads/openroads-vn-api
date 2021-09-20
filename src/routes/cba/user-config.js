'use strict';

var knex = require('../../connection');
const handler = require('../../services/handlers/cba/user-config.js');

module.exports = [
    {
        method: 'GET',
        path: '/cba/user_configs',
        handler: function (req, res) {
            return knex('cba_user_configs')
                .select('*')
                .catch(handler.createErrorHandler(res));
        }
    }, {
        method: 'GET',
        path: '/cba/user_configs/{id}',
        handler: function (req, res) {
            return handler.selectQuery(req.params.id, ['discount_rate', 'economic_factor']);
        }
    }, {
        method: 'GET',
        path: '/cba/user_configs/{id}/traffic_levels',
        handler: function (req, res) {
            return handler.selectQuery(req.params.id, ['traffic_levels']);
        }
    }, {
        method: 'POST',
        path: '/cba/user_configs/{id}/update',
        handler: function (req, res) {
            return handler.wrapHandler(handler.updateConfig, req, res);
        }
    }, {
        method: 'POST',
        path: '/cba/user_configs/create',
        handler: function (req, res) {
            return handler.wrapHandler(handler.insertConfig, req, res);
        }
    }
];

