'use strict';

const express = require('express');
const router = express.Router();
require('dotenv').config();


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

const { getLatLong, getWeatherDailyData } = require('./weather.js');

const getRssFeed = require('./rssFeed.js');


const simpleApiRoutes = {
  '/api/volcanoesByRegion': getVolcanoesByRegion,
  '/api/depthCorrelationMonth': getDepthCorrelationMonth,
  '/api/depthCorrelationWeek': getDepthCorrelationWeek,
  '/api/depthCorrelation': getDepthCorrelationDay,
  '/api/strongestEarthquakeMonth': getStrongestEarthquakeMonth,
  '/api/strongestEarthquakeWeek': getStrongestEarthquakeWeek,
  '/api/strongestEarthquake': getStrongestEarthquakeDay,
  '/api/hourlyEarthquakes': getHourlyEarthquakes,
  '/api/rssFeed': getRssFeed,
};

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

router.get('/api/fetchLatLong', (request, response) => {
  getLatLong(request.query.city, response);
});

router.get('/api/fetchWeatherHighLow', (request, response) => {
  let lat = Number.parseFloat(request.query.lat);
  let long = Number.parseFloat(request.query.long);
  getWeatherDailyData(lat, long, response);
  // getWeatherHighLow(request.query.latlong);
})


module.exports = router;
