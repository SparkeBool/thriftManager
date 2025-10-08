// server/controllers/contributionController.js

const asyncHandler = require('express-async-handler');
const Contribution = require('../models/Contribution');
const Activity = require('../models/Activity');
const Member = require('../models/Member');
const Thrift = require('../models/Thrift'); // Corrected from thriftModel

// @desc    Add a new contribution
// @route   POST /api/contributions/create
// @access  Private
const createContribution = asyncHandler(async (req, res) => {
    const { memberId, amount, date, thriftId } = req.body; // Add thriftId here
    const userId = req.user._id;

    if (!memberId || !amount || !date || !thriftId) { // Ensure thriftId is also checked
        res.status(400);
        throw new Error('Please include member, amount, date, and associated thrift for the contribution.');
    }

    try {
        const contribution = await Contribution.create({
            userId,
            memberId,
            thrift: thriftId, // Save the thriftId to the 'thrift' field
            amount,
            date: date || Date.now(),
            status: 'Pending', // Default status for new contributions
            transactionRef: `TRN-${Date.now()}-${Math.floor(Math.random() * 1000)}` // Simple auto-generated ref
        });

        let memberName = 'Unknown Member';
        const member = await Member.findById(memberId);
        if (member) memberName = member.name;

        await Activity.create({
            userId,
            action: `₦${contribution.amount.toLocaleString()} contribution received from ${memberName}`,
            time: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
            icon: '💰'
        });

        res.status(201).json(contribution);
    } catch (error) {
        console.error('Error creating contribution:', error);
        res.status(500);
        throw new Error('Server error: ' + error.message);
    }
});


// @desc    Get all contributions for the authenticated user
// @route   GET /api/contributions/all
// @access  Private
// backend/controllers/yourController.js (or wherever getContributions is)
const getContributions = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20; // Default to 20 items per page
    const skip = (page - 1) * limit;

    try {
        const userId = req.user.id;
        
        // Find all thrifts belonging to the current user
        const thrifts = await Thrift.find({ userId: userId }).select('_id');
        const thriftIds = thrifts.map(thrift => thrift._id);

        // Find total count of contributions for pagination metadata
        const totalContributions = await Contribution.countDocuments({
            thrift: { $in: thriftIds }
        });

        // Find contributions for the current page
        const contributions = await Contribution.find({
            thrift: { $in: thriftIds }
        })
        .populate('thrift', 'name')
        .populate('memberId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Optional: sort by creation date, newest first

        // Log for debugging
        console.log(`Fetched ${contributions.length} contributions for user ${userId} on page ${page}. Total found: ${totalContributions}`);
        
        // Send the paginated response
        res.status(200).json({
            contributions,
            currentPage: page,
            totalPages: Math.ceil(totalContributions / limit),
            totalContributions,
        });

    } catch (error) {
        console.error('Error fetching contributions:', error);
        res.status(500).json({ message: 'Server error fetching contributions', error: error.message });
    }
});

module.exports = {
    createContribution,
    getContributions,
};