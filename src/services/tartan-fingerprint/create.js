'use strict';

var _ = require('lodash');
var tartan = require('tartan');

function createColorFingerprint(warp, weft) {
  warp = _.reduce(warp, function(accumulator, value) {
    accumulator[value[0]] = accumulator[value[0]] || 0;
    accumulator[value[0]] += value[1];
    return accumulator;
  }, {});

  weft = _.reduce(weft, function(accumulator, value) {
    accumulator[value[0]] = accumulator[value[0]] || 0;
    accumulator[value[0]] += value[1];
    return accumulator;
  }, {});

  var normalizationSquare = _.sum(_.values(warp)) * _.sum(_.values(weft));

  var result = {};
  _.each(warp, function(widthA, colorA) {
    _.each(weft, function(widthB, colorB) {
      var square = widthA * widthB / normalizationSquare;

      result[colorA] = result[colorA] || 0;
      result[colorA] += square / 2;

      result[colorB] = result[colorB] || 0;
      result[colorB] += square / 2;
    });
  });

  var mapped = [[], [], []];

  var normalize = _.max(_.values(result));
  var remap = [0, 1, 1, 2, 2, 2, 2];
  _.each(result, function(score, color) {
    score = score / normalize;
    if (score >= 0.1) {
      score = remap[Math.round(score * 6)];
      mapped[score].push(color);
    }
  });

  return mapped;
}

function createSequenceFingerprint(items) {
  var normalize = _.max(_.map(items, function(item) {
    return item[1];
  }));

  var mapped = [0, 0, 0, 0];
  var remap = [0, 1, 1, 2, 2, 3, 3, 3, 3];
  _.each(items, function(item) {
    var score = remap[Math.round(item[1] / normalize * 8)];
    mapped[score] += 1;
  });

  return mapped;
}

function create(sett, defaultColors) {
  var warp = [];
  var weft = [];
  if (_.isObject(sett)) {
    var warpIsSameAsWeft = sett.warp === sett.weft;
    if (_.isObject(sett.warp) && _.isArray(sett.warp.items)) {
      warp = tartan.utils.sett.compile(sett.warp.items,
        sett.colors, defaultColors);
    }
    if (warpIsSameAsWeft) {
      weft = warp;
    } else {
      if (_.isObject(sett.weft) && _.isArray(sett.weft.items)) {
        weft = tartan.utils.sett.compile(sett.weft.items,
          sett.colors, defaultColors);
      }
    }
  }

  var warpFingerprint = createSequenceFingerprint(warp);
  var weftFingerprint = warpFingerprint;
  if (weft !== warp) {
    weftFingerprint = createSequenceFingerprint(weft);
  }

  return {
    colors: createColorFingerprint(warp, weft),
    warp: warpFingerprint,
    weft: weftFingerprint,
  };
}

module.exports = create;
