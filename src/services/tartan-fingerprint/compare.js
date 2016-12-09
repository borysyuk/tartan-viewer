'use strict';

var normalizeGrayscaleFactor = Math.sqrt(3 * 255 * 255);

function grayscaleFactor(color) {
  var min = Math.min(color[0], color[1], color[2]);
  var max = Math.max(color[0], color[1], color[2]);
  var gray = (min + max) / 2;
  return 1 - Math.sqrt(
    (color[0] - gray) * (color[0] - gray) +
    (color[1] - gray) * (color[1] - gray) +
    (color[2] - gray) * (color[2] - gray)
  ) / normalizeGrayscaleFactor;
}

function colorDistance(left, right) {
  var rmean = (left[0] + right[0]) / 2;
  var r = left[0] - right[0];
  var g = left[1] - right[1];
  var b = left[2] - right[2];
  return Math.sqrt((512 + rmean) * r * r / 256 + 4 * g * g +
    (767 - rmean) * b * b / 256) / 768;
}

function compareColorsHelper(left, right, grayscaleMultiplier) {
  if ((left.length == 0) || (right.length == 0)) {
    if ((left.length == 0) && (right.length == 0)) {
      return 0;  // complete match
    } else {
      return 1;  // none matched
    }
  }

  var threshold = 0.17;
  var count = 0;
  var sum = 0;
  for (var i = 0; i < left.length; i++) {
    for (var j = 0; j < right.length; j++) {
      var diff = colorDistance(left[i], right[j]);
      if (grayscaleMultiplier > 0) {
        diff *= grayscaleFactor(left[i]) * grayscaleMultiplier;
        diff *= grayscaleFactor(right[j]) * grayscaleMultiplier;
      }
      if (diff <= threshold) {
        sum += diff / threshold;
        count += 1;
      }
    }
  }

  var rest = (left.length * right.length) / 2 - count;
  if (rest < 0) {
    rest = 0;
  }

  return (sum + rest) / count;
}

function compareColors(left, right) {
  var diff = [
    0.99 * compareColorsHelper(left.cl3, right.cl3, 0.03),
    0.79 * compareColorsHelper(left.cl2, right.cl2, 0.43),
    0.17 * compareColorsHelper(left.cl1, right.cl1, 0.79),

    0.11 * compareColorsHelper(left.cl3, right.cl2),
    0.11 * compareColorsHelper(left.cl2, right.cl3),

    0.03 * compareColorsHelper(left.cl2, right.cl1),
    0.03 * compareColorsHelper(left.cl1, right.cl2)
  ];

  diff = diff.map(function(value) {
    return value * value;
  });

  var sum = 0;
  for (var i = 0; i < diff.length; i++) {
    sum += diff[i];
  }

  return Math.sqrt(sum);
}

function compareSequence(left, right, prefix, count) {
  var key;
  var diff;

  var sum = 0;
  for (var i = 0; i < count; i++) {
    key = '' + prefix + i;
    diff = (right[key] || 0) - (left[key] || 0);
    sum += diff * diff;
  }

  key = '' + prefix + 'gr';
  diff = (right[key] || 0) - (left[key] || 0);
  sum += diff * diff;

  return Math.sqrt(sum);
}

function compare(left, right) {
  var color = compareColors(left, right);
  var warp = compareSequence(left, right, 'wr', 4);
  var weft = compareSequence(left, right, 'wf', 4);

  return {
    color: color,
    warp: warp,
    weft: weft,
    sett: Math.sqrt(warp * warp + weft * weft),
    score: Math.sqrt(color * color + warp * warp + weft * weft)
  };
}

module.exports = compare;
