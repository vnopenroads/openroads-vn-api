'use strict';

const fastCSV = require('fast-csv');
const fs = require('fs');
const unzip = require('unzip2');
const standardizeRoadId = require('../utils/standardize-road-id');

module.exports = function (zipPath) {
  const filenamePattern = /^.*\/RoadPath.*.csv$/;
  const roadIdPattern = /^.*\/(\d{3}[A-Za-z]{2}\d{1,5}).*?\/.*\/RoadPath.*.csv$/;

  const rows = [];

  fs.createReadStream(zipPath)
    .pipe(unzip.Parse())
    .on('entry', e => {
      const filename = e.path;
      if (filenamePattern.test(filename)) {
        const match = filename.match(roadIdPattern);
        const roadId = match ? standardizeRoadId(match[1]) : null;
        let path = [];

        const read = fastCSV
          .parse({headers: true})
          .on('data', d => {
            path.push([Number(d.longitude), Number(d.latitude)]);
          })
          .on('end', e => {
            rows.push({
              road_id: roadId,
              type: 'RoadLabPro',
              geom: path
            });
          });
        e.pipe(read);
      } else {
        e.autodrain();
      }
    })
    .on('close', () => {
      return rows;
    });
};
