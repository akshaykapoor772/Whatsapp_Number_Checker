require('dotenv').config();  // This line should be at the very top of your file

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Papa = require('papaparse');
const User = require('./models/User');  // Import your Mongoose model

const app = express();
const PORT = process.env.PORT || 5500;

const corsOptions = {
    origin: 'http://localhost:3000', // Allow only your frontend URL, change if different
    optionsSuccessStatus: 200, // For legacy browser support
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection using the URI from .env
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Mock function to check if a phone number is a valid WhatsApp number
const isValidWhatsAppNumber = (phoneNumber) => {
    // Example mock check: valid if exactly 10 digits
    return phoneNumber.length === 10;
};

app.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }

    let allResults = [];
    let filesProcessed = 0;

    const handleChunkComplete = () => {
        filesProcessed += 1;
        if (filesProcessed === req.files.length) {
            // All files processed
            res.json({ message: "Data processed and stored successfully!", data: allResults });
        }
    };

    req.files.forEach(file => {
        // Parse CSV data in chunks
        Papa.parse(file.buffer.toString(), {
            header: true,
            skipEmptyLines: true,  // Skip empty lines
            chunkSize: 1000,  // Increase chunk size to avoid unnecessary chunk processing
            transformHeader: header => header.trim(), // Normalize headers
            chunk: function(results, parser) {
                console.log(`Processing chunk with ${results.data.length} entries`);
                const users = results.data.map(contact => {
                    // Strip out non-numeric characters from the phone number
                    const cleanPhoneNumber = contact['Mobile Number'] ? contact['Mobile Number'].replace(/\D/g, '') : '';
                    if (!cleanPhoneNumber || !contact.Name || !contact['Email Address']) {
                        //console.log("INSIDE SKIPPING");
                        //console.log(`Value of CleanPhoneNum: ${cleanPhoneNumber}, Name: ${contact.Name}, Email: ${contact['Email Address']}`);
                        //console.log("skipping");
                        return null; // Skip invalid entries
                    }

                    return {
                        mobile_number: cleanPhoneNumber,
                        name: contact.Name,
                        email: contact['Email Address'],
                        is_valid: isValidWhatsAppNumber(cleanPhoneNumber),  // Use the mock function to check validity
                        checked_at: new Date()
                    };
                }).filter(user => user !== null); // Filter out invalid entries
                
                allResults = allResults.concat(users);
                //console.log("Server allResults:", allResults);
                
                // Save users to MongoDB
                User.insertMany(users)
                    .then(savedUsers => {
                        console.log("Chunk processed and saved successfully.");
                    })
                    .catch(err => {
                        console.error("Error saving data:", err);
                        res.status(500).json({ error: 'Error saving data to the database.' });
                    });
            },
            complete: function() {
                handleChunkComplete();
            },
            error: function(err) {
                console.error("Error parsing CSV:", err);
                res.status(500).json({ error: 'Error parsing CSV data.' });
            }
        });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});