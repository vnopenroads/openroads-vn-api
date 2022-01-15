'use strict';

const _ = require('lodash');
const fastCSV = require('fast-csv');
const midpoint = require('@turf/midpoint');
const moment = require('moment');
const point = require('turf-point');
const getRoadIdFromPath = require('../util/road-id-utils').getRoadIdFromPath;

function parseRowV1(csvRow) {
  const DATE_STRING_FORMAT = 'HH:mm:ss YYYY-MMMM-DDZ';
  const USED_PROERTIES = ['time', 'start_lat', 'start_lon', 'end_lat', 'end_lon'];

  const coord = midpoint(
    point([Number(csvRow.start_lon), Number(csvRow.start_lat)]),
    point([Number(csvRow.end_lon), Number(csvRow.end_lat)])
  );

  return {
    geom: coord.geometry,
    datetime: moment(csvRow.time, DATE_STRING_FORMAT).toDate(),
    properties: _.omit(csvRow, USED_PROERTIES)
  };
};

function parseRowV2(csvRow) {
  const DATE_STRING_FORMAT = 'HH:mm:ss YYYY-MMMM-DD';

  // convert all column keys to lower-case to avoid inconsistent case between android / ios
  const csvRowLower = {};
  Object.keys(csvRow).forEach(key => {
    csvRowLower[key.toLowerCase()] = csvRow[key];
  });

  // Work-around for "Interval_Start_Latitude" key being sometimes misspelt
  let startLatitudeKey = 'interval_start_latitude';
  if (csvRowLower.hasOwnProperty('interval_start_latidude')) {
    startLatitudeKey = 'interval_start_latidude';
  }
  const coord = midpoint(
    point([Number(csvRowLower['interval_start_longitude']), Number(csvRowLower[startLatitudeKey])]),
    point([Number(csvRowLower['interval_end_longitude']), Number(csvRowLower['interval_end_latitude'])])
  );

  // If row does not have roughness, return null
  if (!csvRowLower.hasOwnProperty('roughness') || csvRow['roughness'] === '') {
    return null;
  }

  const props = {
    'iri': csvRowLower['roughness'],
    'distance': csvRowLower['interval_length'],
    'suspension': csvRowLower['suspension_type']
  };

  return {
    geom: coord.geometry,
    datetime: moment(csvRowLower['time'], DATE_STRING_FORMAT).toDate(),
    properties: props
  };

}

async function parseProperties(path, contentsStream, existingRoadIds, version) {
  const roadId = getRoadIdFromPath(path, existingRoadIds);

  let rows = [];
  return new Promise((resolve, reject) =>
    contentsStream.pipe(fastCSV
      .parse({ headers: true })
      .on('data', d => {
        try {
          let row;
          if (version === 'v1') {
            row = parseRowV1(d);
          } else if (version === 'v2') {
            row = parseRowV2(d);
          } else {
            reject('Invalid version');
          }
          if (row) {
            row.road_id = roadId;
            row.source = 'RoadLabPro';
            rows = rows.concat(row);
          }
        } catch (e) {
          reject(e);
        }
      })
      .on('end', () => {
        resolve(rows);
      })
    )
  );
};

module.exports = { parseRowV1, parseRowV2, parseProperties };
