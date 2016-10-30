'use strict';

var angular = require('angular');
require('angular-tartan');

var app = angular.module('Application', [
  'angular-tartan'
]);

app.run([
  '$rootScope',
  function($rootScope) {
    $rootScope.isLoaded = {};
  }
]);

module.exports = app;
