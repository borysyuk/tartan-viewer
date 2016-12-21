'use strict';

var _ = require('lodash');
var lunr = require('elasticlunr');
var async = require('../utils/async');

function patchLunrIndex(index) {
  // Path pipeline to do some pre-processing
  var run = index.pipeline.run;
  index.pipeline.run = function(tokens) {
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
}

function worker() {
  self.onmessage = function(event) {
    var refList = [];
    var refMap = {};
    var index = lunr(function() {
      /* eslint-disable no-invalid-this */
      this.addField('name', {boost: 100});
      this.addField('description');
      this.setRef('ref');
      this.saveDocument(false);
      patchLunrIndex(this);
      /* eslint-disable no-invalid-this */
    });

    var records = event.data;
    for (var i = 0; i < records.length; i++) {
      var record = Object.assign({}, records[i]);
      if (Array.isArray(record.description)) {
        record.description = record.description.join(' ');
      }
      index.addDoc(record);
      refMap[record.ref] = record;
      refList.push(record.ref);
    }

    self.postMessage({
      index: index.toJSON(),
      refList: refList,
      refMap: refMap
    });
  };
}

function createIndex(records) {
  records = _.sortBy(records, 'name');

  return async.task(worker, records, {
    patchLunrIndex: patchLunrIndex
  }, ['dist/lunr.js']).then(function(data) {
    var refList = data.refList;
    var refMap = data.refMap;
    var index = lunr.Index.load(data.index);
    patchLunrIndex(index);

    return function(query, returnOnlyRefs) {
      query = _.extend({query: ''}, query);
      query = _.trim(_.isString(query.query) ? query.query : '');

      if (query == '') {
        return returnOnlyRefs ? refList : records;
      }
      return _.chain(index.search(query, {bool: 'AND'}))
        .sortBy('score')
        .reverse()
        .map(function(item) {
          return returnOnlyRefs ? parseInt(item.ref) : refMap[item.ref];
        })
        .value();
    };
  });
}

module.exports = createIndex;
