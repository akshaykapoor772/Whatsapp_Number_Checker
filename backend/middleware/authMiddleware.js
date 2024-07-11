const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const UserAuth = require('../models/UserAuth');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attempt to find admin or user from the token
            req.user = await Admin.findById(decoded.id) || await UserAuth.findById(decoded.id);
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };