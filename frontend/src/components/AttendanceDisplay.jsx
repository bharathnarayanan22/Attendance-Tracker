import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudDownloadOutlined } from '@ant-design/icons'
import { Menu } from "antd"

const AttendanceDisplay = ({ courseId }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [lastAttendanceTimestamp, setLastAttendanceTimestamp] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendanceRecords, setStudentAttendanceRecords] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/classes/${courseId}/attendance`);
        setAttendanceData(response.data.attendance);
        setLastAttendanceTimestamp(response.data.lastAttendanceTimestamp);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [courseId]);

  const downloadCSV = () => {
    // Add header row to CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Status,Timestamp\n";

    // Convert attendance data to CSV format
    csvContent += attendanceData.map(record => `${record.studentName},${record.present ? 'Present' : 'Absent'},${record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}`).join('\n');

    // Create a temporary anchor element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance.csv");
    document.body.appendChild(link);

    // Trigger the download
    link.click();
  };

  const viewStudentAttendance = async (studentId) => {
    // Find the selected student
    const student = attendanceData.find(record => record.studentId === studentId);
    // Set the selected student
    setSelectedStudent(student);

    try {
      // Fetch all attendance records of the selected student
      const response = await axios.get(`http://localhost:5000/api/students/${studentId}/attendance`);
      setStudentAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching student attendance records:', error);
    }
  };

  return (
    <div>
      <h2 style={{ color: "white" }}>Attendance for Class</h2>
      <Menu>
        <Menu.Item className='download' key='download' onClick={downloadCSV} icon={<CloudDownloadOutlined />}>
          Download CSV
        </Menu.Item>
      </Menu>
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
            <tr key={record.studentId} onClick={() => viewStudentAttendance(record.studentId)} style={{ cursor: 'pointer' }}>
              <td>{record.studentName}</td>
              <td>{record.present ? 'Yes' : 'No'}</td>
              <td>{record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <p>Last Attendance Time: {lastAttendanceTimestamp ? new Date(lastAttendanceTimestamp).toLocaleString() : 'N/A'}</p> */}
      {selectedStudent && (
        <div>
          <h3>Attendance Record for {selectedStudent.studentName}</h3>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentAttendanceRecords.map((record, index) => (
                <tr key={index}>
                  <td>{new Date(record.timestamp).toLocaleString()}</td>
                  <td>{record.present ? 'Present' : 'Absent'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceDisplay;
