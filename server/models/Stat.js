const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References your User model
        required: true
    },
    title: { type: String, required: true },
    value: { type: String, required: true },
    bgColor: { type: String, required: true },
    growth: { type: String, required: true },
    trend: { type: String, required: true, enum: ['up', 'down', 'stable'] }
}, {
    timestamps: true
});

module.exports = mongoose.model('Stat', statSchema);