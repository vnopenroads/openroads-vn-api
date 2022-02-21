'use strict';
var knex = require('connection');
var server = require('../../bootstrap.test');
var log = require('services/log.js');

module.exports.createGet = function createGet(base) {
  return url => server.inject({ method: 'GET', url: base + url })
};

module.exports.testChangeset = function testChangeset(uid, user, comment) {
  this.changesetId = null;

  this.payload = {
    uid: uid || 99,
    user: user || 'openroads',
    comment: comment || 'test comment',
    osm: { changeset: {} }
  };

  this.create = async function create() {
    var _self = this;
    var payload = {
      method: 'PUT',
      url: '/changeset/create',
      payload: _self.payload
    };
    var res = await server.inject(payload);
    res.statusCode.should.eql(200);
    var id = +res.payload;
    id.should.be.within(0, Number.MAX_VALUE);
    _self.changesetId = id;
    return id;
  };

  this.upload = function upload(data) {
    if (this.changesetId === null) {
      throw new Error('The changeset was not created yet.');
    }

    var payload = {
      method: 'POST',
      url: '/changeset/' + this.changesetId + '/upload',
      payload: { osmChange: data }
    };

    // console.log("PAYLOAD.method:  ", payload.method);
    // console.log("PAYLOAD.url:     ", payload.url);
    // console.log("PAYLOAD.payload: ", payload.payload);

    return server.inject(payload)
      .then(res => {
        res.statusCode.should.eql(200);
        return res;
      });
  };

  this.remove = async function remove() {
    var _self = this;
    if (this.changesetId === null) {
      throw new Error('The changeset was not created yet.');
    }

    return knex.transaction(async function (transaction) {
      var nodeIds = knex.select('id').from('current_nodes').where('changeset_id', _self.changesetId);
      var wayIds = knex.select('id').from('current_ways').where('changeset_id', _self.changesetId);
      var relationIds = knex.select('id').from('current_relations').where('changeset_id', _self.changesetId);

      var deleted = await transaction('current_way_nodes').whereIn('node_id', nodeIds).orWhereIn('way_id', wayIds).del().returning('*');
      log.debug(deleted.length, 'way nodes deleted');
      var deleted = await transaction('current_way_tags').whereIn('way_id', wayIds).del().returning('*');
      log.debug(deleted.length, 'way tags deleted');
      var deleted = await transaction('current_node_tags').whereIn('node_id', nodeIds).del().returning('*');
      log.debug(deleted.length, 'node tags deleted');
      var deleted = await transaction('current_relation_tags').whereIn('relation_id', relationIds).del().returning('*');
      log.debug(deleted.length, 'relation tags deleted');
      var deleted = await transaction('current_relation_members').whereIn('relation_id', relationIds).del().returning('*');
      log.debug(deleted.length, 'relation members deleted');
      var deleted = await transaction('current_ways').where('changeset_id', _self.changesetId).del().returning('*');
      log.debug(deleted.length, 'nodes deleted');
      var deleted = await transaction('current_nodes').where('changeset_id', _self.changesetId).del().returning('*');
      log.debug(deleted.length, 'ways deleted');
      var deleted = await transaction('current_relations').where('changeset_id', _self.changesetId).del().returning('*');
      log.debug(deleted.length, 'relations deleted');
      var deleted = await transaction('changesets').where('id', _self.changesetId).del().returning('*');
      log.debug(deleted.length, 'changesets deleted');
    });
  };
}

