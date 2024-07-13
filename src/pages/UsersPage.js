import React from 'react';
import FileUploadForm from '../components/FileUploadForm';
import { Button } from '@mui/material';

function UsersPage({handleUserLogout}) {
  return (
    <div style={{ position: 'relative' }}>
    <Button 
      variant="contained" 
      color="secondary" 
      onClick={handleUserLogout} 
      style={{ backgroundColor: '#ff1744', color: 'white', position: 'absolute', top: 10, right: 10 }}>
      Logout
    </Button>
    <FileUploadForm />
  </div>
  );
}

export default UsersPage;