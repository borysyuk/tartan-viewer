'use strict';

var _ = require('lodash');
var async = require('../utils/async');

function createIndex(records) {
  var refsList = [];
  var refCategories = {};
  var refMap = {};

  return async.each(records, function(record) {
    refMap[record.ref] = record;
    refsList.push(record.ref);

    var categories = record.category;
    if (categories.length == 0) {
      categories = [''];
    }
    _.each(categories, function(category) {
      refCategories[category] = refCategories[category] || [];
      refCategories[category].push(record.ref);
    });
  }).then(function() {
    var searchIndex = function(query, returnOnlyRefs) {
      query = _.extend({categories: []}, query);

      var results = [refsList];
      _.each(query.categories, function(category) {
        var refs = refCategories[category];
        if (_.isArray(refs)) {
          results.push(refs);
        }
      });
      results = _.intersection.apply(null, results);

      return returnOnlyRefs ? results : _.map(results, function(ref) {
        return refMap[ref];
      });
    };

    searchIndex.categories = _.chain(refCategories)
      .keys()
      .sortBy()
      .map(function(key) {
        return {
          name: key == '' ? 'Without category' : key,
          value: key,
          count: refCategories[key].length
        };
      })
      .value();

    return searchIndex;
  });
}

module.exports = createIndex;
