const pino = require("pino");
const logger = pino({ prettyPrint: true });
// Import required modules
const cron = require('node-cron');

const url = require("url");
const axios = require("axios");
const { RSSFeed } = require("../models/rssFeed");

async function getKeyLink(request, reply) {
  try {
    const queryObject = url.parse(request.url, true).query;
    const key = queryObject.key;
    if (!key) {
      throw new Error("Missing key parameter");
    }
    // set the BASE_URL environment variable in your deployment environment
    const baseUrl = process.env.BASE_URL || "http://localhost:5000/key";
    const keyUrl = `${baseUrl}?key=${key}`;
    const originalUrl = `https://paikat.te-palvelut.fi/tpt-api/v1/tyopaikat.rss?hakusana=${key}`;

    logger.info(`Fetching data from: ${originalUrl}`);

    const response = await axios.get(originalUrl);
    const content = await response.data;
    logger.debug(`Received content from ${originalUrl}: ${content}`);

    // Use the same dynamic baseUrl to construct the modifiedUrl
    const modifiedUrl = `${baseUrl}?key=${key}`;
    logger.debug(`Modified URL: ${modifiedUrl}`);

    reply.send({ modifiedUrl, content });
  } catch (err) {
    logger.error(err.message);
    reply.status(400).send(err.message);
  }
}

async function saveRSSFeed(request, reply) {
  try {
    const { xml, rssLink } = request.body;

    const newFeed = new RSSFeed({
      xml,
      rssLink,
    });

    logger.debug(`New RSS feed: ${JSON.stringify(newFeed)}`);
    const savedFeed = await newFeed.save();

    logger.info(`New RSS feed saved with id ${savedFeed._id}`);
    reply.send(savedFeed);
  } catch (err) {
    logger.error(err.message);
    reply.status(500).send(err.message);
  }
}

// Define a function to update the content of the RSS feed based on a search term and workflow
async function updateRSSFeed(key, rssLink) {
  try {
    // Construct the URL for fetching new content based on the search term (key)
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000/key';
    const originalUrl = `https://paikat.te-palvelut.fi/tpt-api/v1/tyopaikat.rss?hakusana=${key}`;
    const response = await axios.get(originalUrl);
    const content = await response.data;

    // Update the RSS feed with the new content
    const existingFeed = await RSSFeed.findOne({ rssLink });
    if (existingFeed) {
      existingFeed.xml = content;
      await existingFeed.save();
      logger.info(`Updated RSS feed with link ${rssLink}`);
    } else {
      logger.error(`RSS feed not found for link ${rssLink}`);
    }
  } catch (err) {
    logger.error(`Error updating RSS feed: ${err.message}`);
  }
}

// Schedule the cron job to run every 10 minutes
//cron.schedule('*/10 * * * *', async () => {
cron.schedule('* * 1 * * *', async () => {
  try {
    // Replace 'YOUR_SEARCH_TERM' and 'YOUR_RSS_LINK' with the appropriate values
    const queryObject = url.parse(request.url, true).query;
    const key = queryObject.key;
    if (!key) {
      throw new Error("Missing key parameter");

    }
  }
  catch (err) {
    logger.error(`Cron job error: ${err.message}`);
  }
  await updateRSSFeed(key, rssLink);

});


module.exports = {
  getKeyLink,
  saveRSSFeed,
  updateRSSFeed
};

