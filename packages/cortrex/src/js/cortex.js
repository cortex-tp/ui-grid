(function () {
  'use strict';
  /**
   *  @ngdoc overview
   *  @name ui.grid.cortex
   *
   *  @description
   *
   *  #ui.grid.cortex
   *
   *  <div class="alert alert-warning" role="alert"><strong>Beta</strong> This feature is ready for testing, but it either hasn't seen a lot of use or has some known bugs.</div>
   *
   *  This module provides cortex-resizing functionality to UI-Grid.
   */
  var module = angular.module('ui.grid.cortex', ['ui.grid']);

  /**
   *  @ngdoc directive
   *  @name ui.grid.cortex.directive:uiGridCortex
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of the ui-grid directive and
   *  adds the a watch to the grid's height and width which refreshes
   *  the grid content whenever its dimensions change.
   *
   */
  module.directive('uiGridCortex', ['gridUtil', function (gridUtil) {
    return {
      require: 'uiGrid',
      scope: false,
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        var prevGridWidth, prevGridHeight;

        function getDimensions() {
          prevGridHeight = gridUtil.elementHeight($elm);
          prevGridWidth = gridUtil.elementWidth($elm);
        }

        // Initialize the dimensions
        getDimensions();

        var resizeTimeoutId;
        function startTimeout() {
          clearTimeout(resizeTimeoutId);

          resizeTimeoutId = setTimeout(function () {
            var newGridHeight = gridUtil.elementHeight($elm);
            var newGridWidth = gridUtil.elementWidth($elm);

            if (newGridHeight !== prevGridHeight || newGridWidth !== prevGridWidth) {
              uiGridCtrl.grid.gridHeight = newGridHeight;
              uiGridCtrl.grid.gridWidth = newGridWidth;

              $scope.$apply(function () {
                uiGridCtrl.grid.refresh()
                  .then(function () {
                    getDimensions();

                    startTimeout();
                  });
              });
            }
            else {
              startTimeout();
            }
          }, 250);
        }

        startTimeout();

        $scope.$on('$destroy', function () {
          clearTimeout(resizeTimeoutId);
        });
      }
    };
  }]);

  module.directive('uiGridCell',
    ['uiGridConstants', 'uiGridSelectionService',
      function (uiGridConstants, uiGridSelectionService) {
        return {
          priority: -200, // run after default uiGridCell directive
          restrict: 'A',
          require: '?^uiGrid',
          scope: false,
          link: function ($scope, $elm, $attrs, uiGridCtrl) {
            // Cortex: add double click event
            var doubleClick = function (evt) {
              if ($scope.grid.options.doubleClickRow) {
                $scope.grid.options.doubleClickRow($scope.row.entity);
              }
            }

            function registerRowSelectionEvents() {
              if ($scope.grid.options.enableRowSelection && $scope.grid.options.enableFullRowSelection && $scope.col.colDef.name !== 'selectionRowHeaderCol') {
                // Cortex : Add double click event
                $elm.on('dblclick', doubleClick);
                $scope.doubleClickRegistered = true;
              }
            }

            function unregisterRowSelectionEvents() {
              if ($scope.doubleClickRegistered) {
                // Cortex: Add double click event
                $elm.off('dblclick', doubleClick);
                $scope.doubleClickRegistered = false;
              }
            }

            registerRowSelectionEvents();

            // register a dataChange callback so that we can change the selection configuration dynamically
            // if the user changes the options
            var dataChangeUnreg = $scope.grid.registerDataChangeCallback(function () {
              if ($scope.grid.options.enableRowSelection && $scope.grid.options.enableFullRowSelection &&
                !$scope.doubleClickRegistered) {
                registerRowSelectionEvents();
              }
              else if ((!$scope.grid.options.enableRowSelection || !$scope.grid.options.enableFullRowSelection) &&
                $scope.doubleClickRegistered) {
                unregisterRowSelectionEvents();
              }
            }, [uiGridConstants.dataChange.OPTIONS]);

            $elm.on('$destroy', dataChangeUnreg);
          }
        };
      }]);

})();
