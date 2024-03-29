'use strict';

var _ = require('lodash');
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
        $scope.isSearchIndexReady = false;
        var searchIndex = _.constant([]);

        var state = $scope.state = {
          search: {
            query: '',
            categories: []
          },
          showPreview: false,
          items: [],
          current: null
        };

        $scope.searchExamples = [
          'MacKenzie Clan',
          'MacLeod Tartan',
          'MacDonald\'s tartan'
        ];

        $scope.availableCategories = [];
        $scope.selectedCategories = [];

        $scope.clearSelectedCategory = function(value) {
          var index = state.search.categories.indexOf(value);
          if (index >= 0) {
            state.search.categories.splice(index, 1);
          }
        };

        function performSearch() {
          state.items = searchIndex(state.search);
          state.current = _.first(state.items);

          var counts = {};
          _.each(state.items, function(item) {
            var categories = item.category;
            if (categories.length == 0) {
              categories = [''];
            }
            _.each(categories, function(category) {
              counts[category] = (counts[category] || 0) + 1;
            });
          });

          _.each($scope.availableCategories, function(category) {
            category.count = counts[category.value] || 0;
          });
        }

        $scope.$watch('state.search', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $scope.selectedCategories = _.filter($scope.availableCategories,
              function(category) {
                return state.search.categories.indexOf(category.value) >= 0;
              });
            performSearch();
          }
        }, true);

        function update() {
          searchIndex = _.constant([]);
          $scope.availableCategories = [];
          if (_.isObject($scope.item)) {
            searchIndex = _.constant(_.sortBy($scope.item.items, 'name'));
            if (_.isObject($scope.item.$searchIndex)) {
              $scope.item.$searchIndex.then(function(options) {
                if (_.isFunction(options.searchIndex)) {
                  searchIndex = options.searchIndex;
                }
                $scope.availableCategories = _.filter(
                  options.availableCategories, _.isObject);

                $scope.isSearchIndexReady = true;

                performSearch();

                return options;
              });
            }
          }

          state.search.categories = [];
          $scope.selectedCategories = [];

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
