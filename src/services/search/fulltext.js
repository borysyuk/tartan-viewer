'use strict';

var _ = require('lodash');
var lunr = require('lunr');

function createIndex(records) {
  records = _.sortBy(records, 'name');

  var index = lunr(function() {
    this.field('name', {boost: 100});
    this.field('description');
    this.ref('ref');

    // Path pipeline to do some pre-processing
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
          .replace(/^(mac|mc|o'|m'k|m'c)/i, '')
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

  var refList = [];
  var refMap = {};
  _.each(records, function(record) {
    record = _.extend({}, record);
    if (_.isArray(record.description)) {
      record.description = record.description.join(' ');
    }
    index.add(record);
    refMap[record.ref] = record;
    refList.push(record.ref);
  });

  return function(query, returnOnlyRefs) {
    query = _.extend({query: ''}, query);
    query = _.isString(query.query) ? query.query : '';
    query = query.replace(/^\s+/i, '').replace(/\s+$/i, '');

    if (query == '') {
      return returnOnlyRefs ? refList : records;
    }
    return _.chain(index.search(query))
      .sortBy('score')
      .reverse()
      .map(function(item) {
        return returnOnlyRefs ? item.ref : refMap[item.ref];
      })
      .value();
  };
}

module.exports = createIndex;
