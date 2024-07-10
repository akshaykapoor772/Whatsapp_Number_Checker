const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).send('Admin registered');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).send('Authentication failed');
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).send('Authentication failed');
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;