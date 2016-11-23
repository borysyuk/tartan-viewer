'use strict';

/* global Event */

var $q = require('../services/ng-utils').$q;
var ngModule = require('../module');
var application = require('../services/application');

ngModule.controller('MainController', [
  '$scope',
  function($scope) {
    $q(application.getDatasetDirectory()).then(function(datasets) {
      $scope.datasets = datasets;
      $scope.isLoaded.application = true;
    });

    $scope.dataset = null;

    $scope.openDataset = function(dataset) {
      $scope.dataset = dataset;
      $scope.isLoaded.dataset = false;
      $q(application.getDataset(dataset))
        .then(function(dataset) {
          if ($scope.dataset && ($scope.dataset.name == dataset.name)) {
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
