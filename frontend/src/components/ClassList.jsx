import React from 'react';

const ClassList = ({ classes, handleClassClick }) => {
  return (
    <div className="class-list">
      <h2>All Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li key={cls._id} onClick={() => handleClassClick(cls._id)}>
            {cls.className} - {cls.courseCode}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassList;
