import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './facultyDetectionStyles.css';

const FacultyDetection = () => {
  const [facultyName, setFacultyName] = useState('');
  const [result, setResult] = useState('');
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = mediaStream;
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
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

  const handleDetectFaculty = async (event) => {
    event.preventDefault();

    const imageData = takeSnapshot();
    if (imageData) {
      const formData = new FormData();
      formData.append('File1', dataURItoBlob(imageData), 'snapshot.jpg');

      try {
        const response = await fetch('http://localhost:5000/check-face', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        displayResult(data.result);
      } catch (error) {
        console.error('Error sending snapshot:', error);
      }
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
      const detectedName = result[0]._label;

      if (detectedName.toLowerCase() === facultyName.toLowerCase()) {
        setResult(`Faculty: ${facultyName} is found on cam 1`);
      } else {
        setResult(`Faculty: ${facultyName} is not found`);
      }
    } else {
      setResult('No face detected or unknown face');
    }
  };

  const handleBackToHome = () => {
    stopCamera();
    navigate('/home');
  };

  const resultStyle = {
    fontSize: '20px',
    color: result.includes('cam') ? '#28a745' : 'red',
  };

  return (
    <div className="c1">
    <div className="container">
      <h1 className="title">Faculty Detection Page</h1>
      <form className="form" onSubmit={handleDetectFaculty}>
        <label className="label" htmlFor="facultyName">Enter Faculty Name:</label>
        <input
          className="input"
          type="text"
          id="facultyName"
          name="facultyName"
          value={facultyName}
          onChange={(e) => setFacultyName(e.target.value)}
          placeholder="Enter faculty name"
        />
        <button className="button" type="submit">Detect Faculty</button>
      </form>

      <div className="video-container">
        <video className="video" ref={videoRef} autoPlay></video>
      </div>

      <p style={resultStyle}>{result}</p>

      <button className="back-button" onClick={handleBackToHome}>Back to Home</button>
    </div>
    </div>
  );
};

export default FacultyDetection;
