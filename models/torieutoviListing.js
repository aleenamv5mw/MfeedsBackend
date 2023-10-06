const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  address: String,
  vendor: String,
  type: String,
  year: String,
  correction: String,
  area: String,
  price: String,
  date: String,
  time: String,
});

const torietuoviListing = mongoose.model("torietuoviListing", listingSchema);
module.exports = torietuoviListing;
