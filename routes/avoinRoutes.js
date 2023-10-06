const avoindataControllers = require("../controllers/avoindataController");

module.exports = (app) => {
  // GET request to display a form for generating a link
  app.get("/generate-link", async (req, res) => {
    res.type("text/html");
    return `
      <html>
        <head>
          <title>Generate Link</title>
        </head>
        <body>
          <form action="/generate-link" method="POST">
            <label for="keyword">Keyword:</label>
            <input type="text" id="keyword" name="keyword">
            <button type="submit">Generate Link</button>
          </form>
        </body>
      </html>
    `;
  });

  // POST request to generate a link based on the keyword submitted in the form
  app.post("/generate-link", async (req, res) => {
    const { keyword } = req.body;
    let data;
    if (/^[a-zA-Z]+$/.test(keyword)) {
      // Keyword is alphabetic, generate link 2
      data = await avoindataControllers.generateLink2(keyword);
    } else {
      // Keyword is a number, generate link 1
      data = await avoindataControllers.generateLink1(keyword);
    }
    return { data };
  });
  app.get("/api/listingsA/key", avoindataControllers.getRSSFeedAv);
  app.post("/api/listingsA/rss", avoindataControllers.saverssFeed);

  // GET request to get the saved RSS feed
  //app.get("/api/listingsA/saved-rss", avoindataControllers.getSavedRSSFeed);
};
