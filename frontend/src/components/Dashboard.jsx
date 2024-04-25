import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './SideBar';
import AddStudent from './AddStudent';
import EnrollStudentsForm from './EnrollStudentsForm';
import CreateClassForm from './CreateClassForm';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import AttendanceDisplay from './AttendanceDisplay';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState('home');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [showAttendance, setShowAttendance] = useState(false);
  const [result, setResult] = useState('');
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


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

    return () => {
      stopCamera();
    };
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
      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseId));
      // window.location.reload();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
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
    stopCamera();
    setCameraStarted(false);
    setSelectedCourse(null);
    setResult('');
    setIsLoading(false);
  };
  

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setCameraStarted(true);
    } catch (error) {
      console.error('Error accessing the camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg');
    }
    return null;
  };

  const sendSnapshot = async () => {
    try {
      const imageData = takeSnapshot();
      if (!imageData) return;

      const formData = new FormData();
      formData.append('File1', dataURItoBlob(imageData), 'snapshot.jpg');

      const response = await fetch('http://localhost:5000/check-face', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      displayResult(data.result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  };

  const displayResult = (result) => {
    if (result.length > 0 && result[0]._label !== 'unknown') {
      setResult(`Detected face: ${result[0]._label}`);
      markAttendance(result[0]._label);
    } else {
      setResult('No face detected or unknown face');
    }
  };

  const markAttendance = (detectedName) => {
    const matchedStudent = enrolledStudents.find((student) => student.name === detectedName);
    if (matchedStudent) {
      console.log(`Attendance marked for ${detectedName}`);
      // Update attendance status and timestamp for the matched student
      const updatedAttendanceMap = { ...attendanceMap };

    if (matchedStudent._id in updatedAttendanceMap) {
      // Student already has attendance recorded, toggle present status
      updatedAttendanceMap[matchedStudent._id] = {
        ...updatedAttendanceMap[matchedStudent._id],
        present: !updatedAttendanceMap[matchedStudent._id].present,
        timestamp: new Date().toLocaleString(),
      };
    } else {
      // Add new attendance entry for the student
      updatedAttendanceMap[matchedStudent._id] = {
        present: true,
        timestamp: new Date().toLocaleString(),
      };
    }

    // Update attendanceMap state with the updated attendance information
    setAttendanceMap(updatedAttendanceMap);
    storeAttendance(matchedStudent._id, updatedAttendanceMap[matchedStudent._id].present);
    }
  };
  
  const handleTakeAttendance = async () => {
    if (!cameraStarted) {
      startCamera();
      setCameraStarted(true);
    }

    setIsLoading(true); // Set loading state

    intervalRef.current = setInterval(async () => {
      await sendSnapshot();
      setIsLoading(false); // Reset loading state after sending snapshot
    }, 30000);
  };

  const storeAttendance = async (studentId, present) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/classes/${selectedCourse}/mark-attendance`,
        { studentId, present },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      console.log(response.data.message); 
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  
  const handleViewAttendance = (courseId) => {
    console.log(courseId)
    setSelectedCourse(courseId);
    setShowAttendance(true); // Set the selected course ID to display attendance
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
              <div className={styles.courseDetailsContainer}>
                <div className={styles.courseDetailsHeader}>
                  <h2>Course Details - {selectedCourse?.courseName}</h2>
                  <button onClick={handleBack}>Back</button>
                </div>
                <table className={styles.studentTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll Number</th>
                      <th>Attendance</th>
                      <th>Date & Time of Attendance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((student) => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.rollNo}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={attendanceMap[student._id] && attendanceMap[student._id].present}
                            className={styles.attendanceCheckbox}
                            disabled
                          /></td>
                            {/* <td><input type="checkbox" checked={attendanceMap[student._id] && attendanceMap[student._id].present}
                    onChange={(e) => storeAttendance(student._id, e.target.checked)} className={styles.attendanceCheckbox} disabled/></td> */}
                        
                        <td>{attendanceMap[student._id] ? attendanceMap[student._id].timestamp : 'N/A'}</td>
                        
                        {/* <td className={styles.attendanceCheckbox}>
                      {student.attendance && student.attendance.present ? 'Yes' : 'No'}
                    </td>
                    <td>
                      {student.attendance && student.attendance.timestamp
                        ? student.attendance.timestamp
                        : 'N/A'}
                    </td> */}
                    <td>
                          <button onClick={() => handleUnenroll(selectedCourse._id, student._id)}>Unenroll</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.studentActions}>              
                {cameraStarted ? (
                  <div>
                    <video ref={videoRef} autoPlay />
                    {/* <button onClick={handleTakeAttendance}>Take Attendance</button> */}
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      result && <p>{result}</p>
                    )}
                  </div>
                ) : (
                  <button onClick={handleTakeAttendance}>Start Camera</button>
                )}
              <button className={styles.deleteButton} onClick={() => handleViewAttendance(selectedCourse)}>View Attendance</button>
                </div>
                {showAttendance && <AttendanceDisplay courseId={selectedCourse} />}
              </div>
            </div>
          );
        }else {
          return (
            <div className={styles.mainContent}>
              <h2>Welcome to Dashboard, {username}!</h2>
              <div className={styles.courseContainer}>
                <h3>Available Courses</h3>
                <div className={styles.courseList}>
                  {courses.map((course) => (
                    <div key={course._id} className={styles.courseBox} >
                      <h4>{course.courseName}</h4>
                      <p>Course Code: {course.courseCode}</p>
                      <p>Timing: {course.sessionTiming}</p>
                      <p>Students Enrolled: {course.enrolledStudents ? course.enrolledStudents.length : 0}</p>
                      <button className={styles.deleteButton} onClick={() => handleDeleteCourse(course._id)}>
                        Delete
                      </button>
                      {/* <button className={styles.deleteButton} onClick={() => handleViewAttendance(course._id)}>View Attendance</button> */}
                      <button className={styles.deleteButton} onClick={() => handleCourseClick(course._id)}>View course</button>
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
