'use strict';

angular.module('app')
  .controller('RootController', ['$scope', '$modal', function ($scope, $modal) {
    
    $scope.$on('$routeChangeSuccess',function(e,current, previus){
      $scope.currentRoute = current;
    });
    
      $scope.showWorkoutHistory = function () {
          var dailog = $modal.open({
              templateUrl: 'partials/workout-history.html',
              controller: WorkoutHistoryController,
              size: 'lg'
          });
      };

      var WorkoutHistoryController = function ($scope, $modalInstance, workoutHistoryTracker) {
          $scope.search = {};
          $scope.search.completed = '';
          $scope.history = workoutHistoryTracker.getHistory();

          $scope.ok = function () {
              $modalInstance.close();
          };
      };
      WorkoutHistoryController['$inject'] = ['$scope', '$modalInstance', 'workoutHistoryTracker'];
  }]);
