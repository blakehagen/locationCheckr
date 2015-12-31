angular.module('locationTracker').controller('userCtrl', function ($scope, $stateParams, geolocation, userService) {
    
    // SET USER ID TO SCOPE//
    $scope.user = $stateParams.id;

    // GET USER DATA/LOCATION ON SIGN IN //
    $scope.getUserData = function () {
        $scope.loading = true;
        userService.getUser($scope.user).then(function (user) {
            console.log(user);
            $scope.myConnections = [];
            $scope.myConnections = user.connections;
            console.log('my connections initial load: 1', $scope.myConnections);

            $scope.getMyLocation();
        })
    };

    // RUN GET USER FUNCTION //
    $scope.getUserData();
   
    
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
            
            // TRY TO WRAP THIS IN A FUNCTION AND EXEC FUNC HERE //
            updateMapMarkerData(map);
            
            // // CONVERT CONNECTION **CURRENT** LOCATIONS TO GOOGLE MAPS FORMAT //
            // $scope.connectionsCurrentLocations = [];
            // for (var i = 0; i < $scope.myConnections.length; i++) {
            //     var connection = $scope.myConnections[i];

            //     var contentStringCurrent = "<p>" + connection.name + " has been here since " + connection.updated_at_readable + "</p>";

            //     $scope.connectionsCurrentLocations.push({
            //         latlon: new google.maps.LatLng(connection.currentLocation[1], connection.currentLocation[0]),
            //         name: connection.name,
            //         message: new google.maps.InfoWindow({
            //             content: contentStringCurrent,
            //             maxWidth: 320
            //         })
            //     })
            // }
            // // console.log($scope.connectionsCurrentLocations);

            // $scope.connectionsCurrentLocations.forEach(function (n, i) {
            //     var marker = new google.maps.Marker({
            //         position: n.latlon,
            //         map: map,
            //         title: n.name,
            //         icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            //     });

            //     google.maps.event.addListener(marker, 'click', function (e) {
            //         currentSelectedMarker = n;
            //         n.message.open(map, marker);
            //     });
            // });


            
            // // CONVERT CONNECTION **LAST KNOWN** LOCATIONS TO GOOGLE MAPS FORMAT //
            // $scope.connectionsPreviousLocation = [];
            // for (var i = 0; i < $scope.myConnections.length; i++) {

            //     var connection = $scope.myConnections[i];

            //     var contentStringPrevious = "<p>" + connection.name + " was last here " + connection.updated_at_readable + "</p>";

            //     $scope.connectionsPreviousLocation.push({
            //         latlon: new google.maps.LatLng(connection.lastKnownLocation[1], connection.lastKnownLocation[0]),
            //         name: connection.name,
            //         message: new google.maps.InfoWindow({
            //             content: contentStringPrevious,
            //             maxWidth: 320
            //         })
            //     })
            // }
            // // console.log($scope.connectionsCurrentLocations);

            // $scope.connectionsPreviousLocation.forEach(function (n, i) {
            //     var marker = new google.maps.Marker({
            //         position: n.latlon,
            //         map: map,
            //         title: n.name,
            //         icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            //     });

            //     google.maps.event.addListener(marker, 'click', function (e) {
            //         currentSelectedMarker = n;
            //         n.message.open(map, marker);
            //     });
            // });
            
            // infoWindow.setPosition(pos);
            // infoWindow.setContent('You are here!');
            
            // SET CURRENT LOCATION TO SEND TO DB // --> NOTICE FORMAT IS OPPOSITE OF GOOGLE MAPS FORMAT
            $scope.myCurrentLocation = {
                currentLocation: [data.coords.longitude, data.coords.latitude]
                // lastKnownLocation: [null, null]
            };
        })
    };
    
    
    // UPDATE MYCONNECTIONS DATA TO UPDATE MAP MARKERS //
    
    function updateMapMarkerData(map) {
        console.log('updating map marker Data');
        // CONVERT CONNECTION **CURRENT** LOCATIONS TO GOOGLE MAPS FORMAT //
        $scope.connectionData = [];
        for (var i = 0; i < $scope.myConnections.length; i++) {
            var connection = $scope.myConnections[i];

            var contentStringCurrent = "<p>" + connection.name + " has been here since " + connection.updated_at_readable + "</p>";

            $scope.connectionData.push({
                latlon: new google.maps.LatLng(connection.currentLocation[1], connection.currentLocation[0]),
                name: connection.name,
                message: new google.maps.InfoWindow({
                    content: contentStringCurrent,
                    maxWidth: 320
                })
            })
        }
        console.log($scope.connectionData);

        $scope.connectionData.forEach(function (n, i) {
            var marker = new google.maps.Marker({
                position: n.latlon,
                map: map,
                title: n.name,
                icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            });

            google.maps.event.addListener(marker, 'click', function (e) {
                currentSelectedMarker = n;
                n.message.open(map, marker);
            });
        });
    };
            
    
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
            currentLocation: [null, null],
            updated_at: new Date(),
            updated_at_readable: moment().format('ddd, MMM D YYYY, h:mma')
        };
        userService.stopLocation($scope.user, myLastKnownLocation).then(function (response) {
            console.log('stop broadcast ', response);
        })
    };
    
    
    // GET LOCATIONS FOR CONNECTIONS (AT SET INTERVAL) //
    $scope.pingConnectionLocations = function () {
        userService.getConnectionLocations($scope.user).then(function (response) {
            console.log(response);
            $scope.myConnections = [];
            $scope.myConnections = response.connections;
            console.log('my connections 2 ', $scope.myConnections);
            updateMapMarkerData($scope.map);
            console.log('PING');
        })
    };
    
    // setInterval($scope.pingConnectionLocations, 10000);

});