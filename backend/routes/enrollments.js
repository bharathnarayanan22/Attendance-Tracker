const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');

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

// Fetch enrolled students for a class based on classId
router.get('/class/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const enrolledStudents = await Enrollment.find({ classId })
      .populate({
        path: 'studentId',
        select: 'name' // Select the 'name' field of the referenced Student
      });

    res.status(200).json(enrolledStudents);
  } catch (error) {
    console.error('Failed to fetch enrolled students:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled students', error });
  }
});

module.exports = router;
