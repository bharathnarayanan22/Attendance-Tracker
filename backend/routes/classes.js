const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Create a new class
router.post('/', async (req, res) => {
  const { className, courseCode, schedule } = req.body;
  try {
    const newClass = new Class({ className, courseCode, schedule });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Class creation failed', error });
  }
});

// Fetch all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch classes', error });
  }
});

module.exports = router;
