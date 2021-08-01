'use strict'
const knex = require('../../connection.js');
const utils = require('./utils.js')
const PAGE_SIZE = 10;

function maybeInt(x) { return x ? x : 0 }
function maybeFloat(x) { return x ? x : 0.0 }

exports.getRoads = function (req, res) {
  const province = req.query.province;
  const district = req.query.district;
  const limit = req.query.limit;

  knex('v_roads_cba as t')
    .select('t.way_id as id', 't.vp_id', 't.length', 't.vp_length', 't.province', 't.district', 't.surface_type', 
            't.road_type', 't.lanes', 't.width', 't.condition', 't.traffic_level', 't.terrain')
    .modify(function(queryBuilder) {
      if (province) { queryBuilder.andWhere('province', province);}
      if (district) { queryBuilder.andWhere('district', district);}
      if (limit)    { queryBuilder.limit(limit); }
    })
    .then((roads) => {
      // const ids = roads.map(e => e.id);
      var results = roads.map((r) => {
        return { 
          'id': r.id, 'vpromms_id': r.vp_id, 'length': r.length, 'vpromms_length': r.vp_length,
          // "road_number": r.road number,
          // "road_name": r.name,
          // "road_start": r.road start location,
          // "road_end": r.road end location,
          "province": r.province,
          "district": r.district,
          // "commune": r.section_commune_gso,
          // "management": Section.maybe_int(r.management),
          "lanes": maybeInt(r.lanes),
          "terrain": r.terrain,
          "width": r.width == "6+" ? 6 : maybeFloat(r.width),
          "road_class": r.link_class,
          "temperature": r.section_temperature,
          "moisture": r.section_moisture,
          "surface_type": r.surface_type,
          "condition_class": r.condition,
          "roughness": maybeFloat(r.iri),
          "traffic_level": r.traffic_level,
          "traffic_growth": 0,
          "pavement_age": maybeInt(r.section_pavement_age),
          "aadt_motorcyle": maybeInt(r.aadt_mcyc),
          "aadt_carsmall": maybeInt(r.aadt_sc),
          "aadt_carmedium": maybeInt(r.aadt_mc),
          "aadt_delivery": maybeInt(r.aadt_dv),
          "aadt_4wheel": maybeInt(r.aadt_fourwd),
          "aadt_smalltruck": maybeInt(r.aadt_lt),
          "aadt_mediumtruck": maybeInt(r.aadt_mt),
          "aadt_largetruck": maybeInt(r.aadt_ht),
          "aadt_articulatedtruck": maybeInt(r.aadt_at),
          "aadt_smallbus": maybeInt(r.aadt_sb),
          "aadt_mediumbus": maybeInt(r.aadt_mb),
          "aadt_largebus": maybeInt(r.aadt_lb),
          "aadt_total": maybeInt(r.aadt),
        };
      });
      return res(results).type('application/json');
    });
};


exports.saveRoadArchive = function(req, res) {

  var logErrors = function (err) { console.log(err); return res({}).type('application/json'); };
  var returnNull = function (_) { return res({}).type('application/json'); }

  var new_record = { id: req.payload.archive_id, road_data: { "data": req.payload.road_data }};
  return knex('road_archives')
    .select('id')
    .andWhere('id', 1)
    .then(function(rows) {
      if (rows.length == 0) {
        console.log("no existing record");
        return knex('road_archives').insert(new_record).then(returnNull).catch(logErrors);
      } else {
        console.log("updating existing record");
        return knex('road_archives').update(new_record).then(returnNull).catch(logErrors);
      }
      return res(null);
    });
    // .then(function(response) { return res({ id: req.params.road_id }).type('application/json'); } 
    // .catch(function(err) {
    //     if (err.constraint === 'road_properties_pkey') {
    //       return res(Boom.conflict('Road already exists'));
    //     }
    //     console.error('Error PUT /properties/roads/{road_id}', err);
    //     return res(Boom.badImplementation('Unknown error'));
    // });
  };