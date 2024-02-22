var map = L.map('map').setView([41.8781, -87.6298], 7); // Set initial map view to Chicago, IL

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load GeoJSON data
fetch('Unit2/data/Illinois_Obesity_By_County.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        L.geoJSON(geojsonData).addTo(map);
    })
    .catch(error => {
        console.error('Error loading GeoJSON data:', error);
    });

// Parse CSV data and convert it to GeoJSON
Papa.parse('Unit2/data/Illinois_Obesity_By_County.csv', {
    header: true,
    download: true,
    dynamicTyping: true,
    complete: function(results) {
        var csvData = results.data;

        // Convert CSV data to GeoJSON format
        var geojsonFeatures = csvData.map(row => {
            return {
                type: 'Feature',
                properties: {
                    // Add properties based on CSV columns
                    county: row.County,
                    percent: row.Percent_1
                },
                geometry: {
                    type: 'Point',
                    coordinates: [row.Longitude, row.Latitude] // Assuming Longitude and Latitude columns in CSV
                }
            };
        });

        // Create GeoJSON layer from CSV data
        L.geoJSON(geojsonFeatures).addTo(map);
    }
});
