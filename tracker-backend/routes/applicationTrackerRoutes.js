const express = require('express');
const router = express.Router();
const {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationTrackerController');

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
