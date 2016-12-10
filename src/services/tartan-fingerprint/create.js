'use strict';

var _ = require('lodash');
var tartan = require('tartan');

/*
cl - colors (from most-used to less used), cut by threashold
clrs - count of rest colors

wr* - warp, wf* - weft

wrsq/wfsq - normalized stripes, ordered from wide to thin
wrsc/wfsc - normalized stripes, ordered from wide to thin and groupped by color

*/

function grayscaleFactor(color) {
  // Calculate S from HLS
  var r = color[0];
  var g = color[1];
  var b = color[2];

  var st = 0;
  if (r + g + b != 0) {
    var min = Math.min(r, g, b) / 255;
    var max = Math.max(r, g, b) / 255;
    if (min + max < 1) {
      st = (max - min) / (max + min);
    } else {
      st = (max - min) / (2.0 - max - min);
    }
  }

  // scale and offset - we don't need zero values
  return st * 0.5 + 0.5;
}

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

  var mapped = {
    cl: [],
    clrs: 0
  };

  var normalize = _.max(_.values(result));
  _.each(result, function(score, color) {
    score = Math.sqrt(score / normalize);
    if (score >= 0.17) {
      var value = [
        parseInt(color[1] + color[2], 16),
        parseInt(color[3] + color[4], 16),
        parseInt(color[5] + color[6], 16)
      ];
      value.push(score / normalize * grayscaleFactor(value));
      mapped['cl'].push(value);
    } else {
      mapped.clrs += 1;
    }
  });

  mapped.cl = _.orderBy(mapped.cl, _.identity, 'desc');

  return mapped;
}

function createSequenceFingerprint(items, prefix) {
  var normalize = _.chain(items)
    .map(function(item) {
      return item[1];
    })
    .max()
    .value();

  var mapped = {};
  mapped[prefix + 'sq'] = [];

  var itemsByColors = {};

  _.each(items, function(item) {
    var value = item[1] / normalize;
    mapped[prefix + 'sq'].push(value);

    itemsByColors[item[0]] = itemsByColors[item[0]] || [];
    itemsByColors[item[0]].push(value);
  });

  mapped[prefix + 'sq'] = _.orderBy(mapped[prefix + 'sq'], _.identity, 'desc');

  mapped[prefix + 'sc'] = _.chain(itemsByColors)
    .values()
    .map(function(items) {
      return _.orderBy(items, _.identity, 'desc');
    })
    .orderBy('length', 'desc')
    .value();

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

  var warpFingerprint = createSequenceFingerprint(warp, 'wr');
  var weftFingerprint;
  if (weft === warp) {
    weftFingerprint = _.chain(warpFingerprint)
      .toPairs()
      .map(function(pair) {
        if (pair[0].substr(0, 2) == 'wr') {
          return [
            'wf' + pair[0].substr(2, pair[0].length),
            pair[1]
          ];
        } else {
          return pair;
        }
      })
      .fromPairs()
      .value();
  } else {
    weftFingerprint = createSequenceFingerprint(weft, 'wf');
  }

  return _.extend({},
    createColorFingerprint(warp, weft),
    warpFingerprint,
    weftFingerprint
  );
}

module.exports = create;
