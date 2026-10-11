const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');

// 1. GET /api/tasks - Retrieve all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve tasks', details: err.message });
  }
});

// 2. POST /api/tasks - Create a new task with input validation
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    // Explicit manual validation checks
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Task description is required.' });
    }
    if (!dueDate || isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ error: 'A valid due date is required.' });
    }

    const newTask = new Task({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority: priority || 'Medium',
      status: status || 'Pending',
      createdDate: new Date()
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Internal server error while creating task' });
  }
});

// 3. PUT /api/tasks/:id - Update an existing task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Internal server error while updating task' });
  }
});

// 4. DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format.' });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error while deleting task' });
  }
});

module.exports = router;