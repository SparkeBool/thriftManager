// backend/routes/contributionRoutes.js
const express = require('express');
const router = express.Router();
const {
    createContribution,
    getContributions,
    // Add other controller functions here if you implement update/delete
} = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have an auth middleware

// Route to add a new contribution
// POST /api/contributions/create
// Protected: Requires authentication
router.post('/create', protect, createContribution);

// Route to get all contributions for the authenticated user
// GET /api/contributions/all
// Protected: Requires authentication
router.get('/all', protect, getContributions);

// Example: Route to get a single contribution by ID
// router.get('/:id', protect, getContributionById);

// Example: Route to update a contribution
// router.put('/:id', protect, updateContribution);

// Example: Route to delete a contribution
// router.delete('/:id', protect, deleteContribution);

module.exports = router;