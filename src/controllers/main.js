'use strict';

var $q = require('../services/ng-utils').$q;
var ngModule = require('../module');
var log = require('../services/utils/log');
var application = require('../services/application');

ngModule.controller('MainController', [
  '$scope',
  function($scope) {
    var state = $scope.state = {
      datasets: [],
      dataset: null,
      datasetForDownload: null
    };

    log.info('Loading datasets...');
    $q(application.getDatasetDirectory()).then(function(datasets) {
      log.info('Loaded datasets.');
      state.datasets = datasets;
      $scope.isLoaded.application = true;
    });

    $scope.dataset = null;

    $scope.openDataset = function(dataset) {
      state.dataset = dataset;
      $scope.isLoaded.dataset = false;
      log.info('Loading dataset: ' + dataset.name + '...');
      $q(application.getDataset(dataset))
        .then(function(dataset) {
          log.info('Building search index for: ' + dataset.name + '...');
          dataset.$searchIndex = $q(application.buildSearchIndex(
            dataset.items));
          return dataset;
        })
        .then(function(dataset) {
          if (state.dataset && (state.dataset.name == dataset.name)) {
            log.info('Loaded: ' + dataset.name + '.');
            state.dataset = dataset;
          }
        })
        .finally(function() {
          if (state.dataset && (state.dataset.name == dataset.name)) {
            $scope.isLoaded.dataset = true;
          }
        });
    };

    $scope.downloadDataset = function(dataset) {
      state.datasetForDownload = dataset;
    };

    $scope.closeDataset = function() {
      state.dataset = null;
    };
  }
]);
