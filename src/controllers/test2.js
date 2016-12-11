'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var $q = require('../services/ng-utils').$q;
var ngModule = require('../module');
var log = require('../services/utils/log');
var application = require('../services/application');
var lessDetails = require('./less-details');

ngModule.controller('Test2Controller', [
  '$scope',
  function($scope) {
    var state = $scope.state = {
      item: null
    };

    $scope.resetOffsets = function() {
      state.offsetOriginal = {x: 0, y: 0};
      state.offsetCompare = {x: 0, y: 0};
    };

    $scope.modifySett = function(sett) {
      var schema = tartan.schema.classic;
      var parse = schema.parse({
        transformSyntaxTree: tartan.transform([
          tartan.transform.flatten(),
          lessDetails(),
          tartan.transform.mergeStripes()
        ])
      });
      var format = schema.format();
      sett = parse(sett);
      return format(sett);
    };


    $q(application.getDatasetDirectory())
      .then(function(datasets) {
        return $q(application.getDataset(_.first(datasets), ['name', 'sett']));
      })
      .then(function(dataset) {
        $scope.items = dataset.items;
        $scope.isLoaded.application = true;
      });
  }
]);
