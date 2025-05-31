import React from 'react';

const FileExplorer = () => {
  const [files, setFiles] = React.useState([]);

  React.useEffect(() => {
    // Fetch the file structure from the repository API
    const fetchFiles = async () => {
      const response = await fetch('/api/repositories/files'); // Adjust the API endpoint as needed
      const data = await response.json();
      setFiles(data);
    };

    fetchFiles();
  }, []);

  const renderFiles = (files) => {
    return files.map((file) => (
      <div key={file.path} className="file-item">
        {file.type === 'directory' ? (
          <div className="directory">
            <span className="folder-icon">📁</span>
            {file.name}
            <div className="nested-files">{renderFiles(file.children)}</div>
          </div>
        ) : (
          <div className="file">
            <span className="file-icon">📄</span>
            {file.name}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="file-explorer">
      <h2>File Explorer</h2>
      <div className="file-list">{renderFiles(files)}</div>
    </div>
  );
};

export default FileExplorer;