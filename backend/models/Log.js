import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    ip: {
        type: String,
        index: true
    },
    endpoint: {
        type: String,
        required: true
    },
    algorithm: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ALLOWED', 'BLOCKED'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

const Log = mongoose.model('Log', logSchema);

export default Log;
