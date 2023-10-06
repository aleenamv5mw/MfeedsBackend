const mongoose = require("mongoose");
const uuid = require("uuid");

const rssFeedSchema = new mongoose.Schema({
  rssId: {
    type: String,
    default: uuid.v4, // generate a unique ID for rssId
    required: true,
  },
  xml: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  rssLink: {
    type: String,
    required: true,
  },
});

const RSSFeed = mongoose.model("RSSFeed", rssFeedSchema);

module.exports = { RSSFeed };
