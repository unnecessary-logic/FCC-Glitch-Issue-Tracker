/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);


//test ID variables - we will NEED these going forward.
let id1;
let id2;
let id3;

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      //These tests are pretty self explanatory.
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          id1 = res.body._id;
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title")
          assert.equal(res.body.issue_text, "text")
          assert.equal(res.body.created_by, "Functional Test - Every field filled in")
          assert.equal(res.body.assigned_to, "Chai and Mocha")
          assert.equal(res.body.status_text, "In QA")
          assert.equal(res.body.open, true)
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required Fields Filled In',
        })
        .end(function(err, res){
          id2 = res.body._id;
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title")
          assert.equal(res.body.issue_text, "text")
          assert.equal(res.body.created_by, "Functional Test - Required Fields Filled In")
          done();
        });
      });
    
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          assigned_to: 'Title',
          status_text: 'text',
        })
        .end(function(err, res){
          id3 = res.body._id;
          assert.equal(res.status, 200);
          assert.isUndefined(res.body.issue_title)
          assert.isUndefined(res.body.issue_text)
          assert.isUndefined(res.body.created_by)
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      //These tests are self explanatory but it's easy to be thrown off by the "id" requirement.
      //We really just have to capture that data from our previously created tests and use it here, and going forward.
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id1
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "No updated fields sent.")
          done();
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id2,
          assigned_to: "Dev",
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "Successfully updated.")
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id3,
          assigned_to: "Finance",
          issue_title: "Notatitle"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "Successfully updated.")
          done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      //These are pretty self explanatory - the res.body will have the property we query for if we supplied it.
      //If nothing is supplied everything will be returned.
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          issue_text: "text"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_text');
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          issue_title: "Title",
          open: true
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'open');
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      //Here, let's put in a static ID that will never be generated ever.
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: "n;3lkn4l;kjsadf9ujz;kdnsf;klj34l;kj;lkansdfa09sdufialsj;ln3l;kj4a09sdjfkl;asdjf;klj"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "_id error; _id not found.")
          done();
        });
      });
      //We'll blow away one of our entries from earlier.
      test('Valid _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: id2
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "Successfully deleted ID.")
          done();
        });
      });
      
    });

});
