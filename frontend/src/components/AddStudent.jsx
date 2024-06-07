import React, { useState } from 'react';
import axios from 'axios';
import styles from './AddStudentForm.module.css';
import loadingGif from '/src/assets/loading.gif'; // Ensure you have the loading.gif in your project
import successGif from '/src/assets/success.gif'; // Ensure you have the success.gif in your project

const AddStudentForm = () => {
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessGif, setShowSuccessGif] = useState(false); // New state for success GIF

  const handleFileChange = (e) => {
    setPhotos(e.target.files);
    setFiles(Array.from(e.target.files)); // Update file state to show file names
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', studentName);
    formData.append('rollNo', rollNo);
    formData.append('email', email);
    for (let i = 0; i < photos.length; i++) {
      formData.append(`photo${i + 1}`, photos[i]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStudentName('');
      setRollNo('');
      setEmail('');
      setPhotos([]);
      setFiles([]);
      setShowSuccessGif(true); // Show success GIF
      setTimeout(() => {
        setShowSuccessGif(false); // Hide success GIF after 2 seconds
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <img src={loadingGif} alt="Loading..." className={styles.loadingGif} />
        </div>
      )}
      {showSuccessGif && (
        <div className={styles.successOverlay}>
          <img src={successGif} alt="Success" className={styles.successGif} />
        </div>
      )}
      <h2>Add Student</h2>
      {errorMessage && <p className={`${styles.messageContainer} ${styles.errorMessage}`}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} className={styles.innerForm}>
        <div className={styles.inputContainer}>
          <label htmlFor="studentName" className={styles.label}>Student Name</label>
          <input
            type="text"
            id="studentName"
            placeholder='Student Name'
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className={styles.inputField}
            required
          />
        
          <label htmlFor="rollNo" className={styles.label}>Roll No</label>
          <input
            type="text"
            id="rollNo"
            placeholder='Roll No'
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            className={styles.inputField}
            required
          />
        
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            placeholder='Email Id'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
            required
          />

          <label htmlFor="photos" className={styles.label}>Photos</label>
          <input
            type="file"
            id="photos"
            onChange={handleFileChange}
            className={styles.inputField}
            multiple
            required
            style={{color: "black"}}
          />
  
        </div>
        <button type="submit" className={styles.button}>Add Student</button>
      </form>
    </div>
  );
};

export default AddStudentForm;
