'use strict';

var _ = require('lodash');
var application = require('../../services/application');
var ngModule = require('../../module');

ngModule.directive('datasetView', [
  function() {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        item: '='
      },
      link: function($scope) {
        var searchIndex = _.constant([]);

        var state = $scope.state = {
          search: {},
          showPreview: false,
          items: [],
          current: null
        };

        $scope.searchExamples = [
          'MacKenzie Clan',
          'MacLeod Tartan',
          'MacDonald\'s tartan'
        ];

        function performSearch() {
          state.items = searchIndex(state.search);
          state.current = _.first(state.items);
        }

        $scope.$watch('state.search', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            performSearch();
          }
        }, true);

        function update() {
          searchIndex = _.constant([]);
          if (_.isObject($scope.item)) {
            if (_.isFunction($scope.item.searchIndex)) {
              searchIndex = $scope.item.searchIndex;
            } else {
              searchIndex = _.constant($scope.item.items);
            }
          }
          performSearch();
        }

        $scope.$watch('item', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            update();
          }
        });

        update();
      }
    };
  }
]);
