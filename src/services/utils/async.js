'use strict';

var _ = require('lodash');
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

module.exports.each = each;
