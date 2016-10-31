'use strict';

var angular = require('angular');
require('angular-tartan');

var app = angular.module('Application', [
  'angular-tartan',
  'hc.marked'
]);

app.config([
  'markedProvider',
  function (markedProvider) {
    markedProvider.setOptions({
      gfm: true
    });
  }
]);

app.run([
  '$rootScope',
  function($rootScope) {
    $rootScope.isLoaded = {};
  }
]);

module.exports = app;
