'use strict';

var _ = require('lodash');
var ngModule = require('../../module');

ngModule.directive('dropdown', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        items: '=',
        selected: '=?',
        title: '@?',
        type: '@?', // 'addon'
        align: '@?' // 'right'
      },
      link: function($scope, element) {
        element.find('.dropdown-toggle').dropdown();

        $scope.toggleSelected = function(value) {
          if (!_.isArray($scope.selected)) {
            $scope.selected = [];
          }
          var index = $scope.selected.indexOf(value);
          if (index >= 0) {
            $scope.selected.splice(index, 1);
          } else {
            $scope.selected.push(value);
          }
        };

        $scope.clearSelected = function() {
          $scope.selected = [];
        };
      }
    };
  }
]);
