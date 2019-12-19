const superagent = require('superagent');

function getLatLong(query, request, response) {
  console.log('this is my query', query);
  console.log('this is my request', request);
  console.log('this is my request.body', request.body);
  const urlToVisit = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=AIzaSyAkHx7LRhOcZalVqUBZPsIbJ4gisqT8yWY`;
  superagent
    .get(urlToVisit)
    .then(responseFromSuper => {
      const geoData = responseFromSuper.body;
      // console.log('this is geodata', geoData);
      const specificGeoData = geoData.results[0];
      const newLocation = [
        specificGeoData.geometry.location.lat,
        specificGeoData.geometry.location.lng,
      ];
      console.log('this is my newLocation data', newLocation);
      response.send(newLocation);
    })
    .catch(error => {
      response.status(500).send(error.message);
      console.error(error);
    });
}

module.exports = getLatLong;
