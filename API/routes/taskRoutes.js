const express = require('express');
const router = express.Router();
const taskController = require('../Controllers/taskController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Create a new task
router.post('/', auth, taskController.createTask);

// Get all tasks (filtered by role)
router.get('/', auth, taskController.getAllTasks);

// Get task by ID
router.get('/:id', auth, taskController.getTaskById);

// Update task
router.put('/:id', auth, taskController.updateTask);

// Delete task
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
