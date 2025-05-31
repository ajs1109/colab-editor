import React from 'react';

const ProjectBoard = () => {
  return (
    <div className="project-board">
      <h2>Project Board</h2>
      <div className="board-columns">
        <div className="column todo">
          <h3>To Do</h3>
          {/* Add cards for tasks here */}
        </div>
        <div className="column in-progress">
          <h3>In Progress</h3>
          {/* Add cards for tasks here */}
        </div>
        <div className="column done">
          <h3>Done</h3>
          {/* Add cards for tasks here */}
        </div>
      </div>
      <button className="add-task-button">Add Task</button>
    </div>
  );
};

export default ProjectBoard;