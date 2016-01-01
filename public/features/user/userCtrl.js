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
            $scope.mapConnections();
            $scope.go();
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
            // console.log('these are my connections', response.connections);

            for (var i = 0; i < response.connections.length; i++) {
                if (response.connections[i].status === 'stop') {
                    // console.log('ding');
                    response.connections.splice(i, 1);
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
            console.log(locations);

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
        var stopData = {
            currentLocation: [undefined, undefined],
            updated_at: new Date(),
            updated_at_readable: moment().format('ddd, MMM D YYYY, h:mma'),
            status: 'stop'
        };
        userService.stopLocation($scope.user, stopData).then(function (response) {
            console.log('stop broadcast ', response);
        })
    };

    $scope.go = function () {
        setInterval($scope.mapConnections, 30000);
    };

});