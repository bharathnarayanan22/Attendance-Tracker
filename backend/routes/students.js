const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Route to add a new student
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newStudent = new Student({ name, email });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Failed to add student:', error);
    res.status(500).json({ message: 'Failed to add student', error });
  }
});


router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error('Failed to fetch students:', error);
    res.status(500).json({ message: 'Failed to fetch students', error });
  }
});

module.exports = router;
