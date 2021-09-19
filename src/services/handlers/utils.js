var Boom = require('@hapi/boom');

function maybeInt(x) { return x ? x : 0 }
function maybeFloat(x) { return x ? x : 0.0 }


exports.errorHandler = function (e) {
  console.log(e);
  if (e.message.includes('duplicate')) {
    return Boom.conflict(e);
  } else {
    return Boom.notImplemented(e.message);
  }
}

exports.boomWrapper = function (e) {
  console.log(e);
  // return error if it occurs
  return (Boom.wrap(e));
}

exports.allGood = function (res) {
  return (_) => { return { success: true, message: 'ok' } };
}

exports.checkStandardQueryParams = function (sortField, sortOrder, page) {
  if (sortField !== 'id') {
    return Boom.badData(`Expected 'sortField' query param to be either 'id' or not included.  Got ${req.query.sortField}`);
  }
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    return Boom.badData(`Expected 'sortOrder' query param to be either 'asc', 'desc', or not included.  Got ${req.query.sortOrder}`);
  }
  if (page === 0 || isNaN(page)) {
    return Boom.badData(`Expected 'page' query param to be a number >= 1, or not included.  Got ${req.query.page}`);
  }
  return false;
}

exports.convertToPythonFormat = function (r) {
  return {
    'orma_way_id': r.id, 'vpromms_id': r.vp_id, 'length': r.length, 'vpromms_length': r.vp_length,
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
}