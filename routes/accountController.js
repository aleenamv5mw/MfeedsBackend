const fastify = require("fastify")();
const pino = require("pino")();
const { Parser } = require("json2csv");
const Account = require("../models/Account");
const Log = require("../models/log");
const logger = pino.child({ component: "Account" });
const { v4: uuidv4 } = require("uuid");

const Fuse = require("fuse.js");

module.exports = {
  // create account
  create: async (request, reply) => {
    try {
      const account = request.body;
      const accountId = account.accountId;

      // Check if the accountId already exists in the database
      const existingAccount = await Account.findOne({ accountId });

      if (existingAccount) {
        // Account with the same accountId already exists
        reply.code(409).send({ error: "Account ID already exists" });
      } else {
        // Account ID is unique, create the account
        const newAccount = await Account.create(account);

        // Store the log in MongoDB
        const log = new Log({ action: "create", account: newAccount });
        await log.save();

        reply.code(201).send(newAccount);
      }
    } catch (e) {
      logger.error({ action: "create", error: e });
      reply.code(500).send(e);
    }
  },

  // fetch accounts

  fetch: async (request, reply) => {
    try {
      const searchQuery = request.query.q || "";
      let accounts;

      if (searchQuery) {
        const searchNumber = parseInt(searchQuery);
        if (isNaN(searchNumber)) {
          // search for string values with fuzzy search using Fuse.js
          const options = {
            keys: ["accountName", "region", "salesRepresentative", "email"],
            threshold: 0.3,
            ignoreLocation: true,
            includeMatches: true,
            minMatchCharLength: 2,
          };
          const fuse = new Fuse(await Account.find({}), options);
          accounts = fuse.search(searchQuery);
          accounts = accounts.map((account) => account.item);
        } else {
          // search for number value
          accounts = await Account.find({ accountId: searchNumber });
        }
      } else {
        accounts = await Account.find({});
      }

      logger.info({ action: "fetch", count: accounts.length });

      reply.code(200).send(accounts);
    } catch (e) {
      logger.error({ action: "fetch", error: e });
      reply.code(500).send(e);
    }
  },

  // get a single account
  get: async (request, reply) => {
    try {
      const id = request.params.id;
      const account = await Account.findById(id);

      logger.info({ action: "get", accounts: account });

      reply.code(200).send(account);
    } catch (e) {
      logger.error({ action: "get", error: e });
      reply.code(500).send(e);
    }
  },

  // update an account
  update: async (request, reply) => {
    try {
      const id = request.params.id;
      const updates = request.body;
      const updatedAccountId = updates.accountId;

      const existingAccount = await Account.findOne({
        accountId: updatedAccountId,
      });

      if (existingAccount && existingAccount._id.toString() !== id) {
        reply.code(409).send({ error: "Account ID already exists" });
      } else {
        await Account.findByIdAndUpdate(id, updates);
        const accountToUpdate = await Account.findById(id);

        reply.code(200).send(accountToUpdate);
      }
    } catch (e) {
      logger.error({ action: "update", error: e });
      reply.code(500).send(e);
    }
  },

  // delete an account
  delete: async (request, reply) => {
    try {
      const id = request.params.id;
      const accountToDelete = await Account.findById(id);

      await Account.findByIdAndDelete(id);
      //store the log in Mongo DB
      const log = new Log({ action: "delete", account: accountToDelete });
      await log.save();

      reply.code(200).send({ data: accountToDelete });
    } catch (e) {
      logger.error({ action: "delete", error: e });
      reply.code(500).send(e);
    }
  },

  deleteMany: async (request, reply) => {
    try {
      const { ids } = request.body;

      const accountsToDelete = await Account.find({ _id: { $in: ids } });

      const deleteResult = await Account.deleteMany({ _id: { $in: ids } });

      // Store the logs in MongoDB for each account deletion
      for (const account of accountsToDelete) {
        const log = new Log({ action: "delete", account });
        await log.save();
      }

      console.log("Account IDs to delete:", ids);
      console.log("Accounts to delete:", accountsToDelete);
      console.log("Delete result:", deleteResult);

      reply.code(200).send({ data: accountsToDelete });
    } catch (error) {
      console.error("Error deleting accounts:", error);
      reply.code(500).send({ error: "Failed to delete accounts" });
    }
  },

  exportMany: async (request, reply) => {
    try {
      const accountIds = request.query.ids;
      if (!accountIds) {
        throw new Error("No account ids specified");
      }

      const accounts = await Account.find({
        _id: { $in: accountIds.split(",") },
      });

      // check if accounts array is empty
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // convert the data to CSV format
      const fields = ["accountName", "region", "salesRepresentative", "email"];
      const json2csvParser = new Parser({ fields, header: true });
      const csv = json2csvParser.parse(accounts);

      // set the content type to CSV
      reply.header("Content-Type", "text/csv");
      reply.send(csv);
    } catch (e) {
      logger.error({ action: "exportMany", error: e });
      reply.code(500).send(e);
    }
  },
};
