'use strict';

var _ = require('lodash');
var $q = require('../services/ng-utils').$q;
var tartan = require('tartan');
var app = require('../module');
var database = require('../services/database');

app.controller('MainController', [
  '$scope', '$window', '$timeout',
  function($scope, $window, $timeout) {
    $scope.current = {
      weave: [2, 2]
    };

    function updateImage() {
      // Fix canvas size
      $timeout(function() {
        $window.dispatchEvent(new Event('resize'));
      }, 50);
    }
    $scope.updateImage = updateImage();

    $scope.getImageBounds = function() {
      var isInfinite = !!$scope.current.isInfiniteMode;
      var metrics = $scope.current.metrics;

      var width = 0;
      var height = 0;

      if (_.isObject(metrics)) {
        width = metrics.warp.length;
        height = metrics.weft.length;
      }

      return {
        'max-width': isInfinite ? 'none' : width + 'px',
        'max-height': isInfinite ? 'none' : height + 'px'
      };
    };

    $q(database.loadItems()).then(function(data) {
      $scope.tartans = data;
      $scope.current.tartan = _.first(data);
      $scope.isLoaded.application = true;

      updateImage();
    });

    $scope.$watch('current', function() {
      updateImage();
    }, true);
  }
]);
