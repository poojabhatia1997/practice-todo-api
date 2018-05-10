const MongoClient = require('mongodb').MongoClient;
// Connection url
const url = 'mongodb://localhost:3000';
// Database Name
const dbName = 'test';
// Connect using MongoClient
MongoClient.connect(url, function(err, client) {
  // Select the database by name
  if (err){
  	console.log(err)
  	return err
  } else {
  	  const testDb = client.db(dbName);
      client.close();
  }
});