angular.module('locationTracker').controller('userCtrl', function ($scope, $stateParams, geolocation, userService, mapService) {

    $scope.user = $stateParams.id;

    $scope.getUserData = function () {
        userService.getUser($scope.user).then(function (user) {
            console.log(user);
        })
    };
    // GET USER DATA ON LOGIN //
    $scope.getUserData();
    
    // GET USER'S LOCATION //
    $scope.getMyLocation = function () {
        $scope.coords = geolocation.getLocation().then(function (data) {
            // console.log({ lat: data.coords.latitude, long: data.coords.longitude });

            var map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: data.coords.latitude, lng: data.coords.longitude },
                zoom: 15
            });
            // var infoWindow = new google.maps.InfoWindow({ map: map });
            var pos = {
                lat: data.coords.latitude,
                lng: data.coords.longitude
            };

            var marker = new google.maps.Marker({
                position: pos,
                map: map,
                title: "Big Map",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            });

            marker.setPosition(pos);
            marker.setContent('You are here!');

            // infoWindow.setPosition(pos);
            // infoWindow.setContent('You are here!');

            $scope.myCurrentLocation = {
                currentLocation: [data.coords.longitude, data.coords.latitude]
            };
            userService.updateMyLocation($scope.user, $scope.myCurrentLocation).then(function (response) {
                console.log(response);
            })
        })
    };
    

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