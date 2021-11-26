const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaderSchema = Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        default: ''
    },
    abbr: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    usePushEach: true
});

module.exports = mongoose.model('Leader', leaderSchema);