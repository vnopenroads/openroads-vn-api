'use strict';

var Boom = require('boom');
var knex = require('../../connection');
var UserConfig = require('../../models/cba/user-config.js')

module.exports = [
    {
        method: 'GET',
        path: '/cba/user_configs',
        handler: function (req, res) {
            knex(UserConfig.tableName)
                .select('*')
                .then((results) => { res(results); })
                .catch(rewrapAsBoom);
        }
    },
    {
        method: 'POST',
        path: '/cba/user_config/create',
        handler: function (req, res) {
            try {
                var insert_data = {
                    name: req.payload.name,
                    updated_at: new Date().toISOString(),
                    created_at: new Date().toISOString()
                };
                knex(UserConfig.tableName)
                    .insert(insert_data)
                    .then((_) => { res({ success: true, message: 'ok' }); })
                    .catch((e) => { res(Boom.wrap(e)) });
            } catch (err) {
                console.log(err);
                res(Boom.wrap(err));
            }
        }
    }
];

