const locations = JSON.parse(document.getElementById('map').dataset.locations);

const map = L.map('map', {
    // minZoom: 5,
    scrollWheelZoom	: false
});
const markers = L.featureGroup();

const natoursMapIcon = L.icon({
    iconUrl: '../img/pin.png',
    iconSize:     [32, 40], // size of the icon
    iconAnchor:   [16, 40], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -40]
});


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



locations.forEach(loc => {
    // 1) Criando o html do popup
    const popupHtml = document.createElement('p');
    popupHtml.classList.add('mapboxgl-popup', 'mapboxgl-popup-content');
    popupHtml.innerHTML = `Day ${loc.day}: ${loc.description}`;

    // 2) Adicionando o layer marker ao featureGroup
    markers.addLayer(
        L.marker([loc.coordinates[1], loc.coordinates[0]], {icon: natoursMapIcon})
        .bindPopup(popupHtml)  
    );
});

markers.addTo(map).openPopup();
map.fitBounds(markers.getBounds(), {
    paddingTopLeft: [200, 100],
    paddingBottomRight: [200, 100]
});
