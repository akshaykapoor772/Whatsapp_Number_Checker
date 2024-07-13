const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uploadDataSchema = new Schema({
    name: String,
    email: { type: String, unique: false },  
    mobile_number: String,
    is_valid: Boolean,
    checked_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UploadData', uploadDataSchema);