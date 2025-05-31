import React, { useState } from 'react';

const WikiEditor = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleSave = async () => {
    // Implement save functionality here
    // This could involve making an API call to save the wiki content
  };

  return (
    <div className="wiki-editor">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Wiki Page Title"
        className="wiki-title-input"
      />
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Write your wiki content here..."
        className="wiki-content-textarea"
      />
      <button onClick={handleSave} className="save-button">
        Save
      </button>
    </div>
  );
};

export default WikiEditor;