'use strict';

var Boom = require('boom');
var knex = require('../connection');

// module.exports = {
  /**
   * @api {get} /admin/:level
   * @apiGroup Admin
   * @apiName ListAdmins
   * @apiDescription Returns list of admin unit ids of specified level.
   * @apiVersion 0.1.0
   *
   * @apiParam {String} level Admin level (province, district, or commune)
   *
   * @apiSuccess {JSON} Sucess-Response object including list of all admin ids in the level supplied in parameters
   *
   * @apiSuccessExample {JSON} Example Usage:
   *  curl http://localhost:4000/api/admins/commune
   *
   * @apiSuccessExample {JSON} Success-Response
   * {
   *  'commune': [
   *    123456,
   *    789101,
   *    654321
   *  ]
   * }
  */
//   method: 'GET',
//   path: '/admin/{level}',
//   handler: function (req, res) {
//     console.log(req.param.level);
//     res('surf')
//   }
// }

module.exports = [
  {
    /**
     * @api {get} /admin/:level/units
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
     * @api {get} /admin/:unit_id/info
     * @apiGroup Admin
     * @apiName AdminInfo
     * @apiDescription Returns information for a provided admin_id
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
    path: '/admin/{unit_id}/info',
    handler: function (req, res) {}
  }
];

