'use strict';

const superagent = require('superagent');
const xmlParser = require('fast-xml-parser');
const hourMs = 1000 * 60 * 60;

var getEarthquakesCache = {};
const getEarthquakes = (callback, url) => {
  // If it's within the last minute we use our cached data

  if (
    url in getEarthquakesCache &&
    getEarthquakesCache[url].time + 60000 > Date.now()
  ) {
    callback(null, getEarthquakesCache[url].result);
    return;
  }

  superagent.get(url).end((apiError, apiResponse) => {
    if (apiError) {
      callback(apiError, null);
      return;
    }

    const xmlBody = apiResponse.body.toString();
    const jsonObj = xmlParser.parse(xmlBody);
    // Update cache data
    getEarthquakesCache[url] = {};
    getEarthquakesCache[url].result = jsonObj;
    getEarthquakesCache[url].time = Date.now;
    callback(null, jsonObj);
  });
};

const getEarthquakesDay = callback => {
  getEarthquakes(
    callback,
    'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom',
  );
};

const getEarthquakesWeek = callback => {
  getEarthquakes(
    callback,
    'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.atom',
  );
};

const getEarthquakesMonth = callback => {
  getEarthquakes(
    callback,
    'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.atom',
  );
};

function getHourlyEarthquakes(callback) {
  getEarthquakesDay((apiError, earthquakesJson) => {
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
        // Add 1 earthquake to the hour bucket
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

function getStrongestEarthquake(callback, getter) {
  getter((apiError, earthquakesJson) => {
    if (apiError) {
      callback(apiError, null);
      return;
    }

    let strongestEarthquake = 0;
    let strongestLocation = '';

    for (const entry of earthquakesJson.feed.entry) {
      const strengthMatch = entry.title.match(/M ([0-9.]+) /);
      if (strengthMatch === null || strengthMatch.length < 2) {
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

function getDepthCorrelation(callback, getter) {
  getter((apiError, earthquakesJson) => {
    if (apiError) {
      callback(apiError, null);
      return;
    }

    const series = [];

    for (const entry of earthquakesJson.feed.entry) {
      const strengthMatch = entry.title.match(/M ([0-9.]+) /);
      if (strengthMatch === null || strengthMatch.length < 2) {
        continue;
      }
      const strength = Number.parseFloat(strengthMatch[1]);
      const depth = Number.parseFloat(entry.summary.match(/([0-9.]+) km/)[1]);

      series.push([strength, depth]);
    }

    callback(null, { series });
  });
}

function getStrongestEarthquakeDay(callback) {
  getStrongestEarthquake(callback, getEarthquakesDay);
}
function getStrongestEarthquakeWeek(callback) {
  getStrongestEarthquake(callback, getEarthquakesWeek);
}
function getStrongestEarthquakeMonth(callback) {
  getStrongestEarthquake(callback, getEarthquakesMonth);
}

function getDepthCorrelationDay(callback) {
  getDepthCorrelation(callback, getEarthquakesDay);
}
function getDepthCorrelationWeek(callback) {
  getDepthCorrelation(callback, getEarthquakesWeek);
}
function getDepthCorrelationMonth(callback) {
  getDepthCorrelation(callback, getEarthquakesMonth);
}

module.exports = {
  getDepthCorrelationMonth,
  getDepthCorrelationWeek,
  getDepthCorrelationDay,
  getStrongestEarthquakeMonth,
  getStrongestEarthquakeWeek,
  getStrongestEarthquakeDay,
  getHourlyEarthquakes,
};
