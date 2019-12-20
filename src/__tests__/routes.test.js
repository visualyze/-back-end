'use strict';

const server = require('../app.js');
const supertest = require('supertest');
const mockRequest = supertest(server.app);

const {
  getDepthCorrelationMonth,
  getDepthCorrelationWeek,
  getDepthCorrelationDay,
  getStrongestEarthquakeMonth,
  getStrongestEarthquakeWeek,
  getStrongestEarthquakeDay,
  getHourlyEarthquakes,
} = require('../routes/earthquakes.js');

const {
  getVolcanoesByRegion,
} = require('../routes/volcanoes.js');

const {
  getLatLong,
  getWeatherDailyData,
} = require('../routes/weather.js');

const getRssFeed = require('../routes/rssFeed.js');

const simpleRouteTests = {
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

describe('Test the api routes', () => {

  for (let routeName in simpleRouteTests) {

    it(`Route ${routeName} should return a result `, (done) => {
      const callback = (e, data) => {
        expect(e).toBeNull();
        expect(data).toBeDefined();
        done();
      };
      simpleRouteTests[routeName](callback);
    });
  }

  it('Get correct coordinates from api/fetchLatLong?city=Seattle', (done) => {
    mockRequest
      .get('/api/fetchLatLong?city=Seattle')
      .then(results => {
        expect(results.status).toBe(200);
        expect(results.body).toEqual([47.6062095, -122.3320708]);
        done();
      });
  });

  it('Get 500 error due to bad city from api/fetchLatLong?city=zzzzzzzz', (done) => {
    mockRequest
      .get('/api/fetchLatLong?city=zzzzzzzz')
      .then(results => {
        expect(results.status).toBe(500);
        expect(results.body).toEqual({});
        done();
      });
  });

  it('Get 8 days of weather data from api/fetchWeatherHighLow?lat=47.6062095&long=-122.3320708', (done) => {
    mockRequest
      .get('/api/fetchWeatherHighLow?lat=47.6062095&long=-122.3320708')
      .then(results => {
        expect(results.status).toBe(200);
        expect(results.body.length).toEqual(8);
        done();
      });

  });

  it('Get 500 error from api/fetchWeatherHighLow?lat=700.6062095&long=-122.3320708', (done) => {
    mockRequest
      .get('/api/fetchWeatherHighLow?lat=700.6062095&long=-122.3320708')
      .then(results => {
        expect(results.status).toBe(500);
        expect(results.body).toEqual({});
        done();
      });
  });
});
