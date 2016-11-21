'use strict';

var _ = require('lodash');
var ngModule = require('../../module');

ngModule.directive('tartanListItem', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        item: '=',
        onchange: '&?'
      },
      link: function($scope) {
      }
    };
  }
]);
