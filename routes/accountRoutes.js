const accountController = require("./accountController");

module.exports = (app) => {
  app.get("/", async (request, reply) => {
    return { message: "Hello, world!" };
  });
  // create account
  app.post("/api/accounts", accountController.create);

  // get the list of accounts
  app.get("/api/accounts", accountController.fetch);

  // get a single account
  app.get("/api/accounts/:id", accountController.get);

  // update account
  app.put("/api/accounts/:id", accountController.update);

  // delete account
  app.delete("/api/accounts/:id", accountController.delete);
  //delete many
  app.delete("/api/accounts", accountController.deleteMany);

  //export many
  app.get("/api/accounts/export", accountController.exportMany);
};
