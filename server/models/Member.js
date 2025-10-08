const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to your User model
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add a member name'],
        trim: true,
    },
    phone: { // Example field
        type: String,
        required: false,
    },
    address: { // Example field
        type: String,
        required: false,
    },
    // Add any other member-specific fields here
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Member', memberSchema);