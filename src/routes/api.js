'use strict';

const superagent = require('superagent');
const xmlParser = require('fast-xml-parser');
const express = require('express');
const router = express.Router();
const hourMs = 1000 * 60 * 60;

// These are for the cached data
let lastGetEarthquakesResult = null;
let lastGetEarthquakesResultTime = 0;

// let lastWeatherAlertsResult = null;
// let lastWeatherAlertsResultTime = 0;

// const getWeatherAlerts = callback => {
//   // If it's within the last minute we use our cached data
//   if (lastWeatherAlertsResultTime + 60000 > Date.now()) {
//     callback(null, lastWeatherAlertsResult);
//     return;
//   }

//   superagent
//     .get('http://alerts.weather.gov/cap/us.php?x=0')
//     .end((apiError, apiResponse) => {
//       if (apiError) {
//         callback(apiError, null);
//         return;
//       }

//       const xmlBody = apiResponse.body.toString();
//       const jsonObj = xmlParser.parse(xmlBody);
//       // Update cache data
//       lastWeatherAlertsResult = jsonObj;
//       lastWeatherAlertsResultTime = Date.now();
//       callback(null, jsonObj);
//     });
// };

const getEarthquakes = callback => {
  // If it's within the last minute we use our cached data
  if (lastGetEarthquakesResultTime + 60000 > Date.now()) {
    callback(null, lastGetEarthquakesResult);
    return;
  }

  superagent
    .get(
      'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom'
    )
    .end((apiError, apiResponse) => {
      if (apiError) {
        callback(apiError, null);
        return;
      }

      const xmlBody = apiResponse.body.toString();
      const jsonObj = xmlParser.parse(xmlBody);
      // Update cache data
      lastGetEarthquakesResult = jsonObj;
      lastGetEarthquakesResultTime = Date.now();
      callback(null, jsonObj);
    });
};

let lastGetEarthquakesWeekResult = null;
let lastGetEarthquakesWeekResultTime = 0;

const getEarthquakesWeek = callback => {
  // If it's within the last minute we use our cached data
  if (lastGetEarthquakesWeekResultTime + 60000 > Date.now()) {
    callback(null, lastGetEarthquakesWeekResult);
    return;
  }

  superagent
    .get(
      'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.atom'
    )
    .end((apiError, apiResponse) => {
      if (apiError) {
        callback(apiError, null);
        return;
      }

      const xmlBody = apiResponse.body.toString();
      const jsonObj = xmlParser.parse(xmlBody);
      // Update cache data
      lastGetEarthquakesWeekResult = jsonObj;
      lastGetEarthquakesWeekResultTime = Date.now();
      callback(null, jsonObj);
    });
};

function getHourlyEarthquakes(callback) {
  getEarthquakes((apiError, earthquakesJson) => {
    if (apiError) {
      callback(apiError, null);
      return;
    }

    const countsPerHour = {};
    for (const entry of earthquakesJson.feed.entry) {
      // Get when the earthquake happened in milliseconds
      const whenMs = new Date(entry.updated).getTime();

      // Round the when down to the nearest hour
      const hour = whenMs - (whenMs % hourMs);

      if (hour in countsPerHour) {
        // Add 1 earthqake to the hour bucket
        countsPerHour[hour] += 1;
      } else {
        // It's not there so it's the first earthquake that hour
        countsPerHour[hour] = 1;
      }
    }

    // Since highcharts needs a sorted array of arrays
    const series = Object.entries(countsPerHour).sort((a, b) => a[0] - b[0]);
    callback(null, series);
  });
}

function getStrongestEarthquake(callback) {
  getEarthquakes((apiError, earthquakesJson) => {
    if (apiError) {
      callback(apiError, null);
      return;
    }

    let strongestEarthquake = 0;
    let strongestLocation = '';

    for (const entry of earthquakesJson.feed.entry) {
      const strengthMatch = entry.title.match(/M ([0-9.]+) /);
      if (strengthMatch === null || strengthMatch.length < 2) {
        console.log('This is bad:', entry.title);
        continue;
      }
      const strength = Number.parseFloat(strengthMatch[1]);
      if (strength > strongestEarthquake) {
        strongestEarthquake = strength;
        strongestLocation = entry.title.match(/ - (.+)/)[1];
      }
    }

    callback(null, { strongestEarthquake, strongestLocation });
  });
}

function getStrongestEarthquakeWeek(callback) {
  getEarthquakesWeek((apiError, earthquakesJson) => {
    if (apiError) {
      callback(apiError, null);
      return;
    }

    let strongestEarthquake = 0;
    let strongestLocation = '';

    for (const entry of earthquakesJson.feed.entry) {
      const strengthMatch = entry.title.match(/M ([0-9.]+) /);
      if (strengthMatch === null || strengthMatch.length < 2) {
        console.log('This is bad:', entry.title);
        continue;
      }
      const strength = Number.parseFloat(strengthMatch[1]);
      if (strength > strongestEarthquake) {
        strongestEarthquake = strength;
        strongestLocation = entry.title.match(/ - (.+)/)[1];
      }
    }

    callback(null, { strongestEarthquake, strongestLocation });
  });
}

function getDepthCorrelation(callback) {
  getEarthquakes((apiError, earthquakesJson) => {
    if (apiError) {
      callback(apiError, null);
      return;
    }

    const series = [];

    for (const entry of earthquakesJson.feed.entry) {
      const strengthMatch = entry.title.match(/M ([0-9.]+) /);
      if (strengthMatch === null || strengthMatch.length < 2) {
        console.log('This is bad:', entry.title);
        continue;
      }
      const strength = Number.parseFloat(strengthMatch[1]);
      const depth = Number.parseFloat(entry.summary.match(/([0-9.]+) km/)[1]);

      series.push([strength, depth]);
    }

    callback(null, { series });
  });
}

router.get('/api/hourlyEarthquakes', (request, response) => {
  getHourlyEarthquakes((apiError, earthquakesJson) => {
    // If we had an error return st atus 500 and the error and log
    if (apiError) {
      console.log('Api error: ', apiError);
      response
        .status(500)
        .json(apiError)
        .end();
      return;
    }
    response.status(200).json(earthquakesJson);
  });
});

router.get('/api/strongestEarthquake', (request, response) => {
  getStrongestEarthquake((apiError, earthquakesJson) => {
    // If we had an error return st atus 500 and the error and log
    if (apiError) {
      console.log('Api error: ', apiError);
      response
        .status(500)
        .json(apiError)
        .end();
      return;
    }
    response.status(200).json(earthquakesJson);
  });
});

router.get('/api/strongestEarthquakeWeek', (request, response) => {
  getStrongestEarthquakeWeek((apiError, earthquakesJson) => {
    // If we had an error return st atus 500 and the error and log
    if (apiError) {
      console.log('Api error: ', apiError);
      response
        .status(500)
        .json(apiError)
        .end();
      return;
    }
    response.status(200).json(earthquakesJson);
  });
});

router.get('/api/depthCorrelation', (request, response) => {
  getDepthCorrelation((apiError, earthquakesJson) => {
    // If we had an error return status 500 and the error and log
    if (apiError) {
      console.log('Api error: ', apiError);
      response
        .status(500)
        .json(apiError)
        .end();
      return;
    }
    response.status(200).json(earthquakesJson);
  });
});

// router.get('/api/weatherAlertsTest', (request, response) => {
//   getWeatherAlerts((apiError, weatherJson) => {
//     // If we had an error return status 500 and the error and log
//     if (apiError) {
//       console.log('Api error: ', apiError);
//       response
//         .status(500)
//         .json(apiError)
//         .end();
//       return;
//     }
//     response.status(200).json(weatherJson);
//   });
// });

module.exports = router;
