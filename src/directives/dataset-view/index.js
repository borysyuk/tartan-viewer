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
        var searchIndex = null;

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
          if (searchIndex) {
            state.items = searchIndex(state.search);
          } else
          if (_.isObject($scope.item) && _.isArray($scope.item.items)) {
            state.items = $scope.item.items;
          } else {
            state.items = [];
          }
          state.current = _.first(state.items);
        }

        $scope.$watch('state.search', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            performSearch();
          }
        }, true);

        function update() {
          searchIndex = null;
          if (_.isObject($scope.item) && _.isArray($scope.item.items)) {
            searchIndex = application.buildSearchIndex($scope.item.items);
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
