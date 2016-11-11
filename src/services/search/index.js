'use strict';

var _ = require('lodash');

function createIndex(records, engines) {
  engines = _.filter(engines, _.isFunction);

  var refMap = {};
  _.each(records, function(record) {
    refMap[record.id] = record;
  });

  if (engines.length == 0) {
    return function() {
      return records;
    };
  }

  return function(query, returnOnlyRefs) {
    var results = _.map(engines, function(engine) {
      return engine(query, true);
    });
    if (results.length > 1) {
      results = _.intersection.apply(null, results);
    } else {
      results = _.first(results);
    }
    return returnOnlyRefs ? results : _.map(results, function(ref) {
      return refMap[ref];
    });
  };
}

module.exports = createIndex;

module.exports.fulltext = require('./fulltext');
module.exports.category = require('./category');
