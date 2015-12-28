angular.module('locationTracker').controller('userCtrl', function ($scope, $stateParams, geolocation, userService) {

    $scope.user = $stateParams.id;
    
    $scope.getUserData = function(){
        userService.getUser($scope.user).then(function(user){
            console.log(user);
        })
    };
    // GET USER DATA ON LOGIN //
    $scope.getUserData();








});