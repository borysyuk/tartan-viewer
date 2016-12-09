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
        '***  (' + fp.cl3.join(') (') + ')',
        '**   (' + fp.cl2.join(') (') + ')',
        '*    (' + fp.cl1.join(') (') + ')',
        'Wr:  (' + [fp.wr3, fp.wr2, fp.wr1, fp.wr0].join(' : ') + ')',
        '  gr: ' + fp.wrgr,
        'Wf:  (' + [fp.wf3, fp.wf2, fp.wf1, fp.wf0].join(' : ') + ')',
        '  gr: ' + fp.wfgr
      ].join('\n');
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

            if (score < 0.5) {
              return null;
            }

            item.score = score;
            return item;
          })
          .filter()
          .sortBy(function(item) {
            return item.score.color;
          })  // less score is better
          .value();
        console.timeEnd('search');
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
