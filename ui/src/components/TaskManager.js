// components/TaskManager.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskForm from './Tasks/TaskForm';
import TaskList from './Tasks/TaskList';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import './TaskManager.css';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();

  // API base URL - update this to your actual API endpoint
  const API_URL = 'http://localhost:4000/api/tasks';

  // Fetch all tasks
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        // Unauthorized - token might be expired
        logout();
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data.tasks);
      setError(null);
    } catch (err) {
      setError('Error fetching tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new task
  const addTask = async (taskData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (response.status === 401) {
        logout();
        navigate('/login');
        return false;
      }
      
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      
      const newTask = await response.json();
      setTasks([...tasks, newTask.task]);
      return true;
    } catch (err) {
      setError('Error adding task: ' + err.message);
      console.error('Error adding task:', err);
      return false;
    }
  };

  // Update a task
  const updateTask = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.status === 401) {
        logout();
        navigate('/login');
        return false;
      }
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === id ? updatedTask.task : task));
      return true;
    } catch (err) {
      setError('Error updating task: ' + err.message);
      console.error('Error updating task:', err);
      return false;
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      if (response.status === 401) {
        logout();
        navigate('/login');
        return false;
      }
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      setTasks(tasks.filter(task => task.id !== id));
      return true;
    } catch (err) {
      setError('Error deleting task: ' + err.message);
      console.error('Error deleting task:', err);
      return false;
    }
  };

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="task-manager">
      <Navbar />
      
      <div className="task-manager-content">
        <div className="mobile-section-heading">
          <h2>Add New Task</h2>
        </div>
        <TaskForm addTask={addTask} />
        
        <div className="mobile-section-heading">
          <h2>Your Tasks</h2>
        </div>
        {isLoading ? (
          <div className="loading">Loading tasks...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <TaskList 
            tasks={tasks} 
            updateTask={updateTask} 
            deleteTask={deleteTask} 
          />
        )}
      </div>
    </div>
  );
}

export default TaskManager;