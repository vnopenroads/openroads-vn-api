'use strict';

const path_ = require('path');

// These are often specific to the country and road ID schema of use

const getRoadIdFromPath = (path, existingRoadIds) => {
  // Check each ancestor directory name for a valid road ID
  const pathParts = path.split(path_.sep).reverse();
  const roadId = pathParts.reduce(
    (found, one) => found || (existingRoadIds.includes(one) && one),
    null
  );
  return roadId;
};

const getPossibleRoadIdFromPath = path => {
  // Check each ancestor directory name for a possible road ID
  // This function is only useful when testing paths that
  // are _known_ to not have one of the platform's known road IDs
  const POSSIBLE_ROAD_ID_PATTERN = /^\d{3}([A-ZĐa-zđ]{2}|00)\d+.*$/;

  const pathParts = path.split(path_.sep).reverse();
  const roadId = pathParts.reduce(
    (found, one) => found || (one.match(POSSIBLE_ROAD_ID_PATTERN) && one),
    null
  );
  return roadId;
}

module.exports = {
  getRoadIdFromPath,
  getPossibleRoadIdFromPath
};
