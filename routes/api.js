/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var DbHandler = require('../controllers/dbHandler.js');
const CONNECTION_STRING = process.env.DB; 
const dbName = "test";
const collectionName = "issues";
module.exports = function (app) {

  var dbHandler = new DbHandler();
  
  
  app.route('/api/issues/:project')
    .get(function (req, res){
      var project = req.params.project;
      var query = req.query
      dbHandler.getStuff(query, res)
    })
    .post(function (req, res){
      var project = req.params.project;
    
      dbHandler.newEntry(req.body.issue_title, req.body.issue_text, req.body.created_by, req.body.assigned_to, req.body.status_text, res)
      })
    .put(function (req, res){
      var project = req.params.project;
      dbHandler.updateEntry(req.body._id, req.body.issue_title, req.body.issue_text, req.body.created_by, req.body.assigned_to, req.body.status_text, res)
      })
    .delete(function (req, res){
      var project = req.params.project;
      let delID = req.body._id
      dbHandler.deleteStuff(delID, res)
    });
    
};
