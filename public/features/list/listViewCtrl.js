angular.module('locationTracker').controller('listViewCtrl', function ($rootScope, $scope, $stateParams, geolocation, userService, $state, socketService) {

    $scope.displayConnections = false;

    $scope.getListData = function () {
        userService.getConnectionLocations($rootScope.user).then(function (response) {
            // console.log(response.connections);
            $rootScope.listViewData = [];
            $rootScope.offlineData = [];
            for (var i = 0; i < response.connections.length; i++) {
                if (response.connections[i].status === 'active') {
                    $rootScope.listViewData.push(response.connections[i]);
                } else {
                    $rootScope.offlineData.push(response.connections[i]);
                }
            }
            // console.log('listview data ', $rootScope.listViewData);
            // console.log('offline ', $rootScope.offlineData);
            if ($rootScope.listViewData.length === 0) {
                $scope.noConnectionsOnline = true;
            }

            $scope.displayConnections = true;
        });
    };
    
    // SOCKET --> LISTENING FOR NOTICE OF A USER STATUS CHANGE //
    socketService.on('updateThisUser', function (userToUpdateId) {
        // console.log('user to update', userToUpdateId);
        // console.log('myConnections on listview, ', $rootScope.myConnections);
        // if ($rootScope.myConnections.length === 0) {
        // console.log('update made by someone you are NOT connected with');
        // return false;
        // }
        for (var i = 0; i < $rootScope.listViewData.length; i++) {
            // console.log('list view id in loop: ', $rootScope.listViewData[i]._id);
            if ($rootScope.listViewData[i]._id !== userToUpdateId.toString()) {
                // console.log('user to update not in listViewData array');
                $scope.connection = false;
            } else if ($rootScope.listViewData[i]._id === userToUpdateId) {
                // console.log('user to update IS IN the listViewData array');
                $scope.connection = true;
            }
        }

        if ($scope.connection !== true) {
            for (var i = 0; i < $rootScope.offlineData.length; i++) {
                // console.log('offline data id in loop: ', $rootScope.offlineData[i]._id);
                if ($rootScope.offlineData[i]._id !== userToUpdateId) {
                    // console.log('user to update not in offlineData array');
                    $scope.connection = false;
                } else if ($rootScope.offlineData[i]._id === userToUpdateId) {
                    // console.log('user to update IS IN the offlineData array');
                    $scope.connection = true;
                }
            }
        }

        console.log('$scope.connection: ', $scope.connection);
        if ($scope.connection !== true) {
            return false;
        }
        // --> Go get new data for the updated user //
        userService.getUpdatedUserInfo(userToUpdateId).then(function (updatedUser) {
            // console.log('updated user: ', updatedUser);

            for (var i = 0; i < $rootScope.listViewData.length; i++) {
                if ($rootScope.listViewData[i]._id === updatedUser._id) {
                    $rootScope.listViewData.splice(i, 1);
                    i--;
                }
            }

            for (var i = 0; i < $rootScope.offlineData.length; i++) {
                if ($rootScope.offlineData[i]._id === updatedUser._id) {
                    $rootScope.offlineData.splice(i, 1);
                    i--;
                }
            }

            if (updatedUser.status === 'active') {
                $rootScope.listViewData.push(updatedUser);
            } else {
                $rootScope.offlineData.push(updatedUser);
            }

            if ($rootScope.listViewData.length === 0) {
                $scope.noConnectionsOnline = true;
            } else {
                $scope.noConnectionsOnline = false;
            }

        });
    });


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

    $scope.$on('$destroy', function (event) {
        socketService.removeAllListeners();
        // console.log('$Destroy triggered!');
    });

});