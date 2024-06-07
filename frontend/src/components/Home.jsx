// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Welcome to Smart Attendance Tracker</h1>
        <p className={styles.description}>
          The ultimate solution for automated student attendance monitoring and staff location tracking.
        </p>
        <p className={styles.description}>
          Start managing your attendance and stay informed about campus activities today!
        </p>
        <div style={{display:"flex", justifyContent:"space-around"}}>
        <Link to="/register" className={styles.getStartedButton}>
          Take Attendance
        </Link>
        {/* <Link to="/faculty-detection" className={styles.getStartedButton}>
          Detect Faculty
        </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Home;
