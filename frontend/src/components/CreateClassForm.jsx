// components/CreateClassForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const CreateClassForm = () => {
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [sessionTiming, setSessionTiming] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/classes', {
        courseName,
        courseCode,
        sessionTiming,
      });

      setSuccessMessage(response.data.message);
      setCourseName('');
      setCourseCode('');
      setSessionTiming('');
    } catch (error) {
      setErrorMessage(error.response.data.error);
    }
  };

  return (
    <div>
      <h2>Create Class</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="courseName">Course Name:</label>
          <input
            type="text"
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="courseCode">Course Code:</label>
          <input
            type="text"
            id="courseCode"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="sessionTiming">Session Timing:</label>
          <input
            type="text"
            id="sessionTiming"
            value={sessionTiming}
            onChange={(e) => setSessionTiming(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Class</button>
      </form>
    </div>
  );
};

export default CreateClassForm;
