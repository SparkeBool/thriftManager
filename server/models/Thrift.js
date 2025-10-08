const mongoose = require('mongoose');

const thriftSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to your User model
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add a thrift name'],
        trim: true,
    },
    startDate: {
        type: Date,
        required: [true, 'Please add a start date'],
    },
    endDate: {
        type: Date,
        required: false, // Can be set later
    },
    amountPerCycle: {
        type: Number,
        required: [true, 'Please add amount per cycle'],
        min: [0, 'Amount must be a positive number'],
    },
    frequency: { // e.g., 'daily', 'weekly', 'monthly'
        type: String,
        required: [true, 'Please add frequency'],
        enum: ['daily', 'weekly', 'monthly', 'bi-weekly', 'yearly'], // Example values
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled', 'pending'],
        default: 'pending',
    },
        maxMembers: {
            type: Number,
            required: false,
            min: [2, 'Minimum members must be 2']
        },
        description: {
            type: String,
            required: false,
            trim: true
        },
        isPublic: {
            type: Boolean,
            default: true
        }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Thrift', thriftSchema);