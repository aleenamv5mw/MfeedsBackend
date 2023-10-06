const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema({
  title: String,
  url: String,
  datadescription: String,
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

const opkotiListing = mongoose.model("opkotiListing", listingSchema);
module.exports = opkotiListing;
