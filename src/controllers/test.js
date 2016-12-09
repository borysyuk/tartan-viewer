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
      return [
        '*** ' + fp.colors[2].join(' ') + ';',
        '**  ' + fp.colors[1].join(' ') + ';',
        '*   ' + fp.colors[0].join(' ') + ';',
        'Wr: ' + _.reverse(_.clone(fp.warp)).join(' - ') + ';',
        'Wf: ' + _.reverse(_.clone(fp.weft)).join(' - ') + ';'
      ].join('\n');
    };

    $scope.selectItem = function() {
      $scope.similarItems = [];
      if (state.originalItem) {
        $scope.similarItems = _.chain($scope.items)
          .map(function(item) {
            var score = fingerprint.compare(state.originalItem.fingerprint,
              item.fingerprint);

            if (score < 0.5) {
              return null;
            }

            item.score = score;
            return item;
          })
          .filter()
          .sortBy(function(item) {
            return item.score.score;
          })  // less score is better
          .value();
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
        $scope.items = _.map(dataset.items, function(item) {
          item.fingerprint = fingerprint.create(parse(item.sett),
            schema.colors);
          return item;
        });
        $scope.isLoaded.application = true;
      });
  }
]);
