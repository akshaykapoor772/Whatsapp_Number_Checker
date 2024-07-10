import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <div>
        <label>Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Log In</button>
    </form>
  );
}

export default Login;