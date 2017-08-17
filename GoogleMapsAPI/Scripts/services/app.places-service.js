function PlacesService() {
    //private fields
    var placesService;

    //public methods
    return {
        getNearbyPlaces: function (placeInfo, map, callback, errorCallback) {
            placesService = new google.maps.places.PlacesService(map);

            placesService.nearbySearch(placeInfo, function (response, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    callback(response);
                } else if(status == 'ZERO_RESULTS') {
                    errorCallback('Ningun lugar en los alrededores encontrado');
                }
            }, function () {
                errorCallback('Hubo un problema al contactar el servidor de Google');
            });
        },

        getNearbyPlacesForRoute: function (placeInfo, map, callback) {
            placesService = new google.maps.places.PlacesService(map);

            placesService.nearbySearch(placeInfo, function (response, status) {
                callback(response, status);
            });
        },

        getPlaceDetails: function (placeInfo, map, callback) {
            placesService = new google.maps.places.PlacesService(map);

            placesService.getDetails(placeInfo, function (place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    callback(place);
                }
            });
        }
    };
}