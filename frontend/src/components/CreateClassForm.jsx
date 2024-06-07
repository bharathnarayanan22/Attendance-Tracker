import React, { useState } from 'react';
import axios from 'axios';
import styles from './CreateClassForm.module.css'; // Import CSS styles

const CreateClassForm = () => {
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  // const [sessionTiming, setSessionTiming] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const response = await axios.post('http://localhost:5000/api/classes', {
  //       courseName,
  //       courseCode,
  //       sessionTiming: `${startTime} - ${endTime}`,
  //     });

  //     setSuccessMessage(response.data.message);
  //     setCourseName('');
  //     setCourseCode('');
  //     // setSessionTiming('');
  //     setStartTime('');
  //     setEndTime('');
  //   } catch (error) {
  //     setErrorMessage(error.response.data.error);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5000/api/classes', {
        courseName,
        courseCode,
        sessionTiming: `${startTime} - ${endTime}`,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      setSuccessMessage(response.data.message);
      setCourseName('');
      setCourseCode('');
      setStartTime('');
      setEndTime('');
      setShowSuccessGif(true); // Show success GIF
      setTimeout(() => {
        setShowSuccessGif(false); // Hide success GIF after 2 seconds
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response.data.error);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Create Class</h2>
      {successMessage && <p className={`${styles.messageContainer} ${styles.successMessage}`}>{successMessage}</p>}
      {errorMessage && <p className={`${styles.messageContainer} ${styles.errorMessage}`}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} className={styles.innerForm}>
        
          <label htmlFor="courseName" className={styles.label}>Course Name</label>
          <input
            type="text"
            id="courseName"
            value={courseName}
            placeholder='Course Name'
            onChange={(e) => setCourseName(e.target.value)}
            className={styles.inputField}
            required
          />
        
          <label htmlFor="courseCode" className={styles.label}>Course Code</label>
          <input
            type="text"
            id="courseCode"
            placeholder='Course Code'
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className={styles.inputField}
            required
          />
        
          {/* <label htmlFor="sessionTiming" className={styles.label}>Session Timing</label>
          <input
            type="time"
            id="sessionTiming"
            value={sessionTiming}
            onChange={(e) => setSessionTiming(e.target.value)}
            className={styles.inputField}
            required
          /> */}

          <label htmlFor="startTime" className={styles.label}>
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={styles.inputField}
              required
            />

            <label htmlFor="endTime" className={styles.label}>
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={styles.inputField}
              required
            />
        
        <button type="submit" className={styles.button}>Create Class</button>
      </form>
    </div>
  );
};

export default CreateClassForm;
