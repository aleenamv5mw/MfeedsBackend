const User = require("../models/User");
const logger = require("./logger");
module.exports = {
  //# create a note
  create: async (request, reply) => {
    try {
      const user = request.body;
      const newUser = await User.create(user);

      reply.code(201).send(newUser);
      /* const childLogger = logger.child({ newUser });
      childLogger.trace('getUser called'); */
    } catch (e) {
      reply.code(500).send(e);
    }
  },

  //#get the list of notes
  fetch: async (request, reply) => {
    try {
      const users = await User.find({});
      reply.code(200).send(users);
    } catch (e) {
      reply.code(500).send(e);
    }
  },

  //#get a single note
  get: async (request, reply) => {
    try {
      const userId = request.params.id;
      const user = await Support.findById(id);
      reply.code(200).send(user);
    } catch (e) {
      reply.code(500).send(e);
    }
  },

  /* //#update a note
  update: async (request, reply) => {
    try {
      const userId = request.params.id;
      const updates = request.body;
      await Note.findByIdAndUpdate(noteId, updates);
      const noteToUpdate = await Note.findById(noteId);
      reply.code(200).send({ data: noteToUpdate });
    } catch (e) {
      reply.code(500).send(e);
    }
  }, */

  /*   //#delete a note
  delete: async (request, reply) => {
    try {
      const noteId = request.params.id;
      const noteToDelete = await Note.findById(noteId);
      await Note.findByIdAndDelete(noteId);
      reply.code(200).send({ data: noteToDelete });
    } catch (e) {
      reply.code(500).send(e);
    }
  }, */
};
