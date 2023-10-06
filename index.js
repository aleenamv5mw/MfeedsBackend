const fastify = require("fastify");
const app = fastify();
const mongoose = require("mongoose");
const subRoutes = require("./routes/subRoutes");
const noteRoutes = require("./routes/noteRoutes");
const accountRoutes = require("./routes/accountRoutes");
const hlistingRoutes = require("./routes/hlistingRoutes");
const paikatRoutes = require("./routes/paikatRoutes");
const espacenetRoutes = require("./routes/espacenetRoutes");
const tontitRoutes = require("./routes/tontitRoutes");
// const userRoutes = require("./routes/userRoutes");
const contentRangeHook = require("./hooks/contentRangeHook");
const Subscription = require("./models/Subscription");

const listingRoutes = require("./routes/listingRoutes");
//const avoinRoutes = require("./routes/avoinRoutes");

const parser = require("rss-parser");
const avoinRoutes = require("./routes/avoinRoutes");

try {
  mongoose.connect(
    "mongodb+srv://user:johnmayer@mfeeds.giicowq.mongodb.net/mfeeds_db?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  // Define the `account` model only once
  require("./models/Account");
  require("./models/Subscription");
  // require("./models/note");
  require("./models/hlisting");
  require("./models/log");
  require("./models/User");
  require("./models/eutoviListing");
  require("./models/torieutoviListing");
  require("./models/toriListing");
  require("./models/rssFeed");
  require("./models/avoindataListing");
} catch (e) {
  console.error(e);
}

//logs

app.addHook("preHandler", contentRangeHook);

accountRoutes(app);
subRoutes(app);
noteRoutes(app);
//hlistingRoutes(app);
listingRoutes(app);
paikatRoutes(app);
espacenetRoutes(app);
tontitRoutes(app);
avoinRoutes(app);

// userRoutes(app);
const port = process.env.PORT || 5000;
app.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on ${address}`);
});
