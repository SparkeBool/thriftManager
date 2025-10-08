// Import your core application models
const Member = require("../models/Member");
const Contribution = require("../models/Contribution");
const Thrift = require("../models/Thrift");
const Activity = require("../models/Activity");

// @desc    Get dashboard stats for the logged-in user
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  const userId = req.user._id;
  try {
    // Total Members for this user
    const totalMembers = await Member.countDocuments({ userId });

    // 2. Total Contributions Amount for this user
    // Use MongoDB aggregation for sum if you have many contributions for better performance
    const totalContributionsResult = await Contribution.aggregate([
      { $match: { userId } }, // Filter by user
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }, // Sum the 'amount' field
    ]);
    const totalContributionsAmount =
      totalContributionsResult.length > 0
        ? totalContributionsResult[0].totalAmount
        : 0;
    const formattedTotalContributions = `₦${totalContributionsAmount.toLocaleString()}`;

    // 3. Active Thrifts for this user
    const activeThrifts = await Thrift.countDocuments({
      userId,
      status: "active",
    });

    // Construct the stats array
    const stats = [
      {
        title: "Total Members",
        value: totalMembers.toLocaleString(),
        icon: "Users",
        bgColor: "#6610f2",
        growth: "+15%",
        trend: "up",
      }, // Growth/trend can be dynamic based on historical data if implemented
      {
        title: "Total Contributions",
        value: formattedTotalContributions,
        icon: "DollarSign",
        bgColor: "#20c997",
        growth: "+8%",
        trend: "up",
      },
      {
        title: "Active Thrifts",
        value: activeThrifts.toLocaleString(),
        icon: "PieChart",
        bgColor: "#fd7e14",
        growth: "+5%",
        trend: "up",
      },
    ];

    res.status(200).json(stats);
  } catch (error) {
    console.error(`Error fetching dashboard stats for user ${userId}:`, error);
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

// @desc    Get recent activities for the logged-in user
// @route   GET /api/dashboard/activities
// @access  Private
const getDashboardActivities = async (req, res) => {
  const userId = req.user._id;
  try {
    const recentActivities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Format activities for frontend
    const formattedActivities = recentActivities.map((activity) => ({
      action: activity.action,
      time: activity.time || activity.createdAt.toLocaleString(),
      icon: activity.icon,
    }));

    res.status(200).json(formattedActivities);
  } catch (error) {
    console.error(
      `Error fetching dashboard activities for user ${userId}:`,
      error
    );
    res.status(500).json({
      message: "Error fetching dashboard activities",
      error: error.message,
    });
  }
};

// @desc    Debug: Get all activities (for troubleshooting only)
// @route   GET /api/dashboard/debug-activities
const getAllActivitiesDebug = async (req, res) => {
  try {
    const activities = await Activity.find({}).limit(10);
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all activities",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardActivities,
  getAllActivitiesDebug,
};
