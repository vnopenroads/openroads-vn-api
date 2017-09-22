'use strict';

const _ = require('lodash');

module.exports = function (roadId) {
  // This function is specific to VPRoMMS road IDs
  if (roadId.length < 10) {
    roadId = roadId.slice(0,5)
      .concat(_.padStart(roadId.slice(5), 5, '0'));
  }
  return roadId.toUpperCase();
};
