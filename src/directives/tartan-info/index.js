'use strict';

var app = require('../../module');

app.directive('tartanInfo', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: false,
      scope: {
        tartan: '='
      },
      link: function($scope) {
      }
    };
  }
]);
