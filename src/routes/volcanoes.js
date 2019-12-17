'use strict';

const superagent = require('superagent');

const getVolcanoes = callback => {
  superagent
    .get(
      'https://data.humdata.org/dataset/a60ac839-920d-435a-bf7d-25855602699d/resource/7234d067-2d74-449a-9c61-22ae6d98d928/download/volcano.json'
    )
    .end((apiError, apiResponse) => {
      if (apiError) {
        callback(apiError, null);
        return;
      }

      const jsonObj = apiResponse.body.features;
      callback(null, jsonObj);
    });
};

function getVolcanoesByRegion(callback) {
  getVolcanoes((apiError, volcanoesJson) => {
    if (apiError) {
      callback(apiError, null);
      return;
    }
    const volcanoData = {};
    for (const entry of volcanoesJson) {
      if (entry.properties.Region in volcanoData) {
        volcanoData[entry.properties.Region] += 1;
      } else {
        volcanoData[entry.properties.Region] = 1;
      }
    }
    callback(null, volcanoData);
  });
}

module.exports = {
  getVolcanoesByRegion
};
