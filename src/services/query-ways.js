'use strict';
var _ = require('lodash');
var Promise = require('bluebird');

module.exports = async function queryWays(knex, wayIds, excludeNotVisible = false) {

  // helper to make raw queries, because knex version of these
  // simple selects was MUCH slower
  function select(table, key, ids) {
    if (ids.length === 0)
      return Promise.resolve([]);
    const sql = 'select * from ' + table + ' where ' + key + ' in (' + ids.join(',') + ')';
    return knex.raw(sql).then(resp => resp.rows);
  }

  // Query the desired ways and any way_nodes that are in those ways
  // Also query any relations that those ways are a part of.

  // TODO this currently does not query nodes that are part of relations,
  // or other relations that are part of relations.
  const currentWays = knex('current_ways').whereIn('id', wayIds);
  if (excludeNotVisible) { currentWays.where('visible', true); }

  var ways = await currentWays;
  var wayIds = _.map(ways, 'id');

  var nodesSql = knex('current_way_nodes')
    .orderBy('way_id', 'asc')
    .orderBy('sequence_id', 'asc')
    .whereIn('way_id', wayIds)
    .distinct('node_id AS id')
    .select('way_id', 'sequence_id');

  var waynodes = await nodesSql;
  var nodeIds = _.map(waynodes, 'id');

  var relationsSql = knex('current_relation_members')
    .orderBy('relation_id', 'asc')
    .orderBy('sequence_id', 'asc')
    .where('member_type', 'Way')
    .whereIn('member_id', wayIds)
    .select('relation_id AS id', 'member_id', 'member_role');
  var members = await relationsSql;
  var relationIds = _.map(members, 'id');

  // Now we have all the ways and nodes that we need, so fetch
  // the associated tags.
  var nodes = await select('current_nodes', 'id', nodeIds);
  var waytags = await select('current_way_tags', 'way_id', wayIds);
  var nodetags = await select('current_node_tags', 'node_id', nodeIds);
  var relations = await select('current_relations', 'id', relationIds);
  var relationtags = await select('current_relation_tags', 'relation_id', relationIds);

  // attach associated nodes and tags to ways
  ways.forEach(function (way) {
    let nodes = waynodes.filter(waynode => waynode.way_id === way.id);
    nodes.forEach(waynode => waynode.node_id = waynode.id); // make compatible with geojson formatter
    way.nodes = nodes;
    way.tags = waytags.filter(tag => tag.way_id === way.id);
  });

  relations.forEach(function (relation) {
    relation.members = members.filter(function (member) {
      return member.relation_id === relation.id;
    });
    relation.tags = relationtags.filter(function (tag) {
      return tag.relation_id === relation.id;
    });
  });

  return { ways, waynodes, members, nodes, waytags, nodetags, relations, relationtags };
};
