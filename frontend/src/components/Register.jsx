import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./slide.css";

const Register = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dept: '',
    isSignUp: false
  });

  const { name, email, password, dept, isSignUp } = formData;

  const handleFormToggle = () => {
    setFormData({ ...formData, isSignUp: !isSignUp });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', formData);
      console.log(response.data.message);

      // Redirect to dashboard upon successful signup
      window.location.replace('/dashboard'); // Redirect using window.location
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      window.location.replace('/dashboard'); // Redirect using window.location
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  return (
    <div className="body">
      <div className={`container ${isSignUp ? "right-panel-active" : ""}`}>
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignup}>
            <h1>Create Account</h1>
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Department"
              name="dept"
              value={dept}
              onChange={handleChange}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={handleChange}
              required
            />
            <button type="submit">Sign In</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Already have an account?</h1>
              <p>Please login to access your profile.</p>
              <button className="ghost" onClick={handleFormToggle}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Don't have an account?</h1>
              <p>Go ahead and create an account for yourself!</p>
              <button className="ghost" onClick={handleFormToggle}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
