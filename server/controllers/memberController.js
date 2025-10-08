// server/controllers/memberController.js

const asyncHandler = require('express-async-handler'); // Don't forget this!
const Member = require('../models/Member');
const Activity = require('../models/Activity');

// @desc    Add a new member
// @route   POST /api/members
// @access  Private (requires authentication)
const createMember = asyncHandler(async (req, res) => { // Wrapped with asyncHandler
    const { name, phone, address } = req.body;
    const userId = req.user._id;

    if (!name) {
        res.status(400);
        throw new Error('Please include a member name');
    }

    try {
        const member = await Member.create({
            userId, // Associate the member with the user who created it
            name,
            phone,
            address,
        });

        await Activity.create({
            userId,
            action: `New member added: ${member.name}`,
            time: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
            icon: '🤝'
        });

        res.status(201).json(member);
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500);
        throw new Error('Server error: ' + error.message);
    }
});

// Get all members for the authenticated user
// @desc    Get all members for the authenticated user
// @route   GET /api/members/all
// @access  Private
const getMembers = asyncHandler(async (req, res) => {
      const members = await Member.find({ userId: req.user.id });

     res.status(200).json(members);
});

module.exports = {
    createMember,
    getMembers,  
};