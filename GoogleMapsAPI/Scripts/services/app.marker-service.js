function MarkerService() {

    // public methods
    return {
        createMarker: function (place, map, width, height) {
            return new google.maps.Marker({
                map: map,
                position: place.geometry.location,
                icon: {
                    size: new google.maps.Size(width, height),
                    scaledSize: new google.maps.Size(width, height),
                    url: localStorage.getItem(place.place_id) != null ? '/Content/Images/ic_favorite_black_24dp_2x.png' : place.icon
                }
            });
        }
    }
}