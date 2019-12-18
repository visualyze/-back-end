'use strict';

const superagent = require('superagent');
const express = require('express');
const router = express.Router();
const {
  getDepthCorrelationMonth,
  getDepthCorrelationWeek,
  getDepthCorrelationDay,
  getStrongestEarthquakeMonth,
  getStrongestEarthquakeWeek,
  getStrongestEarthquakeDay,
  getHourlyEarthquakes
} = require('./earthquakes.js');

const { getVolcanoesByRegion } = require('./volcanoes.js');

// const getLatLong = require('./weather.js');

const simpleApiRoutes = {
  '/api/volcanoesByRegion': getVolcanoesByRegion,
  '/api/depthCorrelationMonth': getDepthCorrelationMonth,
  '/api/depthCorrelationWeek': getDepthCorrelationWeek,
  '/api/depthCorrelation': getDepthCorrelationDay,
  '/api/strongestEarthquakeMonth': getStrongestEarthquakeMonth,
  '/api/strongestEarthquakeWeek': getStrongestEarthquakeWeek,
  '/api/strongestEarthquake': getStrongestEarthquakeDay,
  '/api/hourlyEarthquakes': getHourlyEarthquakes,
  // '/api/fetchLatLong': getLatLong,
};

function getLatLong(city, response) {
  const urlToVisit = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=AIzaSyAkHx7LRhOcZalVqUBZPsIbJ4gisqT8yWY`;
  superagent
    .get(urlToVisit)
    .then(responseFromSuper => {
      const geoData = responseFromSuper.body;
      // console.log('this is geodata', geoData);
      const specificGeoData = geoData.results[0];
      const newLocation = [
        specificGeoData.geometry.location.lat,
        specificGeoData.geometry.location.lng
      ];
      console.log('this is my newLocation data', newLocation);
      response.status(200).send(newLocation);
    })
    .catch(error => {
      response.status(500).send(error.message);
      console.error(error);
    });
}

function getWeatherHighLowData(lat, long, response) {
  const urlToVisit = `https://api.darksky.net/forecast/46da4fc4b81fdd5a3ad2a546858b7d24/${lat},${long}`;
  superagent
    .get(urlToVisit)
    .then(responseFromSuper => {
      console.log('this is my response from super', responseFromSuper.body.daily.data);
      response.status(200).send();
    })
    .catch(error => {
      response.status(500).send(error.message);
      console.error(error);
    });
}


router.get('/api/fetchLatLong', (request, response) => {
  getLatLong(request.query.city, response);
});

router.get('/api/fetchWeatherHighLow', (request, response) => {
  console.log('query data', request.query);
  let lat = Number.parseFloat(request.query.lat);
  let long = Number.parseFloat(request.query.long);
  console.log(lat, long);
  getWeatherHighLowData(lat, long, response);
  // getWeatherHighLow(request.query.latlong);
})




for (let routePath in simpleApiRoutes) {
  router.get(routePath, (request, response) => {
    simpleApiRoutes[routePath]((apiError, jsonObj) => {
      // If we had an error return status 500 and the error and log
      if (apiError) {
        console.log('Api error: ', apiError);
        response
          .status(500)
          .json(apiError)
          .end();
        return;
      }
      response.status(200).json(jsonObj);
    });
  });
}
module.exports = router;
