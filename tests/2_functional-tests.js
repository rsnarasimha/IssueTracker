const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('POST request to /api/issues/{project}', function() {
    // #1
    test('Create an issue with every field', function(done) {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Func Test 1',
          issue_text: 'Create issue with every field',
          created_by: 'user1',
          assigned_to: 'tester1',
          status_text: 'To be tested'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Func Test 1');
          assert.equal(res.body.created_by, 'user1');
          done();
        });
    });
    // #2
    test('Create an issue with only required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Func Test 2',
          issue_text: 'Create issue with only required fields',
          created_by: 'user2'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Func Test 2');
          assert.equal(res.body.created_by, 'user2');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });
    // #3
    test('Create an issue with missing required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Func Test 3',
          issue_text: 'Create issue with missing required fields'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'required field(s) missing' });
          done();
        });
    });
  });
    suite('GET request to /api/issues/{project}', function() {
      // #1
      test('View all issues on a project', function(done) {
        chai
          .request(server)
          .get('/api/issues/apitest')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'is Array');
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], 'open');
            done();
          });
      });
      // #2
      test('View issues on a project with one filter', function(done) {
        chai
          .request(server)
          .get('/api/issues/apitest')
          .query({ assigned_to: 'tester1' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'is Array');
            res.body.forEach(issue => { assert.equal(issue.assigned_to, 'tester1') });
            done();
          });
      });
      // #3
      test('View issues on a project with multiple filter', function(done) {
        chai
          .request(server)
          .get('/api/issues/apitest')
          .query({ assigned_to: 'tester1', open: true })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'is Array');
            res.body.forEach(issue => {
              assert.equal(issue.assigned_to, 'tester1')
              assert.equal(issue.open, true)
            });
            done();
          });
      });
    });
    suite('PUT request to /api/issues/{project}', function() {
      // #1
      test('Update one field on an issue', function(done) {
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            _id: '63dd624c3e7e112e07a5d032',
            status_text: 'Test complete'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: 'successfully updated', '_id': '63dd624c3e7e112e07a5d032' });
            done();
          });
      });
      // #2
      test('Update multiple fields on an issue', function(done) {
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            _id: '63dd624c3e7e112e07a5d034',
            status_text: 'Test complete and will be closed',
            open: false
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: 'successfully updated', '_id': '63dd624c3e7e112e07a5d034' });
            done();
          });
      });
      // #3
      test('Update an issue with missing _id', function(done) {
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            issue_title: 'Func Test 9',
            status_text: 'Test complete'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'missing _id' });
            done();
          });
      });
      // #4
      test('Update an issue with no fields to update', function(done) {
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            _id: '63dd624c3e7e112e07a5d034'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'no update field(s) sent', '_id': '63dd624c3e7e112e07a5d034' });
            done();
          });
      });
      // #5
      test('Update an issue with an invalid _id', function(done) {
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            _id: '63dd4614fd4ca8d1372cf3b5',
            status_text: 'Test complete'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'could not update', '_id': '63dd4614fd4ca8d1372cf3b5' });
            done();
          });
      });
    });
    suite('DELETE request to /api/issues/{project}', function() {
      // #1
      test('Delete an issue', function(done) {
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .send({
            _id: '63dd633b6907e45f9ebccda2'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: 'successfully deleted', '_id': '63dd633b6907e45f9ebccda2' });
            done();
          });
      });
      // #2
      test('Delete an issue with an invalid _id', function(done) {
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .send({
            _id: '63dd4614fd4ca8d1372cf3b5'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'could not delete', '_id': '63dd4614fd4ca8d1372cf3b5' });
            done();
          });
      });
      // #3
      test('Delete an issue with missing _id', function(done) {
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'missing _id' });
            done();
          });
      });
    });
});
