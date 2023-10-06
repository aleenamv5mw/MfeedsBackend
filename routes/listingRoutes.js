const {
  getSearchResults,
  getRSSFeed,
  saverssFeed,
  getSavedRSSFeed,
  updateRSSFeed,
} = require("../controllers/listingController");
const listingController = require("../controllers/listingController.js");

module.exports = async (app, opts) => {
  //fetch listings

  app.get("/api/listings", listingController.fetch);
  app.get("/api/listings/search", listingController.getSearchResults);
  app.get("/api/listings/rss", listingController.getRSSFeed);
  app.post("/api/listings/rss/:rssId", listingController.saverssFeed);
  app.get("/api/listings/rss/saved/:rssId", listingController.getSavedRSSFeed);
  app.put("/api/listings/rss/update/:rssId", listingController.updateRSSFeed);
};
