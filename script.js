
var map = L.map('map').setView([48.8566, 2.3522], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© Contributeurs de OpenStreetMap'
}).addTo(map);

var markersCluster = L.markerClusterGroup(); // Initialisation du groupe de clusters
var openWeatherApiKey = '1630814035a36a2c68c347a3aa2de7cc'; // Remplacez par votre clé API OpenWeatherMap
map.addLayer(markersCluster);
      
var suggestionsBox = document.getElementById('suggestionsBox');

  var markersCluster = L.markerClusterGroup(); // Initialisation du groupe de clusters
  // Charger les marqueurs pour toutes les villes à partir de l'API Geo et les ajouter au cluster
  fetch('https://geo.api.gouv.fr/communes?fields=nom,centre')
    .then(response => response.json())
    .then(data => {
      data.forEach(ville => {
        var marker = L.marker([ville.centre.coordinates[1], ville.centre.coordinates[0]]);
        marker.bindPopup(ville.nom);

        // Ajouter un gestionnaire d'événement de clic pour afficher la météo pour la ville
        marker.on('click', function(e) {
          console.log(`Lat : ${e.latlng.lat}, Long: ${e.latlng.lng}`); // Coordonnées lat et lon du point cliqué
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${e.latlng.lat}&lon=${e.latlng.lng}&appid=${openWeatherApiKey}&units=metric`)
          .then(response => response.json())
          .then(data => {
            var iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
            var popupContent = `
              <strong>${data.name}</strong>
              <img src="${iconUrl}" alt="Weather icon">
              <p>Température: ${data.main.temp}°C</p>
              <p>Nuages: ${data.clouds.all}%</p>
              <p>Humidité: ${data.main.humidity}%</p>
              <p>Pression: ${data.main.pressure}hPa</p>
              <p>Direction du vent: ${data.wind.deg}°</p>
              <p>Vitesse du vent: ${data.wind.speed}m/s</p>
            `;
      
            map.setView([e.latlng.lat, e.latlng.lng], 13);
            L.popup()
              .setLatLng([e.latlng.lat, e.latlng.lng])
              .setContent(popupContent)
              .openOn(map);
              document.getElementById('result').innerHTML = popupContent; // Afficher les informations météo dans 'result'
            })
            .catch(error => {
              console.error('Erreur lors de la récupération des données météo:', error);
            });

        });
  
// console.log(marker);
        markersCluster.addLayer(marker);
      });
      map.addLayer(markersCluster);
    })
    .catch(error => console.error('Erreur lors du chargement des villes:', error));
 
// Fonction pour afficher des suggestions d'auto-complétion
function showSuggestions(input) {
  if (input.length < 3) {
      suggestionsBox.innerHTML = '';
      return;
  }



  fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(input)}&type=municipality&limit=5`)
    .then(response => response.json())
    .then(data => {
      suggestionsBox.innerHTML = '';
      data.features.forEach((feature) => {
        var div = document.createElement('div');
        div.innerHTML = `${feature.properties.name} (${feature.properties.postcode})`;
        div.className = 'autocomplete-suggestion';
        div.onclick = function() {
          document.getElementById('cityInput').value = feature.properties.name;
          suggestionsBox.innerHTML = '';
          getWeather(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        };
        suggestionsBox.appendChild(div);
      });
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des suggestions:', error);
    });
}

function getWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      var iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
      var popupContent = `
        <strong>${data.name}</strong>
        <img src="${iconUrl}" alt="Weather icon">
        <p>Température: ${data.main.temp}°C</p>
        <p>Nuages: ${data.clouds.all}%</p>
        <p>Humidité: ${data.main.humidity}%</p>
        <p>Pression: ${data.main.pressure}hPa</p>
        <p>Direction du vent: ${data.wind.deg}°</p>
        <p>Vitesse du vent: ${data.wind.speed}m/s</p>
      `;

      map.setView([lat, lon], 13);
      L.popup()
        .setLatLng([lat, lon])
        .setContent(popupContent)
        .openOn(map);

      // Ajouter un marqueur pour la ville avec les informations météo
      // markersCluster.clearLayers(); // Nettoyer les anciens marqueurs
      // var weatherMarker = L.marker([lat, lon]).bindPopup(popupContent);
      // markersCluster.addLayer(weatherMarker);
      // map.addLayer(markersCluster);

      document.getElementById('result').innerHTML = popupContent; // Afficher les informations météo dans 'result'
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des données météo:', error);
    });
}

// Fonction pour rechercher manuellement la météo d'une ville par son nom
function getWeatherByName() {
  var cityName = document.getElementById('cityInput').value;
  fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(cityName)}&type=municipality&limit=1`)
    .then(response => response.json())
    .then(data => {
      if (data.features.length > 0) {
        const lat = data.features[0].geometry.coordinates[1];
        const lon = data.features[0].geometry.coordinates[0];
        getWeather(lat, lon);
      } else {
        console.error('Aucun résultat trouvé pour la ville:', cityName);
      }
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des coordonnées de la ville:', error);
    });
}