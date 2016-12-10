'use strict';

function colorDistance(left, right) {
  var rmean = (left[0] + right[0]) / 2;
  var r = left[0] - right[0];
  var g = left[1] - right[1];
  var b = left[2] - right[2];
  return Math.sqrt((512 + rmean) * r * r / 256 + 4 * g * g +
    (767 - rmean) * b * b / 256) / 768;
}

function compareColorsHelper(left, right) {
  if ((left.length == 0) || (right.length == 0)) {
    return {sum: 0, restLeft: left, restRight: right};
  }
  right = right.slice(0, right.length);  // copy

  var sum = 0;
  var restLeft = [];
  left.forEach(function(cleft) {
    for (var i = 0; i < right.length; i++) {
      var cright = right[i];
      var dist = colorDistance(cleft, cright);
      if (dist <= 0.11) {
        var diff = cleft[3] - cright[3];
        sum += diff * diff;
        right.splice(i, 1);  // remove it
        return;
      }
    }
    restLeft.push(cleft);
  });
  return {
    sum: sum,
    restLeft: restLeft,
    restRight: right
  };
}

function compareColors(left, right) {
  // Map left colors to right
  var temp = compareColorsHelper(left.cl, right.cl);
  var sum = temp.sum;

  // Map unmatched right colors to unmatched left
  temp = compareColorsHelper(temp.restRight, temp.restLeft);
  sum += temp.sum;

  // Add the rest of unmatched with difference against 0,
  // but only if there ae more than one unmatched color and it is not
  // major
  var rest = 1;
  if (temp.restLeft.length + temp.restRight.length == 1) {
    if (temp.restLeft.length == 1) {
      rest = temp.restLeft[0][3];
    }
    if (temp.restRight.length == 1) {
      rest = temp.restRight[0][3];
    }
  }
  if (rest > 0.43) {
    temp.restLeft.forEach(function(value) {
      sum += value[3] * value[3];
    });
    temp.restRight.forEach(function(value) {
      sum += value[3] * value[3];
    });
  }

  // Respect smallest stripes
  var diff = left.clrs - right.clrs;
  sum += diff * diff;

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
    total: Math.sqrt(
      1.0 * color * color +
      0.8 * warp * warp +
      0.8 * weft * weft
    )
  };
}

module.exports = compare;
