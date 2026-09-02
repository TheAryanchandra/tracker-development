const express = require('express');
const router = express.Router();
const {
  getDailyLogs,
  createDailyLog,
  updateDailyLog,
  deleteDailyLog,
} = require('../controllers/dailyTrackerController');

router.route('/')
  .get(getDailyLogs)
  .post(createDailyLog);

router.route('/:id')
  .put(updateDailyLog)
  .delete(deleteDailyLog);

module.exports = router;
