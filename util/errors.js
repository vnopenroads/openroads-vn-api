const Boom = require('boom');

module.exports = {
  nullRoadIds: Boom.badRequest(
    'Failed to ingest data; ' +
    'cannot ingest invalid or missing road IDs. ' +
    'Please assign IDs to all roads, and try uploading again.'
  ),
  unknownRoadIds: ids => Boom.badRequest(
    'Failed to ingest data; ' +
    'found road IDs that are not known to the platform. ' +
    'Please add these road IDs to the platform first, ' +
    'or remove these roads from your data and upload again: ' +
    ids.join(', ')
  )
};
