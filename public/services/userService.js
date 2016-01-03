angular.module('locationTracker').service('userService', function ($http, $q, $rootScope) {

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

    this.getConnectionLocations = function (userId) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/v1/user/' + userId + '/connections'
        }).then(function (response) {
            deferred.resolve(response.data)
        })
        return deferred.promise
    };

    this.getAllUsers = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/v1/users/'
        }).then(function (response) {
            deferred.resolve(response.data)
        })
        return deferred.promise

    };

    this.inviteUserToConnect = function (connectionId, inviterId) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/api/v1/user/invite/' + connectionId,
            dataType: 'json',
            data: inviterId
        }).then(function (response) {
            deferred.resolve(response.data)
        })
        return deferred.promise
    };

    this.clearInputForInvite = function (id) {
        if (id) {
            $rootScope.$broadcast('angucomplete-alt:clearInput', id);
        }
        else {
            $rootScope.$broadcast('angucomplete-alt:clearInput');
        }
    }

    this.acceptInviteToConnect = function (userId, newConnectionId) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/api/v1/user/accept/' + userId,
            dataType: 'json',
            data: newConnectionId
        }).then(function (response) {
            deferred.resolve(response.data)
        })
        return deferred.promise
    };







});