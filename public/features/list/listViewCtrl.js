angular.module('locationTracker').controller('listViewCtrl', function ($rootScope, $scope, $stateParams, geolocation, userService, $state) {

    $scope.getListData = function () {
        userService.getConnectionLocations($rootScope.user).then(function (response) {
            console.log(response.connections);
            $scope.listViewData = [];
            for (var i = 0; i < response.connections.length; i++) {
                if (response.connections[i].status === 'active') {
                    $scope.listViewData.push(response.connections[i]);
                }
            }
            // console.log($scope.listViewData);
        });
    };

    $scope.getListData();

    $scope.mapView = function () {
        $state.go('user', { id: $rootScope.user });
    }



});