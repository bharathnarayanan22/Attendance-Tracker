import React from 'react';

const EnrollStudentsForm = ({ students, classes, selectedStudent, handleEnrollStudent, setSelectedStudent }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const classId = e.target.querySelector('select[name="class"]').value; // Get the selected class ID
    handleEnrollStudent(classId); // Pass the selected classId to handleEnrollStudent
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enroll Students</h2>
      <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
        <option value="">Select Student</option>
        {students.map((student) => (
          <option key={student._id} value={student._id}>
            {student.name}
          </option>
        ))}
      </select>
      <select name="class" required>
        <option value="">Select Class</option>
        {classes.map((cls) => (
          <option key={cls._id} value={cls._id}>
            {cls.className} - {cls.courseCode}
          </option>
        ))}
      </select>
      <button type="submit">Enroll Student</button>
    </form>
  );
};

export default EnrollStudentsForm;
