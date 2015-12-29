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
    };

    this.updateMyLocation = function (userId, locationData) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/api/v1/user/' + userId,
            dataType: 'json',
            data: locationData
        }).then(function (response) {
            deferred.resolve(response.data)
        })
        return deferred.promise
    };
    
      this.stopLocation = function (userId, locationData) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/api/v1/user/stop/' + userId,
            dataType: 'json',
            data: locationData
        }).then(function (response) {
            deferred.resolve(response.data)
        })
        return deferred.promise
    };





});