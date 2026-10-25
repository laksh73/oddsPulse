const mongoose = require("mongoose");

const oddsSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true
    },
    marketHash: {
        type: String,
        required: true
    },
    outcomeOne: {
        type: Number,
        default: null
    },
    outcomeTwo: {
        type: Number,
        default: null
    },
    edge: {
        type: Number,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});


// It groups all identical marketHash values together in ascending order (1).
//  Inside each identical market hash group, it sorts the documents by timestamp from oldest to newest (1).
oddsSchema.index({ marketHash: 1, timestamp: 1 }); // Create a compound index on marketHash and timestamp for efficient querying

module.exports = mongoose.model("Odds", oddsSchema);