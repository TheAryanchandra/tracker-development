const express = require('express');
const router = express.Router();
const {
  getLectures,
  createLecture,
  updateLecture,
  deleteLecture,
} = require('../controllers/dsaLectureController');

router.route('/')
  .get(getLectures)
  .post(createLecture);

router.route('/:id')
  .put(updateLecture)
  .delete(deleteLecture);

module.exports = router;
