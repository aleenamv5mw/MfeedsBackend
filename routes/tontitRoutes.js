const {
  getSearchResultsT,
  getRSSFeedT,
  saveRSSFeedT,
  getSavedRSSFeedT,
  updateRSSFeedT,
} = require("../controllers/tontitController");
const tontitController = require("../controllers/tontitController.js");

module.exports = async (app, opts) => {
  //fetch listings

  app.get("/api/Tlistings", tontitController.fetch);
  app.get("/api/Tlistings/search", getSearchResultsT);
  app.get("/api/Tlistings/rss", getRSSFeedT);
  app.post("/api/Tlistings/rss/:rssId", saveRSSFeedT);
  app.get("/api/Tlistings/rss/saved/:rssId", getSavedRSSFeedT);
  app.put("/api/Tlistings/rss/update/:rssId", updateRSSFeedT);
};
