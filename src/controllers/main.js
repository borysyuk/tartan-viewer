'use strict';

/* global Event */

var _ = require('lodash');
var $q = require('../services/ng-utils').$q;
var app = require('../module');
var application = require('../services/application');

app.controller('MainController', [
  '$scope',
  function($scope) {
    $scope.state = {
      search: {}
    };

    $scope.searchExamples = [
      'MacKenzie Clan',
      'MacLeod Tartan',
      'MacDonald\'s tartan'
    ];

    var searchIndex = null;

    function updateCurrentTartans() {
      if (searchIndex) {
        $scope.state.tartans = searchIndex($scope.state.search);
      } else {
        $scope.state.tartans = [];
      }
      $scope.state.tartan = _.first($scope.state.tartans);
    }

    $q(application.loadDatabase()).then(function(search) {
      searchIndex = search;
      updateCurrentTartans();
      $scope.isLoaded.application = true;
    });

    $scope.$watch('state.search', updateCurrentTartans, true);
  }
]);
