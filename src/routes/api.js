'use strict';

// const superagent = require('superagent');
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

const simpleApiRoutes = {
  '/api/volcanoesByRegion': getVolcanoesByRegion,
  '/api/depthCorrelationMonth': getDepthCorrelationMonth,
  '/api/depthCorrelationWeek': getDepthCorrelationWeek,
  '/api/depthCorrelation': getDepthCorrelationDay,
  '/api/strongestEarthquakeMonth': getStrongestEarthquakeMonth,
  '/api/strongestEarthquakeWeek': getStrongestEarthquakeWeek,
  '/api/strongestEarthquake': getStrongestEarthquakeDay,
  '/api/hourlyEarthquakes': getHourlyEarthquakes
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
module.exports = router;
