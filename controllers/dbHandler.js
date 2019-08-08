var apiRoutes = require('../routes/api.js');
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const CONNECTION_STRING = process.env.DB; 
const dbName = "test";
const collectionName = "issues";
const shortid = require('shortid');

//This is the handler function that will make the api.js routes look 'prettier' and less cluttered.
//This can all be done in that file too but I wanted to try it this way.

function dbHandler() {
  
     //We're going to wrap MongoClient connections in every function we call in this handler as seen below.
    //They all follow the same scheme - connect, throw error if error, define db/collection, do something with collection, then close connection.
    //All these functions also pass in "res" so we can send responses right out of these functions by passing it through the route callback.
      this.newEntry = function(title, text, created, assigned = "", status = "", res) {
      let mongDB = MongoClient.connect(CONNECTION_STRING, function(err, client) {
      if (err) {
        throw(err)
      }
      else {
      console.log("Connected correctly to server");
      const db = client.db(dbName);
      const collection = db.collection(collectionName)
      
      let timeNow = new Date();
      
      //This is our initial object.  Using shortid here to keep sane when querying for id's in operations later.
      let results = {
      _id: shortid.generate(),
      issue_title: title,
      issue_text: text,
      created_by: created,
      assigned_to: assigned,
      status_text: status,
      created_on: timeNow,
      updated_on: timeNow,
      open: true
      }
      //Pretty simple insert function; if everything is good we'll return the result ops at index 0 in JSON.
      collection.insertOne(results, (err, result) => {
        if (err) {
          throw(err)
        }
        else {
          res.json(result.ops[0])
          }
        })
      };
        client.close();
      })
  }
  this.updateEntry = function(id, title, text, created, assigned, status, res) {
    
    //If our ID is null we should send this type of response and return out of the function right away.
    if (id == null) {
      res.send("Please enter a valid ID.")
      return false;
    }
    
    let mongDB = MongoClient.connect(CONNECTION_STRING, function(err, client) {
      if (err) {
        throw(err)
      }
      else {
      console.log("Connected correctly to server");
      const db = client.db(dbName);
      const collection = db.collection(collectionName)
      let timeNow = new Date();
      
      //These fields we only care about updating - the rest shouldn't be tampered with (unless by checkbox for open).
      let results = {
      issue_title: title,
      issue_text: text,
      created_by: created,
      assigned_to: assigned,
      status_text: status,
      }
      let newResults = {}
      //Here we have to construct newResults with Object.entries.
      for (let [key, value] of Object.entries(results)) {
      if (value) {
        newResults[key] = value
        }
      }
        //If it's not 0 we'll do some work.  Luckily the updateOne parameter can simply take an object and scale over it, updating an existing object with its values.
      if (Object.entries(newResults).length !== 0) {
        collection.updateOne({"_id": id}, {'$set': newResults}, (err, item) => {
          if (err) {
            console.log(err)
            res.send("Could not update ID, please review your entry and try again.")
          }
          //item.matchedCount will not be 0 if something is actually found, hence we can use this to return this type of message.
          else if (item.matchedCount === 0) {
            console.log("No entry found.")
            res.send("No entry found for your ID - try again.")
          }
          else {
            console.log("Successful.")
            res.send("Successfully updated.")
          }
        })
      }
      else {
          res.send("No updated fields sent.")
        }
        //We'll stamp the time on our entries no matter what here.
      collection.updateOne({_id: id}, {'$set': {updated_on: timeNow}}, (err, item) => {
          if (err) {
            console.log(err)
          }
          else {
            console.log("Time stamped.")
          }
        })
  }
      client.close();
})
    }
  
  this.getStuff = function(queryObj, res) {
    let mongDB = MongoClient.connect(CONNECTION_STRING, function(err, client) {
      if (err) {
        throw(err)
      }
      else {
      console.log("Connected correctly to server");
      const db = client.db(dbName);
      const collection = db.collection(collectionName)
      
      //Parse our little boolean.  In a query string, it gets evaluated as a 'string' which throws off the collection find.
      //If it is in the queryObj that is.
      if (queryObj.open) {
        queryObj.open === 'true' ? queryObj.open = true : queryObj.open = false;
      }
      
        //This one is pretty simple.  Again, we can query an object straight away and simply work off that as an array.
      collection.find(queryObj).toArray((err, items) => {
        if (err) {
          console.log(err)
          res.send(err)
        }
        else if (items.length === 0) {
          res.send("No items found! Try another query.")
        }
        else {
          res.send(items)
             }
        })
      }
      client.close();
    })
  }
  
  this.deleteStuff = function(queryID, res) {
    
    let mongDB = MongoClient.connect(CONNECTION_STRING, function(err, client) {
      if (err) {
        throw(err)
      }
      else {
      console.log("Connected correctly to server");
      const db = client.db(dbName);
      const collection = db.collection(collectionName)
      
      collection.deleteOne({_id: queryID}, (err, item) => {
        if (err) {
          throw(err)
          res.send("Could not delete ID.")
        }
        //Here, deletedCount will = 0 if nothing was deleted.  deleteOne will not return an error if nothing was actually deleted, you have to parse that yourself.
        else if (item.deletedCount === 0) {
          res.send("_id error; _id not found.")
        }
        else {
          res.send("Successfully deleted ID.")
        }
      })
    }
      client.close();
  })
}
}
module.exports = dbHandler;