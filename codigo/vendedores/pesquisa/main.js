function renderGoogleMap(lat, lon, mapElementId) {
    let map;
    let infowindow;
    let service;
    let markers = [];

    function initMap() {
        const mapOptions = {
            center: new google.maps.LatLng(lat, lon),
            zoom: 10
        };
        map = new google.maps.Map(document.getElementById(mapElementId), mapOptions);

        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: map,
            title: "Você está aqui"
        });

        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
    }

    function searchCategory(category) {
        clearMarkers();

        const request = {
            location: new google.maps.LatLng(lat, lon),
            radius: '5000',
            type: [category]
        };

        service.nearbySearch(request, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (let i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                }
            } else {
                console.error('Erro ao buscar lugares:', status);
            }
        });
    }

    function createMarker(place) {
        const marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });

        markers.push(marker);
    }

    function clearMarkers() {
        for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }


    initMap();

    return {
        searchCategory: searchCategory
    };
}

function geocodeAddress(address, callback) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status === 'OK') {
            const location = results[0].geometry.location;
            callback(location.lat(), location.lng());
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const address = "São Paulo, Avenida Brasil, 946"; // Example address
    geocodeAddress(address, function(lat, lon) {
        const mapElementId = 'map';
        const mapFunctions = renderGoogleMap(lat, lon, mapElementId);

        // Example usage of searchCategory function
        // mapFunctions.searchCategory('restaurant');
    });
});


