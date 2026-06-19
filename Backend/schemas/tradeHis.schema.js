import mongoose from "mongoose";

const tradesSchema = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", 
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    entryPrice: { 
        type: Number,
        required: true
    },
    exitPrice: { 
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    realizedPnl: { 
        type: Number, 
        required: true
    },
    openedAt: {
        type: Date,
        required: true
    },
    closedAt: {
        type: Date,
        required: true
    },
    
    // --- THE NEW JOURNALING FIELDS ---
    setupName: { 
        type: String, 
        default: "" 
    },
    tags: [{ 
        type: String 
    }],
    thesisNotes: {
        type: String,
        default: ""
    },
    mistakesNotes: {
        type: String,
        default: ""
    },

    // --- NEW: AI Prediction Metrics at Entry ---
    aiMetrics: {
        adx: { type: Number, default: null },
        macd: { type: Number, default: null },
        rsi: { type: Number, default: null },
        volume: { type: Number, default: null }
    },
    
    // Optional: A place to store what the AI actually predicted
    aiPredictionNotes: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Add an index to make fetching a user's journal blazing fast
tradesSchema.index({ userid: 1, closedAt: -1 });

const trades = mongoose.model("Trades", tradesSchema);
export default trades;