function GeoLocation() {

    //public methods
    return {
        getCurrentLocation: function (callback, handleLocationError) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var currentPositionCoordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    callback(currentPositionCoordinates);
                }, function () {
                    handleLocationError(true);
                });
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false);
            }
        }
    };
}