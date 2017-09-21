'use strict';

var Boom = require('boom');
var knex = require('../connection');
var getParents = require('../services/admin').getParents;
var formatBox = require('../services/admin').formatBOX;
Promise = require('bluebird');

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
     * @apiSuccess {string} units.level admin units' level
     * @apiSuccess {array} units.units list of objects representing all units in level. each object icludes an id and name
     *
     *
     * @apiSuccessExample {JSON} Example Usage:
     *  curl http://localhost:4000/api/admins/commune
     *
     * @apiSuccessExample {JSON} Success-Response
     * {
     *  level: 'province',
     *  'units': [
     *    {
     *      id: 106,
     *      name_en: 'Bac Ninh
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
      const levelCheck = ['commune', 'district', 'province'].find((l) => { return l === level; });
      if (!levelCheck) {
        res(Boom.badRequest('Admin level must be of type \'province\', \'district\', or \'commune'));
      }
      // if proper, SELECT id FROM admin_boundaries WHERE type=${level}
      knex('admin_boundaries')
      .where({ type: level })
      .select('id', 'name_en')
      .then((ids) => {
        // format response per apiSuccessExample spec
        const resObj = {};
        resObj[level] = ids;
        // serve result
        res(resObj);
      })
      .catch((e) => {
        console.log(e);
        // return error if it occurs
        res(Boom.wrap(e));
      });
    }
  },
  {
    /**
     * @api {get} /admin/units?name=substring&limit=# List Matching Units
     * @apiGroup Admin
     * @apiName ListMathcingUnits
     * @apiDescription Returns list of admin unit ids that match a substring.
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
     *  curl http://localhost:4000/api/admins/units?name=Th&limit=2
     *
     * @apiSuccessExample {JSON} Success-Response
     * [
     *  {
     *    id: 2071205,
     *    name_en: "Thanh Van",
     *    level: "commune"
     *  },
     *  {
     *    id: 2071209,
     *    name_en: "Thanh Mai",
     *    level: "commune"
     *  }
     * ]
    */
    method: 'GET',
    path: '/admin/units',
    handler: function (req, res) {
      // parse the query string and the limit setting
      const queryString = req.query.name.toLowerCase();
      console.log(queryString);
      const limit = req.query.limit;
      // selects all admin boundaries ids and name_en fields where name_en field matches query string
      knex('admin_boundaries')
      .where('name_en', 'ILIKE', `${queryString}%`)
      .select('id', 'name_en', 'type as level')
      .then((results) => {
        // serve the response. if a limit is found in the query string, limit response to that limit
        // if not, just serve all that was found
        limit ? res(results.slice(0, Number(limit))) : res(results);
      })
      .catch((e) => {
        console.log(e)
        req(Boom.warp(e));
      })
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
     * @apiSuccess {string} unitInfo.level admin unit level
     * @apiSuccess {string} unitInfo.id unit id
     * @apiSuccess {array} unitInfo.parent_ids unit's parent unit id(s)
     * @apiSuccess {array} unitInfo.bbox unit's bounding box
     *
     *
     * @apiSuccessExample {JSON} Example Usage:
     *  curl http://localhost:4000/admin/10153/info
     *
     * @apiSuccessExample {JSON} Success-Response
     * {
     *   level: 'district',
     *   id: 10153,
     *   name_en: 'Me Linh',
     *   parent_ids: [101],
     *   child_ids: [
     *     1015301,
     *     1015303,
     *     1015315,
     *     1015317,
     *     1015319,
     *     1015321,
     *     1015325,
     *     1015327,
     *     1015329,
     *     1015331,
     *     1015333,
     *     1015335,
     *     1015337,
     *     1015339,
     *     1015341,
     *  level: 'province',
     *  'units': [
     *    {
     *      id: 106,
     *      name_en: 'Bac Ninh
     *    }
     *    ...
     *  ]
     * }
     *     1015343,
     *     1015345,
     *     1015347
     *   ]
     * }
     *
    */
    method: 'GET',
    path: '/admin/{unit_id}/info',
    handler: function (req, res) {
      // get unitId from request params
      const unitId = req.params.unit_id;
      // check if unitId is valid length
      const validIdCheck = [7, 5, 3].find(idLenght => idLenght === unitId.toString().length);
      // serve bad request if unitId string is not an integer
      if(!Number.isInteger(Number(unitId))) {
        return res(Boom.badRequest('unit_id must be an integer'));
      // serve a bad request if unitId is not of valid length
      } else if (!validIdCheck) {
        return res(Boom.badRequest('unit_id must be a numeric code of length 7, 5, or 3. See documentation'));
      }
      // joins two tables made from select statements:
      //   1. a table with admin:
      //      - level
      //      - id
      //      - parent_id
      //      - bbox
      //      - parent_id name
      //      - parent_id level
      //   2. a table with admin:
      //      - id
      //      - child_admin ids
      //      - child_admin names
      // on id
      knex
      .select(
        'self.id as id',
        'self.name_en as name',
        'self.type as level',
        'child.name_en as c_name',
        'child.id as c_id',
        'child.type as c_level',
        'parent.id as p_id',
        'parent.name_en as p_name',
        'parent.type as p_level',
        knex.raw(`ST_Extent(self.geom) as bbox`)
      )
      .from('admin_boundaries AS self')
      .where('self.id', unitId)
      .leftJoin('admin_boundaries AS child', 'self.id', 'child.parent_id')
      .leftJoin('admin_boundaries AS parent', 'self.parent_id', 'parent.id')
      .groupBy('self.id', 'child.name_en', 'child.id', 'parent.id')
      .then((info) => {
        // // format the results, making the bouding box of correct spec, finding parent_ids
        let children = info.map(o => {
          return {name: o.c_name, id: o.c_id};
        });
        let parent = {name: info[0].p_name, id: info[0].p_id, level: info[0].p_level};
        let reposnse = {
          id: info[0].id,
          name: info[0].name,
          level: info[0].level,
          parent: parent,
          children: children,
          children_level: info[0].c_level,
          bbox: formatBox(info[0].bbox)
        };
        res(reposnse);
      })
      .catch((e) => {
        console.log(e);
        throw e;
      });
    }
  }
];
