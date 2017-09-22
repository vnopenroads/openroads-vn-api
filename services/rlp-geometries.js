'use strict';

const _ = require('lodash');
const fastCSV = require('fast-csv');
const path_ = require('path');
const linestring = require('turf-linestring');
const moment = require('moment');
const standardizeRoadId = require('../util/standardize-road-id');

moment.locale('en');

function cleanGeometry (points) {
  // If a sensor has not made a measurement for a while, then
  // assume that the shorter part of the road is erroneous data
  const TIME_DIFF_THRESHOLD = 2 * 60 * 1000;
  const DATE_STRING_FORMAT = 'HH:mm:ss YYYY-MMMM-DD';

  const pieces = points.reduce((all, one) => {
    if (all[0].length === 0) { return [[one]]; }

    const currentPiece = _.last(all);
    const lastDatum = _.last(currentPiece);

    const previousTime = moment(lastDatum.time, DATE_STRING_FORMAT);
    const currentTime = moment(one.time, DATE_STRING_FORMAT);

    if (currentTime - previousTime <= TIME_DIFF_THRESHOLD) {
      all[all.length - 1] = currentPiece.concat(one);
    } else {
      all = all.concat([[one]]);
    }
    return all;
  }, [[]]);

  // This'll work even if there's only one piece
  const longest = pieces.reduce((longest, one) =>
    one.length > longest.length ? one : longest
  , []);

  // Clean up the geometry into a linestring
  const geom = linestring(longest.map(d =>
    [Number(d.longitude), Number(d.latitude)]
  ));
  return geom;
}

module.exports = async function (path, contentsStream) {
  // Check each ancestor directory name for a valid road ID
  const ROAD_ID_PATTERN = /^(\d{3}[A-Za-z]{2}\d{1,5}).*?$/;
  const pathParts = path.split(path_.sep).reverse();
  const roadId = pathParts.reduce((found, one) => {
    if (!found) {
      const match = one.match(ROAD_ID_PATTERN);
      if (match) { found = standardizeRoadId(match[1]); }
    }
    return found;
  }, null);

  let points = [];
  return new Promise(resolve =>
    contentsStream.pipe(fastCSV
      .parse({headers: true})
      .on('data', d => { points = points.concat(d); })
      .on('end', async () => {
        resolve({
          road_id: roadId,
          type: 'RoadLabPro',
          geom: cleanGeometry(points)
        });
      })
    )
  );
};
