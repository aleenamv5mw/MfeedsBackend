//finnish Rennovation
const cron = require("node-cron");
const listingModels = [
  require("../models/eutoviListing"),
  require("../models/hhlisting"),
  require("../models/opkotiListing"),
  require("../models/kinteistoListing"),
  require("../models/habitaListing"),
  require("../models/assunotlisting"),
];

const Fuse = require("fuse.js");
const xmlbuilder = require("xmlbuilder");

const { RSSFeed } = require("../models/rssFeed");

async function searchListings(query) {
  if (!query || query.trim().length === 0) {
    console.log("Empty query.");
    return [];
  }

  const andQuery = [];
  const orQuery = [];
  const notQuery = [];
  const nearQuery = [];

  const keywords = query.match(/("[^"]+"|\S+)/g).slice(0, 10);

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    if (keyword.toUpperCase() === "AND") {
      const nextKeyword = keywords[i + 1];
      if (nextKeyword) {
        andQuery.push(nextKeyword);
        i++;
      }
    } else if (keyword.toUpperCase() === "OR") {
      const nextKeyword = keywords[i + 1];
      if (nextKeyword) {
        orQuery.push(nextKeyword);
        i++;
      }
    } else if (keyword.toUpperCase() === "NOT") {
      const nextKeyword = keywords[i + 1];
      if (nextKeyword) {
        notQuery.push(nextKeyword);
        i++;
      }
    } else if (keyword.toUpperCase() === "NEAR") {
      const nextKeyword = keywords[i + 1];
      const distance = parseInt(keywords[i + 2]);
      if (nextKeyword && distance >= 1 && distance <= 4) {
        nearQuery.push(`${nextKeyword} NEAR/${distance} ${keywords[i + 3]}`);
        i += 3;
      }
    } else {
      andQuery.push(keyword);
    }
  }

  const options = {
    keys: [
      "title",
      "datadescription",
      "vendor",
      "type",
      "correction",
      "area",
      "year",
    ],
  };

  const allListings = await Promise.all(
    listingModels.map((model) => model.find({}))
  );
  const allListingsFlat = allListings.flat();

  const fuse = new Fuse(allListingsFlat, options);

  let results = [];
  if (andQuery.length > 0) {
    results = fuse.search(andQuery.join(" "));
  }
  if (orQuery.length > 0) {
    results = results.concat(fuse.search(orQuery.join(" ")));
  }
  if (notQuery.length > 0) {
    const notResults = fuse.search(notQuery.join(" "));
    results = results.filter((r) => !notResults.includes(r));
  }
  if (nearQuery.length > 0) {
    for (const query of nearQuery) {
      const [keyword1, relation, keyword2] = query.split(" ");
      const searchOptions = {
        includeMatches: true,
        threshold: 0.2,
        keys: [
          "title",
          "datadescription",
          "vendor",
          "type",
          "correction",
          "area",
          "year",
        ],
      };
      const result1 = fuse.search(keyword1, searchOptions);
      const result2 = fuse.search(keyword2, searchOptions);
      const matches = [];
      for (const r1 of result1) {
        for (const r2 of result2) {
          const dist = getDistance(r1.item, r2.item);
          if (dist <= relation) {
            matches.push({
              item1: r1.item,
              item2: r2.item,
              distance: dist,
              match1: r1.matches[0],
              match2: r2.matches[0],
            });
          }
        }
      }
      results = results.concat(matches);
    }
  }

  return results;
}

function getDistance(item1, item2) {
  // Calculate the distance between item1 and item2
  return 1; // Placeholder for demo purposes
}

const getSearchResults = async (req, res) => {
  const query = req.query.q;
  const results = await searchListings(query);
  res.send(results);
};

const getRSSFeed = async (req, res) => {
  const query = req.query.q;
  const results = await searchListings(query);

  const feed = xmlbuilder.create("rss", { version: "1.0", encoding: "UTF-8" });
  feed.att("xmlns:atom", "http://www.w3.org/2005/Atom");
  const channel = feed.ele("channel");
  channel.ele("title", "My Search Results");
  channel.ele("description", "Search results for " + query);

  results.forEach((result) => {
    const item = channel.ele("item");
    item.ele("title", result.item.title);
    item.ele(
      "description",
      `${result.item.vendor}, ${result.item.type}, ${result.item.correction}, ${result.item.area}, ${result.item.price}, ${result.item.year}`
    );
    item.ele("link", result.item.url);
    item.ele("pubDate", new Date().toUTCString());
  });

  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers.host;
  let baseUrl = "";

  if (protocol && host) {
    baseUrl = `${protocol}://${host}`;
  }

  const rssLink = `${baseUrl}/api/listings/rss?q=${query}`;

  feed.ele("atom:link", {
    href: rssLink,
    rel: "self",
    type: "application/rss+xml",
  });

  const rss = feed.end({ pretty: true });
  await saverssFeed(rss, rssLink);

  res.type("application/rss+xml").send(rss);
};
async function updateRSSFeed() {
  try {
    const results = await searchListings();

    const feed = xmlbuilder.create("rss", {
      version: "1.0",
      encoding: "UTF-8",
    });
    feed.att("xmlns:atom", "http://www.w3.org/2005/Atom");
    const channel = feed.ele("channel");
    channel.ele("title", "My Search Results");
    channel.ele("description", "Search results for Finnish Rennovation"); // Modify the description here

    results.forEach((result) => {
      const item = channel.ele("item");
      item.ele("title", result.item.title);
      item.ele(
        "description",
        `${result.item.vendor}, ${result.item.type}, ${result.item.correction}, ${result.item.area}, ${result.item.price}, ${result.item.year}`
      );
      item.ele("link", result.item.url);
      item.ele("pubDate", new Date().toUTCString());
    });

    const rss = feed.end({ pretty: true });
    await saverssFeed(rss);

    console.log("RSS feed updated successfully!");
  } catch (err) {
    console.error(err);
    console.log("Error updating RSS feed");
  }
}

const saverssFeed = async (rss, rssLink) => {
  const feed = new RSSFeed({ xml: rss, rssLink });
  try {
    await feed.save();
    console.log("RSS feed saved successfully!");
  } catch (err) {
    console.error(err);
    console.log("Error saving RSS feed");
  }
};

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
cron.schedule("0 0 * * *", updateRSSFeed);

module.exports = {
  //getting list of listings
  fetch: async (request, reply) => {
    try {
      const promises = listingModels.map((model) => model.find({}));
      const [
        eutoviListings,
        hhlistings,
        opkotiListings,
        kinteistoListings,
        habitaListings,
        assunotListings,
      ] = await Promise.all(promises);
      const allListings = [
        ...eutoviListings,
        ...hhlistings,
        ...opkotiListings,
        ...kinteistoListings,
        ...habitaListings,
        ...assunotListings,
      ];
      reply.code(200).send(allListings);
    } catch (e) {
      reply.code(500).send(e);
    }
  },

  getSearchResults,
  getRSSFeed,
  saverssFeed,
  getSavedRSSFeed,
  updateRSSFeed,
};
