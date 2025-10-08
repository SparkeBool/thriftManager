// server/routes/memberRoutes.js

const express = require('express');
const router = express.Router();
const {
    createMember,
    getMembers //  
} = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createMember); // Route to add a new member

//  Get all members for the authenticated user
// This will respond to GET /api/members/all
router.get('/all', protect, getMembers); //  

module.exports = router;