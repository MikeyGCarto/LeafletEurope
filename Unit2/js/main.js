var map = L.map('map').setView([41.8781, -87.6298], 7); // Set initial map view to Chicago, IL

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load GeoJSON data
fetch('data/Illinois_Obesity_By_County.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        // Define a color scale for the choropleth map
        //NEED TO IMPORT CHROMA.JS SAYS FUNNY ROBOT
        var colorScale = chroma.scale(['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494']).domain([23, 37], 14, 'quantiles');

        L.geoJSON(geojsonData, {
            // Style the county polygons based on the percentage of obesity
            style: function (feature) {
                var obesityPercent = feature.properties.Percent_1; // Assuming this property contains the percentage of obesity
                return {
                    fillColor: colorScale(obesityPercent).hex(), // Use the color scale to determine the fill color
                    color: 'black',
                    weight: 1,
                    fillOpacity: 0.7
                };
            },
            // Add interactivity - show county name and obesity percentage on hover
            onEachFeature: function (feature, layer) {
                var countyName = feature.properties.County;
                var obesityPercent = feature.properties.Percent_1;
                layer.bindTooltip('County: ' + countyName + '<br>Obesity Rate: ' + obesityPercent + '%');

                // Add click event listener to show CSV data in popup
                layer.on('click', function () {
                    // You can fetch and display the CSV data here
                    // For demonstration purposes, I'll just display the county name
                    layer.bindPopup('<b>County: ' + countyName + '</b>').openPopup();
                    
// Parse CSV data and convert it to GeoJSON
Papa.parse('data/Illinois_Obesity_By_County.csv', {
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
        L.geoJSON(geojsonFeatures, {
            onEachFeature: function(feature, layer) {
                // Add interactivity - for example, open a popup when clicked
                layer.bindPopup('<b>' + feature.properties.county + '</b><br>Obesity Percentage: ' + feature.properties.percent + '%');
            }
        }).addTo(map);
    }
});
