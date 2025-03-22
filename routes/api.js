'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const IssueSchema = new mongoose.Schema({
  project: String, 
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  open: { type: Boolean, default: true },
  status_text: { type: String, default: '' },
});

const Issue = mongoose.model('Issue', IssueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    // **GET Request: View Issues (with optional filters)**
    .get(async (req, res) => {
      try {
        let project = req.params.project;
        let filter = { project, ...req.query }; 
        const issues = await Issue.find(filter);
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
    })
    
    // **POST Request: Create a new issue**
    .post(async (req, res) => {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const newIssue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
        });

        await newIssue.save();
        res.json(newIssue); 
      } catch (err) {
        res.status(500).json({ error: 'Could not create issue' });
      }
    })
    
    // **PUT Request: Update an issue**
    .put(async (req, res) => {
      let { _id, ...updateFields } = req.body;
      
      if (!_id) return res.json({ error: 'missing _id' });

      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      try {
        updateFields.updated_on = new Date();
        const updatedIssue = await Issue.findByIdAndUpdate(_id, updateFields, { new: true });

        if (!updatedIssue) return res.json({ error: 'could not update', _id });
        
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })
    
    // **DELETE Request: Delete an issue**
    .delete(async (req, res) => {
      let { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      try {
        const deletedIssue = await Issue.findByIdAndDelete(_id);
        
        if (!deletedIssue) return res.json({ error: 'could not delete', _id });

        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });

};