const subController = require("./subController");

module.exports = (app) => {
  // create subscription
  app.post("/api/subscriptions", subController.create);

  //  list of subscriptions
  app.get("/api/subscriptions", subController.fetch);

  // get a single subscription
  app.get("/api/subscriptions/:id", subController.get);

  // update asubscription
  app.put("/api/subscriptions/:id", subController.update);

  // delete subscription
  app.delete("/api/subscriptions/:id", subController.delete);
};
