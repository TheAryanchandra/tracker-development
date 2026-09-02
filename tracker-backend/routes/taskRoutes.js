const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskController');

router.get('/', controller.listTasks);
router.post('/', controller.createTask);
router.patch('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
