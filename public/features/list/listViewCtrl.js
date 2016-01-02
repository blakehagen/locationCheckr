angular.module('locationTracker').controller('listViewCtrl', function ($rootScope, $scope, $stateParams, geolocation, userService, $state) {

    $scope.getListData = function () {
        userService.getConnectionLocations($rootScope.user).then(function (response) {
            $scope.listViewData = response.connections;
            console.log($scope.listViewData);
        });
    };

    $scope.getListData();


    $scope.mapView = function () {
        $state.go('user', { id: $rootScope.user });
    }



});