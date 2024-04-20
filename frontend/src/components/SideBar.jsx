import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ onSelectMenuItem }) => {
  const handleMenuItemClick = (menuItem) => {
    onSelectMenuItem(menuItem);
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
        <li><Link to="/logout">Logout</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;

