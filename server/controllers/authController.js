// server/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken"); // Keep this import for jwt.sign

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // IMPORTANT: When registering, you should also set the cookie if you want the user
    // to be automatically logged in after registration.
    const token = generateToken(user._id); // Generate token here too!

    res.cookie("token", token, {
      // <--- Set the actual token here
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matching generateToken's expiresIn
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      // You can remove 'token' from the JSON response if you're relying solely on cookies
      // token: token, // Or keep it if your frontend also expects it
    });
  } catch (error) {
    console.error("Registration error:", error); // Log the actual error
    res.status(500).json({ message: "Server error", error: error.message }); // Send error message for debugging
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id); // <--- GENERATE THE TOKEN HERE

      res.cookie("token", token, {
        // <--- Set the generated token (the string)
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      });
      res.json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message }); // Send error message
    console.error("Login error:", error); // Use console.error for errors
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (req, res) => {
  if (req.user) {
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};
