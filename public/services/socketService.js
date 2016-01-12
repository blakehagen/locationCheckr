angular.module('locationTracker').factory('socketService', ['$rootScope', function ($rootScope) {
    var socket = io.connect('http://locationcheckr.com');

    return {
        removeAllListeners: function (eventName, callback) {
            socket.removeAllListeners();
        },
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };


}]);