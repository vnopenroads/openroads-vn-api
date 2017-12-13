'use strict';

const Boom = require('boom');
const {
  NO_ID,
  ONLY_PROPERTIES
} = require('./road-id-utils');

module.exports = {
  nullRoadIds: Boom.badRequest(
    'Failed to ingest data; ' +
    'cannot ingest invalid or missing road IDs. ' +
    'Please assign IDs to all roads, in the standard form ' +
    'of ###ZZ#####, and try uploading again. ' +
    `If a road truly has no ID, then assign an ID of '${NO_ID}'. ` +
    'If this is a run to collect IRI for many roads at a time, ' +
    `then assign an ID of '${ONLY_PROPERTIES}'.`
  ),
  unknownRoadIds: ids => Boom.badRequest(
    'Failed to ingest data; ' +
    'found road IDs that are not known to the platform. ' +
    'Please add these road IDs to the platform first, ' +
    'or standardize IDs to the standard form of ###ZZ#####, ' +
    'or remove these roads from your data and upload again. ' +
    `If a road truly has no ID, then assign an ID of '${NO_ID}'. ` +
    'If this is a run to collect IRI for many roads at a time, ' +
    `then assign an ID of '${ONLY_PROPERTIES}'. ` +
    ids.join(', ')
  ),
  alreadyIngested: Boom.badRequest(
    'All data in the upload is already present in the platform. ' +
    'No further action is required.'
  ),
  cannotUseNoId: Boom.badRequest(
    `Cannot use '${NO_ID}' as a road ID value in this type of upload. ` +
    'Please remove that data, or label it with a standard road ID.'
  ),
  cannotUseOnlyProperties: Boom.badRequest(
    `Cannot use '${ONLY_PROPERTIES}' as a road ID value in this type of upload. ` +
    'Please remove that data, or label it with a standard road ID.'
  ),

  // Errors solely for tabular uploads
  noCSV: Boom.badRequest(
    'No CSV provided, or cannot parse CSV'
  ),
  noCSVRows: Boom.badRequest(
    'CSV must contain data, but no rows detected'
  ),
  noDuplicateTabularHeaders: Boom.badRequest(
    'CSV cannot have duplicate column names'
  ),
  noQuotesInTabularHeader: Boom.badRequest(
    'Do not use quotes or commans in the CSV headers'
  ),
  noExtraQuotesInTabular: Boom.badRequest(
    'Do not use unnecessary quotations'
  )
};
