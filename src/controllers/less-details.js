'use strict';

var _ = require('lodash');

function processItems(items) {
  var n = items.length;
  var i;
  var current;
  var left;
  var right;

  var result = [];
  for (i = 0; i < n; i++) {
    current = items[i];
    left = i > 0 ? items[i - 1] : items[n - 1];
    right = i < n - 1 ? items[i + 1] : items[0];

    if (left.name == right.name) {
      if (left.count + right.count >= current.count * 3) {
        current = _.clone(current);
        current.name = left.name;
      }
    }

    result.push(current);
  }

  return result;
}

function removeEmptyBlocks(block) {
  block = _.clone(block);
  block.items = processItems(block.items);
  return block;
}

function transform(sett) {
  var result = _.clone(sett);
  var warpIsSameAsWeft = sett.warp == sett.weft;

  if (_.isObject(sett.warp)) {
    result.warp = removeEmptyBlocks(sett.warp);
  }
  if (_.isObject(sett.weft)) {
    if (warpIsSameAsWeft) {
      result.weft = result.warp;
    } else {
      result.weft = removeEmptyBlocks(sett.weft);
    }
  }

  return result;
}

function factory() {
  return transform;
}

module.exports = factory;
