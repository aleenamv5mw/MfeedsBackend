const userController = require("../controllers/userController");
/* const fastify = require("fastify")();
const app = fastify({ logger: require("pino")() }); */

module.exports = (app) => {
  //# create
  app.post("/api/users", userController.create);

  //#get the list of users
  app.get("/api/users", userController.fetch);

  //#get a single note
  app.get("/api/users/:id", userController.get);

  /*  //#update a note
  app.put("/api/support_list/:id", supportController.update);

  //#delete a note
  app.delete("/api/support_list/:id", supportController.delete); */

  // Log all requests and responses for this route
  //   app.use("/api/notes", app.logRequest);
};
