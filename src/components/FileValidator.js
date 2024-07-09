import React, { useState, useEffect, useRef } from 'react';

const FileValidator = ({ files }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploaded, setUploaded] = useState(false); // Track if the files have been uploaded
    const isMounted = useRef(false);

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

        fetch('http://localhost:5500/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(result => {
            console.log("Received data from backend:", result);
            if (result.data) {
                setData(result.data);
            }
            setLoading(false);
            setUploaded(true); // Mark the files as uploaded
        })
        .catch(error => {
            console.error('Error:', error);
            setLoading(false);
        });
    };

    if (loading) {
        return <p>Loading...</p>;
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