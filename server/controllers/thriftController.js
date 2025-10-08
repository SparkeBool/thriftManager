const Thrift = require("../models/Thrift");
const Activity = require("../models/Activity"); // Import Activity model to log events
const asyncHandler = require("express-async-handler");

// @desc    Create a new thrift plan
// @route   POST /api/thrifts
// @access  Private
const createThrift = async (req, res) => {
  const { name, startDate, amountPerCycle, frequency, endDate, status, maxMembers } =
    req.body;
  const userId = req.user._id;

  console.log(name, startDate, amountPerCycle, frequency, maxMembers);

  

  if (!name || !startDate || !amountPerCycle || !frequency || !maxMembers) {
    return res
      .status(400)
      .json({ message: "Please fill all required thrift fields" });
  }

  try {
    const thrift = await Thrift.create({
      userId,
      name,
      startDate,
      amountPerCycle,
      frequency,
      endDate,
      status,
      maxMembers
    });

    // Log this action as an activity for the dashboard
    await Activity.create({
      userId,
      action: `New thrift plan created: "${thrift.name}"`,
      time: new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      icon: "📈",
    });

    res.status(201).json(thrift);
  } catch (error) {
    console.error("Error creating thrift plan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all thrifts for the authenticated user
// @route   GET /api/thrifts
// @access  Private
const getThrifts = asyncHandler(async (req, res) => {
    

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 25; // Default to 25 items per page
    const skip = (page - 1) * limit;

    try {
        const userId = req.user.id; // Make sure req.user.id is correctly populated by your auth middleware

        // Get total count for pagination metadata
        const totalThrifts = await Thrift.countDocuments({ userId });

        // Fetch thrifts for the current page
        const thrifts = await Thrift.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Optional: sort by creation date, newest first

        // Log received values for debugging (optional, remove in production)
        console.log(`Fetching thrifts for user: ${userId}, Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
        console.log(`Total thrifts found: ${totalThrifts}, Thrifts on this page: ${thrifts.length}`);

        res.status(200).json({
            thrifts,
            currentPage: page,
            totalPages: Math.ceil(totalThrifts / limit),
            totalThrifts,
        });

    } catch (error) {
        console.error('Error fetching thrifts in getThrifts controller:', error);
        res.status(500).json({ message: 'Server error fetching thrifts', error: error.message });
    }
});

// @desc    Update a thrift plan
// @route   PUT /api/thrifts/:id
// @access  Private (Owner only)
const updateThrift = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get thrift ID from URL parameters
    const userId = req.user.id; // Get user ID from authenticated user

    // Get updated fields from request body.
    // Ensure you pick only allowed fields to prevent malicious updates.
    const {
        name,
        startDate,
        endDate,
        amountPerCycle,
        frequency,
        status,
        maxMembers,
        description,
        isPublic
    } = req.body;

    // Find the thrift by ID
    const thrift = await Thrift.findById(id);

    if (!thrift) {
        res.status(404);
        throw new Error('Thrift not found');
    }

    // Ensure the authenticated user is the owner of the thrift
    if (thrift.userId.toString() !== userId) {
        res.status(403); // Forbidden
        throw new Error('Not authorized to update this thrift');
    }

    // Basic validation for required fields if they are being updated
    // (You might want more robust Joi/Express-validator schema here)
    if (!name || !startDate || !amountPerCycle || !frequency) {
        res.status(400);
        throw new Error('Please fill all required fields: name, startDate, amountPerCycle, frequency');
    }

    // Update thrift fields
    thrift.name = name;
    thrift.startDate = startDate;
    thrift.endDate = endDate; // endDate is optional
    thrift.amountPerCycle = amountPerCycle;
    thrift.frequency = frequency;
    thrift.status = status; // Status might be changed by admin or automatically
    thrift.maxMembers = maxMembers; // maxMembers is optional
    thrift.description = description; // description is optional
    thrift.isPublic = isPublic; // isPublic is optional

    const updatedThrift = await thrift.save();

    
   // Log this action as an activity for the dashboard
    await Activity.create({
      userId,
      action: `Thrift Updated: "${thrift.name}"`,
      time: new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      icon: "📈",
    });

    res.status(200).json(updatedThrift);
});


module.exports = {
    createThrift,
    getThrifts,
    updateThrift, // Export the new function
};