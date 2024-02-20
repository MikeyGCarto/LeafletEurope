/* Leaflet Proportional Symbols Example */

//GOAL: Proportional symbols representing attribute values of mapped features

//Step 1: Create the Leaflet map
function createMap(){
	//create the map
	var map = L.map('map', {
		center: [20, 0],
		zoom: 2
	});

	//add OSM base tilelayer
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
	}).addTo(map);

	//call getData function
	getData(map);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
	//scale factor to adjust symbol size evenly
	var scaleFactor = 50;
	//area based on attribute value and scale factor
	var area = attValue * scaleFactor;
	//radius calculated based on area
	var radius = Math.sqrt(area/Math.PI);

	return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
	//Assign the current attribute based on the first index of the attributes array
	var attribute = attributes[0];

	//create marker options
	var options = {
		fillColor: "#ff7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	//For each feature, determine its value for the selected attribute
	var attValue = Number(feature.properties[attribute]);

	//Give each feature's circle marker a radius based on its attribute value
	options.radius = calcPropRadius(attValue);

	//create circle marker layer
	var layer = L.circleMarker(latlng, options);

	//original popupContent can be changed to panelContent
	var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

	//add formatted attribute to content string
	var year = attribute.split("_")[1];
	popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

	// //popup content is now just the city name
	// var popupContent = feature.properties.City;

	//bind the popup to the circle marker
	layer.bindPopup(popupContent, {
		offset: new L.Point(0,-options.radius),
		closeButton: false 
	});

	//event listeners to open popup on hover and fill panel on click
	layer.on({
		mouseover: function(){
			this.openPopup();
		},
		mouseout: function(){
			this.closePopup();
		}//,
	// 	click: function(){
	// 		$("#panel").html(panelContent);
	// 	}
	});

	//return the circle marker to the L.geoJson pointToLayer option
	return layer;
};

//build an attributes array from the data
function processData(data){
	//empty array to hold attributes
	var attributes = [];

	//properties of the first feature in the dataset
	var properties = data.features[0].properties;
	//push each attribute name into attributes array
	for (var attribute in properties){
		//only take attributes with population values
		if (attribute.indexOf("Pop") > -1){
			attributes.push(attribute);
		};
	};

	return attributes;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
	//create a Leaflet GeoJSON layer and add it to the map
	L.geoJson(data, {
		pointToLayer: function(feature, latlng){
			return pointToLayer(feature, latlng, attributes);
		}
	}).addTo(map);
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute]){
			//access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
		};
	});
};

//Step 1: Create new Leaflet control
function createSequenceControls(map, attributes){
	//create range input element (slider)
	$('#panel').append('<input class="range-slider" type="range">');

	//set slider attributes
	$('.range-slider').attr({
		max: 6,
		min: 0,
		value: 0,
		step: 1
	});

	//add skip buttons
	$('#panel').append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
	$('#panel').append('<button class="skip" id="forward" title="Forward">Skip</button>');

	//replace button content with images
	$('#reverse').html('<img src="img/reverse.png">');
	$('#forward').html('<img src="img/forward.png">');

	//Step 5: click listener for buttons
	$('.skip').click(function(){
		//get the old index value
		var index = $('.range-slider').val();

		//Step 6: increment or decriment depending on button clicked
		if ($(this).attr('id') == 'forward'){
			index++;
			//Step 7: if past the last attribute, wrap around to first attribute
			index = index > 6 ? 0 : index;
		} else if ($(this).attr('id') == 'reverse'){
			index--;
			//Step 7: if past the first attribute, wrap around to last attribute
			index = index < 0 ? 6 : index;
		};

		//Step 8: update slider
		$('.range-slider').val(index);

		//Step 9: pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
	});

	//Step 5: input listener for slider
	$('.range-slider').on('input', function(){
		//Step 6: get the new index value
		var index = $(this).val();

		//Step 9: pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
	});
};

//Import GeoJSON data
function getData(map){
	//load the data
	$.ajax("data/MegaCities.geojson", {
		dataType: "json",
		success: function(response){
			//create an attributes array
			var attributes = processData(response);

			createPropSymbols(response, map, attributes);
			createSequenceControls(map, attributes);

		}
	});
};

$(document).ready(createMap);