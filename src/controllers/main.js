'use strict';

var $q = require('../services/ng-utils').$q;
var ngModule = require('../module');
var log = require('../services/utils/log');
var application = require('../services/application');

ngModule.controller('MainController', [
  '$scope',
  function($scope) {
    log.info('Loading datasets...');
    $q(application.getDatasetDirectory()).then(function(datasets) {
      log.info('Loaded datasets.');
      $scope.datasets = datasets;
      $scope.isLoaded.application = true;
    });

    $scope.dataset = null;

    $scope.openDataset = function(dataset) {
      $scope.dataset = dataset;
      $scope.isLoaded.dataset = false;
      log.info('Loading dataset: ' + dataset.name + '...');
      $q(application.getDataset(dataset))
        .then(function(dataset) {
          log.info('Building search index for: ' + dataset.name + '...');
          return application.buildSearchIndex(dataset.items)
            .then(function(options) {
              dataset.searchIndex = options.searchIndex;
              dataset.availableCategories = options.availableCategories;
              return dataset;
            });
        })
        .then(function(dataset) {
          if ($scope.dataset && ($scope.dataset.name == dataset.name)) {
            log.info('Loaded: ' + dataset.name + '.');
            $scope.dataset = dataset;
          }
        })
        .finally(function() {
          if ($scope.dataset && ($scope.dataset.name == dataset.name)) {
            $scope.isLoaded.dataset = true;
          }
        });
    };

    $scope.closeDataset = function() {
      $scope.dataset = null;
    };
  }
]);
