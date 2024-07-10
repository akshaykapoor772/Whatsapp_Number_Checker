import React, { useState, useEffect, useRef } from 'react';
import DataTable from './DataTable'; 

const FileValidator = ({ files }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploaded, setUploaded] = useState(false); // Track if the files have been uploaded
    const [message, setMessage] = useState(''); // To store the success message
    const isMounted = useRef(false);
    const [progress, setProgress] = useState(0); // To track upload progress
    const [showData, setShowData] = useState(false); // To control when to show the data

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
    }, [files, uploaded, loading]);

    const uploadFiles = (files) => {
        setLoading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:5500/upload', true);

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
                        setData(result.data);
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
    };

    if (loading) {
        return (
            <div>
                <p>Uploading... {progress}%</p>
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