'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var module = require('../module');

module.controller('MainController', [
  '$scope',
  function($scope) {
    $scope.source = 'K#101010 BLACK; B#2c2c80 BLUE; G#006818 GREEN;\n' +
      'B/24 K4 B4 K4 B4 K20 G24 K6 G24 K20 B22 K4 B/4';
    $scope.inifinteImage = true;

    $scope.availableSchemas = _.map(tartan.schema,
      function(value, key) {
        return {
          name: value.name,
          value: key
        };
      });
    $scope.schema = 'classic';
    $scope.metrics = null;

    $scope.$watch('metrics', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        console.log($scope.metrics);
      }
    });

    $scope.availableWeaves = _.map(tartan.defaults.weave,
      function(value, key) {
        return {
          name: _.startCase(key) + ' (' + value.join(' x ') + ')',
          value: value
        };
      });
    $scope.weave = tartan.defaults.weave.serge;
  }
]);
