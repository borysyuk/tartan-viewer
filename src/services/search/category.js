'use strict';

var _ = require('lodash');
var async = require('../utils/async');

function worker() {
  self.onmessage = function(event) {
    var refsList = [];
    var refCategories = {};
    var refMap = {};

    var records = event.data;
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      refMap[record.ref] = record;
      refsList.push(record.ref);

      var categories = record.category;
      if (categories.length == 0) {
        categories = [''];
      }
      for (var j = 0; j < categories.length; j++) {
        var category = categories[j];
        refCategories[category] = refCategories[category] || [];
        refCategories[category].push(record.ref);
      }
    }
    self.postMessage({
      refsList: refsList,
      refCategories: refCategories,
      refMap: refMap
    });
  };
}

function createIndex(records) {
  return async.task(worker, records).then(function(data) {
    var refsList = data.refsList;
    var refCategories = data.refCategories;
    var refMap = data.refMap;

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
