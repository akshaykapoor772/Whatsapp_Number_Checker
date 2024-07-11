import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import CircularProgress from '@mui/material/CircularProgress';
import { Button } from '@mui/material';
import './AdminPage.css';

const socket = io('http://localhost:5500');  // Update with your actual backend URL

function AdminPage({handleAdminLogout}) {
    const [qrSrc, setQrSrc] = useState('');
    const [message, setMessage] = useState('Please scan the QR code to authenticate.');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket.on('qr', (data) => {
            setQrSrc(data.src);
            setMessage('Scan the QR Code with WhatsApp');
            setLoading(false);
        });

        socket.on('authenticated', (data) => {
          setQrSrc('');  // Clear the QR code
          setMessage(data.message);
          setLoading(false);
        });

        socket.on('qr-request', (data) => {
          setMessage(data.message);
          setLoading(true);  // Show loading until the new QR code is received
        });

        return () => {
          socket.off('qr');
          socket.off('authenticated');
          socket.off('qr-request');
      };
    }, []);

    return (
      <div className="top-parent">
      <h2>Admin Page</h2>
      <Button 
        variant="contained"
        color="secondary" 
        onClick={handleAdminLogout} 
        style={{ backgroundColor: '#ff1744', color: 'white', position: 'absolute', top: 10, right: 10 }}>
        Logout
    </Button>
      <h3>{message}</h3>
            {/* Conditional rendering based on loading or QR code existence */}
            {(loading || qrSrc) && (
                <div className="qr-container">
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <img src={qrSrc} alt="WhatsApp QR Code" />
                    )}
                </div>
            )}
      </div>
    );
}

export default AdminPage;
