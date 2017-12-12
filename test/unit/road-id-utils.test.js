'use strict';

const assert = require('assert');
const utils = require('../../util/road-id-utils');

describe('road ID utilities', () => {
  it('retrieves a road ID when it is in the path', () => {
    const path = '/foo/123AB12345/baz.csv';
    const knownRoadIds = ['123AB12345', '987ZZ98765'];
    const roadId = utils.getRoadIdFromPath(path, knownRoadIds);
    assert.equal(roadId, '123AB12345');
  });

  it('retrieves the road ID deepest in the path', () => {
    const path = '/foo/987ZZ98765/123AB12345/baz.csv';
    const knownRoadIds = ['123AB12345', '987ZZ98765'];
    const roadId = utils.getRoadIdFromPath(path, knownRoadIds);
    assert.equal(roadId, '123AB12345');
  });

  it('retrieves no road ID when none is present', () => {
    const path = '/foo/123AB12345/baz.csv';
    const knownRoadIds = ['987ZZ98765'];
    const roadId = utils.getRoadIdFromPath(path, knownRoadIds);
    assert.equal(roadId, null);
  });

  it('finds a possible ID that is already in VPRoMMS format', () => {
    const path = '/foo/123AB12345/baz.csv';
    const roadId = utils.getPossibleRoadIdFromPath(path);
    assert.equal(roadId, '123AB12345');
  });

  it('finds a possible ID that has `00` district code', () => {
    const path = '/foo/1230012345/baz.csv';
    const roadId = utils.getPossibleRoadIdFromPath(path);
    assert.equal(roadId, '1230012345');
  });

  it('finds a possible ID that has too few characters', () => {
    const path = '/foo/123AB123/baz.csv';
    const roadId = utils.getPossibleRoadIdFromPath(path);
    assert.equal(roadId, '123AB123');
  });

  it('finds a possible ID that has too many characters', () => {
    const path = '/foo/123AB1234567/baz.csv';
    const roadId = utils.getPossibleRoadIdFromPath(path);
    assert.equal(roadId, '123AB1234567');
  });

  it('finds a possible ID that has lower-case characters', () => {
    const path = '/foo/123ab12345/baz.csv';
    const roadId = utils.getPossibleRoadIdFromPath(path);
    assert.equal(roadId, '123ab12345');
  });

  it('finds a possible ID that has non-ASCII characters', () => {
    const path = '/foo/123ZĐ12345/baz.csv';
    const roadId = utils.getPossibleRoadIdFromPath(path);
    assert.equal(roadId, '123ZĐ12345');
  });

  it('finds a possible ID that has trailing characters', () => {
    const path = '/foo/123AB12345foo123/baz.csv';
    const roadId = utils.getPossibleRoadIdFromPath(path);
    assert.equal(roadId, '123AB12345foo123');
  });

  it('finds no possible IDs if none are present', () => {
    const path = '/foo/bar/baz.csv';
    const roadId = utils.getPossibleRoadIdFromPath(path);
    assert.equal(roadId, null);
  });

  it('has a no-road-id code', () => {
    assert.ok(utils.NO_ID);
  });
});
