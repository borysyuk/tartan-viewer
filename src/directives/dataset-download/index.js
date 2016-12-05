'use strict';

/* global Blob */

var _ = require('lodash');
var $q = require('../../services/ng-utils').$q;
var application = require('../../services/application');
var utils = require('../../services/utils');
var ngModule = require('../../module');

ngModule.directive('datasetDownload', [
  '$window',
  function($window) {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        item: '='
      },
      link: function($scope, element) {
        element.modal({
          backdrop: true,
          keyboard: true,
          show: !!$scope.item
        });

        function getFiles(dataset) {
          $scope.files = [];
          if (!dataset) {
            return;
          }
          $scope.isLoaded = false;
          $q(application.getDatasetFiles(dataset))
            .then(function(files) {
              if ($scope.item && ($scope.item.name == dataset.name)) {
                $scope.files = _.map(files, function(file) {
                  return _.extend({}, file, {
                    formattedSize: utils.formatDataSize(file.data.length, true)
                  });
                });
              }
            })
            .finally(function() {
              if ($scope.item && ($scope.item.name == dataset.name)) {
                $scope.isLoaded = true;
              }
            });
        }

        getFiles($scope.item);

        $scope.downloadFile = function(file) {
          $window.saveAs(new Blob([file.data], {
            type: 'application/octet-stream'
          }), file.name, true);
        };

        $scope.downloadAll = function(files) {
          if ($scope.item) {
            $window.saveAs(application.createArchive(files),
              $scope.item.name + '.tar.gz', true);
            element.modal('hide');  // close modal
          }
        };

        element.on('hidden.bs.modal', function() {
          $scope.item = null;
          $scope.$applyAsync();
        });

        $scope.$watch('item', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            element.modal($scope.item ? 'show' : 'hide');
            getFiles($scope.item);
          }
        }, true);
      }
    };
  }
]);
