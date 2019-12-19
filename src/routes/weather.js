const superagent = require('superagent');

const GEO_DATA = process.env.geodata;
const DARK_SKY = process.env.darksky;


function getLatLong(city, response) {
  const urlToVisit = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${GEO_DATA}`;
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
      response.status(200).send(newLocation);
    })
    .catch(error => {
      response.status(500).send(error.message);
      console.error(error);
    });
}

// TODO: When do we throw out old data?
var weatherDailyDataCache = {};

function getWeatherDailyData(lat, long, response) {
  const cacheKey = lat + '_' + long;
  if(cacheKey in weatherDailyDataCache && weatherDailyDataCache[cacheKey].time + (1000 * 60 * 60) > Date.now()){
    response.status(200).send(weatherDailyDataCache[cacheKey].data);
    return;
  }

  const urlToVisit = `https://api.darksky.net/forecast/${DARK_SKY}/${lat},${long}`;
  superagent
    .get(urlToVisit)
    .then(responseFromSuper => {
      weatherDailyDataCache[cacheKey] = {
        time: Date.now,
        data: responseFromSuper.body.daily.data,
      },
      response.status(200).send(responseFromSuper.body.daily.data);
    })
    .catch(error => {
      response.status(500).send(error.message);
      console.error(error);
    });
}

module.exports = {getLatLong, getWeatherDailyData};
