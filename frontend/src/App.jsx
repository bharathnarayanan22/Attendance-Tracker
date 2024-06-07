import React from "react";
import Home from "./components/Home"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import FacultyDetection from "./components/FacultyDetection";
import MotionIntro from "./components/MotionIntro";

const App = () => {
  return(
    <>
    <main>
    <Router>
      <Routes>
        <Route path="/" element={<MotionIntro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/faculty-detection" element={<FacultyDetection />} />
      </Routes>
    </Router>
    </main>
    </>
  )
}

export default App;