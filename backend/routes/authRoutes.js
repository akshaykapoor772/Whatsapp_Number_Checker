const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const router = express.Router();
const UserAuth = require('../models/UserAuth');

//Admin registration
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

//Admin login
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

// User Registration
router.post('/user/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const newUser = new UserAuth({ email, password });
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// User Login
router.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserAuth.findOne({ email });
        if (!user) {
            return res.status(401).send('Authentication failed');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Authentication failed');
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;