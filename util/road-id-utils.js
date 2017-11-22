'use strict';

const path_ = require('path');
const _ = require('lodash');

// These are often specific to the country and road ID schema of use
const ROAD_ID_PATTERN = /^\d{3}[A-Z]{2}\d{1,8}$/;
const POSSIBLE_ROAD_ID_PATTERN = /^\d+[A-Za-z]+\d+.*?$/;

const getRoadIdFromPath = path => {
  // Check each ancestor directory name for a valid road ID
  const pathParts = path.split(path_.sep).reverse();
  const roadId = pathParts.reduce((found, one) => {
    if (!found) {
      const match = one.match(ROAD_ID_PATTERN);
      if (match) { found = match[1]; }
    }
    return found;
  }, null);
  return roadId;
};

module.exports = {
  ROAD_ID_PATTERN,
  POSSIBLE_ROAD_ID_PATTERN,
  getRoadIdFromPath,
  findBadRoadId: path => {
    // Check each ancestor directory name for a possible but incorrect road IDs
    if (getRoadIdFromPath(path) !== null) { return null; }

    const pathParts = path.split(path_.sep).reverse();
    const roadId = pathParts.reduce((found, one) => {
      if (!found) {
        if (
          one.match(POSSIBLE_ROAD_ID_PATTERN) &&
          !one.match(ROAD_ID_PATTERN)
        ) { found = one; }
      }
      return found;
    }, null);
    return roadId;

    return possibleIds;
  },
  getResponsibilityFromRoadId: roadId => {
    // Extract the road's responsibility from its ID
    const RESPONSIBILITIES = {
      '1': 'national',
      '2': 'provincial',
      '3': 'district',
      '4': 'commune',
      '5': 'village',
      '6': 'rural',
      '7': 'special',
      '8': null,
      '9': null,
      '0': null
    };
    const RESPONSIBILITY_PATTERN = /^\d{2}(\d)[A-Z]{2}\d{5}$/;
    const match = roadId.match(RESPONSIBILITY_PATTERN);
    if (match) {
      return RESPONSIBILITIES[match[1]];
    } else {
      return null;
    }
  }
};
