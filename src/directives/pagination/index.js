'use strict';

var ngModule = require('../../module');

function validateCount(value) {
  value = parseFloat(value) || 0;
  return value >= 1 ? value : 1;
}

function validateCurrent(value, count) {
  value = parseFloat(value) || 0;
  value = value < 1 ? 1 : value;
  return value > count ? count : value;
}

ngModule.directive('pagination', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        count: '=',
        current: '='
      },
      link: function($scope) {
        var state = $scope.state = {
          count: 1,
          current: 1,
          savedCurrent: null,
          editing: false
        };

        state.count = validateCount($scope.count);
        state.current = validateCurrent($scope.current, state.count);
        $scope.current = state.current;

        $scope.$watch('count', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            state.count = validateCount($scope.count);
            if (!state.editing) {
              state.current = validateCurrent(state.current, state.count);
            }
          }
        });

        $scope.$watch('current', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            if (!state.editing) {
              state.current = validateCurrent($scope.current, state.count);
            }
          }
        });

        $scope.$watch('state', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            if (!state.editing) {
              state.current = validateCurrent(state.current, state.count);
              $scope.current = state.current;
            }
          }
        }, true);

        $scope.handleKeyPress = function($event) {
          var modifiers = $event.altKey || $event.shiftKey ||
            $event.ctrlKey || $event.metaKey;
          if (!modifiers) {
            switch ($event.keyCode) {
              case 13:
                state.editing = false;
                $event.preventDefault();
                break;
              case 27:
                state.editing = false;
                state.current = $scope.current;
                $event.preventDefault();
                break;
              default:
                break;
            }
          }
        };
      }
    };
  }
]);
