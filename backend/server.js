require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Papa = require('papaparse');
const UploadData = require('./models/UploadData'); 
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const http = require('http');
const socketIo = require('socket.io');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const UploadEvent = require('./models/UploadEvent');
const app = express();
const PORT = process.env.PORT || 5500;
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",  // Adjust this to match your front-end URL in production
        methods: ["GET", "POST"]
    }
});

// Setup WhatsApp client and QR code event
console.log('Initializing WhatsApp client...');
const whatsappClient = new Client({
    webVersionCache: {type: 'none'},
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 1000000
    }
  });

let isInitialized = false;
if (!isInitialized) {
    whatsappClient.initialize()
    .then(() => console.log('WhatsApp client initialized successfully'))
    .catch(e => {
        console.error('Failed to initialize WhatsApp client:', e);
        console.log(e.stack);
    })
    isInitialized = true;
}

whatsappClient.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Error generating QR code:', err);
            return;
        }
        io.emit('qr', { src: url });
        console.log('QR Code sent to the client');
    });
});

whatsappClient.on('ready', () => {
    console.log('WhatsApp client is ready and authenticated!');
    io.emit('authenticated', { message: "You are now logged in to WhatsApp and ready to use services" });
});

whatsappClient.on('authenticated', (session) => {
    console.log('Authentication successful!', session);
    const SystemEvent = require('./models/SystemEvent');
    SystemEvent.create({
        event_type: 'auth_success',
        description: 'WhatsApp authentication successful.'
    });
});

whatsappClient.on('auth_failure', msg => {
    console.error('Authentication failure:', msg);
});

whatsappClient.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected!', reason);
    io.emit('qr-request', { message: "Please scan QR code again to reconnect." });
    isInitialized = false;  // Reset initialization flag
});

whatsappClient.on('error', (error) => {
    console.error('Error in WhatsApp client:', error);
});

io.on('connection', socket => {
    console.log('Client connected to the socket');
    // Additional socket events can be handled here
});

// Additional routes and logic
app.get('/some-route', (req, res) => {
    res.send('Response from some route');
});

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

app.use('/auth', authRoutes);

app.get('/auth/login', protect, (req, res) => {
    res.status(200).json({ message: 'You are authenticated', user: req.user });
  });

// Mock function to check if a phone number is a valid WhatsApp number
const isValidWhatsAppNumber = (phoneNumber) => {
    // Example mock check: valid if exactly 10 digits
    return phoneNumber.length === 10;
};

app.post('/upload', protect, upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }
    let allResults = [];
    let filesProcessed = 0;

    const handleChunkComplete = () => {
        filesProcessed += 1;
        if (filesProcessed === req.files.length) {
            const fileNames = req.files.map(file => file.originalname);  // Gather all file names
            const fileSizes = req.files.map(file => file.size);        
            UploadEvent.create({
                user_id: req.user._id,
                user_name: req.user.Name,
                file_names: fileNames,
                file_sizes: fileSizes,
                valid_numbers: allResults.filter(user => user.is_valid).length,
                invalid_numbers: allResults.filter(user => !user.is_valid).length,
                total_numbers: allResults.length
            });
            // All files processed
            res.json({ message: "Data processed and stored successfully!", data: allResults });
        }
    };
    req.files.forEach(file => {
        // Parse CSV data in chunks
        Papa.parse(file.buffer.toString(), {
            header: true,
            skipEmptyLines: true,  // Skip empty lines
            //chunkSize: 1000,  // Increase chunk size to avoid unnecessary chunk processing
            transformHeader: header => header.trim(), // Normalize headers
            chunk: function(results, parser) {
                console.log(`Processing chunk with ${results.data.length} entries`);
                const users = results.data.map(contact => {
                    // Strip out non-numeric characters from the phone number
                    const cleanPhoneNumber = contact['Mobile Number'] ? contact['Mobile Number'].replace(/\D/g, '') : '';
                    if (!cleanPhoneNumber || !contact.Name || !contact['Email Address']) {
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
                UploadData.insertMany(users)
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



server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});