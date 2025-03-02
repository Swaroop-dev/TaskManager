// components/TaskItem.js
import React, { useState } from 'react';
import "./TaskItem.css"

function TaskItem({ task, updateTask, deleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const [isProcessing, setIsProcessing] = useState(false);

  // Format due date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    setIsProcessing(true);
    const success = await updateTask(task.id, { ...task, status: newStatus });
    setIsProcessing(false);
    
    if (!success) {
      alert('Failed to update task status');
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsProcessing(true);
      const success = await deleteTask(task.id);
      setIsProcessing(false);
      
      if (!success) {
        alert('Failed to delete task');
      }
    }
  };

  // Handle editing form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    console.log(editedTask,"edited task")
    const success = await updateTask(task.id, editedTask);
    
    setIsProcessing(false);
    if (success) {
      setIsEditing(false);
    } else {
      alert('Failed to update task');
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  return (
    <li className={`task-item priority-${task.priority}`}>
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor={`title-${task.id}`}>Title</label>
            <input
              type="text"
              id={`title-${task.id}`}
              name="title"
              value={editedTask.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`description-${task.id}`}>Description</label>
            <textarea
              id={`description-${task.id}`}
              name="description"
              value={editedTask.description || ''}
              onChange={handleChange}
              rows="2"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`status-${task.id}`}>Status</label>
           
            <select class="task-edit-select" name="status" onChange={handleChange}>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          
          
          
          
          <div className="edit-buttons">
            <button 
              type="submit" 
              className="save-btn" 
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : 'Save'}
            </button>
            
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => setIsEditing(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="task-header">
            <h3 className="task-title">{task.title}</h3>
            
          </div>
          
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          
          
          
          <div className="task-actions">
            
            
            <div className="edit-delete-buttons">
              <button 
                onClick={() => setIsEditing(true)} 
                className="task-save-button"
                disabled={isProcessing}
              >
                Edit
              </button>
              <button 
                onClick={handleDelete} 
                className="task-cancel-button"
                disabled={isProcessing}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </li>
  );
}

export default TaskItem;