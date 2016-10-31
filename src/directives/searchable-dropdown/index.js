'use strict';

var $ = require('jquery');
var app = require('../../module');

app.directive('searchableDropdown', [
  '$window', '$timeout',
  function($window, $timeout) {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: false,
      scope: {
        items: '=',
        selected: '='
      },
      link: function($scope, $element) {
        $scope.dropdownState = {};
        $scope.filter = {};

        $scope.changeSelected = function(item) {
          $scope.selected = item;
        };

        var block = $element.find('.pinned');
        var list = $element.find('ul');
        if (block.length > 0) {
          list.on('scroll', function() {
            var block = $element.find('.pinned');
            block.css('top', list.get(0).scrollTop + 'px');
          });
        }

        var closeDropdownHandler = function(event) {
          if ($element.has(event.target).length == 0) {
            $timeout(function() {
              $scope.dropdownState.isOpen = false;
            });
          }
        };

        $($window).on('click', closeDropdownHandler);
        $scope.$on('$destroy', function() {
          $($window).off('click', closeDropdownHandler);
        });
      }
    };
  }
]);
