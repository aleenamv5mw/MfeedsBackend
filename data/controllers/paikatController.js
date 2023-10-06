const pino = require("pino");
const logger = pino({ prettyPrint: true });

const url = require("url");
const fetch = require("node-fetch");
const { RSSFeed } = require("../models/rssFeed");

async function getKeyLink(request, reply) {
  try {
    const queryObject = url.parse(request.url, true).query;
    const key = queryObject.key;
    if (!key) {
      throw new Error("Missing key parameter");
    }
    const baseUrl = "http://localhost:5000/key";
    const keyUrl = `${baseUrl}?key=${key}`;
    const originalUrl = `https://paikat.te-palvelut.fi/tpt-api/v1/tyopaikat.rss?hakusana=${key}`;

    logger.info(`Fetching data from: ${originalUrl}`);
    const response = await fetch(originalUrl);
    const content = await response.text();
    logger.debug(`Received content from ${originalUrl}: ${content}`);
    const modifiedUrl = `http://localhost:5000/key?key=${key}`;
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

module.exports = {
  getKeyLink,
  saveRSSFeed,
};
