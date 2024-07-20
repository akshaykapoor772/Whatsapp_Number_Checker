require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Papa = require('papaparse');
const xlsx = require('xlsx');
const UploadData = require('./models/UploadData'); 
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const http = require('http');
const socketIo = require('socket.io');
const pLimit = require('p-limit');
const limit = pLimit(30); // Limit of concurrent operations within a batch of numbers
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

const activeSockets = new Map();
io.on('connection', socket => {
    console.log(`Client connected: ${socket.id}`);
    activeSockets.set(socket.id, socket);
    socket.on('disconnect', () => {
        activeSockets.delete(socket.id);
        console.log(`Client disconnected: ${socket.id}`);
    });
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
let isAuthenticated = false;
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
    isAuthenticated = true;
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
    isAuthenticated = false;
});

whatsappClient.on('error', (error) => {
    console.error('Error in WhatsApp client:', error);
});

// Additional routes and logic
app.get('/some-route', (req, res) => {
    res.send('Response from some route');
});

const corsOptions = {
    origin: 'http://localhost:3000', // Allow only your frontend URL
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

const checkWhatsAppContact = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.trim() === '') {
        return { is_valid: false, reason: "Invalid phone number" }; // Immediately return false if the phone number is invalid
    }
    if (!isAuthenticated) {
        return { is_valid: false, reason: "Not authenticated" };
    }
    try {
        // Construct the full contact ID (append "@c.us" which is common for WhatsApp IDs)
        const contactId = phoneNumber + '@c.us';
        
        // Fetch the contact from WhatsApp
        const isRegistered = await whatsappClient.isRegisteredUser(contactId);
        
        // Return whether the contact is registered on WhatsApp
        return { is_valid: isRegistered, reason: isRegistered ? "Valid" : "Invalid" };
    } catch (error) {
        return { is_valid: false, reason: "Error checking status" };
    }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Batch size and delay configuration
const BATCH_SIZE = 30; // Number of numbers to process at once
const DELAY_BETWEEN_BATCHES = 1000; // Delay in milliseconds

const processBatch = async (batch) => {
    const tasks = batch.map(contact => {
        const cleanPhoneNumber = contact['Mobile Number'] ? String(contact['Mobile Number']).replace(/\D/g, '') : '';
        if (!cleanPhoneNumber) {
            console.log(`Skipping entry due to missing mobile number: ${JSON.stringify(contact)}`);
            return null;
        }
        return limit(() => checkWhatsAppContact(cleanPhoneNumber).then(result => ({
            mobile_number: cleanPhoneNumber,
            name: contact.Name || '',
            email: contact['Email Address'] || '',
            is_valid: result.is_valid,
            status_reason: result.reason,
            checked_at: new Date()
        })));
    });
    return await Promise.all(tasks.filter(task => task !== null));
};

const processChunk = async (data, socket) => {
    let allResults = [];
    let processedCount = 0;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        const batchResults = await processBatch(batch);
        allResults = allResults.concat(batchResults);
        await delay(DELAY_BETWEEN_BATCHES); // Delay between batches to manage rate limits
        processedCount += batchResults.length;
        const progress = Math.round((processedCount / data.length) * 100);
        socket.emit('progress', progress);
    }
    console.log(`Inserting ${allResults.length} entries to the database.`);
    await UploadData.insertMany(allResults);
    return allResults;
};

app.post('/upload', protect, upload.array('files'), async (req, res) => {
    const socketId = req.body.socketId; // Ensure you're passing this from the client
    console.log("socket id is:", socketId)
    const socket = activeSockets.get(socketId);
    if (!socket) {
        console.log("Socket not found.");
        return res.status(404).json({ error: "Socket not found" });
    }

    if (!req.files || req.files.length === 0) {
        console.log("No files received for upload.");
        return res.status(400).json({ error: 'No files uploaded.' });
    }
    try {
        const results = await Promise.all(req.files.map(async file => {
            console.log(`Processing file: ${file.originalname}`);
            const fileType = file.originalname.split('.').pop().toLowerCase();
            if (fileType === 'csv') {
                return new Promise((resolve, reject) => {
                    Papa.parse(file.buffer.toString(), {
                        header: true,
                        skipEmptyLines: true,
                        transformHeader: header => header.trim(),
                        complete: async (results) => {
                            try {
                                const processedResults = await processChunk(results.data, socket);
                                console.log(`Finished processing CSV file: ${file.originalname}`);
                                resolve(processedResults);
                            } catch (err) {
                                console.log(`Error processing CSV file: ${file.originalname}`, err);
                                reject(err);
                            }
                        }
                    });
                });
            } else if (fileType === 'xlsx') {
                const workbook = xlsx.read(file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
                return await processChunk(data, socket);
            } else {
                throw new Error('Unsupported file type');
            }
        }));

        const allResults = results.flat();
        const fileNames = req.files.map(file => file.originalname);
        const fileSizes = req.files.map(file => file.size);
        console.log("Creating upload event in the database.");
        await UploadEvent.create({
            user_id: req.user._id,
            user_email: req.user.email,
            file_names: fileNames,
            file_sizes: fileSizes,
            valid_numbers: allResults.filter(user => user.is_valid).length,
            invalid_numbers: allResults.filter(user => !user.is_valid).length,
            total_numbers: allResults.length
        });
        console.log("Data processed and stored successfully.");
        res.json({ message: "Data processed and stored successfully!", data: allResults });
    } catch (err) {
        console.error("Error processing files:", err);
        res.status(500).json({ error: 'Error processing files.' });
    }
});


app.get('/api/admin/upload-stats', protect, async (req, res) => {
    console.log("Fetching upload stats");
    try {
        const uploadStats = await UploadEvent.aggregate([
            {
                $group: {
                    _id: null,
                    totalFiles: { $sum: { $size: "$file_names" } },
                    totalNumbers: { $sum: "$total_numbers" },
                    totalValidNumbers: { $sum: "$valid_numbers" },
                    totalInvalidNumbers: { $sum: "$invalid_numbers" }
                }
            }
        ]);
        res.json(uploadStats);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route to get uploads over time
app.get('/api/admin/uploads-over-time', protect, async (req, res) => {
    console.log("Fetching upload over time");
    try {
        const uploadsOverTime = await UploadEvent.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    filesUploaded: { $sum: 1 },
                    validNumbers: { $sum: "$valid_numbers" },
                    invalidNumbers: { $sum: "$invalid_numbers" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        res.json(uploadsOverTime);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/api/admin/upload-events', protect, async (req, res) => {
    console.log("Fetching upload events");
    try {
      const uploadEvents = await UploadEvent.find();
      res.json(uploadEvents);
    } catch (error) {
      res.status(500).send(error);
    }
  });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});