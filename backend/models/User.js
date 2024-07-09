// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    email: { type: String, unique: false },  // Ensure emails are unique across the collection
    mobile_number: String,
    is_valid: Boolean,
    checked_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);