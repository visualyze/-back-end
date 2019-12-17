getLatLong(request, response) {
  const { config } = this.props;
  const urlToVisit = `https://maps.googleapis.com/maps/api/geocode/json?address=${config.city}&key=AIzaSyAkHx7LRhOcZalVqUBZPsIbJ4gisqT8yWY`;
  superagent
    .get(urlToVisit)
    .then(responseFromSuper => {
      const geoData = responseFromSuper.body;
      console.log('this is geodata', geoData);
      const specificGeoData = geoData.results[0];
      const newLocation = [
        specificGeoData.geometry.location.lat,
        specificGeoData.geometry.location.lng
      ];
      response.send(newLocation);
    })
    .catch(error => {
      response.status(500).send(error.message);
      console.error(error);
    });
}