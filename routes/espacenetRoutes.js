const espacenetController = require("../controllers/espacenetController");

module.exports = (app) => {
  app.get("/esp", espacenetController.getKeyLink2);
  app.post("/rss2", espacenetController.saveRSSFeed2);
};
