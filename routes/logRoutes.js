const logsController = require("../controllers/logsController.js");

module.exports = (app) => {
  //#get the list of logs
  app.get("/api/logs", logsController.fetch);

  //#get a single log
  app.get("/api/logs/:id", logsController.get);

  //#delete a log
  app.delete("/api/logs/:id", logsController.delete);

  // Log all requests and responses for this route
  //   app.use("/api/notes", app.logRequest);
};
