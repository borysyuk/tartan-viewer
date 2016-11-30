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
  });
}

module.exports = createIndex;
