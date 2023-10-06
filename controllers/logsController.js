const log = require("../models/log");

module.exports = {
  //#get the list of logs
  fetch: async (request, reply) => {
    try {
      const logs = await log.find({});
      reply.code(200).send(logs);
    } catch (e) {
      reply.code(500).send(e);
    }
  },

  //#get a single log
  get: async (request, reply) => {
    try {
      const logId = request.params.id;
      const log = await Note.findById(logId);
      reply.code(200).send(log);
    } catch (e) {
      reply.code(500).send(e);
    }
  },

  //#delete a note
  delete: async (request, reply) => {
    try {
      const logId = request.params.id;
      const logToDelete = await log.findById(logId);
      await log.findByIdAndDelete(logId);
      reply.code(200).send({ data: logToDelete });
    } catch (e) {
      reply.code(500).send(e);
    }
  },
};
