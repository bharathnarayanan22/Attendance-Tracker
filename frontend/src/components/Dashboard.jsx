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
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/classes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/classes/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
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
    const updatedCourses = courses.map((course) => {
      if (course._id === courseId) {
        const updatedEnrolledStudents = course.enrolledStudents.filter((student) => student._id !== studentId);
        return { ...course, enrolledStudents: updatedEnrolledStudents };
      }
      return course;
    });
    setCourses(updatedCourses);

    // Update enrolledStudents state
    if (selectedCourse === courseId) {
      setEnrolledStudents(updatedCourses.find((course) => course._id === courseId).enrolledStudents);
    }
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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
      const updatedAttendanceMap = { ...attendanceMap };

      if (matchedStudent._id in updatedAttendanceMap) {
        updatedAttendanceMap[matchedStudent._id] = {
          ...updatedAttendanceMap[matchedStudent._id],
          present: !updatedAttendanceMap[matchedStudent._id].present,
          timestamp: new Date().toLocaleString(),
        };
      } else {
        updatedAttendanceMap[matchedStudent._id] = {
          present: true,
          timestamp: new Date().toLocaleString(),
        };
      }

      setAttendanceMap(updatedAttendanceMap);
      storeAttendance(matchedStudent._id, updatedAttendanceMap[matchedStudent._id].present);
    }
  };

  // const handleTakeAttendance = async () => {
  //   if (!cameraStarted) {
  //     startCamera();
  //     setCameraStarted(true);
  //   }

  //   setIsLoading(true);

  //   intervalRef.current = setInterval(async () => {
  //     await sendSnapshot();
  //     setIsLoading(false);
  //   }, 30000);
  // };

  const handleTakeAttendance = async () => {
    if (!cameraStarted) {
      startCamera();
      setCameraStarted(true);
      setIsLoading(true);
  
      intervalRef.current = setInterval(async () => {
        await sendSnapshot();
        setIsLoading(false);
      }, 30000);
    } else {
      stopCamera();
      setCameraStarted(false);
      setResult('')
      setIsLoading(false);
    }
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
    setShowAttendance(!showAttendance);
    setSelectedCourse(courseId);
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
                <h2 style={{ color: "white" }}>Course Details {selectedCourse?.courseName}</h2>
                  <button className={styles.backButton} onClick={handleBack}>Back</button>
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
                          />
                        </td>
                        <td>{attendanceMap[student._id] ? attendanceMap[student._id].timestamp : 'N/A'}</td>
                        <td>
                          <button onClick={() => handleUnenroll(selectedCourse, student._id)} className={styles.backButton}>Unenroll</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.studentActions}>
                <button
                    className={styles.attendanceButton}
                    onClick={handleTakeAttendance}
                  >
                    {cameraStarted ? 'Stop Camera' : 'Start Camera'}
                  </button>
                  <div className={styles.videoContainer}>
                    <video ref={videoRef} autoPlay className={styles.video} />
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      result && <p>{result}</p>
                    )}
                  </div>
                  
                  <button
                    className={styles.attendanceButton}
                    onClick={() => handleViewAttendance(selectedCourse)}
                  >
                    {showAttendance ? 'Close Attendance' : 'View Attendance'}
                  </button>
                </div>
                {showAttendance && <AttendanceDisplay courseId={selectedCourse} onClose={() => setShowAttendance(false)} />}
              </div>
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
                    <div key={course._id} className={styles.courseBox}>
                      <h4>{course.courseName}</h4>
                      <p>Course Code: {course.courseCode}</p>
                      <p>Timing: {course.sessionTiming}</p>
                      <p>Students Enrolled: {course.enrolledStudents ? course.enrolledStudents.length : 0}</p>
                      <div className={styles.courseActions}>
                        <button className={styles.deleteButton} onClick={() => handleDeleteCourse(course._id)}>
                          <img src="src/assets/del.png" alt="Delete" className={styles.icon} />
                        </button>
                        {"\t"}{"\t"}<button className={"viewcourse"} onClick={() => handleCourseClick(course._id)}>View course</button>
                      </div>
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