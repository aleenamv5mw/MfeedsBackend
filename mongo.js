const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://user:johnmayer@mfeeds.giicowq.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'mfeeds_db';
const accountsCollectionName = 'accounts';
const subscriptionsCollectionName = 'subscriptions';
const data = require('./db.json');

MongoClient.connect(url, function(err, client) {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }

  console.log('Connected to MongoDB');
  
  const db = client.db(dbName);
  const accountsCollection = db.collection(accountsCollectionName);
  const subscriptionsCollection = db.collection(subscriptionsCollectionName);
  
  // Insert the data into the collections
  accountsCollection.insertMany(data.accounts, function(err, res) {
    if (err) {
      console.error('Failed to insert accounts data:', err);
      return;
    }
    console.log(res.insertedCount + ' accounts documents inserted');
  });

  subscriptionsCollection.insertMany(data.subscriptions, function(err, res) {
    if (err) {
      console.error('Failed to insert subscriptions data:', err);
      return;
    }
    console.log(res.insertedCount + ' subscriptions documents inserted');
    
    // Retrieve the data from the collections
    accountsCollection.find().toArray(function(err, accountsData) {
      if (err) {
        console.error('Failed to retrieve accounts data:', err);
        return;
      }
      console.log('Accounts data:');
      console.log(accountsData);
    });

    subscriptionsCollection.find().toArray(function(err, subscriptionsData) {
      if (err) {
        console.error('Failed to retrieve subscriptions data:', err);
        return;
      }
      console.log('Subscriptions data:');
      console.log(subscriptionsData);
      client.close();
    });
  });
});
