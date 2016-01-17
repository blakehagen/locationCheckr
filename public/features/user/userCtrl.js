angular.module('locationTracker').controller('userCtrl', function ($rootScope, $scope, $stateParams, geolocation, userService, mapService, $state, $interval, $timeout, socketService) {

    // SET USER ID TO SCOPE/ ROOTSCOPE //
    $rootScope.user = $stateParams.id;
    $scope.user = $stateParams.id;

    // GET USER DATA/LOCATION ON SIGN IN //
    $scope.getUserData = function () {
        $scope.loading = true;
        $scope.switchShow = false;
        userService.getUser($scope.user).then(function (user) {
            $scope.userData = user;
            // console.log('user data: ', $scope.userData);
            if (user.status === 'active') {
                $scope.toggleSwitch = false;
            } else {
                $scope.toggleSwitch = true;
            }

            $rootScope.myConnections = user.connections;
            $rootScope.myInvitations = user.invitations;

            if ($state.current.name === 'user') {
                $scope.getMyLocation();
            }
        })
    };

    // RUN GET USER FUNCTION //
    $scope.getUserData();
    var map;
    
    // GET AUTH USER'S LOCATION/MAP VIA GOOGLE MAPS //
    $scope.getMyLocation = function () {
        $scope.coords = geolocation.getLocation().then(function (data) {
            $scope.loading = false;
            $scope.switchShow = true;

            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: data.coords.latitude, lng: data.coords.longitude },
                zoom: 14
            });
            $scope.map = map;
            // var infoWindow = new google.maps.InfoWindow({ map: map });
            $scope.pos = {
                lat: data.coords.latitude,
                lng: data.coords.longitude
            };

            $scope.latLng = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);

            var myLocation = new google.maps.Marker({
                position: $scope.pos,
                map: map,
                title: "My Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            });

            myLocation.setPosition($scope.pos);

            var infoWindow = new google.maps.InfoWindow({
                content: '<div class="info-window-popup"><div class="info-window-popup-row"><h5>' + $scope.userData.name + '</h5></div><div class="info-window-popup-row"><h6>You are here!</h6></div>'
            });

            google.maps.event.addListener(myLocation, 'click', function () {
                infoWindow.open(map, myLocation);
            });
           
            // GET ADDRESS VIA REVERSE GEOLOCATION TO SHOW IN LIST VIEW //
            mapService.reverseGeolocate($scope.pos).then(function (address) {
                // SET CURRENT LOCATION TO SEND TO DB WHEN LOCATION IS BROADCAST //
                // console.log(address);
                $scope.myCurrentLocation = {
                    currentLocation: [data.coords.longitude, data.coords.latitude],
                    status: 'active',
                    address: address
                };
            })
            $scope.mapMyConnectionsOnLoad();
        })
    };
    
    // MAP MY CONNECTIONS ON LOAD //
    $scope.mapMyConnectionsOnLoad = function () {
        // console.log('PING');

        $scope.locations = [];
        $scope.markers = [];

        userService.getConnectionLocations($scope.user).then(function (response) {
            // console.log('these are my connections', response.connections);

            for (var i = 0; i < response.connections.length; i++) {
                if (response.connections[i].status !== 'active') {
                    response.connections.splice(i, 1);
                    i--;
                }
            }

            for (var i = 0; i < response.connections.length; i++) {
                var connection = response.connections[i];
                $scope.locations.push({
                    latlon: new google.maps.LatLng(connection.currentLocation[1], connection.currentLocation[0]),
                    name: connection.name,
                    id: connection._id,
                    updated: connection.updated_at_readable,
                    status: connection.status
                })
            };

            for (var i = 0; i < $scope.locations.length; i++) {
                $scope.locations[i].distanceFromCurrentUser = (google.maps.geometry.spherical.computeDistanceBetween($scope.latLng, $scope.locations[i].latlon) * .000621371).toFixed(2);
            }

            // console.log($scope.locations);

            for (var i = 0; i < $scope.locations.length; i++) {
                var marker = new google.maps.Marker({
                    position: $scope.locations[i].latlon,
                    map: map,
                    title: $scope.locations[i].name,
                    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                    id: $scope.locations[i].id,
                    status: $scope.locations[i].status,
                    info: '<div class="info-window-popup"><div class="info-window-popup-row"><h5>' + $scope.locations[i].name + '</h5></div><div class="info-window-popup-row"><h6>' + $scope.locations[i].distanceFromCurrentUser + ' miles away</h6></div><div class="info-window-popup-row"><h6>' + $scope.locations[i].updated + '</h6></div></div>'
                });

                $scope.markers.push(marker);
            }
            var infowindow = new google.maps.InfoWindow;

            for (var i = 0; i < $scope.markers.length; i++) {
                var marker = $scope.markers[i];

                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(this.info);
                    infowindow.open(map, this);
                })
            }
        })
    };

    // SHARE MY LOCATION --> SEND MY CURRENT LOCATION INFO TO DB //
    $scope.broadcastMyLocation = function () {
        $scope.toggleSwitch = !$scope.toggleSwitch;
        $scope.myCurrentLocation.updated_at = moment();
        $scope.myCurrentLocation.updated_at_readable = moment().format('LT - l');
        userService.updateMyLocation($scope.user, $scope.myCurrentLocation).then(function (response) {
            // console.log('response after broadcasting btn clicked ', response);
            
            // SOCKET --> NEED TO SEND NOTICE THAT I UPDATED (SHARING MY LOCATION)
            socketService.emit('userUpdated', $scope.user);
            // console.log('My location sent to db and socket.io message sent');
        })
    };
    
    // STOP SHARING MY LOCATION --> SENDING NULL AND REMOVE LOCATION FROM DB //
    $scope.stop = function () {
        $scope.toggleSwitch = !$scope.toggleSwitch;
        var stopData = {
            currentLocation: [undefined, undefined],
            updated_at: moment(),
            updated_at_readable: moment().format('LT - l'),
            status: 'stop',
            address: null
        };
        userService.stopLocation($scope.user, stopData).then(function (response) {
            // console.log('stop broadcast ', response);
            
            // SOCKET --> NEED TO SEND NOTICE THAT I UPDATED (STOPPED SHARING LOCATION)
            socketService.emit('userUpdated', $scope.user);
            // console.log('My location sent to db and socket.io message sent');
        })
    };
    
    // SOCKET --> LISTENING FOR NOTICE OF A USER STATUS CHANGE //
    socketService.on('updateThisUser', function (userToUpdateId) {
        if ($rootScope.myConnections.length === 0) {
            // console.log('update made by someone you are NOT connected with');
            return false;
        }

        for (var i = 0; i < $rootScope.myConnections.length; i++) {
            if ($rootScope.myConnections[i]._id !== userToUpdateId) {
                // console.log('update made by someone you are NOT connected with');
                return false;
            }
        }
        // --> Go get new data for the updated user //
        userService.getUpdatedUserInfo(userToUpdateId).then(function (updatedUser) {

            for (var i = 0; i < $scope.locations.length; i++) {
                if ($scope.locations[i].id === updatedUser._id) {
                    if (updatedUser.status === 'stop') {
                        $scope.locations.splice(i, 1);
                        i--;
                    }
                    for (var j = 0; j < $scope.markers.length; j++) {
                        if ($scope.markers[j].id === updatedUser._id) {
                            $scope.markers[j].setMap(null);
                            $scope.markers = [];
                        }
                    }
                    return false;

                } else {
                    // console.log('The new user is not in the locations array. I will create a new location object and push it in...');
                }
            }
            var updatedLocation = {
                status: updatedUser.status,
                latlon: new google.maps.LatLng(updatedUser.currentLocation[1], updatedUser.currentLocation[0]),
                name: updatedUser.name,
                id: updatedUser._id,
                updated: updatedUser.updated_at_readable
            };
            // Adding in the 'distanceFromCurrentUser' property //
            updatedLocation.distanceFromCurrentUser = (google.maps.geometry.spherical.computeDistanceBetween($scope.latLng, updatedLocation.latlon) * .000621371).toFixed(2);

            $scope.locations.push(updatedLocation);

            for (var i = 0; i < $scope.markers.length; i++) {
                $scope.markers[i].setMap(null);
            }
            $scope.markers = [];

            for (var i = 0; i < $scope.locations.length; i++) {
                var newMarker = new google.maps.Marker({
                    position: $scope.locations[i].latlon,
                    map: $scope.map,
                    title: $scope.locations[i].name,
                    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                    id: $scope.locations[i].id,
                    distanceFromUser: $scope.locations[i].distanceFromCurrentUser,
                    info: '<div class="info-window-popup"><div class="info-window-popup-row"><h5>' + $scope.locations[i].name + '</h5></div><div class="info-window-popup-row"><h6>' + $scope.locations[i].distanceFromCurrentUser + ' miles away</h6></div><div class="info-window-popup-row"><h6>' + $scope.locations[i].updated + '</h6></div></div>'
                })
                $scope.markers.push(newMarker);
            }
            
            // Create info windows for each marker // 
            var infowindow = new google.maps.InfoWindow;

            for (var i = 0; i < $scope.markers.length; i++) {

                google.maps.event.addListener($scope.markers[i], 'click', function () {
                    infowindow.setContent(this.info);
                    infowindow.open($scope.map, this);
                })
            }
        })
    });
    
    // MAKE CONNECTIONS //
    
    // GET ALL USERS IN DB TO SEARCH //
    $rootScope.getAllUsersinDb = function () {
        userService.getAllUsers().then(function (response) {
            $rootScope.usersInDb = response;
            // console.log('gettng users in db');
        })
    };
    
    // SELECT SOMEONE TO CONNECT WITH //
    $scope.userToConnect = function (selected) {
        if (selected) {
            console.log(selected);
            $scope.userToConnectId = selected.description.id;
        }
    };

    $scope.invitationStatus = true;
    
    // SEND SELECTED USER INVITE TO CONNECT //
    $scope.connect = function () {
        if ($scope.userToConnectId) {
            if ($scope.userToConnectId === $scope.user) {
                return false;
            }
            for (var i = 0; i < $rootScope.myConnections.length; i++) {
                if ($scope.userToConnectId === $rootScope.myConnections[i]._id) {
                    return false;
                }
            }
            userService.clearInputForInvite();
            $scope.invitationStatus = false;
            var connectWithMe = {
                id: $scope.user
            };
            userService.inviteUserToConnect($scope.userToConnectId, connectWithMe).then(function (response) {
                console.log(response);

                $scope.inviteData = {
                    _id: $scope.user,
                    name: $scope.userData.name,
                    // _id: $scope.userToConnectId
                };

                // console.log('inviteData ', $scope.inviteData);

                socketService.emit('invitationToConnect', $scope.inviteData);
                // console.log('sent invite to socket.io');

                $timeout(function () {
                    $scope.invitationStatus = true;
                }, 1000);
            })
        }
    };
    
    // LISTENING FOR NEW INVITATIONS //
    socketService.on('newInvitation', function (data) {
        // console.log('invitation socket invite from server: ', data);
        if (data.personToInviteId === $scope.user) {
            // console.log('you\'ve got a new invitation!');
        }
        $rootScope.myInvitations.unshift(data);

    });
    
    // ACCEPT INVITE TO CONNECT //
    $scope.acceptConnection = function (userToConnectId) {
        for (var i = 0; i < $scope.myInvitations.length; i++) {
            if (userToConnectId === $scope.myInvitations[i]._id) {
                $scope.myInvitations.splice(i, 1);
            }
        }
        var newConnection = {
            id: userToConnectId
        };
        userService.acceptInviteToConnect($scope.user, newConnection).then(function (response) {
            // console.log(response);
            socketService.emit('userUpdated', $scope.user);
        })
    };
    
    
    
    // ROUTES //
    $scope.listView = function () {
        $state.go('list', { id: $scope.user });
    }

    $scope.mapView = function () {
        $state.go('user', { id: $scope.user });
    }

    $scope.connectView = function () {
        $state.go('connect', { id: $scope.user });
    }

    $scope.infoView = function () {
        $state.go('info', { id: $scope.user });
    }

    $scope.$on('$destroy', function (event) {
        socketService.removeAllListeners();
        // console.log('$Destroy triggered!');
    });


});