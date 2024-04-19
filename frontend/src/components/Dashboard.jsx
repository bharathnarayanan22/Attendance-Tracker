import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import ClassList from './ClassList';
import CreateClassForm from './CreateClassForm';
import EnrollStudentsForm from './EnrollStudentsForm';
import AddStudentForm from './AddStudentForm';

const Dashboard = () => {
  const [className, setClassName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [schedule, setSchedule] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [classes, setClasses] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('Home');
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleCreateClass = async () => {
    try {
      const newClass = { className, courseCode, schedule };
      const response = await axios.post('http://localhost:5000/api/classes', newClass);
      setClasses([...classes, response.data]);
      setClassName('');
      setCourseCode('');
      setSchedule('');
    } catch (error) {
      console.error('Class creation failed:', error);
    }
  };

  const handleEnrollStudent = async (classId) => { // Accept classId as parameter
    try {
      const enrollmentData = {
        studentId: selectedStudent,
        classId: classId // Use the passed classId
      };
      const response = await axios.post('http://localhost:5000/api/enrollments', enrollmentData);
      console.log('Student enrolled successfully:', response.data);
      setSelectedStudent('');
    } catch (error) {
      console.error('Student enrollment failed:', error);
    }
  };
  
  
  
  
  const handleAddStudent = async () => {
    try {
      const newStudent = { name: className, email: courseCode };
      const response = await axios.post('http://localhost:5000/api/students', newStudent);
      setStudents([...students, response.data]);
      setClassName('');
      setCourseCode('');
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const handleSidebarItemClick = (item) => {
    setSelectedSidebarItem(item);
  };

  const handleClassClick = async (classId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/enrollments/class/${classId}`);
      const enrolledStudents = response.data;
      setEnrolledStudents(enrolledStudents);
    } catch (error) {
      console.error('Failed to fetch enrolled students:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderContent = () => {
    switch (selectedSidebarItem) {
      case 'Create Class':
        return (
          <CreateClassForm
            className={className}
            courseCode={courseCode}
            schedule={schedule}
            handleCreateClass={handleCreateClass}
            setClassName={setClassName}
            setCourseCode={setCourseCode}
            setSchedule={setSchedule}
          />
        );

      case 'Enroll Students':
        return (
          <EnrollStudentsForm
            students={students}
            classes={classes}
            selectedStudent={selectedStudent}
            handleEnrollStudent={handleEnrollStudent}
            setSelectedStudent={setSelectedStudent}
          />
        );

      case 'Add Student':
        return (
          <AddStudentForm
            className={className}
            courseCode={courseCode}
            handleAddStudent={handleAddStudent}
            setClassName={setClassName}
            setCourseCode={setCourseCode}
          />
        );

      default:
        return (
          <ClassList
            classes={classes}
            handleClassClick={handleClassClick}
          />
        );
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Welcome, {loggedInUser}</h2>
        <ul>
          <li onClick={() => handleSidebarItemClick('Home')}>Home</li>
          <li onClick={() => handleSidebarItemClick('Create Class')}>Create Class</li>
          <li onClick={() => handleSidebarItemClick('Enroll Students')}>Enroll Students</li>
          <li onClick={() => handleSidebarItemClick('Add Student')}>Add Student</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>

      <div className="main-content">
        <h1>Faculty Dashboard</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
