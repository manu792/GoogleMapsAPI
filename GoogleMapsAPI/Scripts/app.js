(function (directionService, directionsDisplay, placesService, geoLocationService, markerService, factory, routeBoxer) {
    var map;
    var infoWindow;
    var coordinates;
    var markers = [];

    function initMap() {
        coordinates = { lat: -34.397, lng: 150.644 };

        map = factory.setMap(document.getElementById('map'), {
            center: coordinates,
            zoom: 15
        });

        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directionsPanel'));

        getCurrentLocation();
    }

    function setAutoComplete() {
        //var defaultBounds = new google.maps.LatLngBounds(
        //    new google.maps.LatLng(-33.8902, 151.1759),
        //    new google.maps.LatLng(-33.8474, 151.2631)
        //);

        var start = document.getElementById('start');
        var end = document.getElementById('end');

        var options = {
            //types: ['(cities)'],
            componentRestrictions: {country: 'cr'}
        };
        var startAutocomplete = new google.maps.places.Autocomplete(start, options);
        var endAutocomplete = new google.maps.places.Autocomplete(end, options);
    }

    function getNearbyPlaces() {
        var placeInfo = {
            location: coordinates,
            radius: 500,
            type: document.getElementById('type').value
        }

        placesService.getNearbyPlaces(placeInfo, map, function (response) {
            createMarkers(response);
        }, function (response) {
            alert(response); 
        });
    }

    function getCurrentLocation() {
        geoLocationService.getCurrentLocation(function (currentPositionCoordinates) {
            coordinates = currentPositionCoordinates;
            infoWindow = factory.setInfoWindow(map);
            infoWindow.setPosition(coordinates);
            infoWindow.setContent('Tu ubicacion actual');
            map.setCenter(coordinates);

            // makes geo-position element visible otherwise it is hidden
            document.getElementById('geo-position-container').style.display = 'block';
            document.getElementById('nearby').style.display = 'block';
        }, handleLocationError);
    }

    function handleLocationError(browserHasGeolocation) {
        infoWindow = factory.setInfoWindow(map);
        infoWindow.setPosition(map.getCenter());
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: El servicio de Geolocalizacion ha fallado.' :
                              'Error: Su browser no soporta Geolocalizacion.');
    }

    function calculateAndDisplayRoute() {
        var distance = 0.3; // km
        var boxes;

        distance = distance * 1.609344;

        var routeInfo = {
            startPoint: document.getElementById('start').disabled  ? coordinates : document.getElementById('start').value,
            destination: document.getElementById('end').value,
            travelMode: document.getElementById('mode').value || 'DRIVING'
        };

        directionService.calculateRoute(routeInfo, function (response) {
            directionsDisplay.setDirections(response);

            // Box around the overview path of the first route
            var path = response.routes[0].overview_path;
            boxes = routeBoxer.box(path, distance);
            getPlacesInRoute(boxes, 0);
        }, function (response) {
            alert('Solicitud de direccion ha fallado con el error ' + response);
        });
    }

    function getPlacesInRoute(boxes, searchIndex) {
        var request = {
            bounds: boxes[searchIndex],
            type: document.getElementById('type').value
        };

        placesService.getNearbyPlacesForRoute(request, map, function (response, status) {
            if (status === 'OK') {
                createMarkers(response);
            }
            if (status != 'OVER_QUERY_LIMIT') {
                searchIndex++;
                if (searchIndex < boxes.length) {
                    getPlacesInRoute(boxes, searchIndex);
                }
            } else {
                // delay 1 second and try again
                setTimeout(function () { getPlacesInRoute(boxes, searchIndex) }, 1000);
            }
        });
    }

    function clearMarker(marker) {
        marker.setMap(null);
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].map == null) {
                markers.splice(i, 1);
            }
        }
    }

    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }

    function createMarkers(results) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }

    function createMarker(place) {
        var height = 20;
        var width = 20;

        var marker = markerService.createMarker(place, map, width, height);
        markers.push(marker);
        setMarkerClickHandler(marker, place);

        //placesService.getPlaceDetails({ placeId: place.place_id }, map, function (place) {
        //    var marker = markerService.createMarker(place, map, width, height);
        //    markers.push(marker);
        //    setMarkerClickHandler(marker, place);
        //});
    }

    function changeMarkerInfo(place) {
        var height = 20;
        var width = 20;

        var marker = markerService.createMarker(place, map, width, height);
        markers.push(marker);
        setMarkerClickHandler(marker, place);
    }

    function setMarkerClickHandler(marker, place) {
        google.maps.event.addListener(marker, 'click', function () {
            placesService.getPlaceDetails({ placeId: place.place_id }, map, function (place) {
                var content = getMarkerContent(place);
                infoWindow = factory.setInfoWindow(map);
                infoWindow.setContent(content);
                infoWindow.open(map, marker);
                setEventHandler(marker, place);
            });
        });
    }

    function setEventHandler(marker, place) {
        if (document.getElementById('addToFavorites')) {
            eventHandlerForAddFavorites(marker, place);
        } else {
            eventHandlerForRemoveFavorites(marker, place);
        }
    }

    function eventHandlerForAddFavorites(marker, place) {
        document.getElementById('addToFavorites').addEventListener('click', function () {
            localStorage.setItem(place.place_id, JSON.stringify(place));

            //remove current marker and replace it with new one
            updateMarker(marker, place);
        });
    }

    function eventHandlerForRemoveFavorites(marker, place) {
        document.getElementById('removeFromFavorites').addEventListener('click', function () {
            localStorage.removeItem(place.place_id);

            //remove current marker and replace it with new one
            updateMarker(marker, place);
        });
    }

    function updateMarker(marker, place) {
        // change marker icon
        clearMarker(marker);
        changeMarkerInfo(place);
    }

    function getMarkerContent(place) {
        var content;
        if (localStorage.getItem(place.place_id) == null) {
            content = '<div><strong>' + place.name + '</strong><br>' +
              'Place ID: ' + place.place_id + '<br>' +
              place.formatted_address + '<br>' +
              '<button id="addToFavorites" class="btn btn-success"><strong>Agregar a Favoritos</strong></button>' + '</div>'
        } else {
            content = '<div><strong>' + place.name + '</strong><br>' +
              'Place ID: ' + place.place_id + '<br>' +
              place.formatted_address + '<br>' +
              '<button id="removeFromFavorites" class="btn btn-danger"><strong>Eliminar de Favoritos</strong></button>' + '</div>'
        }
        return content;
    }

    initMap();
    setAutoComplete();

    var onRouteHandler = function () {
        // Clear any previous markers from the map
        clearMarkers();
        calculateAndDisplayRoute(directionsDisplay);
    }

    var onGeoPositionHandler = function () {
        var element = document.getElementById('geo-position');
        var startElement = document.getElementById('start');
        if (element.checked) {
            startElement.disabled = true;
        } else {
            startElement.disabled = false;
        }
    }

    var onChangeHandler = function () {
        // Clear any previous markers from the map
        clearMarkers();
        calculateAndDisplayRoute(directionsDisplay);
    };

    var onClickNearby = function () {
        // Clear any previous markers from the map
        clearMarkers();
        getNearbyPlaces();
    };
    document.getElementById('routeBtn').addEventListener('click', onRouteHandler);
    document.getElementById('geo-position').addEventListener('change', onGeoPositionHandler);
    document.getElementById('nearby').addEventListener('click', onClickNearby);

}(  new DirectionService(),
    new google.maps.DirectionsRenderer,
    new PlacesService(),
    new GeoLocation(),
    new MarkerService(),
    new Factory(),
    new RouteBoxer()
 ));