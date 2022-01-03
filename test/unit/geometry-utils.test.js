'use strict';

const assert = require('assert');
const _ = require('lodash');
const utils = require('util/geometry-utils');

describe('geometry utilities', () => {
  it('finds two identical LineStrings the same', () => {
    const ls = {
      "type": "LineString",
      "coordinates": [
        [
          100.123456789,
          20.123456789
        ],
        [
          101.123456789,
          21.123456789
        ]
      ]
    };

    const other = _.cloneDeep(ls);

    assert.ok(utils.geometriesEqualAtPrecision(ls, other, 0));
    assert.ok(utils.geometriesEqualAtPrecision(ls, other, 1));
    assert.ok(utils.geometriesEqualAtPrecision(ls, other, 5));
    assert.ok(utils.geometriesEqualAtPrecision(ls, other, 9));
    assert.ok(utils.geometriesEqualAtPrecision(ls, other, 100));
  });

  it('finds two very different LineStrings to be different', () => {
    const ls = {
      "type": "LineString",
      "coordinates": [
        [
          100.123456789,
          20.123456789
        ],
        [
          101.123456789,
          21.123456789
        ]
      ]
    };

    const other = {
      "type": "LineString",
      "coordinates": [
        [
          1,
          20.123456789
        ],
        [
          101.123456789,
          21.123456789
        ]
      ]
    };

    assert.ifError(utils.geometriesEqualAtPrecision(ls, other, 5));
  });

  it('finds LineString and MultiLineString different', () => {
    const ls = {
      "type": "LineString",
      "coordinates": [
        [
          100.123456789,
          20.123456789
        ],
        [
          101.123456789,
          21.123456789
        ]
      ]
    };

    const other = {
      "type": "MultiLineString",
      "coordinates": [[
        [
          100.123456789,
          20.123456789
        ],
        [
          101.123456789,
          21.123456789
        ]
      ]]
    };

    assert.ifError(utils.geometriesEqualAtPrecision(ls, other, 5));
  });

  it('finds two different LineStrings the same at certain precisions', () => {
    const ls = {
      "type": "LineString",
      "coordinates": [
        [
          100.123456789,
          20.123456789
        ],
        [
          101.123456789,
          21.123456789
        ]
      ]
    };

    const other = {
      "type": "LineString",
      "coordinates": [
        [
          100.12345,
          20.12345
        ],
        [
          101.12345,
          21.12345
        ]
      ]
    };

    assert.ok(utils.geometriesEqualAtPrecision(ls, other, 0));
    assert.ok(utils.geometriesEqualAtPrecision(ls, other, 1));
    assert.ok(utils.geometriesEqualAtPrecision(ls, other, 5));
    assert.ifError(utils.geometriesEqualAtPrecision(ls, other, 6));
    assert.ifError(utils.geometriesEqualAtPrecision(ls, other, 100));
  });
});
