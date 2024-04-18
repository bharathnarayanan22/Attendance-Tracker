import React from "react";
import axios from "axios";

const Dashboard = () => {
  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/logout");
      window.location.href = "/"; 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
};

export default Dashboard;
