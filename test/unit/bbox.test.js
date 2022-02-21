'use strict';
var should = require('should');
var BoundingBox = require('services/bounding-box.js');

describe('BBox', function () {
  after(function (done) { done(); });

  var makeNode = (x, y) => ({ lat: x, lon: y });

  it('should be constructable from empty nodes', function (done) {
    var bbox = BoundingBox.fromNodes([]);
    should.deepEqual([0, 0, 0, 0], bbox.toArray());
    done();
  });

  it('should be constructable from a single nodes', function (done) {
    var nodes = [makeNode(1, 2)]
    var bbox = BoundingBox.fromNodes(nodes);
    should.deepEqual([2, 1, 2, 1], bbox.toArray());
    done();
  });

  it('should be constructable from a multiple nodes', function (done) {
    var nodes = [makeNode(1.0, 2.0), makeNode(1.1, 2.1)]
    var bbox = BoundingBox.fromNodes(nodes);
    should.deepEqual([2.0, 1.0, 2.1, 1.1], bbox.toArray());
    done();
  });

});
