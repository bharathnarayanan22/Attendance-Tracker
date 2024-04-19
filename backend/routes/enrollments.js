const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');

// Enroll a student in a class
router.post('/', async (req, res) => {
  const { studentId, classId } = req.body;
  try {
    const newEnrollment = new Enrollment({ studentId, classId });
    await newEnrollment.save();
    res.status(201).json(newEnrollment);
  } catch (error) {
    res.status(500).json({ message: 'Student enrollment failed', error });
  }
});

module.exports = router;
