function Factory() {
    return {
        setMap: function (element, mapOptions) {
            return new google.maps.Map(element, mapOptions);
        },
        setInfoWindow: function (map) {
            return new google.maps.InfoWindow({ map: map });
        }
    }
}