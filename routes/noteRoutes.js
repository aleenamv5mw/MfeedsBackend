const notesController = require("../controllers/notesController");

module.exports = (app) => {
  /*  //# create a note
  app.post("/api/notes", notesController.create); */

  //#get the list of saved notes
  app.get("/api/rssfeeds", notesController.fetch);

  //#get a single note
  app.get("/api/rssfeeds/:id", notesController.get);

  //#update a note
  // app.put("/api/notes/:id", notesController.update);

  //#delete a note
  app.delete("/api/rssfeeds/:id", notesController.delete);

  // Log all requests and responses for this route
  //   app.use("/api/notes", app.logRequest);
};
