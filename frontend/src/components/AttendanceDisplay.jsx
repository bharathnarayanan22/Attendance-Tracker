import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {CloudDownloadOutlined } from '@ant-design/icons'
import {Menu} from "antd"

const AttendanceDisplay = ({ courseId }) => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/classes/${courseId}/attendance`);
        setAttendanceData(response.data);
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
    csvContent += attendanceData.map(record => `${record.studentName},${record.present ? 'Present' : 'Absent'},${new Date(record.timestamp).toLocaleString()}`).join('\n');
  
    // Create a temporary anchor element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance.csv");
    document.body.appendChild(link);
  
    // Trigger the download
    link.click();
  };
  

  return (
    <div>
      <h2>Attendance for Class</h2>
      <Menu >
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