import React, { useState, useEffect, useRef } from 'react';

const FileValidator = ({ files }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploaded, setUploaded] = useState(false); // Track if the files have been uploaded
    const isMounted = useRef(false);
    const [progress, setProgress] = useState(0); // To track upload progress

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
    }, [files]);

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
                if (result.data) {
                    setData(result.data);
                }
                setUploaded(true); // Mark the files as uploaded
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
            {data.length > 0 ? data.map((row, index) => (
                <div key={index}>
                    <p>Name: {row.name}</p>
                    <p>Email: {row.email}</p>
                    <p>Number: {row.mobile_number}</p>
                    <p>Status: {row.is_valid ? "Valid" : "Invalid"}</p>
                    <hr />
                </div>
            )) : <p>No data to display</p>}
        </div>
    );
};

export default FileValidator;