import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const SideBar = ({ onSelectMenuItem }) => {
  const handleMenuItemClick = (menuItem) => {
    onSelectMenuItem(menuItem);
  };
  
  const handleLogout = async () => {
    try {
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  return (
    <div className={styles.sidebar}>
      <ul className={styles.nav}>
        <li onClick={() => handleMenuItemClick('home')}>
          <Link to="/dashboard">Home</Link>
        </li>
        <li onClick={() => handleMenuItemClick('create-class')}>
          <Link to="/dashboard">Create Class</Link>
        </li>
        <li onClick={() => handleMenuItemClick('add-student')}>
          <Link to="/dashboard">Add Student</Link>
        </li>
        <li onClick={() => handleMenuItemClick('enroll-students')}>
          <Link to="/dashboard">Enroll Student</Link>
        </li>
      </ul>
      <div className={styles.logout}>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default SideBar;
