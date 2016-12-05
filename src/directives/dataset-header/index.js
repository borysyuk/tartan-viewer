'use strict';

var ngModule = require('../../module');

ngModule.directive('datasetHeader', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        item: '=',
        loaded: '=?',
        onclose: '&?',
        ondownload: '&?'
      },
      link: function() {
      }
    };
  }
]);
