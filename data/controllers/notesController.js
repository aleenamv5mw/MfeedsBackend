const fastify = require("fastify")();
const pino = require("pino")();
const { RSSFeed } = require("../models/rssFeed"); // Make sure the path to the model is correct
console.log("RSSFeed model: ", RSSFeed); // Add this line to check if the model is being imported correctly

const Log = require("../models/log");
const logger = pino.child({ component: "Account" });
const Fuse = require("fuse.js");
module.exports = {
  fetch: async (request, reply) => {
    try {
      const { filter, range, sort } = request.query;

      const parsedFilter = JSON.parse(filter || "{}");
      const parsedRange = JSON.parse(range || "[0, 9]");
      const parsedSort = JSON.parse(sort || '["id", "ASC"]');

      const [sortBy, sortOrder] = parsedSort;

      const limit = parsedRange[1] - parsedRange[0] + 1;
      const offset = parsedRange[0];

      console.log("Fetching RSSFeeds"); // Add this line to check if the function is being executed

      const RSSFeeds = await RSSFeed.find(parsedFilter)
        .sort({ [sortBy]: sortOrder === "ASC" ? 1 : -1 })
        .skip(offset)
        .limit(limit);

      console.log("RSSFeeds: ", RSSFeeds); // Add this line to check if RSSFeeds is being populated correctly

      const totalCount = await RSSFeed.countDocuments(parsedFilter);

      reply
        .code(200)
        .header(
          "Content-Range",
          `notes ${offset}-${offset + limit - 1}/${totalCount}`
        )
        .send(RSSFeeds);
    } catch (e) {
      console.log("Error: ", e); // Add this line to check the error message
      reply.code(500).send(e);
    }
  },

  //#get a single note
  get: async (request, reply) => {
    try {
      const rssId = request.params.id;
      const rssfeed = await RSSFeed.findById(rssId);
      reply.code(200).send(note);
    } catch (e) {
      reply.code(500).send(e);
    }
  },

  //#update a note
  update: async (request, reply) => {
    try {
      const noteId = request.params.id;
      const updates = request.body;
      await Note.findByIdAndUpdate(noteId, updates);
      const noteToUpdate = await Note.findById(noteId);
      reply.code(200).send({ data: noteToUpdate });
    } catch (e) {
      reply.code(500).send(e);
    }
  },

  //#delete a note
  delete: async (request, reply) => {
    try {
      const rssId = request.params.id;
      const rssToDelete = await RSSFeed.findById(rssId);
      await RSSFeed.findByIdAndDelete(rssId);
      reply.code(200).send({ data: rssToDelete });
    } catch (e) {
      reply.code(500).send(e);
    }
  },
};
