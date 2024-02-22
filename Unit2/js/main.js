L.geoJSON(data, {
    style: function(feature) {
        // Your styling logic based on feature properties
    }
}).addTo(map);

//Import GeoJSON data
function getData(map){
	//load the data
	$.ajax("data/Illinois_Obesity_By_County.geojson", {
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
