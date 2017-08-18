function DirectionService() {
    //private fields
    var directionsService = new google.maps.DirectionsService;

    //public methods
    return {
        calculateRoute: function (routeInfo, callback, errorCallback) {
            directionsService.route({
                origin: routeInfo.startPoint,
                destination: routeInfo.destination,
                travelMode: routeInfo.travelMode
            }, function (response, status) {
                if (status === 'OK') {
                    callback(response);
                } else {
                    errorCallback(status);
                }
            });
        }
    };
}