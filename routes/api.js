'use strict';

const mongoose = require("mongoose");
const Issue = require('../models/issues');
const mySecret = process.env['MONGO_URI'];

module.exports = function(app) {

  //Connect to database
  mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.log(err));

  app.route('/api/issues/:project')

    .get(function(req, res) {
      let project = req.params.project;
      console.log("in get");
      let query = req.query;
      query.project = project;

      Issue.find(query, function(err, issues) {
        if (err) return console.log(err);
        if (issues.length == 0) {
          res.send('No issues found');
        } else {
          let issArr = [];
          issues.forEach(issue => {
            issArr.push({
              _id: issue._id,
              issue_title: issue.issue_title,
              issue_text: issue.issue_text,
              created_on: issue.created_on,
              updated_on: issue.updated_on,
              created_by: issue.created_by,
              assigned_to: issue.assigned_to,
              open: issue.open,
              status_text: issue.status_text
            });
          });
          res.send(issArr);
        }
      });
    })

    .post(function(req, res) {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      console.log("in post");
      console.log(project, req.body.issue_title, req.body.issue_text);

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = new Issue({
        project: project,
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || ''
      });

      newIssue.save(function(err, issue) {
        if (err) return console.error(err);
        res.json({
          _id: issue._id,
          issue_title: issue.issue_title,
          issue_text: issue.issue_text,
          created_on: issue.created_on,
          updated_on: issue.updated_on,
          created_by: issue.created_by,
          assigned_to: issue.assigned_to,
          open: issue.open,
          status_text: issue.status_text
        });
      })
    })

    .put(function(req, res) {
      let project = req.params.project;
      console.log("in put");
      console.log(req.body);
      console.log(Object.values(req.body).length, req.body._id);

      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }

      let updateIssue = req.body;
      for (let entry in updateIssue) {
        if (!updateIssue[entry]) {
          delete updateIssue[entry];
        }
      }
      console.log(updateIssue);
      if (Object.keys(updateIssue).length === 1 && updateIssue._id) {
        return res.json({ error: 'no update field(s) sent', '_id': updateIssue._id });
      }

      updateIssue.project = project;
      updateIssue.updated_on = new Date();

      Issue.findByIdAndUpdate(updateIssue._id, updateIssue, function(err, updatedIss) {
        if (err) return console.log(err);
        if (updatedIss) {
          return res.json({ result: 'successfully updated', '_id': updatedIss._id });
        } else {
          return res.json({ error: 'could not update', '_id': updateIssue._id });
        }
      });
    })

    .delete(function(req, res) {
      let project = req.params.project;
      console.log("on delete");
      let issue = req.body._id;
      if (!issue) {
        return res.json({ error: 'missing _id' });
      }

      Issue.findByIdAndDelete(issue, function(err, data) {
        if (err) return console.log(err);
        if (data) {
          return res.json({ result: 'successfully deleted', '_id': issue });
        } else {
          return res.json({ error: 'could not delete', '_id': issue });
        }
      });
    });

};
