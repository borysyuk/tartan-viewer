'use strict';

var _ = require('lodash');
var url = require('url');
var Promise = require('bluebird');

var chunkSize = 100;
var sleepTimeout = 10;

function each(items, callback) {
  if (!_.isArrayLike(items) || !_.isFunction(callback)) {
    return Promise.resolve(items);
  }
  if (items.length == 0) {
    return Promise.resolve(items);
  }

  var completeCallback = _.noop;
  var current = 0;
  function process() {
    var from = current;
    var to = Math.min(from + chunkSize, items.length);
    for (var i = from; i < to; i++) {
      callback(items[i]);
    }
    current = to;
    if (current < items.length) {
      setTimeout(process, sleepTimeout);
    } else {
      completeCallback();
    }
  }

  return new Promise(function(resolve) {
    completeCallback = function() {
      resolve(items);
    };
    process();
  });
}

function task(task, data, context, imports) {
  return new Promise(function(resolve, reject) {
    var code = [];

    var baseUrl = window.location.href;
    code.push(
      'importScripts(' +
      _.chain(imports)
        .map(function(scriptUrl) {
          return JSON.stringify(url.resolve(baseUrl, scriptUrl));
        })
        .join(',')
        .value() +
      ');'
    );

    code.push(';(function() {');
    code.push('self.window = self;');

    _.each(context, function(value, key) {
      if (!_.isUndefined(value)) {
        if (_.isFunction(value)) {
          code.push('var ' + key + '=' + value.toString() + ';');
        } else {
          code.push('var ' + key + '=' + JSON.stringify(value) + ';');
        }
      }
    });

    code.push('(' + task.toString() + ')();');
    code.push('})();');

    var blob = new Blob([code.join('\n')], {type: 'text/javascript'});
    var workerUrl = window.URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    window.URL.revokeObjectURL(workerUrl);

    worker.onmessage = function(event) {
      resolve(event.data);
      worker.terminate();
    };
    worker.onerror = function(event) {
      console.log(event);
      reject(new Error(event.message));
      worker.terminate();
    };

    worker.postMessage(data);
  });
}

module.exports.each = each;
module.exports.task = task;
