var map = L.map('map').setView([50.0000, 15.0000], 5);

// Add tile layer
var Stadia_StamenTonerLite = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
}).addTo(map);

// Load GeoJSON data and add it to the map
fetch("Unit2/data/EURPOP.geojson")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        // Define initial attribute and calculate min value
        var attribute = "Pop_2022"; // Initial attribute
        var minValue = calcMinValue(data);

        // Define colors for each category
        var colors = ['#b2182b','#d6604d','#f4a582','#fddbc7','#d1e5f0','#92c5de','#4393c3','#2166ac'];

        // Create a Leaflet GeoJSON layer with interactivity and customized markers
        var geojsonLayer = L.geoJSON(data, {
            onEachFeature: function(feature, layer) {
                // Initialize popup content
                var popupContent = "<b>Country:</b> " + feature.properties.Country + "<br>";

                // Loop through population properties and add them to the popup content
                for (var i = 2023; i >= 2016; i--) {
                    var propName = "Pop_" + i;
                    if (feature.properties[propName]) {
                        popupContent += "<b>Population change % in " + i + ":</b> " + feature.properties[propName] + "<br>";
                    }
                }

                // Bind popup with the constructed content to the layer
                layer.bindPopup(popupContent);
            },
            pointToLayer: function(feature, latlng) {
                // Determine attribute value
                var attValue = Number(feature.properties[attribute]);

                // Calculate radius and fillColor using calcPropRadius function
                var radiusAndColor = calcPropRadius(attValue, minValue);
                var radius = radiusAndColor.radius;
                var fillColor = radiusAndColor.fillColor;

                // Customize markers
                var geojsonMarkerOptions = {
                    radius: radius,
                    fillColor: fillColor,
                    color: "#000",
                    weight: 2,
                    opacity: 0.5,
                    fillOpacity: 0.7
                };

                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }).addTo(map);

					// Add event listener for the slider
			document.querySelector('.range-slider').addEventListener('input', function() {
				// Get the selected year from the slider
				var selectedYear = this.value;
				// Update attribute based on the selected year
				var attribute = "Pop_" + selectedYear;
				// Recalculate minValue
				var minValue = calcMinValue(data);
				// Update proportional symbols
				geojsonLayer.eachLayer(function(layer) {
					var attValue = Number(layer.feature.properties[attribute]);
					var symbolProps = calcPropRadius(attValue, minValue);
					layer.setRadius(symbolProps.radius);
					layer.setStyle({ fillColor: symbolProps.fillColor });
				});
			});


    })
    .catch(function(error) {
        console.error("Error loading GeoJSON: ", error);
    });


// Function to calculate the minimum value of the attribute
function calcMinValue(data) {
    var minValues = [];

    // Loop through each feature in the GeoJSON data
    data.features.forEach(function(feature) {
        // Loop through the population properties to find the minimum value
        var propName = "Pop_2023";
        if (feature.properties[propName]) {
            minValues.push(feature.properties[propName]);
        }
    });

    // Return the minimum value from the array of values
    return Math.min(...minValues);
}


// Function to create Proportional Symbols
function calcPropRadius(attValue) {
    // Adjust the scaling factors to control symbol sizes
    var minRadius = 10; // Minimum radius for markers
    var scaleFactor = 2; // Scaling factor for adjusting marker size based on population change percentage
    var maxRadius = 30; // Maximum radius for markers

    try {
        // Calculate the radius based on the population change percentage
        var radius;
        var fillColor;

        // Define color range from red to blue
        var colorRange = ['#b2182b','#d6604d','#f4a582','#fddbc7','#d1e5f0','#92c5de','#4393c3','#2166ac']

        // Determine the color index based on the population change percentage
        var colorIndex = Math.round((attValue + 2.1) / 4.2 * (colorRange.length - 1)); // Normalize the attValue to the range [-2.1, 2.1] and map to the length of colorRange

        // Limit color index to the range of colorRange array
        colorIndex = Math.max(0, Math.min(colorIndex, colorRange.length - 1));

        // Set the fillColor based on the color index
        fillColor = colorRange[colorIndex];

        // Calculate the radius based on the population change percentage
        if (attValue >= 0) {
            // Calculate the increase in radius with a maximum limit
            var increase = attValue * scaleFactor;
            radius = Math.min(minRadius + increase, maxRadius); // Ensure the radius doesn't exceed maxRadius
        } else {
            // Calculate the decrease in radius with a minimum limit
            var decrease = Math.abs(attValue) * scaleFactor;
            radius = Math.max(minRadius - decrease, 5); // Ensure the radius doesn't go below 5
        }

        return { radius: radius, fillColor: fillColor };
    } catch (error) {
        console.error('Error in calcPropRadius:', error);
        return { radius: minRadius, fillColor: '#000' }; // Return the minimum radius and default fill color in case of error
    }
}
