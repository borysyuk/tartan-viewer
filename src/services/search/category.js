'use strict';

var _ = require('lodash');

function createIndex(records) {
  var refsList = [];
  var refCategories = {};
  var refMap = {};

  _.each(records, function(record) {
    refMap[record.id] = record;
    refsList.push(record.id);
    var categories = record.category;
    if (categories.length == 0) {
      categories = [''];
    }
    _.each(categories, function(category) {
      refCategories[category] = refCategories[category] || [];
      refCategories[category].push(record.id);
    });
  });

  return function(query, returnOnlyRefs) {
    query = _.extend({categories: []}, query);
    var categories = _.filter(query.categories, _.isString);
    var results = refsList;
    if (categories.length > 0) {
      // TODO: Implement
    }
    return returnOnlyRefs ? results : _.map(results, function(ref) {
      return refMap[ref];
    });
  };
}

module.exports = createIndex;
