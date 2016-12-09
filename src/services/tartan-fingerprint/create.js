'use strict';

var _ = require('lodash');
var tartan = require('tartan');

/*
cl3 - most used colors
cl2 - something between
cl1 - rarely used colors

wr* - warp, wf* - weft

wr0..wr3 - count of stripes, from thin to wide
wrgr/wfgr - granularity

*/

function scale(value, min, max, inverse) {
  value = inverse ? 1 - Math.sqrt(value) : Math.sqrt(value);
  value = Math.round(value * (max - min)) + min;
  return value <= max ? value : max;
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
    cl1: [],
    cl2: [],
    cl3: []
  };

  var normalize = _.max(_.values(result));
  _.each(result, function(score, color) {
    score = score / normalize;
    if (score >= 0.1) {
      mapped['cl' + scale(score, 1, 3)].push([
        parseInt(color[1] + color[2], 16),
        parseInt(color[3] + color[4], 16),
        parseInt(color[5] + color[6], 16)
      ]);
    }
  });

  return mapped;
}

function createSequenceFingerprint(items, prefix) {
  var normalize = _.max(_.map(items, function(item) {
    return item[1];
  }));

  var mapped = {};
  mapped[prefix + '0'] = 0;
  mapped[prefix + '1'] = 0;
  mapped[prefix + '2'] = 0;
  mapped[prefix + '3'] = 0;

  mapped[prefix + 'gr'] = 0;

  var granularity = 0;
  var prevValue = null;
  _.each(items, function(item) {
    var value = item[1] / normalize;
    var score = scale(value, 0, 3);
    mapped[prefix + score] += 1;

    var isThin = value <= 0.3;
    if ((prevValue !== null) && (isThin !== prevValue)) {
      granularity += 1;
    }
    prevValue = isThin;
  });

  if (items.length > 0) {
    mapped[prefix + 'gr'] = granularity / items.length;
  }

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
    weftFingerprint = {
      wf0: warpFingerprint.wr0,
      wf1: warpFingerprint.wr1,
      wf2: warpFingerprint.wr2,
      wf3: warpFingerprint.wr3,
      wfgr: warpFingerprint.wrgr
    };
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
