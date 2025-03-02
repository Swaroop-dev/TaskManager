// components/Tasks/TaskList.js
import React, { useState } from 'react';
import TaskItem from './TaskItem.js';
import './TaskList.css';

function TaskList({ tasks, updateTask, deleteTask }) {
  const [filter, setFilter] = useState('all');
  
  // Filter tasks based on status
  console.log(tasks,"tasks")
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Sort tasks by priority and due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by due date (if exists)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    
    // Tasks with due dates come before those without
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // If all else is equal, sort by ID (assuming newer tasks have higher IDs)
    return b.id - a.id;
  });

  return (
    <div className="task-list-container">
      <div className="task-filters">
        <h2>Your Tasks</h2>
        
      </div>
      
      {sortedTasks.length === 0 ? (
        <div className="no-tasks">
          {filter === 'all' 
            ? 'No tasks found. Add a new task to get started!' 
            : `No ${filter} tasks found.`}
        </div>
      ) : (
        <ul className="task-list">
          {sortedTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              updateTask={updateTask} 
              deleteTask={deleteTask} 
            />
          ))}
          </ul>)
    }
    </div>
  );}


  export default TaskList;