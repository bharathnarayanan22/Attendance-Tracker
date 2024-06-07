import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './MotionIntro.css'; // Ensure this path is correct

const MotionIntro = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home'); // Replace '/next-page' with your target route
    }, 12000); // Total animation time (10s) + 2s delay

    return () => clearTimeout(timer);
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 5, staggerChildren: 0.5 }
    },
  };

  const logoVariants = {
    hidden: { scale: 5 },
    visible: { scale: 1, transition: { duration: 5 } },
  };

  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 5 } }
  };

  const textVariants = {
    hidden: { opacity: 0, x: -50 }, // Slide from left
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="intro-container"
      initial="hidden"
      animate="visible"
    >
      <motion.img
        src="src/assets/logo.png" // Ensure the path to your logo is correct
        alt="Logo"
        className="logo"
        variants={logoVariants}
        initial="hidden"
        animate="visible"
      />
      <motion.div
        className="text-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="intro-text-container"
          variants={textContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="intro-text large-text" variants={textVariants}>
            TEAM PHOENIX
          </motion.h1>
        </motion.div>
        <motion.h1 className="intro-text small-text" variants={textVariants}>
          Presents
        </motion.h1>
        <motion.h2 className="intro-text small-text" variants={textVariants}>
          SMART ATTENDANCE TRACKER
        </motion.h2>
      </motion.div>
    </motion.div>
  );
};

export default MotionIntro;
