angular.module('locationTracker').controller('listViewCtrl', function ($rootScope, $scope, $stateParams, geolocation, userService, $state) {

    $scope.displayConnections = false;

    $scope.getListData = function () {
        userService.getConnectionLocations($rootScope.user).then(function (response) {
            console.log(response.connections);
            $scope.listViewData = [];
            $scope.offlineData = [];
            for (var i = 0; i < response.connections.length; i++) {
                if (response.connections[i].status === 'active') {
                    $scope.listViewData.push(response.connections[i]);
                } else {
                    $scope.offlineData.push(response.connections[i]);
                }
            }
            // console.log($scope.listViewData);
            if ($scope.listViewData.length === 0) {
                $scope.noConnectionsOnline = true;
            }

            $scope.displayConnections = true;
        });
    };

    $scope.getListData();

    $scope.mapView = function () {
        $state.go('user', { id: $rootScope.user });
    }

    $scope.connectView = function () {
        
        $state.go('connect', { id: $rootScope.user });
    }

    $scope.infoView = function () {
        $state.go('info', { id: $rootScope.user });
    }



});