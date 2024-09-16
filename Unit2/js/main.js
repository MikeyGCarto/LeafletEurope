var map = L.map('map').setView([47.5000, 10.0000], 5);
var data; // Define data in a broader scope

// Add tile layer
var Jawg_Sunny = L.tileLayer('https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 22,
	accessToken: 'erBSxDSb3MaX7nh0bMwyVhfS0OQCK9Ewh7zEWXsLoGiF8Y4WUFrGuXLW8CftYEms'
}).addTo(map);

// Define a custom control for the slider and buttons
var SequenceControl = L.Control.extend({
    options: {
        position: 'topleft' // Position the control at the top left
    },

    onAdd: function (map) {
        // Create the container for the slider and buttons
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        // Add HTML elements for the slider and buttons
        container.innerHTML = `
            <input type="range" id="slider" min="2016" max="2023" value="2016" step="1" class="leaflet-bar-part leaflet-bar-part-single" />
            <div id="buttons-container" style="margin-top: 10px; text-align: center;">
                <button id="prev-year" class="leaflet-bar-part leaflet-bar-part-single" style="margin-right: 5px;">Previous</button>
                <button id="next-year" class="leaflet-bar-part leaflet-bar-part-single">Next</button>
            </div>`;

        // Prevent map panning when interacting with the control
        L.DomEvent.disableClickPropagation(container);

        // Add event listener for the slider
        container.querySelector('#slider').addEventListener('input', function() {
            updateSymbols(); // Call your updateSymbols function when the slider moves
        });

        // Add event listeners for the buttons
        container.querySelector('#prev-year').addEventListener('click', function() {
            var slider = container.querySelector('#slider');
            if (parseInt(slider.value) > parseInt(slider.min)) {
                slider.value = parseInt(slider.value) - 1;
                updateSymbols();
            }
        });

        container.querySelector('#next-year').addEventListener('click', function() {
            var slider = container.querySelector('#slider');
            if (parseInt(slider.value) < parseInt(slider.max)) {
                slider.value = parseInt(slider.value) + 1;
                updateSymbols();
            }
        });

        return container;
    }
});


// Create an instance of the SequenceControl
var sequenceControl = new SequenceControl();

// Add the SequenceControl to the map
sequenceControl.addTo(map);

var geojsonLayer; // Define geojsonLayer globally

// Load GeoJSON data and add it to the map
fetch("Unit2/data/EURPOP.geojson")
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonData) {
        // Store the fetched data in the data variable
        data = jsonData;

        // Define initial attribute and calculate min value
        var attribute = "Pop_2016"; // Initial attribute
        var statistics2016 = calculateStatistics(data, "2016");

        // Create a Leaflet GeoJSON layer with interactivity and customized markers
        geojsonLayer = L.geoJSON(data, {
            onEachFeature: function(feature, layer) {
                // Initialize popup content
                var popupContent = "<b>Country:</b> " + feature.properties.Country + "<br>";

                // Bind popup with the constructed content to the layer
                layer.bindPopup(popupContent);
            },
            pointToLayer: function(feature, latlng) {
                // Determine attribute value
                var attValue = Number(feature.properties[attribute]);

                // Calculate radius and fillColor using calcPropRadius function
                var radiusAndColor = calcPropRadius(attValue, statistics2016.min);
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

        // Trigger the input event with value "2016" upon map load
        window.addEventListener('load', function() {
            var event = new Event('input');
            var slider = document.querySelector('#slider');
            slider.value = "2016";
            slider.dispatchEvent(event);
        });

        // Call the function to create the legend with statistics for the year 2016
			createLegend("statistics2016");
    })
    .catch(function(error) {
        console.error("Error loading GeoJSON: ", error);
    });


// Function to calculate statistics for a given year from the data
function calculateStatistics(data, year) {
    var propName = "Pop_" + year;
    var values = data.features.map(feature => feature.properties[propName]);
    var min = Math.min(...values);
    var max = Math.max(...values);
    var mean = values.reduce((acc, val) => acc + val, 0) / values.length;

    return { min: min, max: max, mean: mean };
}

// Function to calculate the minimum, maximum, and mean radius values based on the data for a specific year
function calculateLegendRadius(data, year) {
    var propName = "Pop_" + year;
    var values = data.features.map(feature => Number(feature.properties[propName]));

    // Calculate the minimum, maximum, and mean radius values
    var minRadius = Math.min(...values);
    var maxRadius = Math.max(...values);
    var meanRadius = values.reduce((acc, val) => acc + val, 0) / values.length;

    return { min: minRadius, max: maxRadius, mean: meanRadius };
}

//Function to Create Legend
//Extra Spacing so you know this is the one
// Function to create the legend dynamically based on the selected year
function createLegend(statistics) {
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // Create the control container with a particular class name
            var container = L.DomUtil.create('div', 'info legend');

            // Define the SVG content for your legend
            var svgContent = '<svg width="200" height="120">'; // Adjust width and height as needed

            // Define the legend items
            var legendItems = [
                { label: 'Low: -18.35', color: '#b2182b', radius: 10, },
                { label: 'Mean: -0.299', color: '#f7f7f7', radius: 20 },
                { label: 'High: 4.03', color: '#2166ac', radius: 30 }
            ];

			// Add circles to SVG based on legend items
			for (var i = 0; i < legendItems.length; i++) {
				var item = legendItems[i];
				svgContent += '<circle cx="50" cy="' + (20 + i * 30) + '" r="' + item.radius + '" fill="' + item.color + '" stroke="#000" stroke-width="2" opacity="0.7"></circle>';
				svgContent += '<text x="85" y="' + (25 + i * 30) + '" fill="#000">' + item.label + '</text>'; // Adjusted x position
			}
			svgContent += '</svg>';



            // Add the SVG content to the legend container
            container.innerHTML = svgContent;

            // Add any additional text or styling as needed
            container.style.lineHeight = '20px'; // Adjust line height as needed
            container.style.color = '#555'; // Adjust text color as needed

            return container;
        }
    });

    // Create an instance of the LegendControl and add it to the map
    var legendControl = new LegendControl();
    legendControl.addTo(map);
}


// Function to update proportional symbols based on selected year
function updateSymbols() {
    // Get the selected year from the slider
    var selectedYear = document.querySelector('#slider').value;
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

        // Update popup content for each layer
        var popupContent = "<b>Country:</b> " + layer.feature.properties.Country + "<br>";
        var propName = "Pop_" + selectedYear;
        if (layer.feature.properties[propName]) {
            popupContent += "<b>Population Change % in " + selectedYear + ":</b> " + layer.feature.properties[propName] + "<br>";
        } else {
            popupContent += "<b>No data available for " + selectedYear + "</b><br>";
        }
        layer.setPopupContent(popupContent);
    });
}

// Function to calculate statistics for the selected year
function calculateStatistics(data, selectedYear) {
    var propName = "Pop_" + selectedYear;
    var values = data.features.map(feature => feature.properties[propName]);
    var min = Math.min(...values);
    var max = Math.max(...values);
    var mean = values.reduce((acc, val) => acc + val, 0) / values.length;

    return { min: min, max: max, mean: mean };
}

// Function to calculate circle radius based on statistics
function calculateCircleRadius(statistics) {
    // Adjust the scaling factors to control circle sizes
    var minRadius = 10; // Minimum radius for circles
    var maxRadius = 30; // Maximum radius for circles
    var meanRadius = 20; // Mean radius for circles

    // Calculate the radius based on statistics
    var range = statistics.max - statistics.min;
    var sizeMean = minRadius + (meanRadius / range) * (maxRadius - minRadius);
    var sizeMax = minRadius + (maxRadius / range) * (maxRadius - minRadius);
    var sizeMin = minRadius + (minRadius / range) * (maxRadius - minRadius);

    return [sizeMax, sizeMean, sizeMin]; // Return array of circle radius values
}

// Function to get color range based on statistics
function getColorRange(statistics) {
    // Define color range from red to blue
    var colorRange = ['#b2182b','#d6604d','#f4a582'];

    return colorRange; // Return color range array
}



		
// Function to calculate the minimum value of the attribute
function calcMinValue(data) {
    var minValues = [];

    // Loop through each feature in the GeoJSON data
    data.features.forEach(function(feature) {
        // Loop through the population properties to find the minimum value
        var propName = "Pop_2016";
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
    var minRadius = 20; // Minimum radius for markers
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
            radius = Math.max(minRadius - decrease, 10); // Ensure the radius doesn't go below 5
        }

        return { radius: radius, fillColor: fillColor };
    } catch (error) {
        console.error('Error in calcPropRadius:', error);
        return { radius: minRadius, fillColor: '#000' }; // Return the minimum radius and default fill color in case of error
    }
}
