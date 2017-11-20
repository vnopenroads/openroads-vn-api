'use strict';
var parser = require('xml2json');
var should = require('should');
var knex = require('../../connection.js');
var server = require('../bootstrap.test');
var waysRoute = require('../../routes/ways');

var Node = require('./helpers/create-node.js');
var Way = require('./helpers/create-way.js');
var Change = require('./helpers/create-changeset.js');
var serverTest = require('./helpers/server-test');

describe('ways route', function () {
  var testChangeset = new serverTest.testChangeset();
  after(function (done) {
    testChangeset.remove().then(() => done());
  });
  it.only('should exclude nodes linked to other ways', function (done) {
    testChangeset.create().then(function (cid) {
      // Create two ways, both of which share one node.
      // Then query for one of the roads.
      // It should return two nodes.
      var wayA = new Way({id: -1, changeset: cid});
      var wayB = new Way({id: -2, changeset: cid});

      var nodeA1 = new Node({id: -1, changeset: cid})
      var nodeA2 = new Node({id: -2, changeset: cid})
      var nodeA3 = new Node({id: -3, changeset: cid})

      var nodeB1 = new Node({id: -4, changeset: cid})
      var nodeB2 = new Node({id: -5, changeset: cid})

      wayA.nodes([nodeA1, nodeA2, nodeA3]);
      wayB.nodes([nodeB1, nodeB2, nodeA3]);

      var cs = new Change();
      cs.create('node', [nodeA1, nodeA2, nodeA3, nodeB1, nodeB2])
      .create('way', [wayA, wayB]);

      testChangeset.upload(cs.get())
      .then(function (res) {
        const {created} = JSON.parse(res.payload);
        const wayId = created.way[-1];
        const includedNodes = [created.node[-1], created.node[-2]];
        return server.injectThen({
          method: 'GET',
          url: `/api/0.6/ways?ways=${wayId}&nodes=true&excludeDoubleLinkedNodes=true`
        }).then(function ({payload}) {
          var {osm} = parser.toJson(payload, {
            object: true
          });
          should.deepEqual(
            osm.node.map(nd => nd.id).sort(),
            includedNodes.sort(),
            'Only includes nodes unique to this way'
          );
          done();
        });
      });
    });
  });
});
