'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var $q = require('../services/ng-utils').$q;
var ngModule = require('../module');
var log = require('../services/utils/log');
var application = require('../services/application');
var fingerprint = require('../services/tartan-fingerprint');

ngModule.controller('TestController', [
  '$scope',
  function($scope) {
    var state = $scope.state = {
      originalItem: null,
      compareItem: null
    };

    $scope.formatFingerprint = function(fp) {
      if (!_.isObject(fp)) {
        return '';
      }
      return [].concat(
        [
          'Cl:  (' + fp.cl.join(') (') + ')',
          'Cl-r: ' + fp.clrs,
          'wrsq:  (' + fp.wrsq.join(' ') + ')',
          'wfsq:  (' + fp.wfsq.join(' ') + ')'
        ],
        ['wrsc:'],
        _.map(fp.wrsc, function(value, key) {
          return '  ' + key + ': ' + value.join(' ');
        }),
        ['wfsc:'],
        _.map(fp.wfsc, function(value, key) {
          return '  ' + key + ': ' + value.join(' ');
        })
      ).join('\n');
    };

    $scope.selectItem = function() {
      $scope.similarItems = [];
      state.compareItem = null;
      if (state.originalItem) {
        console.time('search');
        $scope.similarItems = _.chain($scope.items)
          .map(function(item) {
            var score = fingerprint.compare(state.originalItem.fingerprint,
              item.fingerprint);
            item.score = score.sett;
            return item;
          })
          .filter()
          .sortBy('score')  // less score is better
          .value();

        // $scope.similarItems = _.filter($scope.similarItems, function(item) {
        //   return item.score <= 2.121;
        // });
        console.timeEnd('search');
      }
    };

    $scope.compareItems = function(left, right) {
      if (left && right) {
        fingerprint.compare(left.fingerprint, right.fingerprint);
      }
    };

    $q(application.getDatasetDirectory())
      .then(function(datasets) {
        return $q(application.getDataset(_.first(datasets), ['name', 'sett']));
      })
      .then(function(dataset) {
        var schema = tartan.schema.classic;
        var parse = schema.parse({
          transformSyntaxTree: tartan.transform.flatten()
        });
        console.time('fingerprint');
        $scope.items = _.map(dataset.items, function(item) {
          item.fingerprint = fingerprint.create(parse(item.sett),
            schema.colors);
          return item;
        });
        console.timeEnd('fingerprint');
        $scope.isLoaded.application = true;
      });
  }
]);
