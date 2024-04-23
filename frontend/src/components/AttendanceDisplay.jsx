import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceDisplay = ({ classId }) => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/classes/${classId}/attendance`);
        setAttendance(response.data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [classId]);

  return (
    <div>
      <h2>Attendance for Selected Class</h2>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Attendance Status</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record._id}>
              <td>{record.studentId.name}</td>
              <td>{record.present ? 'Present' : 'Absent'}</td>
              <td>{new Date(record.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceDisplay;
