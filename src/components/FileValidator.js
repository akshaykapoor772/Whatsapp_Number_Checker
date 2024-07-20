import React, { useState, useEffect, useRef } from 'react';
import DataTable from './DataTable'; 
import io from 'socket.io-client';

const FileValidator = ({ files, startProcessing }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploaded, setUploaded] = useState(false); // Track if the files have been uploaded
    const [message, setMessage] = useState(''); // To store the success message
    const isMounted = useRef(false);
    const [progress, setProgress] = useState(0); // To track upload progress
    const [showData, setShowData] = useState(false); // To control when to show the data
    const [socketConnected, setSocketConnected] = useState(false);
    const socket = useRef(null);

    useEffect(() => {
        // Establish the WebSocket connection to the server
        socket.current = io('http://localhost:5500');

        socket.current.on('connect', () => {
            setSocketConnected(true); // Set true when socket is connected
            console.log("Connected with Socket ID:", socket.current.id);
        });

        socket.current.on('progress', (progressUpdate) => {
            setProgress(progressUpdate); // Update progress based on server updates
        });

        // Clean up the socket connection when the component unmounts
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (!isMounted.current) {
            // This code will run on mount
            isMounted.current = true;
        } else {
            // This code will run on updates
            if (files.length > 0 && !uploaded && !loading) {
                console.log("Uploading files:", files.map(file => file.name));
                uploadFiles(files);
            }
        }
    }, [startProcessing, socketConnected]);

    const uploadFiles = (files) => {
        setLoading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
    
        if (socket.current && socket.current.id && socketConnected) {
            console.log("Current socket id:", socket.current.id);
            formData.append('socketId', socket.current.id);
    
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:5500/upload', true);
            xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem('userToken')}`);
    
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentComplete); // Update progress state
                }
            };
    
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    console.log("Received data from backend:", result);
                    setMessage(result.message);
                    setTimeout(() => {
                        if (result.data) {
                            const filteredData = result.data.filter(item => item !== null);
                            setData(filteredData);
                            setShowData(true);
                        }
                        setUploaded(true); // Mark the files as uploaded
                    }, 1000); // Delay the display of data for 2 seconds
                } else {
                    console.error('Error during the upload:', xhr.statusText);
                }
                setLoading(false);
            };
    
            xhr.onerror = () => {
                console.error('Error during the upload');
                setLoading(false);
            };
    
            xhr.send(formData);
        } else {
            console.error("Socket not connected or ID not available yet.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div>
                <p>Uploading and processing... {progress}%</p>
                <progress value={progress} max="100"></progress>
            </div>
        );
    }

    return (
        <div>
        {showData ? <DataTable data={data} /> : <p>{message}</p>}
        </div>
    );
};

export default FileValidator;