const mongoose = require("mongoose");
const logSchema = new mongoose.Schema({
  action: String,
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
  },
  error: String,
});
const Log = mongoose.model("Log", logSchema);

module.exports = Log;
