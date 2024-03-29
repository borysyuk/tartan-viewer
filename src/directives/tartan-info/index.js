'use strict';

var ngModule = require('../../module');

ngModule.directive('tartanInfo', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        item: '=',
        showTitle: '=?'
      },
      link: function($scope) {
      }
    };
  }
]);
