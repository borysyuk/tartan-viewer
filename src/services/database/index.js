'use strict';

var _ = require('lodash');
var downloader = require('../downloader');

var apiUrl = 'https://datahub.io/api/action/datastore_search_sql?sql=';
var table = '12352ad7-1424-4292-b9a6-141870ff1048';

function changeKeysCase(object) {
  var result = {};
  _.each(object, function(value, key) {
    result[_.camelCase(key)] = value;
  });
  return result;
}

function query(sql) {
  var url = apiUrl + encodeURIComponent(sql);
  return downloader.getJson(url)
    .then(function(response) {
      if (response.success) {
        return _.map(response.result.records, function(record) {
          var result = _.pick(changeKeysCase(record), [
            'source', 'name', 'overview', 'comment', 'copyright',
            'palette', 'threadcount', 'category', 'sourceUrl'
          ]);
          var sett = _.filter([result.palette, result.threadcount]);
          result.sett = sett.length > 0 ? sett.join('\n') : null;
          return result;
        });
      } else {
        throw new Error(_.first(response.error.query))
      }
    });
}

function loadItems() {
  return query('SELECT * FROM "' + table + '"');
}

function getCategories(tartans) {
  return _.chain(tartans)
    .reduce(function(result, value) {
      var key = JSON.stringify([value.source, value.category]);
      if (!result[key]) {
        result[key] = {
          name: value.source + ' / ' + (value.category || '<Without category>'),
          source: value.source,
          category: value.category
        };
      }
      return result;
    }, {})
    .sortBy('name')
    .values()
    .value();
}

function filterTartans(tartans, category) {
  return _.chain(tartans)
    .filter(function(item) {
      return (item.source == category.source) &&
        (item.category == category.category);
    })
    .sortBy('name')
    .value();
}

module.exports.loadItems = loadItems;
module.exports.getCategories = getCategories;
module.exports.filterTartans = filterTartans;
