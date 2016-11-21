'use strict';

var _ = require('lodash');
var ngModule = require('../../module');

ngModule.directive('tartanPreview', [
  '$window', '$timeout', 'tartan',
  function($window, $timeout, tartan) {
    return {
      restrict: 'E',
      template: require('./template.html'),
      replace: true,
      scope: {
        item: '=',
        active: '='
      },
      link: function($scope, element) {
        var state = $scope.state = {
          weave: tartan.defaults.weave.serge,
          showPreview: false
        };

        element.modal({
          backdrop: true,
          keyboard: true,
          show: !!$scope.active
        });

        element.on('show.bs.modal', function() {
          state.isInfiniteMode = true;
          state.isInteractiveMode = true;
          $scope.$applyAsync();
          updateImage();
        });
        element.on('shown.bs.modal', function() {
          $scope.active = true;
          $scope.$applyAsync();
          updateImage();
        });
        element.on('hidden.bs.modal', function() {
          $scope.active = false;
          $scope.$applyAsync();
        });

        $scope.$watch('active', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            element.modal($scope.active ? 'show' : 'hide');
          }
        });

        function updateImage() {
          // Fix canvas size
          $timeout(function() {
            $window.dispatchEvent(new Event('resize'));
          });
        }
        $scope.updateImage = updateImage();

        $scope.getImageBounds = function() {
          var isInfinite = !!state.isInfiniteMode;
          var metrics = state.metrics;

          var width = 0;
          var height = 0;

          if (_.isObject(metrics)) {
            width = metrics.warp.length;
            height = metrics.weft.length;
          }

          return {
            'padding-top': isInfinite ? '60%' : height + 'px',
            'max-width': isInfinite ? 'none' : width + 'px',
            'max-height': isInfinite ? 'none' : height + 'px'
          };
        };

        $scope.$watch('state.isInfiniteMode', updateImage);

        $scope.$watch('item', function() {
          state.renderingOffset = {x: 0, y: 0};
          updateImage();
        });
      }
    };
  }
]);
