const Account = require("../models/account");

module.exports = async (request, reply, done) => {
  try {
    const count = await Account.countDocuments();
    reply.header("Content-Range", `accounts 0-10/${count}`);
    done();
  } catch (e) {
    console.error(e);
    reply.code(500).send("Error!");
  }
};
