const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let Account;
try {
  Account = mongoose.model("Account");
} catch (e) {
  Account = mongoose.model(
    "Account",
    new Schema({
      accountId: { type: Number, required: true },
      accountName: { type: String, required: true },
      region: { type: String, required: true },
      salesRepresentative: { type: String, required: true },
      email: { type: String, required: true },
      id: { type: String },
    })
  );
}

module.exports = Account;
