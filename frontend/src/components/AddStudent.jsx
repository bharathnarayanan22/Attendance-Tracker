import React, { useState } from 'react';
import axios from 'axios';
import styles from './AddStudentForm.module.css'; // Import CSS styles

const AddStudentForm = () => {
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/students', {
        name: studentName,
        rollNo,
        email,
      });

      setSuccessMessage(response.data.message);
      setStudentName('');
      setRollNo('');
      setEmail('');
    } catch (error) {
      setErrorMessage(error.response.data.error);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Add Student</h2>
      {successMessage && <p className={`${styles.messageContainer} ${styles.successMessage}`}>{successMessage}</p>}
      {errorMessage && <p className={`${styles.messageContainer} ${styles.errorMessage}`}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} className={styles.innerForm}>
        <div className={styles.inputContainer}>
          <label htmlFor="studentName" className={styles.label}>Student Name</label>
          <input
            type="text"
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className={styles.inputField}
            required
          />
        
          <label htmlFor="rollNo" className={styles.label}>Roll No</label>
          <input
            type="text"
            id="rollNo"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            className={styles.inputField}
            required
          />
        
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
            required
          />
        </div>
        <button type="submit" className={styles.button}>Add Student</button>
      </form>
    </div>
  );
};

export default AddStudentForm;
