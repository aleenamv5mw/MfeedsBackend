const fastify = require("fastify")();
const pino = require("pino")();
const Fuse = require("fuse.js");
const Subscription = require("../models/Subscription");
const Log = require("../models/log");
const Account = require("../models/Account");
const cron = require("node-cron");

const logger = pino.child({ component: "Subscription" });
const nodemailer = require("nodemailer");

// create nodemailer transporter with email credentials
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "johnmayer5230418@gmail.com",
    pass: "jzakinchpfsgshtp",
  },
});

module.exports = {
  //# create a subscription
  create: async (request, reply) => {
    try {
      const subscription = request.body;
      const newSubscription = await Subscription.create(subscription);

      // Store the log in MongoDB
      const log = new Log({ action: "create", subscription: newSubscription });
      await log.save();
      reply.code(201).send(newSubscription);
    } catch (e) {
      logger.error({ action: "create", error: e });

      reply.code(500).send(e);
    }
  },

  // add the function to the fetch method
  fetch: async (request, reply) => {
    try {
      const searchQuery = request.query.q || "";
      let subscriptions;

      if (searchQuery) {
        const searchNumber = parseInt(searchQuery);
        if (isNaN(searchNumber)) {
          // search for string values with fuzzy search using Fuse.js
          const options = {
            keys: [
              "accountName",
              "startdate",
              "endDate",
              "subscriptionType",
              "status",
            ],
            threshold: 0.3,
            ignoreLocation: true,
            includeMatches: true,
            minMatchCharLength: 2,
          };
          const fuse = new Fuse(await Subscription.find({}), options);
          subscriptions = fuse.search(searchQuery);
          subscriptions = subscriptions.map(
            (subscription) => subscription.item
          );
        } else {
          subscriptions = await Subscription.find({
            $or: [{ accountId: searchNumber }, { orderId: searchNumber }],
          });
        }
      } else {
        subscriptions = await Subscription.find({});
      }

      logger.info({ action: "fetch", count: subscriptions.length });

      reply.code(200).send(subscriptions);
    } catch (e) {
      logger.error({ action: "fetch", error: e });
      reply.code(500).send(e);
    }
  },

  //#get a single subscription
  get: async (request, reply) => {
    try {
      const subscriptionId = request.params.id;
      const subscription = await Subscription.findById(subscriptionId);
      reply.code(200).send(subscription);
    } catch (e) {
      reply.code(500).send(e);
    }
  },

  //#update a subscription
  update: async (request, reply) => {
    try {
      const id = request.params.id;
      const updates = request.body;

      // Get the current subscription
      const subscriptionToUpdate = await Subscription.findById(id);

      // Get the account associated with the subscription
      const account = await Account.findOne({
        accountId: subscriptionToUpdate.accountId,
      });

      // Check if the subscription's end date is updated
      if (updates.endDate && updates.endDate !== subscriptionToUpdate.endDate) {
        const endDate = new Date(updates.endDate);
        if (endDate < new Date()) {
          const mailOptions = {
            from: "johnmayer5230418@gmail.com",
            to: account.email,
            subject: "Subscription has ended",
            text: `Your subscription for ${
              subscriptionToUpdate.subscriptionType
            } has ended on ${endDate.toISOString()}.`,
          };
          console.log(transporter);
          await transporter.sendMail(mailOptions);

          logger.info({ action: "sendEmail", subscriptionId: id });
        }
      }

      // Update the subscription
      await Subscription.findByIdAndUpdate(id, updates);

      const subscription = await Subscription.findById(id);
      reply.code(200).send(subscription);
    } catch (e) {
      logger.error({ action: "update", error: e });
      reply.code(500).send(e);
    }
  },

  //#delete a subscription
  delete: async (request, reply) => {
    try {
      const subscriptionId = request.params.id;
      const subscriptionToDelete = await Subscription.findById(subscriptionId);
      await Subscription.findByIdAndDelete(subscriptionId);

      //store the log in Mongo DB
      const log = new Log({
        action: "delete",
        subscription: subscriptionToDelete,
      });

      await log.save();

      reply.code(200).send(subscriptionToDelete);
    } catch (e) {
      reply.code(500).send(e);
    }
  },
};
