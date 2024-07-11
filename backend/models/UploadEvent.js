const mongoose = require('mongoose');

const uploadEventSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    file_names: [String],
    file_sizes: [Number],
    valid_numbers: Number,
    invalid_numbers: Number,
    total_numbers: Number  // Adding total numbers for a better overview
});

module.exports = mongoose.model('UploadEvent', uploadEventSchema);