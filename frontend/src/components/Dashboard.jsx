import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './SideBar';
import AddStudent from './AddStudent';
import EnrollStudentsForm from './EnrollStudentsForm';
import CreateClassForm from './CreateClassForm';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState('home');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendanceResults, setAttendanceResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsername(response.data.name);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/classes');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchUserData();
    fetchCourses();
  }, []);

  const handleCourseClick = async (courseId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/classes/${courseId}/students`);
      setEnrolledStudents(response.data);
      setSelectedCourse(courseId);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/classes/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedCourses = courses.filter((course) => course._id !== courseId);
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleStartAttendance = () => {
    const socket = socketIOClient('http://localhost:5000');
    socket.emit('startAttendance');

    socket.on('attendanceResult', (detections) => {
      setAttendanceResults(detections);
      // Process attendance results here and update UI accordingly
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  };

  const handleUnenroll = async (courseId, studentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/classes/${courseId}/unenroll`,
        { studentId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // After unenrollment, update the list of enrolled students for the course
      const updatedCourses = courses.map((course) => {
        if (course._id === courseId) {
          const updatedEnrolledStudents = course.enrolledStudents.filter((student) => student._id !== studentId);
          return { ...course, enrolledStudents: updatedEnrolledStudents };
        }
        return course;
      });

      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error unenrolling student:', error);
    }
  };

  const handleBack = () => {
    setSelectedCourse(null);
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'add-student':
        return <AddStudent />;
      case 'create-class':
        return <CreateClassForm />;
      case 'enroll-students':
        return <EnrollStudentsForm />;
      case 'home':
      default:
        if (selectedCourse) {
          return (
            <div className={styles.mainContent}>
              <h2>Enrolled Students for Selected Course</h2>
              <button onClick={handleBack}>Back</button>
              <button onClick={handleStartAttendance}>Take Attendance</button>
              <ul>
                {enrolledStudents.map((student) => (
                  <li key={student._id}>
                    {student.name}
                    <button onClick={() => handleUnenroll(student._id)}>Unenroll</button>
                  </li>
                ))}
              </ul>
            </div>
          );
        } else {
          return (
            <div className={styles.mainContent}>
              <h2>Welcome to Dashboard, {username}!</h2>
              <div className={styles.courseContainer}>
                <h3>Available Courses</h3>
                <div className={styles.courseList}>
                  {courses.map((course) => (
                    <div key={course._id} className={styles.courseBox} onClick={() => handleCourseClick(course._id)}>
                      <h4>{course.courseName}</h4>
                      <p>Course Code: {course.courseCode}</p>
                      <p>Timing: {course.sessionTiming}</p>
                      <p>Students Enrolled: {course.enrolledStudents ? course.enrolledStudents.length : 0}</p>
                      <button className={styles.deleteButton} onClick={() => handleDeleteCourse(course._id)}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
    }
  };

  return (
    <div className={styles.dashboard}>
      <Sidebar onSelectMenuItem={setSelectedMenuItem} />
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
