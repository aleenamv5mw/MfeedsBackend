const hlistingController = require("../controllers/hlistingController");

module.exports = (app) => {
  app.get("/api/hlistings", hlistingController.fetch);
};
