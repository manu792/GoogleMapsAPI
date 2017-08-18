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
                },
                { timeout: 30000, enableHighAccuracy: true, maximumAge: 75000 });
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false);
            }
        }
    };
}