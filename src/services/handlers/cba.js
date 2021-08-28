'use strict'
const fetch = require('node-fetch');
const knex = require('../../connection');
const utils = require('./utils.js')

exports.getSnapshots = async function (req, res) {
    return knex('cba_road_snapshots as t')
        .select('t.*')
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
        return knex('cba_road_snapshots_data as t')
            .select('t.*')
            .where('cba_road_snapshot_id', '=', id)
            .then((response) => {
                // TODO: Change this from localhost:5000
                var url = 'http://localhost:5000/evaluate_assets'
                var opts = {
                    method: 'POST',
                    body: JSON.stringify(response.map(utils.convertToPythonFormat)),
                    headers: { 'Content-Type': 'application/json' }
                };
                return fetch(url, opts)
                    .then((response) => response.json())
                    .then((response) => {
                        console.log(response);
                        var total = response['stats']['valid'] + response['stats']['invalid'];
                        return knex('cba_road_snapshots')
                            .update({ num_records: total, valid_records: response['stats']['valid'] })
                            .where({ id });
                    });
            });
    }
}


function delete1() {
    return knex('cba_road_snapshots as t').where('id', '>', 2).del();
}
function delete2() {
    return knex('cba_road_snapshots_data as t').where('cba_road_snapshot_id', '>', 2).del();
}

exports.createSnapshot = function (req, res) {

    return delete1()
        .then(delete2)
        .then(() => knex('cba_road_snapshots as t').insert(req.payload, 'id'))
        .then((result) => {
            var [snapshotId] = result;
            console.log(`Got snapshotId: ${snapshotId}`);
            return copySnapshotData(snapshotId, req.payload)
                .then(retrieveSnapshotMeta(snapshotId));
        })
        .catch(utils.errorHandler);
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

