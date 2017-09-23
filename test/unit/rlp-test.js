'use strict';

var fs = require('fs');
var knex = require('../../connection.js');
var knexCleaner = require('knex-cleaner');
var server = require('../bootstrap.test');

var serverShouldStatus = function (mock, done, status) {
  var options = {
    method: 'POST',
    url: '/fielddata/geometries/rlp',
    payload: mock
  };
  server.injectThen(options)
  .then(function(res) {
    res.statusCode.should.eql(status);
    return done();
  }).catch(function(err) {
    return done(err);
  });
};

describe('RoadLabPro upload', function() {
  describe('geometry upload', function() {
    after(function (done) {
      knexCleaner.clean(knex).then(() => done());
    });

    var data = fs.readFileSync(require.resolve('./fixtures/rlp-sample.zip'));
    it('Should ok when uploading a valid file', function(done) {
      serverShouldStatus(data, done, 200);
    });
  });
});
