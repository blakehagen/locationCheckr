angular.module('locationTracker').controller('userCtrl', function ($scope, $stateParams, geolocation, userService) {

    // SET USER ID TO SCOPE//
    $scope.user = $stateParams.id;

    // GET USER DATA/LOCATION ON SIGN IN //
    $scope.getUserData = function () {
        $scope.loading = true;
        userService.getUser($scope.user).then(function (user) {
            console.log(user);
            $scope.myConnections = user.connections;
            console.log('my connections initial load:', $scope.myConnections);
            $scope.getMyLocation();
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
                zoom: 10
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
            
            // SET CURRENT LOCATION TO SEND TO DB // --> NOTICE FORMAT IS OPPOSITE OF GOOGLE MAPS FORMAT
            $scope.myCurrentLocation = {
                currentLocation: [data.coords.longitude, data.coords.latitude],
                status: 'active'
            };
        })
    };
    
    // MAP MY CONNECTIONS //
    var locations = [];
    var markers = [];
    $scope.mapConnections = function () {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        locations = [];
        markers = [];

        userService.getConnectionLocations($scope.user).then(function (response) {
            console.log('these are my connections', response.connections);

            for (var i = 0; i < response.connections.length; i++) {
                if (response.connections[i].status === 'stop') {
                    console.log('ding');
                    response.connections.splice(i, 1);
                }
            }
            for (var i = 0; i < response.connections.length; i++) {
                var connection = response.connections[i];
                locations.push({
                    latlon: new google.maps.LatLng(connection.currentLocation[1], connection.currentLocation[0]),
                    message: new google.maps.InfoWindow({
                        content: connection.name
                    }),
                    id: connection._id,
                    status: connection.status
                })
            };

            for (var i = 0; i < locations.length; i++) {
                var marker = new google.maps.Marker({
                    position: locations[i].latlon,
                    map: map,
                    title: locations[i].message.content,
                    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                    id: locations[i].id,
                    status: locations[i].status
                })
                markers.push(marker);
            }
            console.log(markers.length);
            console.log(markers);
        })
    };

    // UPDATE MYCONNECTIONS DATA TO UPDATE MAP MARKERS //
    
    // function updateMapMarkerData(map) {
    //     console.log('updating map marker Data');
    //     // CONVERT CONNECTION **CURRENT** LOCATIONS TO GOOGLE MAPS FORMAT //
    //     $scope.connectionData = [];
    //     for (var i = 0; i < $scope.myConnections.length; i++) {
    //         var connection = $scope.myConnections[i];

    //         var contentStringCurrent = "<p>" + connection.name + " has been here since " + connection.updated_at_readable + "</p>";

    //         $scope.connectionData.push({
    //             latlon: new google.maps.LatLng(connection.currentLocation[1], connection.currentLocation[0]),
    //             name: connection.name,
    //             message: new google.maps.InfoWindow({
    //                 content: contentStringCurrent,
    //                 maxWidth: 320
    //             })
    //         })
    //     }
    //     $scope.markers = [];
    //     $scope.connectionData.forEach(function (n, i) {
    //         var marker = new google.maps.Marker({
    //             position: n.latlon,
    //             // map: map,
    //             title: n.name,
    //             icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    //         });
    //         // marker.setMap(null);
    //         $scope.markers.length = 0;
    //         $scope.markers.push(marker);

    //         google.maps.event.addListener(marker, 'click', function (e) {
    //             currentSelectedMarker = n;
    //             n.message.open(map, marker);
    //         });
    //     });

    //     for (var i = 0; i < $scope.markers.length; i++) {
    //         $scope.markers[i].setMap(null);
    //         $scope.markers[i].setMap(map);
    //     }
    // };

    // SEND CURRENT LOCATION INFO TO DB //
    $scope.toggleSwitch = true;
    $scope.broadcastMyLocation = function () {
        $scope.toggleSwitch = !$scope.toggleSwitch;
        $scope.myCurrentLocation.updated_at = new Date();
        $scope.myCurrentLocation.updated_at_readable = moment().format('ddd, MMM D YYYY, h:mma');
        userService.updateMyLocation($scope.user, $scope.myCurrentLocation).then(function (response) {
            console.log('response after broadcasting btn clicked ', response);
        })
    };
    
    // STOP SENDING LOCATION AND REMOVE LOCATION FROM CURRENT LOCATION ARRAY //
    $scope.stop = function () {
        $scope.toggleSwitch = !$scope.toggleSwitch;
        var myLastKnownLocation = {
            // lastKnownLocation: [$scope.myCurrentLocation.currentLocation[0], $scope.myCurrentLocation.currentLocation[1]],
            currentLocation: [undefined, undefined],
            updated_at: new Date(),
            updated_at_readable: moment().format('ddd, MMM D YYYY, h:mma'),
            status: 'stop'
        };
        userService.stopLocation($scope.user, myLastKnownLocation).then(function (response) {
            console.log('stop broadcast ', response);
        })
    };

    $scope.go = function () {
        setInterval($scope.mapConnections, 30000);
    };

});