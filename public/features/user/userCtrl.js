angular.module('locationTracker').controller('userCtrl', function ($scope, $stateParams, geolocation, userService) {

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
            console.log({ lat: data.coords.latitude, long: data.coords.longitude });
            $scope.myCurrentLocation = {
                currentLocation: [data.coords.longitude, data.coords.latitude]
            };

            userService.updateMyLocation($scope.user, $scope.myCurrentLocation).then(function (response) {
                console.log(response);
            })
        })
    };









});