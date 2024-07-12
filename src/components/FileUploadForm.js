import React, { useState } from 'react';
import FileValidator from './FileValidator';
import { Button, List, ListItem, ListItemText, Typography, Box, useTheme} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function FileUploadForm() {
  const [files, setFiles] = useState([]);
  const [uploadClicked, setUploadClicked] = useState(false);
  const theme = useTheme();

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
    setUploadClicked(false);
  };

  const handleUploadClick = () => {
    setUploadClicked(true); 
  };

  const renderFileNames = () => (
    <Box sx={{ marginTop: 2, marginBottom: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 2, color: theme.palette.text.primary  }}>
        Please confirm these are the files to be uploaded then click on upload:
      </Typography>
      <List sx={{ border: '1px solid #ccc', 
        borderRadius: '4px', 
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary}}>
        {files.map((file, index) => (
          <ListItem key={index} sx={{ borderBottom: '1px solid #ddd',
          borderColor: theme.palette.divider, 
          ':last-child': { borderBottom: 'none' } }}>
            <ListItemText primary={file.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
      <div style={{ padding: '20px' }}>
        <h1>WhatsApp Number Checker</h1>
        <input
          accept=".csv, .xls, .xlsx"
          style={{ display: 'none' }}
          id="raised-button-file"
          multiple
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span" startIcon={<UploadFileIcon />}>
            Choose files
          </Button>
        </label>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUploadClick}
          disabled={files.length === 0}
          startIcon={<CloudUploadIcon />}
          style={{ marginLeft: '10px' }}
        >
          Upload
        </Button>
        {files.length > 0 && !uploadClicked && renderFileNames()}
        {uploadClicked && files.length > 0 && <FileValidator files={files} startProcessing={uploadClicked} />}
      </div>
  );
}

export default FileUploadForm;