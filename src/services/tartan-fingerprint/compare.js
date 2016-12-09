'use strict';

function distance(left, right) {
  var sum = 0;
  var n = Math.max(left.length, right.length);
  for (var i = 0; i < n; i++) {
    var v = (left[i] || 0) - (right[i] || 0);
    sum += v * v;
  }
  return Math.sqrt(sum);
}

function compare(left, right) {
  var warp = distance(left.warp, right.warp);
  var weft = distance(left.weft, right.weft);
  return {
    warp: warp,
    weft: weft,
    score: Math.sqrt(warp * warp + weft * weft)
  };
}

module.exports = compare;
