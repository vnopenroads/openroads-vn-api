'use strict';

var Boom = require('@hapi/boom');
var knex = require('../connection');
var formatBox = require('../services/admin').formatBOX;
var _ = require('lodash');
var { boomWrapper } = require('../services/handlers/utils')

module.exports = [
  {
    /**
     * @api {get} /admin/:level/units List Admins
     * @apiGroup Admin
     * @apiName ListAdmins
     * @apiDescription Returns list of admin unit ids of specified level.
     * @apiVersion 0.1.0
     *
     * @apiParam {String} level Admin level (province, district, or commune)
     *
     * @apiSuccess {JSON} units object including list of all admin ids in the level supplied in parameters
     * @apiSuccess {string} units[:level] list of objects representing all units in level. each object includes an id, english name, and vietnamese name
     *
     *
     * @apiSuccessExample {JSON} Example Usage:
     *  curl http://localhost:4000/admin/district/units
     *
     * @apiSuccessExample {JSON} Success-Response
     * {
     *  'district': [
     *    {
     *      id: 60511,
     *      name_en: 'Buon Don',
     *      name_vn:'Buôn Đôn'
     *    }
     *    ...
     *  ]
     * }
    */
    method: 'GET',
    path: '/admin/{level}/units',
    handler: function (req, res) {
      const level = req.params.level;
      // check to make sure admin level is of the proper type
      const levelCheck = ['commune', 'district', 'province'].indexOf(level);
      if (levelCheck === -1) {
        return Boom.badRequest('Admin level must be of type \'province\', \'district\', or \'commune');
      }
      // if proper, SELECT id FROM admin_boundaries WHERE type=${level}
      return knex('admin_boundaries')
        .where({ type: level })
        .select('id', 'name_en', 'name_vn')
        .then((ids) => ({ [level]: ids })) // format response per apiSuccessExample spec
        .catch(boomWrapper);
    }
  },
  {
    /**
     * @api {get} /admin/units?name=substring&limit=# List Matching Units
     * @apiGroup Admin
     * @apiName ListMatchingUnits
     * @apiDescription Returns list of admin unit ids that match a substring in ascending order.
     * @apiVersion 0.1.0
     *
     * @apiParam {String} name a string used to search for matching admin units
     * @apiParam {Number} limit a number that when passed limits the # of return units to equal limit
     *
     * @apiSuccess {array} units array including list of all admin ids that match the passed substring
     * @apiSuccess {object} units[i] unit object including unit id and name_en properties
     * @apiSuccess {Number} units[i].id unit id
     * @apiSuccess {string} units[i].level unit level
     * @apiSuccess {string} units[i].name_en english name of matching unit
     *
     *
     * @apiSuccessExample {JSON} Example Usage:
     *  curl http://localhost:4000/admin/units?name=Nie&limit=2
     *
     * @apiSuccessExample {JSON} Success-Response
     * [
     *   {
     *     "id": 296,
     *     "name_en": "Dong Van",
     *     "name_vn": "Huyện Đồng Văn",
     *     "level": "district"
     *   },
     *   {
     *     "id": 65,
     *     "name_en": "Hoa Vang",
     *     "name_vn": "Huyện Hòa Vang",
     *     "level": "district"
     *   }
     * ]
     * 
    */
    method: 'GET',
    path: '/admin/units',
    handler: function (req, res) {
      // parse the query string and the limit setting
      if (!req.query.name) { return Boom.badRequest('Missing parameter \'name\''); }
      const queryString = req.query.name.toLowerCase();
      const limit = (!Number.isNaN(req.query.limit) && Number(req.query.limit) > 0) ? Number(req.query.limit) : 100;
      // selects all admin boundaries ids and name fields where name (en or vn) field matches query string
      return knex('admin_boundaries')
        .where('name_en', 'ILIKE', `%${queryString}%`)
        .orWhere('name_vn', 'ILIKE', `%${queryString}%`)
        .select('id', 'name_en', 'name_vn', 'type as level')
        .orderBy('name_en', 'asc')
        .limit(limit)
        .catch(boomWrapper);
    }
  },
  {
    /**
     * @api {get} /admin/:unit_id/info Admin Info
     * @apiGroup Admin
     * @apiName AdminInfo
     * @apiDescription Returns information for admin unit with provided unit_id
     * @apiVersion 0.1.0
     *
     * @apiParam {String} unit_id Admin unit id
     *
     * @apiSuccess {JSON} unitInfo object with unit info
     * @apiSuccess {string} unitInfo.id unit id
     * @apiSuccess {string} unitInfo.level admin unit level
     * @apiSuccess {object} unitInfo.parent object with info about admin unit's parent
     * @apiSuccess {string} unitInfo.parent.name_en parent unit's english name
     * @apiSuccess {string} unitInfo.parent.name_vn parent unit's vietnamese name
     * @apiSuccess {number} unitInfo.parent.id parent unit's id
     * @apiSuccess {string} unitInfo.parent.level parent unit's level
     * @apiSuccess {array} unitInfo.children list of admin unit's children admin units
     * @apiSuccess {string} unitInfo.children[0].name_en english name of a given child admin unit
     * @apiSuccess {string} unitInfo.children[0].name_vn vietnamese name of a given child admin unit
     * @apiSuccess {number} unitInfo.children[0].id id of a given child admin unit
     * @apiSuccess {string} unitInfo.children_level unit children admin level
     * @apiSuccess {array} unitInfo.bbox unit's bounding box
     *
     *
     * @apiSuccessExample {JSON} Example Usage:
     *  curl http://localhost:4000/admin/106/info
     *
     * @apiSuccessExample {JSON} Success-Response
     * {
     *   id: 10153,
     *   name_en: 'Me Linh',
     *   name_vn: 'H. M Linn',
     *   level: 'district',
     *   parent: {
     *     name_en: 'Ha Noi',
     *     name_vn: 'Hà Nội',
     *     id: 101,
     *     level: 'province'
     *   },
     *   child_ids: [
     *     {
     *       name_en: 'Kim Hoa',
     *       name_vn: 'Kim Hoa',
     *       id: 1015315
     *     },
     *     ...
     *   ],
     *   children_level: 'commune',
     *   bbox: [
     *     105.615146129347,
     *     21.121647339736,
     *     105.791829672926,
     *     21.2396319143545
     *   ]
     * }
     *
    */
    method: 'GET',
    path: '/admin/{unit_id}/info',
    handler: async function (req, res) {
      console.log('/admin/{unit_id}/info');
      // get unitId from request params
      const unitId = req.params.unit_id;
      // check if unitId is valid length
      const validIdCheck = [7, 5, 3].indexOf(unitId.toString().length);
      // serve bad request if unitId string is not an integer
      if (!Number.isInteger(Number(unitId))) {
        return Boom.badRequest('unit_id must be an integer');
        // serve a bad request if unitId is not of valid length
      } else if (validIdCheck === -1) {
        return Boom.badRequest('unit_id must be a numeric code of length 7, 5, or 3. See documentation');
      }
      // joins two tables made from select statements:
      //   1. a table with admin (level, id, parent_id, bbox, parent_id name, parent_id level)
      //   2. a table with admin (id, child_admin ids, child_admin names)
      // on id
      var q = knex
        .select(
          'self.id as id',
          'self.name_en as name_en',
          'self.name_vn as name_vn',
          'self.type as level',
          'child.name_en as c_name_en',
          'child.name_vn as c_name_vn',
          'child.id as c_id',
          'child.type as c_level',
          'parent.id as p_id',
          'parent.name_en as p_name_en',
          'parent.name_vn as p_name_vn',
          'parent.type as p_level',
          knex.raw(`ST_Extent(self.geom) as bbox`)
        )
        .from('admin_boundaries AS self')
        .where('self.id', unitId)
        .leftJoin('admin_boundaries AS child', 'self.id', 'child.parent_id')
        .leftJoin('admin_boundaries AS parent', 'self.parent_id', 'parent.id')
        .groupBy('self.id', 'child.id', 'parent.id', 'child.name_en', 'child.name_vn');

      console.log(q.toString());

      var info = await q;
      if (info.length != 1) {
        return Boom.notFound(`No admin unit with id = '${unitId}' exists`);
      }

      var result = info[0];
      console.log("RESULT: \n ", result);
      // format the results, making the bounding box of correct spec, finding parent_ids
      let children = info.map(o => ({ name_en: o.c_name_en, name_vn: o.c_name_vn, id: o.c_id }));

      let parent = {
        name_en: info[0].p_name_en,
        name_vn: info[0].p_name_vn,
        id: info[0].p_id,
        level: info[0].p_level
      };

      let response = {
        id: info[0].id,
        name_en: info[0].name_en,
        name_vn: info[0].name_vn,
        level: info[0].level,
        parent: parent,
        children: children,
        children_level: info[0].c_level,
        bbox: formatBox(info[0].bbox)
      };
      return response;
    }
  },
  {
    /**
     * @api {get} /admin/roads/total
     * @apiGroup Admin
     * @apiName Province Road Count
     * @apiDescription list road count for all provinces
     * @apiVersion 0.3.0
     *
     * @apiExample {curl} Example Usage:
     *  curl -X GET http://localhost:4000/admin/roads/total
     */
    method: 'GET',
    path: '/admin/roads/total',
    handler: function (req, res) {
      return knex.raw(`
        SELECT SUBSTRING(roads.id, 0, 3) AS province_id,
            COUNT(DISTINCT roads.id) AS count,
            COUNT(DISTINCT CASE WHEN ways.visible THEN roads.id ELSE NULL END) AS osmcount
        FROM road_properties AS roads
        LEFT JOIN current_way_tags AS tags
            ON roads.id = tags.v AND
            tags.k = 'or_vpromms'
        LEFT JOIN current_ways AS ways
            ON tags.way_id = ways.id
        GROUP BY province_id;
      `)
        .then(function ({ rows }) {
          var reducer = (provinces, { province_id, count, osmcount }) => {
            provinces[province_id] = { count: parseInt(count), osmCount: parseInt(osmcount) };
            return provinces;
          }
          return rows.reduce(reducer, {});
        })
        .catch(function (err) {
          console.error('Error GET /admin/roads/total', err);
          return Boom.badImplementation(err);
        });
    }
  },
  {
    /**
     * @api {get} /admin/stats
     * @apiGroup Admin
     * @apiName Province and District Stats
     * @apiDescription list road count for all provinces and districts
     * @apiVersion 0.3.0
     *
     * @apiExample {curl} Example Usage:
     *  curl -X GET http://localhost:4000/admin/stats
     *  curl -X GET http://localhost:4000/admin/stats?province=455
     *  curl -X GET http://localhost:4000/admin/stats?province=455&district=463
     */
    method: 'GET',
    path: '/admin/stats',
    handler: function (req, res) {
      const province = req.query.province || null;
      const district = req.query.district || null;
      const stats = {};
      return knex('admin_boundaries')
        .select('id', 'code', 'parent_id', 'name_en', 'name_vn', 'type', 'total_length as total', 'vpromm_length as vpromm')
        .modify(queryBuilder => {
          if (province && district) {
            queryBuilder.andWhere('id', province)
              .orWhere('id', district);
          } else if (province) {
            queryBuilder.andWhere('id', province)
              .orWhere('parent_id', province);
          }
        })
        .then((rows) => {
          // this query also needs to respect the province and/or district filter
          stats.lengths = rows;
          return knex('road_properties')
            .select(knex.raw('id, status'))
            .then((roads) => {
              const adminStatus = {
                province: {},
                district: {}
              };
              _.forEach(roads, (r) => {
                let provinceCode = r.id.substr(0, 2);
                let districtCode = provinceCode + r.id.substr(3, 2);
                if (!adminStatus.province.hasOwnProperty(provinceCode)) {
                  adminStatus.province[provinceCode] = { 'pending': 0, 'reviewed': 0 };
                }
                if (!adminStatus.district.hasOwnProperty(districtCode)) {
                  adminStatus.district[districtCode] = { 'pending': 0, 'reviewed': 0 };
                }
                if (r.status === 'reviewed') {
                  adminStatus.province[provinceCode].reviewed = adminStatus.province[provinceCode].reviewed + 1;
                  adminStatus.district[districtCode].reviewed = adminStatus.district[districtCode].reviewed + 1;
                } else {
                  adminStatus.province[provinceCode].pending = adminStatus.province[provinceCode].pending + 1;
                  adminStatus.district[districtCode].pending = adminStatus.district[districtCode].pending + 1;
                }
              });
              stats.status = adminStatus;
              return stats;
            });
        })
        .then((stats) => {
          const admins = {};
          // get all the provinces
          admins['provinces'] = _.filter(stats.lengths, (r) => {
            r.status = null;
            if (r.code) {
              r.status = stats.status.province[r.code];
            }
            return r.type === 'province';
          });

          // group district per province
          _.forEach(admins.provinces, (p) => {
            p['districts'] = _.filter(_.cloneDeep(stats).lengths, (d) => {
              if (d.code) {
                d.status = stats.status.district[p.code + d.code];
              }
              return d.parent_id === p.id;
            });
          });
          return admins;
        })
        .catch(function (err) {
          console.error('Error GET /admin/roads/total', err);
          return Boom.badImplementation(err);
        });
    }
  }
];
