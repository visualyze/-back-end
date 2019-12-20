const superagent = require('superagent');
const xmlParser = require('fast-xml-parser');
const minuteMs = 1000 * 60;

const url = 'https://news.yahoo.com/rss/mostviewed';

var getRssFeedCache = {};
const cacheKey = 'OneRss';
const getRssFeed = (callback) => {
  // If it's within the last minute we use our cached data

  if (
    cacheKey in getRssFeedCache &&
    getRssFeedCache[cacheKey].time + 60000 > Date.now()
  ) {
    callback(null, getRssFeedCache[cacheKey].result);
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
    getRssFeedCache[cacheKey] = {};
    getRssFeedCache[cacheKey].result = jsonObj.rss.channel.item;
    getRssFeedCache[cacheKey].time = Date.now;
    // console.log('rss feed', jsonObj);
    callback(null, getRssFeedCache[cacheKey].result);
  });
};

module.exports = getRssFeed;
