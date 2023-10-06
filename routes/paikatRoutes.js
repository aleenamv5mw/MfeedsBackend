const paikatController = require("../controllers/paikatController");

module.exports = (app) => {
  app.get("/key", paikatController.getKeyLink);
  app.post("/rss", paikatController.saveRSSFeed);
};
