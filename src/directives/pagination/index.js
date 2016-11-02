'use strict';

var _ = require('lodash');
var app = require('../../module');

function createPagination(items, ipp) {
  items = _.isArray(items) ? items : [];

  ipp = parseInt(ipp, 10) || 0;
  ipp = ipp <= 10 ? 10 : ipp;

  var count = Math.ceil(items.length / ipp);

  var window = 4;

  var self = {
    count: count,

    set: function(page) {
      if (page < 1) {
        page = 1;
      }
      if (page > count) {
        page = count;
      }
      self.current = page;
      self.items = items.slice((page - 1) * ipp, page * ipp);

      var range = self.range = [];

      var from = 1;
      var to = count;
      if (count >= window * 2 + 1) {
        from = page - window;
        to = page + window;

        if (from < 1) {
          to += (1 - from);
          from = 1;
        }
        if (to > count) {
          from += (count - to);
          to = count;
        }
      }

      for (var i = from; i <= to; i++) {
        range.push(i);
      }

      if (range.length > 2) {
        if (from > 1) {
          range[0] = 1;
          range[1] = '...';
        }
        var n = range.length - 1;
        if (to < count) {
          range[n - 1] = '...';
          range[n] = count;
        }
      }
    }
  };
  self.set(1);

  return self;
}

app.directive('pagination', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: false,
      scope: {
        items: '=',
        itemsPerPage: '@?',
        pagination: '=?'
      },
      link: function($scope) {
        $scope.pagination = createPagination($scope.items,
          $scope.itemsPerPage);

        $scope.showPrevNext = true;

        $scope.$watch('itemsPerPage', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $scope.pagination = createPagination($scope.items,
              $scope.itemsPerPage);
          }
        });

        $scope.$watchCollection('items', function() {
          $scope.pagination = createPagination($scope.items,
            $scope.itemsPerPage);
        });
      }
    };
  }
]);
