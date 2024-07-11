import React, { useState } from 'react';

function UserLogin({ setToken }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:5500/auth/user/login', { // Make sure this endpoint is correct
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            setToken(data.token);
            localStorage.setItem('userToken', data.token); // Use a different key to distinguish from adminToken
        } else {
            console.error(data.message);
            alert(data.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>User Login</h2>
            <div>
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit">Log In</button>
        </form>
    );
}

export default UserLogin;