// models/UserAuth.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userAuthSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

userAuthSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('UserAuth', userAuthSchema);