'use strict';

var _ = require('lodash');
var $q = require('../services/ng-utils').$q;
var tartan = require('tartan');
var app = require('../module');
var application = require('../services/application');

app.controller('MainController', [
  '$scope', '$window', '$timeout',
  function($scope, $window, $timeout) {
    $scope.current = {
      weave: [2, 2]
    };

    $scope.searchExamples = [
      'MacKenzie Clan',
      'MacLeod Tartan',
      'MacDonald\'s tartan'
    ];

    var searchIndex = null;

    function updateImage() {
      // Fix canvas size
      $timeout(function() {
        $window.dispatchEvent(new Event('resize'));
      }, 50);
    }
    $scope.updateImage = updateImage();

    function updateCurrentTartans() {
      if (searchIndex) {
        $scope.current.tartans = searchIndex($scope.current.search);
      } else {
        $scope.current.tartans = [];
      }
      $scope.current.tartan = _.first($scope.current.tartans);
    }

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
        'padding-top': isInfinite ? '60%' : '100%',
        'max-width': isInfinite ? 'none' : width + 'px',
        'max-height': isInfinite ? 'none' : height + 'px'
      };
    };

    $q(application.loadDatabase()).then(function(search) {
      searchIndex = search;
      updateCurrentTartans();
      $scope.isLoaded.application = true;
      updateImage();
    });

    $scope.$watch('current.search', updateCurrentTartans);
    $scope.$watch('current.tartan', function() {
      $scope.current.renderingOffset = {x: 0, y: 0};
      updateImage();
    });
    $scope.$watch('current.isInfiniteMode', updateImage);
  }
]);
