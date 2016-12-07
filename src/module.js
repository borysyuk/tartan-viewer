'use strict';

var angular = require('angular');
require('angular-tartan');
var packageInfo = require('./@package');

var app = angular.module('Application', [
  'angular-tartan',
  'hc.marked'
]);

app.constant('ApplicationVersion', packageInfo.version);

app.config([
  'markedProvider',
  function(markedProvider) {
    markedProvider.setOptions({
      gfm: true
    });
  }
]);

app.run([
  '$rootScope', 'ApplicationVersion',
  function($rootScope, ApplicationVersion) {
    $rootScope.version = ApplicationVersion;
    $rootScope.isLoaded = {};
  }
]);

module.exports = app;
