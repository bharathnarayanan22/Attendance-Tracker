import React from 'react';

const CreateClassForm = ({ className, courseCode, schedule, handleCreateClass, setClassName, setCourseCode, setSchedule }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateClass();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Class</h2>
      <input
        type="text"
        placeholder="Class Name"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Course Code"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Schedule"
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
        required
      />
      <button type="submit">Create Class</button>
    </form>
  );
};

export default CreateClassForm;
