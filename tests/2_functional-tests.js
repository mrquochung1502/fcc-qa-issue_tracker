const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(5000);

  let testId; 

  suite('POST /api/issues/{project}', function () {
    test('Create an issue with every field', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Test Title',
          issue_text: 'Test Text',
          created_by: 'Test Creator',
          assigned_to: 'Test Assignee',
          status_text: 'In Progress'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.equal(res.body.issue_title, 'Test Title');
          testId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Test Required',
          issue_text: 'Test Required Text',
          created_by: 'Test Required Creator'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Create an issue with missing required fields', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({ issue_title: 'Missing Fields' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'required field(s) missing' });
          done();
        });
    });
  });

  suite('GET /api/issues/{project}', function () {
    test('View issues on a project', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with one filter', function (done) {
      chai.request(server)
        .get('/api/issues/test?open=true')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with multiple filters', function (done) {
      chai.request(server)
        .get('/api/issues/test?open=true&created_by=Test Creator')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
  });

  suite('PUT /api/issues/{project}', function () {
    test('Update one field on an issue', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId, issue_text: 'Updated Text' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully updated', _id: testId });
          done();
        });
    });

    test('Update multiple fields on an issue', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId, issue_text: 'Updated Again', status_text: 'Resolved' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully updated', _id: testId });
          done();
        });
    });

    test('Update an issue with missing _id', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ issue_text: 'Should Fail' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'missing _id' });
          done();
        });
    });

    test('Update an issue with no fields to update', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: testId });
          done();
        });
    });

    test('Update an issue with an invalid _id', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: 'invalidid123', issue_text: 'Invalid Update' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'could not update', _id: 'invalidid123' });
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project}', function () {
    test('Delete an issue', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: testId })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully deleted', _id: testId });
          done();
        });
    });

    test('Delete an issue with an invalid _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: 'invalid_id' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'could not delete', _id: 'invalid_id' });
          done();
        });
    });

    test('Delete an issue with missing _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'missing _id' });
          done();
        });
    });
  });
});
