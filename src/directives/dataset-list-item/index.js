'use strict';

var ngModule = require('../../module');

ngModule.directive('datasetListItem', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        item: '=',
        onselect: '&?'
      },
      link: function() {
      }
    };
  }
]);
