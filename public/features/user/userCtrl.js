angular.module('locationTracker').controller('userCtrl', function ($scope, $stateParams, geolocation, userService) {
    
    // SET USER ID TO SCOPE//
    $scope.user = $stateParams.id;

    // GET USER DATA/LOCATION ON SIGN IN //
    $scope.getUserData = function () {
        $scope.loading = true;
        userService.getUser($scope.user).then(function (user) {
            console.log(user);
            $scope.myConnections = user.connections;
            // console.log('myConnections ', $scope.myConnections);

            $scope.getMyLocation();
        })
    };

    // RUN GET USER FUNCTION //
    $scope.getUserData();
    
    // setInterval($scope.getUserData, 5000);
    
    // GET USER'S LOCATION/MAP VIA GOOGLE MAPS //
    // THIS FUNCTION RUNS AS PART OF getUserData FUNCTION //
    $scope.getMyLocation = function () {
        $scope.coords = geolocation.getLocation().then(function (data) {
            $scope.loading = false;
            // console.log({ lat: data.coords.latitude, long: data.coords.longitude });

            var map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: data.coords.latitude, lng: data.coords.longitude },
                zoom: 14
            });
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
            
            // CONVERT CONNECTION **CURRENT** LOCATIONS TO GOOGLE MAPS FORMAT //
            $scope.connectionsCurrentLocations = [];
            for (var i = 0; i < $scope.myConnections.length; i++) {
                var connection = $scope.myConnections[i];

                $scope.connectionsCurrentLocations.push({
                    latlon: new google.maps.LatLng(connection.currentLocation[1], connection.currentLocation[0]),
                    name: connection.name,
                    message: new google.maps.InfoWindow({
                        content: 'hello world!',
                        maxWidth: 320
                    })
                })
            }
            // console.log($scope.connectionsCurrentLocations);

            $scope.connectionsCurrentLocations.forEach(function (n, i) {
                var marker = new google.maps.Marker({
                    position: n.latlon,
                    map: map,
                    title: n.name,
                    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                });
            });


            
            // CONVERT CONNECTION ** AST KNOWN** LOCATIONS TO GOOGLE MAPS FORMAT //
            $scope.connectionsPreviousLocation = [];
            for (var i = 0; i < $scope.myConnections.length; i++) {
                var connection = $scope.myConnections[i];
                $scope.connectionsPreviousLocation.push({
                    latlon: new google.maps.LatLng(connection.lastKnownLocation[1], connection.lastKnownLocation[0]),
                    name: connection.name
                })
            }
            // console.log($scope.connectionsCurrentLocations);

            $scope.connectionsPreviousLocation.forEach(function (n, i) {
                var marker = new google.maps.Marker({
                    position: n.latlon,
                    map: map,
                    title: n.name,
                    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                });
            });
            
            // infoWindow.setPosition(pos);
            // infoWindow.setContent('You are here!');
            
            // SET CURRENT LOCATION TO SEND TO DB // --> NOTICE FORMAT IS OPPOSITE OF GOOGLE MAPS FORMAT
            $scope.myCurrentLocation = {
                currentLocation: [data.coords.longitude, data.coords.latitude],
                lastKnownLocation: [null, null]
            };
        })
    };
    

    // SEND CURRENT LOCATION INFO TO DB //
    $scope.toggleSwitch = true;
    $scope.broadcastMyLocation = function () {
        $scope.toggleSwitch = !$scope.toggleSwitch;
        $scope.myCurrentLocation.updated_at = new Date();
        userService.updateMyLocation($scope.user, $scope.myCurrentLocation).then(function (response) {
            console.log('response after broadcasting btn clicked ', response);
        })
    };
    
    // STOP SENDING LOCATION AND REMOVE LOCATION FROM CURRENT LOCATION ARRAY //
    $scope.stop = function () {
        $scope.toggleSwitch = !$scope.toggleSwitch;
        var myLastKnownLocation = {
            lastKnownLocation: [$scope.myCurrentLocation.currentLocation[0], $scope.myCurrentLocation.currentLocation[1]],
            currentLocation: [null, null],
            updated_at: new Date()
        };
        userService.stopLocation($scope.user, myLastKnownLocation).then(function (response) {
            console.log('stop broadcast ', response);
        })
    };
    
    

    



    // FROM GOOGLE MAPS DOCS --> USED AS REFERENCE //

    // function initMap() {
    //     var map = new google.maps.Map(document.getElementById('map'), {
    //         center: { lat: -34.397, lng: 150.644 },
    //         zoom: 6
    //     });
    //     var infoWindow = new google.maps.InfoWindow({ map: map });

    //     // Try HTML5 geolocation.
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(function (position) {
    //             var pos = {
    //                 lat: position.coords.latitude,
    //                 lng: position.coords.longitude
    //             };

    //             infoWindow.setPosition(pos);
    //             infoWindow.setContent('Location found.');
    //             map.setCenter(pos);
    //         }, function () {
    //             handleLocationError(true, infoWindow, map.getCenter());
    //         });
    //     } else {
    //         // Browser doesn't support Geolocation
    //         handleLocationError(false, infoWindow, map.getCenter());
    //     }
    // }

    // function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    //     infoWindow.setPosition(pos);
    //     infoWindow.setContent(browserHasGeolocation ?
    //         'Error: The Geolocation service failed.' :
    //         'Error: Your browser doesn\'t support geolocation.');
    // }









});