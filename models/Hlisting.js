const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Hlisting;
try {
  Hlisting = mongoose.model("");
} catch (e) {
  Hlisting = mongoose.model(
    "Hlisting",
    new Schema({
      vendor: { type: String, required: true },
      title: { type: String, required: true },
      url: { type: String, required: true },
      datadescription: { type: String, required: true },
      address: { type: String, required: true },
      type: { type: String, required: true },
      area: { type: String, required: true },
      price: { type: String, required: true },
      year: { type: Number, required: true },
      correction: { type: String, required: true },
      id: { type: String, required: true },
      keywords: [{ type: String }],
    })
  );
}

module.exports = Hlisting;
