const { query } = require('../config/db');
const logger = require('../config/logger');
// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status = 'pending' } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const [result] = await query(
      'INSERT INTO tasks (title, description, status, user_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, description, status, userId]
    );

    const taskId = result[0].id;
    logger.info(`Task created by user ${userId}: ${title}`);

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: taskId,
        title,
        description,
        status,
        user_id: userId
      }
    });
  } catch (error) {
    logger.error('Task creation error:', error);
    res.status(500).json({ message: 'Server error during task creation' });
  }
};

// Get all tasks (with role-based filtering)
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let queryText = 'SELECT * FROM tasks';
    let params = [];

    // If user role is not admin, only show their tasks
    if (userRole !== 'admin') {
      queryText += ' WHERE user_id = $1';
      params.push(userId);
    }

    queryText += ' ORDER BY created_at DESC';
    
    const [tasks] = await query(queryText, params);
    
    logger.info(`Tasks retrieved by user ${userId} with role ${userRole}`);
    
    res.json({ tasks });
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error getting tasks' });
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let queryText = 'SELECT * FROM tasks WHERE id = $1';
    let params = [taskId];

    // If user role is not admin, check if the task belongs to them
    if (userRole !== 'admin') {
      queryText += ' AND user_id = $2';
      params.push(userId);
    }

    const [tasks] = await query(queryText, params);
    
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    logger.info(`Task ${taskId} retrieved by user ${userId}`);
    
    res.json({ task: tasks[0] });
  } catch (error) {
    logger.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Server error getting task' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { title, description, status } = req.body;

    // Check if task exists and belongs to user (if not admin)
    let queryText = 'SELECT * FROM tasks WHERE id = $1';
    let params = [taskId];

    if (userRole !== 'admin') {
      queryText += ' AND user_id = $2';
      params.push(userId);
    }

    const [tasks] = await query(queryText, params);
    
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateParams = [];
    let paramCount = 1;

    if (title) {
      updateFields.push(`title = $${paramCount++}`);
      updateParams.push(title);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateParams.push(description);
    }

    if (status) {
      updateFields.push(`status = $${paramCount++}`);
      updateParams.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update provided' });
    }

    // Complete update params array and execute query
    updateParams.push(taskId);
    const idParamPos = paramCount++;
    
    let updateQuery = `
      UPDATE tasks
      SET ${updateFields.join(', ')}
      WHERE id = $${idParamPos}
    `;
    
    if (userRole !== 'admin') {
      updateQuery += ` AND user_id = $${paramCount}`;
      updateParams.push(userId);
    }

    const [result] = await query(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    logger.info(`Task ${taskId} updated by user ${userId}`);
    
    res.json({
      message: 'Task updated successfully',
      task: {
        id: parseInt(taskId),
        ...tasks[0],
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      }
    });
  } catch (error) {
    logger.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let queryText = 'DELETE FROM tasks WHERE id = $1';
    let params = [taskId];

    if (userRole !== 'admin') {
      queryText += ' AND user_id = $2';
      params.push(userId);
    }

    const [result] = await query(queryText, params);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    logger.info(`Task ${taskId} deleted by user ${userId}`);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};