import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EnrollStudentsForm.module.css'; 
import successGif from '/src/assets/success.gif';

const EnrollStudentsForm = () => {
  const [courseId, setCourseId] = useState('');
  const [studentIds, setStudentIds] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showSuccessGif, setShowSuccessGif] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/classes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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
    const selectedStudentIds = [...studentIds];
    if (e.target.checked) {
      selectedStudentIds.push(e.target.value);
    } else {
      const index = selectedStudentIds.indexOf(e.target.value);
      if (index > -1) {
        selectedStudentIds.splice(index, 1);
      }
    }
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

      setCourseId('');
      setStudentIds([]);

      setShowSuccessGif(true); // Show success GIF
      setTimeout(() => {
        setShowSuccessGif(false); // Hide success GIF after 2 seconds
      }, 2000);
    } catch (error) {
      console.error('Enrollment failed:', error); // Handle error
    }
  };

  return (
    <div className={styles.formContainer}>
      {showSuccessGif && (
        <div className={styles.successOverlay}>
          <img src={successGif} alt="Success" className={styles.successGif} />
        </div>
      )}
      <h2>Enroll Students to Course</h2>
      <form onSubmit={handleSubmit} className={styles.innerForm}>
        <label htmlFor="courseId" className={styles.label}>Select Course</label>
        <select id="courseId" value={courseId} onChange={handleCourseChange} className={styles.selectField} required>
          <option value="">Select a course</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>{cls.courseName}</option>
          ))}
        </select>

        <label htmlFor="studentIds" className={styles.label}>Select Students</label>
        <div className={styles.studentItem}>
        {students.map((student) => (
            <div key={student._id}>
              <input
                type="checkbox"
                id={`student-${student._id}`}
                value={student._id}
                checked={studentIds.includes(student._id)}
                onChange={handleStudentChange}
                className={styles.checkbox}
              />
              <label htmlFor={`student-${student._id}`} className={styles.studentLabel}>{student.name}</label>
            </div>
          ))}
          </div>
        <button type="submit" className={styles.button}>Enroll Students</button>
      </form>
    </div>
  );
};

export default EnrollStudentsForm;
