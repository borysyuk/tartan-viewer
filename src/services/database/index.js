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
            'palette', 'threadcount'
          ]);

          if (result.palette == ';') {
            result.palette = '';
          }

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
  return query('SELECT * FROM "' + table +
    '" ORDER BY "Source" ASC, "Name" ASC');
}

module.exports.loadItems = loadItems;
