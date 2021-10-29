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
        path: '/cba/user_configs/{id}/sub_config/{config_type}',
        handler: function (req, res) {
            const general_fields = ['discount_rate', 'economic_factor', 'starting_year']
            const fields = req.params.config_type == 'general' ? general_fields : [req.params.config_type]
            return handler.selectQuery(req.params.id, fields);
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

