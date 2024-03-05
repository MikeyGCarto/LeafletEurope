// Leaflet initialization code
var map = L.map('map').setView([49.000000, 5.000000], 4.5);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load GeoJSON data
fetch('/data/europe.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data).addTo(map);
    })
    .catch(error => {
        console.error('Error:', error);
    });

L.geoJSON(geojsonFeature).addto(map);
