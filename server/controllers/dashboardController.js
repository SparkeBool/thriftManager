// backend/controllers/dashboardController.js

const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');       // Import your Member model
const Thrift = require('../models/Thrift');       // Import your Thrift model
const Contribution = require('../models/Contribution'); // Import your Contribution model
const Activity = require('../models/Activity');

/**
 * @desc    Get aggregated dashboard statistics for the authenticated user
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user.id; // ID of the currently logged-in user

    // --- 1. Find all Thrifts belonging to the user ---
    // This is the core filter, as Contributions are linked to Thrifts.
    const userThrifts = await Thrift.find({ userId: userId }).select('_id').lean();
    const userThriftIds = userThrifts.map(thrift => thrift._id);

    // --- 2. Fetch all key metrics concurrently using Promise.all ---
    const [
        totalMembers,
        totalThrifts,
        totalContributionsResult,
        recentActivity
    ] = await Promise.all([

        // A. Total Members: Count of members created by this user
        // Assuming your Member model has a 'userId' field linking to the creator/owner
        Member.countDocuments({ userId: userId }),

        // B. Total Thrifts: Count of thrifts created by this user
        Thrift.countDocuments({ userId: userId }),

        // C. Total Contributions Amount: Aggregate sum of all contributions for the user's thrifts
        Contribution.aggregate([
            // Filter contributions to only those associated with the user's thrifts
            { $match: { thrift: { $in: userThriftIds } } },
            // Group and sum the 'amount' field
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        // D. Recent Activity: Latest contributions (e.g., 5 items)
        Contribution.find({ thrift: { $in: userThriftIds } })
            .sort({ date: -1 }) // Sort by date descending (newest first)
            .limit(5)
            .populate('memberId', 'name')
            .populate('thrift', 'name')
            .lean() // Return plain JS objects
    ]);

    // Extract the total contributions value (it comes from an aggregation array)
    const totalContributions = totalContributionsResult.length > 0
        ? totalContributionsResult[0].total
        : 0;

    // --- 3. Send the response matching the frontend expectations ---
    res.status(200).json({
        totalMembers: totalMembers,
        totalThrifts: totalThrifts,
        totalContributions: totalContributions,
        recentActivity: recentActivity,
        // You can add other metrics here like: totalPending, totalOverdue, etc.
    });
});

/**
 * @desc    Get recent activities for the authenticated user
 * @route   GET /api/dashboard/activities
 * @access  Private
 */
const getDashboardActivities = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const activities = await Activity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    res.status(200).json(activities);
});

module.exports = {
    getDashboardStats,
    getDashboardActivities
};