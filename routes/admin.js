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
      // make 2 queries and combine results
      Promise.all([
        // mirrors:
        // SELECT type, id, parent_id, bbox FROM admin_boundaries WHERE id=${unitId}
        knex('admin_boundaries')
        .where({ id: unitId })
        .select(knex.raw(`type, id, parent_id, name_en, ST_Extent(geom)`))
        .groupBy('id')
        .then((info) => {
          // format response so it includes a valid bbox array and parent_ids array
          info = info[0];
          info.bbox = formatBox(info.st_extent);
          info.parent_ids = getParents(info.id.toString());
          info.level = info.type;
          // remove unwanted type, parent_id, st_extent properties
          delete info.type
          delete info.parent_id;
          delete info.st_extent;
          return info;
        })
        .catch((e) => {
          console.log(e);
          throw e;
        }),
        // mirrorw:
        // SELECT id WHERE id::text LIKE '${unitid}%';
        // ... this statement selects all ids where leading numbers in id match ${unitId}
        knex('admin_boundaries')
        .where(knex.raw(`id::text LIKE '${unitId}%';`))
        .select('id')
        .then((ids) => {
          // return array of ids without ${unitId} (as it too is selected), then sort results
          // in ascending order. ascending order makes sure children come before grandchildren ids
          return ids.map(id => id[Object.keys(id)[0]])
          .filter(id => id.toString() !== unitId)
          .sort((a, b) => a - b );
        })
        .catch((e) => {
          console.log(e);
          throw e;
        })
      ])
      .then((results) => {
        // serve object from first query with the second query attached as a child_ids property
        const info = results[0];
        info.child_ids = results[1];
        res(info);
      });
    }
  }
];

