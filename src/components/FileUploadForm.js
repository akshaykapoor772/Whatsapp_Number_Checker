import React, { useState } from 'react';
import FileValidator from './FileValidator';

function FileUploadForm() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  return (
    <div>
      <h1>WhatsApp Number Checker</h1>
      <input type="file" multiple onChange={handleFileChange} accept=".csv" />
      {files.length > 0 && <FileValidator files={files} />}
    </div>
  );
}

export default FileUploadForm;