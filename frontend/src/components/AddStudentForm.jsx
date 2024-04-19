import React from 'react';

const AddStudentForm = ({ className, courseCode, handleAddStudent, setClassName, setCourseCode }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddStudent();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Student</h2>
      <input
        type="text"
        placeholder="Student Name"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Student Email"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
        required
      />
      <button type="submit">Add Student</button>
    </form>
  );
};

export default AddStudentForm;
