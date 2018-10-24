#!/bin/node

'use strict';

// read admin1.geojson and admin2.geojson
// prepare a single geojson with:
// ids start at 1 and sequentially increment
// map the province id as parent id for district
// add codes

const fs = require('fs');
const provinces = JSON.parse(fs.readFileSync(process.argv[2], {'encoding': 'utf-8'}));
const districts = JSON.parse(fs.readFileSync(process.argv[3], {'encoding': 'utf-8'}));
const feature = require('@turf/helpers').feature;
const _ = require('lodash');

const data = {
  'type': 'FeatureCollection',
  'features': []
};

let pid = 0;
provinces.features.forEach(p => {
  console.error(p.properties.Pro_ENG);
  const province = feature(p.geometry, {
    'id': pid + 1,
    'code': p.properties['ORMA_Code'] || null,
    'parent_id': null,
    'type': 'province',
    'name_en': p.properties['Pro_ENG'],
    'name_vn': p.properties['Pro_VIE'],
    'total_length': null,
    'vpromm_length': null
  });
  data.features.push(province);

  // get all districts under this province based on GSO code.
  let districtMembers = _.filter(districts.features, (d) => {
    return parseInt(d.properties.Pro_GSO) === parseInt(p.properties.Pro_GSO);
  });

  pid = pid + 1;

  districtMembers.forEach(d => {
    const district = feature(d.geometry, {
      'id': pid + 1,
      'code': null,
      'parent_id': province.properties.id,
      'type': 'district',
      'name_en': d.properties['Dist_ENG'],
      'name_vn': d.properties['Dist_VIE'],
      'total_length': null,
      'vpromm_length': null
    });

    data.features.push(district);
    pid = pid + 1;
  });
});


console.log(JSON.stringify(data));