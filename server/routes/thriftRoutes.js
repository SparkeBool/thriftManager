// routes/thriftRoutes.js
const express = require('express');
const router = express.Router();
const { createThrift, getThrifts, updateThrift } = require('../controllers/thriftController'); // Import updateThrift
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createThrift);
router.get('/all', protect, getThrifts);
router.put('/:id', protect, updateThrift); // New route for updating a thrift

module.exports = router;