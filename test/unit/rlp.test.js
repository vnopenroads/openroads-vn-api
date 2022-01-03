'use strict';

const assert = require('assert');
const _ = require('lodash');
const { parseRow } = require('services/rlp-properties');
const { cleanGeometry } = require('services/rlp-geometries');

describe('RLP parsing', () => {
  it('can parse property CSV columns', () => {
    const row = {
      time: '15:35:49 2017-July-11',
      speed: '18.61',
      category: 'POOR',
      start_lat: '22.54621115',
      start_lon: '103.85113799',
      end_lat: '22.54574264',
      end_lon: '103.85200066',
      is_fixed: 'false',
      iri: '6.13',
      distance: '102.79',
      suspension: 'HARD-MEDIUM'
    };

    const parsed = parseRow(row);

    assert.deepEqual(parsed.geom, {
      type: 'Point',
      coordinates: [103.85156932573214, 22.545976895574945]
    });
    assert.equal(
      parsed.datetime.toISOString(),
      '2017-07-11T19:35:49.000Z'
    );
    assert.ok(_.isEqual(
      new Set(Object.keys(parsed.properties)),
      new Set(['speed', 'category', 'is_fixed', 'iri', 'distance', 'suspension'])
    ));
  });

  it('can parse geometry rows', () => {
    const rows = [
      {
        time: "12:00:00 2017-July-01",
        latitude: "20.0000",
        longitude: "30.0000"
      },
      {
        time: "12:00:30 2017-July-01",
        latitude: "20.0000",
        longitude: "30.0001"
      },
      {
        time: "12:01:00 2017-July-01",
        latitude: "20.0002",
        longitude: "30.0001"
      }
    ];

    const parsed = cleanGeometry(rows);
    const expeted = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [[30, 20], [30.0001, 20], [30.0001, 20.0002]]
      },
      properties: {}
    };

    assert.ok(_.isEqual(parsed, expeted));
  });

  it('throws out geometry sections that are unrealisitically far apart', () => {
    const rows = [
      {
        time: "12:00:00 2017-July-01",
        latitude: "20.0000",
        longitude: "30.0000"
      },
      {
        time: "12:00:30 2017-July-01",
        latitude: "20.0000",
        longitude: "30.0001"
      },
      {
        time: "12:01:00 2017-July-01",
        latitude: "20.0000",
        longitude: "30.1"
      }
    ];

    const parsed = cleanGeometry(rows);
    const expeted = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [[30, 20], [30.0001, 20]]
      },
      properties: {}
    };

    assert.ok(_.isEqual(parsed, expeted));
  });

  it('throws out geometry sections if the time gap is too long', () => {
    const rows = [
      {
        time: "12:00:00 2017-July-01",
        latitude: "20.0000",
        longitude: "30.0000"
      },
      {
        time: "12:00:30 2017-July-01",
        latitude: "20.0000",
        longitude: "30.0001"
      },
      {
        time: "12:09:00 2017-July-01",
        latitude: "20.0002",
        longitude: "30.0001"
      }
    ];

    const parsed = cleanGeometry(rows);
    const expeted = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [[30, 20], [30.0001, 20]]
      },
      properties: {}
    };

    assert.ok(_.isEqual(parsed, expeted));
  });
});
