const url = require("url");
const fetch = require("node-fetch");
const { RSSFeed } = require("../models/rssFeed");
const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

async function getKeyLink2(request, reply) {
  const queryObject = url.parse(request.url, true).query;
  const esp = queryObject.esp;
  if (esp) {
    const baseUrl = "http://localhost:5000/esp";
    const espUrl = `${baseUrl}?esp=${esp}`;
    const originalUrl = `https://fi.espacenet.com/websyndication/searchFeed?DB=EPODOC&ST=singleline&compact=false&locale=fi_FI&output=json&query=${esp}`;

    logger.info(`Fetching original RSS feed from ${originalUrl}`);

    const response = await fetch(originalUrl);
    const content = await response.text();
    const modifiedUrl = `http://localhost:5000/esp?esp=${esp}`;

    logger.debug(`Original RSS feed content: ${content}`);

    reply.send({ modifiedUrl, content });
  } else {
    const errorMessage = "Missing key parameter";
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
  } catch (err) {
    logger.error(err);
    reply.status(500).send(err);
  }
}

module.exports = {
  getKeyLink2,
  saveRSSFeed2,
};
