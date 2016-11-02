'use strict';

var _ = require('lodash');
var lunr = require('lunr');
var Promise = require('bluebird');
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
        return _.map(response.result.records, function(record, index) {
          var result = _.pick(changeKeysCase(record), [
            'source', 'name', 'overview', 'comment', 'copyright',
            'palette', 'threadcount', 'sourceUrl'
          ]);
          result.id = index;
          var sett = _.filter([result.palette, result.threadcount]);
          result.sett = sett.length > 0 ? sett.join('\n') : null;
          result.categories = _.filter(record['Category'].split('; '));
          return result;
        });
      } else {
        throw new Error(_.first(response.error.query))
      }
    });
}

function buildSearchIndex(records) {
  return new Promise(function(resolve) {
    var index = lunr(function() {
      this.field('name', {boost: 100});
      this.field('comment', {boost: 10});
      this.field('source');
      this.field('copyright');
      this.ref('id');

      var run = this.pipeline.run;
      this.pipeline.run = function(tokens) {
        var result = [];
        var n = tokens.length;
        for (var i = 0; i < n; i++) {
          tokens[i] = tokens[i]
            .replace(/[^a-z0-9-']+/ig, '')
            .replace(/'s$/i, '');

          var token = tokens[i];
          token = token
            .replace(/^(mac|mc|o')/i, '')
            .replace(/[']+/ig, '');

          tokens[i] = tokens[i]
            .replace(/[']+/ig, '');

          if (token != '') {
            result.push(tokens[i], token);
          }
        }
        return run.call(this, result);
      };
    });

    _.each(records, function(record) {
      index.add(record);
    });

    resolve(function(query) {
      if (!_.isString(query)) {
        query = '';
      }
      query = query.replace(/^\s+/i, '').replace(/\s+$/i, '');
      if (query == '') {
        return _.sortBy(records, 'name');
      }
      return _.chain(index.search(query))
        .sortBy('score')
        .reverse()
        .map(function(item) {
          return records[item.ref];
        })
        .value();
    });
  });
}

function loadDatabase() {
  var sql = 'SELECT * FROM "' + table + '" WHERE "Source"=\'House of Tartan\'';
  return query(sql).then(buildSearchIndex);
}

module.exports.loadDatabase = loadDatabase;
