const url = require("url");
const axios = require("axios");


const { RSSFeed } = require("../models/rssFeed");
const pino = require("pino");
const cron = require("node-cron");


const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});


async function getKeyLink2(request, reply) {
  const queryObject = url.parse(request.url, true).query;
  const esp = queryObject.esp;
  if (esp) {
    const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:5000/esp"; // Default to localhost if not provided
    const espUrl = `${baseUrl}?esp = ${esp} `;
    const originalUrl = `https://fi.espacenet.com/websyndication/searchFeed?DB=EPODOC&ST=singleline&compact=false&locale=fi_FI&output=json&query=${esp}`;


    logger.info(`Fetching original RSS feed from ${originalUrl}`);


    const response = await axios.get(originalUrl);
    const content = await response.data;
    const modifiedUrl = `${baseUrl}?esp=${esp}`;


    logger.debug(`Original RSS feed content: ${content}`);


    reply.send({ modifiedUrl, content });
  } else {
    const errorMessage = "Missing esp parameter";
    logger.error(errorMessage);
    reply.status(400).send(errorMessage);
  }
}


async function saveRSSFeed2(request, reply) {
  try {
    const { xml, rssLink } = request.body;


    logger.info(`Received request to save RSS feed from ${rssLink}`);


    const newFeed = new RSSFeed({
      xml,
      rssLink,
    });


    const savedFeed = await newFeed.save();


    logger.info(`Saved RSS feed with ID ${savedFeed._id}`);


    reply.send(savedFeed);


    // After saving the RSS feed, trigger the update using the provided rssLink
    updateRSSFeed2(rssLink);
  } catch (err) {
    logger.error(err);
    reply.status(500).send(err);
  }
}


async function updateRSSFeed2(rssLink) {
  try {
    // Find the RSS feed based on the provided rssLink
    const existingFeed = await RSSFeed.findOne({ rssLink });


    if (existingFeed) {
      // Extract the search term (esp) from the rssLink
      const urlParts = url.parse(existingFeed.rssLink, true);
      const esp = urlParts.query.esp;


      // Construct the URL for fetching new content based on the search term (esp)
      const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:5000/esp";
      const originalUrl = `https://fi.espacenet.com/websyndication/searchFeed?DB=EPODOC&ST=singleline&compact=false&locale=fi_FI&output=json&query=${esp}`;


      logger.info(`Fetching updated content for RSS feed from ${originalUrl}`);


      const response = await axios.get(originalUrl);
      const content = await response.data;


      // Update the RSS feed with the new content
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


// Schedule the cron job to run every 10 minutes for updating all RSS feeds
cron.schedule('* * 1 * * *', async () => {
  try {
    // Find all saved RSS feeds and trigger updates
    //const rssFeeds = await RSSFeed.find();
    const rssFeeds = await RSSFeed.find().allowDiskUse(true);

    for (const feed of rssFeeds) {
      await updateRSSFeed2(feed.rssLink);
    }
  } catch (err) {
    logger.error(`Cron job error: ${err.message}`);
  }
});


module.exports = {
  getKeyLink2,
  saveRSSFeed2,
};




