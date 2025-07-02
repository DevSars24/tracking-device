const socket = io();

// Initialize Leaflet map
const map = L.map('map', {
    zoomControl: true,
    maxZoom: 19,
    minZoom: 10
}).setView([0, 0], 18);

// Use OpenStreetMap tiles by default
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    tileSize: 256
}).addTo(map);

// Optional: Mapbox tiles (uncomment and add your key if needed)
// const mapboxLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=YOUR_MAPBOX_ACCESS_TOKEN', {
//     attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 22,
//     tileSize: 256
// });
// mapboxLayer.addTo(map).on('error', () => {
//     console.error('Mapbox tiles failed to load, using OpenStreetMap');
//     map.removeLayer(mapboxLayer);
//     osmLayer.addTo(map);
// });

// Add error handling for tile loading
osmLayer.on('tileerror', (error, tile) => {
    console.error('Tile loading error:', error, tile);
    alert('Map tiles load nahi hue. Check internet ya console mein error dekh!');
});

// Marker to show the user's location
let marker;

// Check if geolocation is supported
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;

        // Send location to the server
        socket.emit('send-location', { latitude, longitude });

        // Update map view and marker with high zoom
        map.setView([latitude, longitude], 18);
        if (marker) {
            marker.setLatLng([latitude, longitude]);
        } else {
            marker = L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup('Tera ghar, bhai! 🌞')
                .openPopup();
        }
    }, (error) => {
        console.error('Geolocation error:', error);
        alert('Location fetch nahi hua. Location access allow kar!');
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
} else {
    alert('Tera browser geolocation support nahi karta!');
}

// Receive location updates from other users
socket.on('receive-location', (data) => {
    const { latitude, longitude } = data;
    map.setView([latitude, longitude], 18);
    if (marker) {
        marker.setLatLng([latitude, longitude]);
    } else {
        marker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup('Location update received!')
            .openPopup();
    }
});