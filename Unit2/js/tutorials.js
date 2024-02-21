/* Leaflet Quick Start Guide and GeoJSON tutorials */

//create Leaflet map object
var map = L.map('map')
	//set the map center at the given coordinates and zoom at level 13
	.setView([51.505, -0.09], 13);

//create Leaflet tileLayer to display map tiles, given tileset url and layer options
var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'northlandiguana.li83eogk',
    accessToken: 'pk.eyJ1Ijoibm9ydGhsYW5kaWd1YW5hIiwiYSI6IldJU1N4Y0UifQ.wpNgLPfnWQOBDWCgynJRiw'
})
	//add tileLayer to map
	.addTo(map);

//create Leaflet marker layer at given latlng coordinates
var marker = L.marker([51.5, -0.09])
	//add marker to map
	.addTo(map);

//create Leaflet circle layer at given latlng coordinates with a radius of 500 meters and given path options, and add to map
var circle = L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

//create Leaflet polygon layer with three latlng coordinate pairs (triangle), and add to map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//bind a popup with the given HTML content to the marker
marker.bindPopup("<b>Hello world!</b><br>I am a popup.")
	//open the popup immediately
	.openPopup();
//bind popups with the given text content to the circle and polygon that will open on click
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//create a standalone popup
var popup = L.popup()
	//set the popup coordinates
    .setLatLng([51.5, -0.09])
    //set the popup text content
    .setContent("I am a standalone popup.")
    //open the popup immediately, closing any previous popups
    .openOn(map);

//map click listener handler
function onMapClick(e) {
	//access previously created popup
    popup
    	//open the popup at the place where the user clicked
        .setLatLng(e.latlng)
        //set the popup content with the latlng coordinates
        .setContent("You clicked the map at " + e.latlng.toString())
        //open the popup, closing the previous one
        .openOn(map);
}

//when the user clicks, fire the handler onMapClick()
map.on('click', onMapClick);

//function to call on each GeoJSON feature
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
    	//if so, bind a popup with its content to the feature layer
        layer.bindPopup(feature.properties.popupContent);
    }
}
