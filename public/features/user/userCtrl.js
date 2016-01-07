angular.module('locationTracker').controller('userCtrl', function ($rootScope, $scope, $stateParams, geolocation, userService, mapService, $state, $interval, $timeout) {

    // SET USER ID TO SCOPE/ ROOTSCOPE //
    $rootScope.user = $stateParams.id;
    $scope.user = $stateParams.id;

    // GET USER DATA/LOCATION ON SIGN IN //
    $scope.getUserData = function () {
        $scope.loading = true;
        userService.getUser($scope.user).then(function (user) {
            console.log(user);
            if (user.status === 'active') {
                $scope.toggleSwitch = false;
            } else {
                $scope.toggleSwitch = true;
            }

            $rootScope.myConnections = user.connections;
            $rootScope.myInvitations = user.invitations;
            // console.log('myInvitations', $scope.myInvitations);
            console.log('my connections initial load:', $rootScope.myConnections);
            if ($state.current.name === 'user') {
                $scope.getMyLocation();
                // console.log('map me');
            }
        })
    };

    // RUN GET USER FUNCTION //
    $scope.getUserData();
    var map;
    
    // GET USER'S LOCATION/MAP VIA GOOGLE MAPS //
    // THIS FUNCTION RUNS AS PART OF getUserData FUNCTION //
    $scope.getMyLocation = function () {
        $scope.coords = geolocation.getLocation().then(function (data) {
            $scope.loading = false;

            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: data.coords.latitude, lng: data.coords.longitude },
                zoom: 14
            });
            $scope.map = map;
            // var infoWindow = new google.maps.InfoWindow({ map: map });
            var pos = {
                lat: data.coords.latitude,
                lng: data.coords.longitude
            };

            var myLocation = new google.maps.Marker({
                position: pos,
                map: map,
                title: "My Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            });

            myLocation.setPosition(pos);
           
            // GET ADDRESS VIA REVERSE GEOLOCATION TO SHOW IN LIST VIEW //
            mapService.reverseGeolocate(pos).then(function (address) {
                // SET CURRENT LOCATION TO SEND TO DB WHEN LOCATION IS BROADCAST //
                // console.log(address);
                $scope.myCurrentLocation = {
                    currentLocation: [data.coords.longitude, data.coords.latitude],
                    status: 'active',
                    address: address
                };
            })
            $scope.mapConnections();
            $scope.go();
        })
    };
    
    // MAP MY CONNECTIONS //
    var locations = [];
    var markers = [];
    $scope.mapConnections = function () {
        console.log('PING');
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        locations = [];
        markers = [];

        userService.getConnectionLocations($scope.user).then(function (response) {
            // console.log('these are my connections', response.connections);

            for (var i = 0; i < response.connections.length; i++) {
                if (response.connections[i].status === 'stop') {
                    // console.log('ding');
                    response.connections.splice(i, 1);
                    i--;
                }
            }

            for (var i = 0; i < response.connections.length; i++) {
                var connection = response.connections[i];
                locations.push({
                    latlon: new google.maps.LatLng(connection.currentLocation[1], connection.currentLocation[0]),
                    name: connection.name,
                    id: connection._id,
                    updated: connection.updated_at_readable,
                    status: connection.status
                })
            };
            // console.log(locations);

            for (var i = 0; i < locations.length; i++) {
                var marker = new google.maps.Marker({
                    position: locations[i].latlon,
                    map: map,
                    title: locations[i].name,
                    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                    id: locations[i].id,
                    status: locations[i].status,
                    info: "<p>" + locations[i].name + " has been here since " + locations[i].updated + "</p>"
                });

                markers.push(marker);
            }
            var infowindow = new google.maps.InfoWindow({
                // test: 'test123'
            });

            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];

                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(this.info);
                    infowindow.open(map, this);
                })
            }
            // console.log(markers.length);
            // console.log(markers);
        })
    };

    // SEND MY CURRENT LOCATION INFO TO DB //
    $scope.toggleSwitch = true;
    $scope.broadcastMyLocation = function () {
        $scope.toggleSwitch = !$scope.toggleSwitch;
        $scope.myCurrentLocation.updated_at = new Date();
        $scope.myCurrentLocation.updated_at_readable = moment().format('ddd, MMM D YYYY, h:mma');
        userService.updateMyLocation($scope.user, $scope.myCurrentLocation).then(function (response) {
            // console.log('response after broadcasting btn clicked ', response);
        })
    };
    
    // STOP SENDING LOCATION AND REMOVE LOCATION FROM CURRENT LOCATION ARRAY //
    $scope.stop = function () {
        $scope.toggleSwitch = !$scope.toggleSwitch;
        var stopData = {
            currentLocation: [undefined, undefined],
            updated_at: new Date(),
            updated_at_readable: moment().format('ddd, MMM D YYYY, h:mma'),
            status: 'stop',
            address: undefined
        };
        userService.stopLocation($scope.user, stopData).then(function (response) {
            // console.log('stop broadcast ', response);
        })
    };
    
    
    ///////////////////////////////////////
    // PING DB FOR NEW DATA EVERY 20 SEC //
    //////////////////////////////////////
    $scope.go = function () {
        $interval($scope.mapConnections, 20000);
    };
    //////////////////////////////////////
    //////////////////////////////////////
    
    
    // MAKE CONNECTIONS //
    
    // GET ALL USERS IN DB TO SEARCH //
    $rootScope.getAllUsersinDb = function () {
        userService.getAllUsers().then(function (response) {
            $rootScope.usersInDb = response;
            console.log('gettng users in db');
            // console.log('users in DB', $scope.usersInDb);
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
                // console.log(response);
                $timeout(function () {
                    $scope.invitationStatus = true;
                }, 1000);
            })
        }
    };
    
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

});