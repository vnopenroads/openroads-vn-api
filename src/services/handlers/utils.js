exports.checkStandardQueryParams = function (sortField, sortOrder, page) {
  if (sortField !== 'id') {
    return res(Boom.badData(`Expected 'sortField' query param to be either 'id' or not included.  Got ${req.query.sortField}`));
  }
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    return res(Boom.badData(`Expected 'sortOrder' query param to be either 'asc', 'desc', or not included.  Got ${req.query.sortOrder}`));
  }
  if (page === 0 || isNaN(page)) {
    return res(Boom.badData(`Expected 'page' query param to be a number >= 1, or not included.  Got ${req.query.page}`));
  }
  return false;
}