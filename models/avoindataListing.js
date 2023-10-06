const mongoose = require("mongoose");

async function deleteExistingData() {
  await Listing.deleteMany({});
}

const listingSchema = new mongoose.Schema({
  Title: String,
  url: String,
  Rekisteröity: String,
  Toimiala: String,
  buisnessId: String,
  companyform: String,
  address: String,
  date: String,
  time: String,
});
const Listing = mongoose.model("avoindataListing", listingSchema);

module.exports = {
  deleteExistingData, // Export the function as a property of the module exports
  Listing, // Export the Listing model as well if you need it in other files
};
