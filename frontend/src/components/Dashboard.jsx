import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [className, setClassName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [schedule, setSchedule] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [classes, setClasses] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('Home');

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    // Fetch additional data or perform actions on component mount
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
  
  const handleCreateClass = async (e) => {
    e.preventDefault();
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

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    try {
      const enrollmentData = { studentId: selectedStudent, classId: e.target.value };
      const response = await axios.post('http://localhost:5000/api/enrollments', enrollmentData);
      console.log('Student enrolled successfully:', response.data);
      setSelectedStudent('');
    } catch (error) {
      console.error('Student enrollment failed:', error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
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

  const renderContent = () => {
    switch (selectedSidebarItem) {
      case 'Create Class':
        return (
          <form onSubmit={handleCreateClass}>
            <h2>Create Class</h2>
            <input
              type="text"
              placeholder="Class Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              required
            />
            <button type="submit">Create Class</button>
          </form>
        );

      case 'Enroll Students':
        return (
          <form>
            <h2>Enroll Students</h2>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name}
                </option>
              ))}
            </select>
            <select onChange={handleEnrollStudent} required>
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} - {cls.courseCode}
                </option>
              ))}
            </select>
            <button type="submit">Enroll Student</button>
          </form>
        );

      case 'Add Student':
        return (
          <form onSubmit={handleAddStudent}>
            <h2>Add Student</h2>
            <input
              type="text"
              placeholder="Student Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Student Email"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
            />
            <button type="submit">Add Student</button>
          </form>
        );

      default:
        return (
          <div className="class-list">
            <h2>All Classes</h2>
            <ul>
              {classes.map((cls) => (
                <li key={cls._id}>
                  {cls.className} - {cls.courseCode}
                </li>
              ))}
            </ul>
          </div>
        );
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/logout");
      window.location.href = "/"; 
    } catch (error) {
      console.error("Logout failed:", error);
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
