const mongoose = require('mongoose');

const systemEventSchema = new mongoose.Schema({
    event_type: String,  // e.g., 'qr_generated', 'auth_success', 'auth_failure'
    description: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemEvent', systemEventSchema);