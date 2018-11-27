'use strict';

const _ = require('lodash');
const fastCSV = require('fast-csv');
const midpoint = require('turf-midpoint');
const moment = require('moment');
const point = require('turf-point');
const getRoadIdFromPath = require('../util/road-id-utils').getRoadIdFromPath;

function parseRowV1 (csvRow) {
  const DATE_STRING_FORMAT = 'HH:mm:ss YYYY-MMMM-DD';
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

  // Work-around for "Interval_Start_Latitude" key being sometimes misspelt
  let startLatitudeKey = 'Interval_Start_Latitude';
  if (csvRow.hasOwnProperty('Interval_Start_Latidude')) {
    startLatitudeKey = 'Interval_Start_Latidude';
  }
  const coord = midpoint(
    point([Number(csvRow['Interval_Start_Longitude']), Number(csvRow[startLatitudeKey])]),
    point([Number(csvRow['Interval_End_Longitude']), Number(csvRow['Interval_End_Latitude'])])
  );

  // If row does not have roughness, return null
  if (!csvRow.hasOwnProperty('Roughness') || csvRow['Roughness'] === '') {
    return null;
  }

  const props = {
    'iri': csvRow['Roughness'],
    'distance': csvRow['Interval_Length'],
    'suspension': csvRow['Suspension_Type']
  };

  return {
    geom: coord.geometry,
    datetime: moment(csvRow['Time'], DATE_STRING_FORMAT).toDate(),
    properties: props
  };

}

async function parseProperties (path, contentsStream, existingRoadIds, version) {
  const roadId = getRoadIdFromPath(path, existingRoadIds);

  let rows = [];
  return new Promise(resolve =>
    contentsStream.pipe(fastCSV
      .parse({headers: true})
      .on('data', d => {
        let row;
        if (version === 'v1') {
          row = parseRowV1(d);
        } else if (version === 'v2') {
          row = parseRowV2(d);
        } else {
          throw new Error('Invalid version');
        }
        if (row) {
          row.road_id = roadId;
          row.source = 'RoadLabPro';
          rows = rows.concat(row);
        }
      })
      .on('end', () => {
        resolve(rows);
      })
    )
  );
};

module.exports = { parseRowV1, parseRowV2, parseProperties };
