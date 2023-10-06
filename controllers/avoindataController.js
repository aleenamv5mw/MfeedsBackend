const pino = require("pino");
const logger = pino({ prettyPrint: true });
const fetch = import("node-fetch");
const xmlbuilder = require("xmlbuilder");
const { deleteExistingData, Listing } = require("../models/avoindataListing");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const { RSSFeed } = require("../models/rssFeed");
async function getData(link) {
  const data = await fetch(link);
  const response = await data.json();
  //console.log(data)
  var loc = new Array();
  const setting = [];
  for (var i = 1; i < 10; i++) {
    var url =
      "http://www.kauppalehti.fi/yritykset/yritys/" +
      response["results"][i].name +
      "/" +
      response["results"][i].businessId;
    var url1 = response[`results`][i].detailsUri;
    var companyform = response["results"][i].companyForm;
    var registrationDate = response["results"][i].registrationDate;
    var name = response["results"][i].name;
    var buisnessId = response["results"][i].businessId;
    var loc = {};
    loc["name"] = name;
    loc["url1"] = url1;
    loc["url"] = url;
    loc["registrationDate"] = registrationDate;
    loc["buisnessId"] = buisnessId;
    loc["companyform"] = companyform;
    setting.push({
      Title: loc["name"],
      Toimiala: loc["name"],
      url1: loc["url1"],
      url: loc["url"],
      Rekisteröity: loc["registrationDate"],
      buisnessId: loc["buisnessId"],
      companyform: loc["companyform"],
    });
  }
  //console.log(setting);
  return setting;
  //return data;
}
async function scrapejobdescription(listing) {
  // TODO: implement job description scraping logic
  for (var i = 0; i < 9; i++) {
    const con = listing[i].url1;
    console.log(con);
    const { MongoClient } = require("mongodb");
    const uri = `mongodb+srv://user:johnmayer@mfeeds.giicowq.mongodb.net/mfeeds_db?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);
    // Connect to the MongoDB cluster
    await client.connect();
    // await findOneListingByName(client, listing[i].url1);
    if (listing[i] && listing[i].url) {
      await findOneListingByName(client, listing[i].url);
    }
    async function findOneListingByName(client, nameOfListing) {
      const cursor = await client
        .db("mfeeds_db")
        .collection("avoindataListings")
        .find({ url: nameOfListing })
        .toArray();
      if (cursor.length === 0) {
        const con = listing[i].url1;
        // console.log(con);
        const myPosts = await fetch(listing[i].url1);
        const response = await myPosts.json();
        //var address1=response.results[0].addresses[0];
        if (response.results[0].addresses[0] == null) {
          address = "null";
        } else {
          address =
            response.results[0].addresses[0].street +
            response.results[0].addresses[0].city +
            response.results[0].addresses[0].postCode;
        } // address= response["results"]["addresses"]//.postCode + response["results"]["addresses"].street+response["results"]["addresses"].city;
        listing[i].address = address;
        // console.log(listing[i].address);
        let ts = Date.now();
        let date_time = new Date(ts);
        let date = date_time.getDate();
        let month = date_time.getMonth() + 1;
        let year1 = date_time.getFullYear();
        // prints date & time in YYYY-MM-DD format
        let v = year1 + "-" + month + "-" + date;
        listing[i].date = v;
        //console.log(listing[i].date);
        let hours = date_time.getHours();
        let minutes = date_time.getMinutes();
        let seconds = date_time.getSeconds();
        let y = hours + ":" + minutes + ":" + seconds;
        listing[i].time = y;
        // console.log(listing[i].time); //this(listing[i])
        const listingModel = new Listing(listing[i]);
        await listingModel.save();
        // await sleep(1000);
      } else {
        client.close();
      }
      // Make the appropriate DB calls
    }
  }
}
async function connectToMongoDb() {
  await mongoose.connect(
    "mongodb+srv://user:johnmayer@mfeeds.giicowq.mongodb.net/mfeeds_db?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  );
  console.log("connected");
}
async function jobdescription(link) {
  const con = link;
  console.log(con);
  const myPosts = await fetch(link);
  const response = await myPosts.json();
  var companyform = response["results"][0].companyForm;
  var registrationDate = response["results"][0].registrationDate;
  var name = response["results"][0].name;
  if (response.results[0].addresses[0] == null) {
    address = "null";
  } else {
    address =
      response.results[0].addresses[0].street +
      response.results[0].addresses[0].city +
      response.results[0].addresses[0].postCode;
  } // address= response["results"]["addresses"]//.postCode + response["results"]["addresses"].street+response["results"]["addresses"].city;
  address = address;
  var url =
    "http://www.kauppalehti.fi/yritykset/yritys/" +
    response["results"][0].name +
    "/" +
    response["results"][0].businessId;
  //console.log(address);
  let ts = Date.now();
  let date_time = new Date(ts);
  let date = date_time.getDate();
  let month = date_time.getMonth() + 1;
  let year1 = date_time.getFullYear();
  // prints date & time in YYYY-MM-DD format
  let v = year1 + "-" + month + "-" + date;
  date = v;
  //console.log(date);
  let hours = date_time.getHours();
  let minutes = date_time.getMinutes();
  let seconds = date_time.getSeconds();
  let y = hours + ":" + minutes + ":" + seconds;
  time = y;
  var loc = {};
  const setting = [];
  //console.log(time);
  loc["name"] = name;
  loc["address"] = address;
  loc["date"] = date;
  loc["registrationDate"] = registrationDate;
  loc["time"] = time;
  loc["companyform"] = companyform;
  setting.push({
    Title: loc["name"],
    Toimiala: loc["name"],
    address: loc["address"],
    date: loc["date"],
    time: loc["time"],
    Rekisteröity: loc["registrationDate"],
    //'buisnessId':loc['buisnessId'],
    companyform: loc["companyform"],
  });
  //console.log("checking");
  console.log(setting);
  const { MongoClient } = require("mongodb");
  const uri = `mongodb+srv://user:johnmayer@mfeeds.giicowq.mongodb.net/mfeeds_db?retryWrites=true&w=majority`;
  const client = new MongoClient(uri);
  // Connect to the MongoDB cluster
  await client.connect();
  // await findOneListingByName(client, listing[i].url1);
  //if (listing[i] && listing[i].url1) {
  await findOneListingByName(client, url);
  //}
  async function findOneListingByName(client, nameOfListing) {
    const cursor = await client
      .db("mfeeds_db")
      .collection("avoindataListings")
      .find({ url: nameOfListing })
      .toArray();
    if (cursor.length === 0) {
      const listingModel = new Listing(setting);
      console.log(setting);

      await listingModel.save();
      // await sleep(1000);
      return setting;
    } else {
      client.close();
    }
    //console.log(setting);
  }
}
async function generateLink1(keyword) {
  const link = `https://avoindata.prh.fi/bis/v1?totalResults=true&maxResults=10&resultsFrom=0&businessId=${keyword}`;
  console.log(link);

  await connectToMongoDb();
  await deleteExistingData(); // Delete existing data before inserting new data
  const data = await jobdescription(link);
  saveToJson(data, `data.json`);
}

async function generateLink2(keyword) {
  const link = `https://avoindata.prh.fi/bis/v1?totalResults=true&maxResults=10&resultsFrom=0&businessLine=${keyword}`;
  const listing = await getData(link);
  await connectToMongoDb();
  await deleteExistingData(); // Delete existing data before inserting new data
  await scrapejobdescription(listing);
  console.log(listing);
  saveToJson(listing, `listing.json`);
  return listing;
}
const getRSSFeedAv = async (req, res) => {
  const listings = await Listing.find({}); // Fetch all listings from the collection

  const feed = xmlbuilder.create("rss", { version: "1.0", encoding: "UTF-8" });
  feed.att("xmlns:atom", "http://www.w3.org/2005/Atom");
  const channel = feed.ele("channel");
  channel.ele("title", "My Search Results");
  channel.ele("description", "AvoindataListings");

  listings.forEach((listing) => {
    const item = channel.ele("item");
    item.ele("title", listing.Title);
    item.ele("description", listing.address); // You can choose which field(s) to include in the description
    item.ele("link", listing.url);
    item.ele("pubDate", new Date().toUTCString());
  });

  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers.host;
  let baseUrl = "";

  if (protocol && host) {
    baseUrl = `${protocol}://${host}`;
  }

  // Generate RSS link
  const rssLink = `${baseUrl}/api/listings/rss`; // No specific query parameter in the link

  feed.ele("atom:link", {
    href: rssLink,
    rel: "self",
    type: "application/rss+xml",
  });

  const rss = feed.end({ pretty: true });
  //await saverssFeed(rss, rssLink);

  res.type("application/rss+xml").send(rss);
};
async function saverssFeed(request, reply) {
  try {
    const { xml, rssLink } = request.body;

    const newFeed = new RSSFeed({
      xml,
      rssLink,
    });
    logger.debug(`New RSS feed: ${JSON.stringify(newFeed)}`);
    //await newFeed.save();
    const savedFeed = await newFeed.save();

    logger.info(`New RSS feed saved with id ${savedFeed._id}`);
    reply.send(savedFeed);
  } catch (err) {
    logger.error(err.message);
    reply.status(500).send(err.message);
  }
}
const getSavedRSSFeed = async (req, res) => {
  try {
    const feed = await RSSFeed.findOne({});
    if (!feed) {
      res.status(404).send("No RSS feed found");
      return;
    }
    res.type("application/rss+xml").send(feed.xml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving RSS feed");
  }
};

//Schedule the RSS feed update to run every day at 12:00 AM
//cron.schedule("0 0 * * *", updateRSSFeed);

module.exports = {
  generateLink1,
  generateLink2,
  deleteExistingData,
  getRSSFeedAv,
  saverssFeed,
  getSavedRSSFeed,
};
