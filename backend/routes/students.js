const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Route to fetch all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error });
  }
});

module.exports = router;
