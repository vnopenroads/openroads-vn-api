'use strict';

var Boom = require('@hapi/boom');
var Promise = require('bluebird');

var knex = require('../connection');
var queryWays = require('../services/query-ways');
var log = require('../services/log');
var XML = require('../services/xml');
var Node = require('../models/node-model');

module.exports = [
  {
    /**
     * @api {get} /api/0.6/ways Get one or more ways by ID
     * @apiGroup Features
     * @apiName MultiWay06
     * @apiDescription Returns OSM XML for requested way(s).
     *
     * @apiParam {String} ways Way IDs (comma-delimited)
     * @apiParam {String} nodes Include nodes in response
     * @apiParam {String} excludeDoubleLinkedNodes Only include nodes that aren't part of other ways
     *
     * @apiExample {curl} Example Usage:
     *    curl http://localhost:4000/api/0.6/ways?ways=88007350,88027071&nodes=true
     *
     * @apiSuccessExample {xml} Success-Response:
     *  <?xml version="1.0" encoding="UTF-8"?>
     *  <osm version="0.6" generator="macrocosm (v0.1.0)">
     *    <node id="35826" visible="true" version="1" changeset="11" timestamp="2017-10-13T05:43:31.411Z" user="DevelopmentSeed" uid="1" lat="22.510901" lon="103.8839726"/>
     *    ...
     *    <way id="88007350" visible="true" version="3" changeset="9820551" timestamp="2011-11-13T23:47:04.000Z" user="DevelopmentSeed" uid="1">
     *      <nd ref="1022995472"/>
     *      <nd ref="1502285127"/>
     *      <nd ref="1502285133"/>
     *      <nd ref="1502285135"/>
     *      <nd ref="1502285123"/>
     *      <nd ref="1023125541"/>
     *      <nd ref="1502285125"/>
     *      <nd ref="1502281511"/>
     *      <nd ref="1502281474"/>
     *      <nd ref="1502281487"/>
     *      <nd ref="1502281521"/>
     *      <nd ref="1502281508"/>
     *      <nd ref="1023169944"/>
     *      <nd ref="1023169948"/>
     *      <tag k="highway" v="footway"/>
     *      <tag k="source" v="Bing"/>
     *      <tag k="highway" v="footway"/>
     *      <tag k="source" v="Bing"/>
     *    </way>
     *    <way id="88027071" visible="true" version="6" changeset="9820551" timestamp="2011-11-14T00:15:25.000Z" user="DevelopmentSeed" uid="1">
     *      <nd ref="1502281457"/>
     *      <nd ref="1502281509"/>
     *      <nd ref="1502281491"/>
     *      <nd ref="1502281514"/>
     *      <nd ref="1502281517"/>
     *      <nd ref="1502271609"/>
     *      <nd ref="1502271614"/>
     *      <nd ref="1502281476"/>
     *      <nd ref="1502281487"/>
     *      <nd ref="1502281507"/>
     *      <nd ref="1502281453"/>
     *      <nd ref="1502281502"/>
     *      <nd ref="1502281483"/>
     *      <nd ref="1502281500"/>
     *      <nd ref="1502281492"/>
     *      <nd ref="1502281456"/>
     *      <nd ref="1502281452"/>
     *      <nd ref="1502281516"/>
     *      <nd ref="1502281506"/>
     *      <nd ref="1502281489"/>
     *      <nd ref="1502281512"/>
     *      <nd ref="1502281478"/>
     *      <nd ref="1502281458"/>
     *      <nd ref="1502281490"/>
     *      <nd ref="1502281470"/>
     *      <nd ref="1502281471"/>
     *      <nd ref="1502281466"/>
     *      <nd ref="1502281479"/>
     *      <nd ref="1502281459"/>
     *      <nd ref="1502281525"/>
     *      <nd ref="1502281481"/>
     *      <nd ref="1502281467"/>
     *      <nd ref="1502281504"/>
     *      <nd ref="1502281460"/>
     *      <nd ref="1502281455"/>
     *      <nd ref="1502281473"/>
     *      <nd ref="1502281485"/>
     *      <nd ref="1502281505"/>
     *      <nd ref="1502281508"/>
     *      <nd ref="1502281450"/>
     *      <nd ref="1502281493"/>
     *      <nd ref="1023169909"/>
     *      <nd ref="1023169947"/>
     *      <nd ref="1502308242"/>
     *      <nd ref="1023169955"/>
     *      <nd ref="1502267313"/>
     *      <nd ref="1502267314"/>
     *      <nd ref="1502267315"/>
     *      <nd ref="1502317860"/>
     *      <nd ref="1502281510"/>
     *      <nd ref="1502263378"/>
     *      <nd ref="1502263430"/>
     *      <nd ref="1502263404"/>
     *      <nd ref="1502263413"/>
     *      <nd ref="1502263446"/>
     *      <nd ref="1502263415"/>
     *      <nd ref="1502263449"/>
     *      <nd ref="1502263384"/>
     *      <nd ref="1502263385"/>
     *      <nd ref="1502263448"/>
     *      <nd ref="1502263444"/>
     *      <nd ref="1502263426"/>
     *      <nd ref="1502263383"/>
     *      <nd ref="1502263443"/>
     *      <nd ref="1502263437"/>
     *      <tag k="highway" v="footway"/>
     *      <tag k="source" v="Bing"/>
     *      <tag k="highway" v="footway"/>
     *      <tag k="source" v="Bing"/>
     *    </way>
     *  </osm>
     */
    method: 'GET',
    path: '/api/0.6/ways',
    handler: function (req, res) {
      var withNodes = req.query.nodes === 'true';
      var excludeDoubleLinkedNodes = withNodes && req.query.excludeDoubleLinkedNodes === 'true';
      var wayIds = req.query.ways.split(',');

      if (wayIds.length === 0 || wayIds.filter(isNaN).length !== 0) {
        return res(Boom.badRequest('Numerical way IDs must be provided.'));
      }

      queryWays(knex, wayIds)
        .then(function (result) {
          var doc = {
            ways: Node.withTags(result.ways, result.waytags, 'way_id')
          };
          if (!excludeDoubleLinkedNodes) {
            doc.nodes = withNodes ? result.nodes : null;
            return Promise.resolve(doc);
          } else {
            return knex('current_way_nodes')
              .whereIn('node_id', result.nodes.map(nd => nd.id))
              .then(function (wayNodes) {
                const nodesToExclude = [];
                for (let i = 0, ii = wayNodes.length; i < ii; ++i) {
                  let { way_id, node_id } = wayNodes[i];
                  if (wayIds.indexOf(way_id) === -1) {
                    nodesToExclude.push(node_id);
                  }
                }
                doc.nodes = result.nodes.filter(nd => nodesToExclude.indexOf(nd.id) === -1);
                return Promise.resolve(doc);
              });
          }
        }).then(function (doc) {
          var xmlDoc = XML.write(doc);
          var response = res(xmlDoc.toString());
          response.type('text/xml');
        })
        .catch(function (err) {
          log.error(err);
          return res(Boom.wrap(err));
        });
    }
  }
];
