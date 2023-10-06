const mongoose = require("mongoose");
const { Schema } = mongoose;
const cron = require("node-cron");

const subscriptionSchema = new Schema({
  accountId: { type: Number, required: true },
  accountName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  subscriptionType: { type: String, required: true },
  status: { type: String, default: "Not started" },

  feeds_Finnish_Renn: { type: Number, required: true },
  feeds_Jobs: { type: Number, required: true },
  feeds_Patent: { type: Number, required: true },
  feeds_Plot: { type: Number, required: true },
  feeds_Sales_Announcement: { type: Number, required: true },
  orderId: { type: Number, required: true },
});

// Update the status based on the start and end dates
subscriptionSchema.pre("save", function (next) {
  const currentDate = new Date(); // Get the current date
  if (this.startDate <= currentDate && this.endDate >= currentDate) {
    this.status = "Activated";
  } else if (this.endDate < currentDate) {
    this.status = "Deactivated";
  } else {
    this.status = "Not started";
  }
  next();
});

const Subscription = mongoose.model("subscription", subscriptionSchema);

// Function to update the subscription statuses for today
const updateStatusForToday = async () => {
  const currentDate = new Date();
  await Subscription.updateMany(
    {
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    },
    { $set: { status: "Activated" } }
  );
  await Subscription.updateMany(
    { endDate: { $lt: currentDate } },
    { $set: { status: "Deactivated" } }
  );
  await Subscription.updateMany(
    {
      startDate: { $gt: currentDate },
      endDate: { $gt: currentDate },
    },
    { $set: { status: "Not started" } }
  );
};

// Schedule the cron job to update the subscription statuses at 12:00 AM (midnight) every day
cron.schedule("0 0 * * *", () => {
  updateStatusForToday()
    .then(() => console.log("Subscription statuses updated for today"))
    .catch((error) =>
      console.error("Error updating subscription statuses:", error)
    );
});

module.exports = Subscription;
