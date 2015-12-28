angular.module('locationTracker').service('userService', function ($http, $q) {

    this.getUser = function (userId) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/v1/user/' + userId
        }).then(function (response) {
            deferred.resolve(response.data)
        })
        return deferred.promise
    }



    
   
});