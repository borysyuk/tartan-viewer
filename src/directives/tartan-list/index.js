'use strict';

var _ = require('lodash');
var app = require('../../module');

app.directive('tartanList', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: false,
      scope: {
        items: '=',
        itemsPerPage: '@?',
        current: '=?'
      },
      link: function($scope) {
        $scope.setCurrent = function(item) {
          $scope.current = item;
        };
      }
    };
  }
]);
