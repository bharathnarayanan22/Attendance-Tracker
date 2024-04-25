// AttendanceDisplay.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceDisplay = ({ courseId }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  console.log(courseId)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/classes/${courseId}/attendance`);
        console.log(response.data)
        setAttendanceData(response.data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [courseId]);

  return (
    <div>
      <h2>Attendance for Class</h2>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Present</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((record) => (
            <tr key={record.studentId}>
              <td>{record.studentName}</td>
              <td>{record.present ? 'Yes' : 'No'}</td>
              <td>{new Date(record.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceDisplay;
