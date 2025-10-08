// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');  
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => { // <-- Wrapped in asyncHandler
    let token;

    // 1. Check for token in cookies first (if using HttpOnly cookies)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        // console.log('Token from cookie:', token ? 'found' : 'not found'); // Log if token was found
    }
    // 2. If not in cookies, check for token in Authorization header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        // console.log('Token from header:', token ? 'found' : 'not found'); // Log if token was found
    }

    // If no token is found in either place
    if (!token) {
        // console.log('No token found in cookies or header. Returning 401.');
        res.status(401);
        throw new Error('Not authorized, no token'); // asyncHandler will catch this
    }

    // Attempt to verify token and find user
    console.log('Attempting to verify token. Token present:', !!token); // Log presence of token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Token decoded payload:', decoded); // Show decoded payload

        // Find the user by ID from the decoded token payload
        // IMPORTANT: Ensure your User model is correctly linked and 'id' is the field to query.
        // Also, make sure this query doesn't hang.
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            // console.log('User not found for decoded ID:', decoded.id, 'Returning 401.');
            res.status(401);
            throw new Error('Not authorized, user not found');
        }

        // Attach the user to the request object
        req.user = user;
        // console.log(`User ${user.email} successfully attached to request.`);

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // console.error('Authentication error during token verification or user lookup:', error.message);
        // If it's a JWT error (e.g., JsonWebTokenError, TokenExpiredError)
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Not authorized, token is invalid or expired');
        } else {
            // Other errors (e.g., database connection issue during User.findById)
            res.status(500); // 500 for server-side errors
            throw new Error(`Server error during authentication: ${error.message}`);
        }
    }
});

module.exports = { protect };