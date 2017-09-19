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
      knex.raw(`
      SELECT * FROM
        (
          SELECT type as level, id, parent_id, ST_Extent(geom) as bbox,
            p.name as p_name_en, name_en, p.p_type as p_level
          FROM admin_boundaries
            JOIN (SELECT name_en as name, id as parent, type as p_type FROM admin_boundaries) p
          ON parent_id=p.parent
          AND id=${unitId}
          GROUP BY id, p_name_en, p_level
        ) a
        JOIN (
          SELECT parent_id as p_id, type as c_level, string_agg(id::text, ', ') AS child_ids, string_agg(name_en, ', ') as child_names
          FROM admin_boundaries
          WHERE parent_id=${unitId}
          GROUP BY parent_id, c_level
        ) b
      ON (a.id = b.p_id);
      `)
      .then((info) => {
        console.log()
        // // format the results, making the bouding box of correct spec, finding parent_ids
        info = info.rows[0];
        info.bbox = formatBox(info.bbox);
        info.parent_ids = getParents(info.id.toString());
        info.child_ids = info.child_ids.split(', ').map(c => Number(c));
        info.children = info.child_names.split(', ').map((c, i ) => { return {id: info.child_ids[i], name: c }; });
        // remove unwanted type, parent_id, st_extent properties
        delete info.parent_id;
        delete info.child_ids;
        delete info.child_names;
        res(info);
      })
      .catch((e) => {
        console.log(e);
        throw e;
      });
    }
  }
];
