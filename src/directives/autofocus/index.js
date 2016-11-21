'use strict';

var ngModule = require('../../module');

ngModule.directive('autofocus', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      link : function($scope, element) {
        $timeout(function() {
          element.focus();
        });
      }
    }
  }
]);