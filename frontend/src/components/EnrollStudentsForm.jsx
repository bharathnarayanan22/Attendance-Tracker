import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EnrollStudentsForm.module.css'; // Import CSS styles

const EnrollStudentsForm = () => {
  const [courseId, setCourseId] = useState('');
  const [studentIds, setStudentIds] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/classes');
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/students');
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchClasses();
    fetchStudents();
  }, []);

  const handleCourseChange = (e) => {
    setCourseId(e.target.value);
  };

  const handleStudentChange = (e) => {
    const selectedStudentIds = Array.from(e.target.selectedOptions, (option) => option.value);
    setStudentIds(selectedStudentIds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/enroll',
        { courseId, studentIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(response.data); // Handle success
    } catch (error) {
      console.error('Enrollment failed:', error); // Handle error
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Enroll Students to Course</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="courseId" className={styles.label}>Select Course:</label>
        <select id="courseId" value={courseId} onChange={handleCourseChange} className={styles.selectField} required>
          <option value="">Select a course</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>{cls.courseName}</option>
          ))}
        </select>

        <label htmlFor="studentIds" className={styles.label}>Select Students:</label>
        <select id="studentIds" multiple value={studentIds} onChange={handleStudentChange} className={styles.selectField} required>
          {students.map((student) => (
            <option key={student._id} value={student._id}>{student.name}</option>
          ))}
        </select>

        <button type="submit" className={styles.button}>Enroll Students</button>
      </form>
    </div>
  );
};

export default EnrollStudentsForm;
