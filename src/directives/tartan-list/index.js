'use strict';

var $ = require('jquery');
var app = require('../../module');

app.directive('tartanList', [
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
          if (!$(event.target).parents($element.get(0)).length) {
            $timeout(function() {
              $scope.dropdownState.isOpen = false;
            });
          }
        };

        $window.addEventListener('click', closeDropdownHandler);

        $scope.$on('$destroy', function() {
          $window.removeEventListener('click', closeDropdownHandler);
        });
      }
    };
  }
]);
