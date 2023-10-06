const Account = require("../models/account");

module.exports = async (request, reply) => {
  try {
    const count = await Account.count({});
    reply.header("Content-Range", `accounts 0-${count}/${count}`);
  } catch (err) {
    console.error(err);
    reply.code(500).send("Error!");
  }
};
