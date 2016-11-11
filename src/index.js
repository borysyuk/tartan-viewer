'use strict';

/* global window */

var _ = require('lodash');

// Init some global variables - needed for proper work of angular and
// some other 3rd-party libraries
(function(globals) {
  globals._ = _;

  require('js-polyfills/xhr');

  var jquery = require('jquery');
  globals.jQuery = globals.$ = jquery;

  require('bootstrap');

  // fetch() polyfill
  require('isomorphic-fetch/fetch-npm-browserify');
  // saveAs() polyfill
  globals.saveAs = require('file-saver/FileSaver.js').saveAs;

  globals.tartan = require('tartan');

  var angular = require('angular');
  globals.angular = angular;
  if (typeof globals.Promise != 'function') {
    globals.Promise = require('bluebird');
  }

  require('angular-marked');

  globals.addEventListener('load', function() {
    require('./application');
    angular.bootstrap(globals.document, ['Application']);
  });
})(window);
