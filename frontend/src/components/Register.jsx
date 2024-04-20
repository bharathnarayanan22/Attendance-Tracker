import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './slide.css';

const Register = () => {
  const navigate = useNavigate(); // Import useNavigate hook

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = isSignUp ? 'http://localhost:5000/api/auth/signup' : 'http://localhost:5000/api/auth/login';
    const requestData = { name, email, password, dept };

    try {
      const response = await axios.post(apiUrl, requestData);

      if (isSignUp) {
        console.log(response.data.message);
        setFormData({ ...formData, isSignUp: false });
      } else {
        const { token, userId } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        navigate('/dashboard'); // Navigate to '/dashboard' route using navigate
      }
    } catch (error) {
      console.error(`${isSignUp ? 'Signup' : 'Login'} failed:`, error);
    }
  };

  return (
    <div className="body">
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`}>
        <div className="form-container sign-up-container">
          <form onSubmit={handleSubmit}>
            <h1>Create Account</h1>
            <input type="text" placeholder="Name" name="name" value={name} onChange={handleChange} required />
            <input type="email" placeholder="Email" name="email" value={email} onChange={handleChange} required />
            <input type="password" placeholder="Password" name="password" value={password} onChange={handleChange} required />
            <input type="text" placeholder="Department" name="dept" value={dept} onChange={handleChange} required />
            <button type="submit">Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form onSubmit={handleSubmit}>
            <h1>Sign In</h1>
            <input type="email" placeholder="Email" name="email" value={email} onChange={handleChange} required />
            <input type="password" placeholder="Password" name="password" value={password} onChange={handleChange} required />
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
