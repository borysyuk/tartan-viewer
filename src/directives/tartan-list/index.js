'use strict';

var _ = require('lodash');
var ngModule = require('../../module');

ngModule.directive('tartanList', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        items: '=',
        item: '=?',
        itemsPerPage: '=?',
        onpreview: '&?',
        showLegend: '=?'
      },
      link: function($scope) {
        var pagination = $scope.pagination = {
          itemsPerPage: 20,
          all: [],
          items: [],
          count: 1,
          current: 1
        };

        function updateItemsPerPage(value) {
          value = parseInt(value) || 20;
          if (value < 2) {
            value = 2;
          }
          pagination.itemsPerPage = value;
          pagination.count = Math.ceil(
            pagination.all.length / pagination.itemsPerPage
          );
          pagination.current = 1;
        }

        function updateItems() {
          var ipp = pagination.itemsPerPage;
          var from = (pagination.current - 1) * ipp;
          var to = from + ipp;
          pagination.items = pagination.all.slice(from, to);
        }

        updateItemsPerPage($scope.itemsPerPage);
        updateItems();

        $scope.$watch('itemsPerPage', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            updateItemsPerPage($scope.itemsPerPage);
          }
        });

        $scope.$watch('pagination.current', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            updateItems();
          }
        });

        $scope.$watchCollection('items', function() {
          pagination.all = _.isArray($scope.items) ? $scope.items : [];
          pagination.count = Math.ceil(
            pagination.all.length / pagination.itemsPerPage
          );
          pagination.current = 1;
          updateItems();
        });

        $scope.setCurrent = function(item) {
          $scope.item = item;
          $timeout($scope.onpreview);
        };
      }
    };
  }
]);
