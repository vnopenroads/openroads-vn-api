'use strict';

module.exports = {
  geometriesEqualAtPrecision: (x, y, decimalPrecision) => {
    // Geometries are slightly simplified when added to PostGIS,
    // so truncate before comparison to accommodate accordingly

    // Have to subtract one level of precision to deal with floating-point error
    decimalPrecision = decimalPrecision - 1;

    const isCoordinatePair = c => c.length === 2 && typeof c[0] === 'number' && typeof c[1] === 'number';
    const truncateValue = (val, prec) => Math.trunc(val * Math.pow(10, prec));
    const compareCoordinatePair = (a, b) =>
      truncateValue(a[0], decimalPrecision) === truncateValue(b[0], decimalPrecision) &&
      truncateValue(a[1], decimalPrecision) === truncateValue(b[1], decimalPrecision);
    const compareArray = (a, b) =>
      isCoordinatePair(a) && isCoordinatePair(b)
        ? compareCoordinatePair(a, b)
        : a.every((aArr, index) => compareArray(aArr, b[index]));

    return x.type === y.type &&
      compareArray(x.coordinates, y.coordinates);
  }
};
