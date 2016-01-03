angular.module('locationTracker').service('mapService', function ($http, $q) {

    this.reverseGeolocate = function (pos) {
        var deferred = $q.defer();

        var geocoder = new google.maps.Geocoder();

        var point = new google.maps.LatLng(pos.lat, pos.lng);
        geocoder.geocode({ 'latLng': point }, function (results, status) {
            if (status !== google.maps.GeocoderStatus.OK) {
                console.log(status);
            }
            // This is checking to see if the Geoeode Status is OK before proceeding
            if (status == google.maps.GeocoderStatus.OK) {
                // console.log(results[0].formatted_address);
            }
            deferred.resolve(results[0].formatted_address);
        })
        return deferred.promise
    };




});