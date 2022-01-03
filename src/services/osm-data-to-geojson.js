'use strict';
/* jshint camelcase: false */

var _ = require('lodash');
var ratio = require('./ratio.js');

/*
 * Takes the given way/waynode/node models and returns a FeatureCollection
 * of LineString features--one for each way.
 *
 * `data` is as yielded by ../services/query-ways.js
 */
module.exports = function toGeoJSON(data, geometryType) {
  geometryType = geometryType || 'LineString';

  var idToNode = {}; // TODO: this should be a real hashmap
  data.nodes.forEach(function (n) { idToNode[n.id] = n; });

  var wayFeatures = data.ways.map(function (way) {
    var nodeCoordinates = way.nodes.map(function (waynode) {
      var node = idToNode[waynode.node_id || waynode.id];
      return [node.longitude / ratio, node.latitude / ratio];
    });

    var properties = _.fromPairs(way.tags.map(function (t) {
      return [t.k, t.v];
    }));

    var meta = {
      id: way.id,
      changeset: way.changeset_id,
      timestamp: way.timestamp,
      version: way.version
    };

    return {
      type: 'Feature',
      properties,
      meta,
      geometry: {
        type: geometryType,
        coordinates: geometryType == 'Polygon' ? [nodeCoordinates] : nodeCoordinates
      }
    };
  });

  return {
    type: 'FeatureCollection',
    properties: {},
    features: wayFeatures
  };
};
