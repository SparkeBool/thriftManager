// server/models/Contribution.js
const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    memberId: { // Link to a specific member
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true, // Typically, a contribution should be for a specific member
    },
     
    thrift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thrift',
        required: true, // A contribution should ideally belong to a thrift
    },
    amount: {
        type: Number,
        required: [true, 'Please add a contribution amount'],
        min: [0, 'Amount must be a positive number'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    // You might also want status and transactionRef fields on the model
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Overdue', 'Refunded'], // Example statuses
        default: 'Pending'
    },
    transactionRef: {
        type: String,
        unique: true, // Can be unique, or not if internal
        // You might generate this in the backend
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Contribution', contributionSchema);