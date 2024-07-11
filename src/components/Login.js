import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5500/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const text = await response.text();
    try {
        const data = JSON.parse(text); // Try to parse it as JSON
        if (response.status === 200) {
            setToken(data.token);
            localStorage.setItem('token', data.token); // Store the token in localStorage
        } else {
            console.error(data.message);
            alert(data.message); // Display error message from server
        }
    } catch (error) {
        console.error('Failed to parse JSON:', text);
        alert('Incorrect Username or Password', text);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
    <Paper elevation={6} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography component="h1" variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <AdminPanelSettingsIcon />
        Admin Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          Log In
        </Button>
      </Box>
    </Paper>
  </Container>
);
}

export default Login;