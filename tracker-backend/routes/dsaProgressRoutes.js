const express = require('express');
const router = express.Router();
const {
  getProgressList,
  createProgress,
  updateProgress,
  deleteProgress,
} = require('../controllers/dsaProgressController');

router.route('/')
  .get(getProgressList)
  .post(createProgress);

router.route('/:id')
  .put(updateProgress)
  .delete(deleteProgress);

module.exports = router;
