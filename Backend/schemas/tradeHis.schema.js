import mongoose from "mongoose";

const tradesSchema = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", // Ensure this matches your User model export exactly
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    // The Quantitative Data
    entryPrice: { // Renamed from buyprice to support shorting
        type: Number,
        required: true
    },
    exitPrice: { // Renamed from sellprice
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    realizedPnl: { // Renamed from prfitnloss and changed to Number!
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
        default: "" // e.g., "Breakout Pullback" (from your top right UI)
    },
    tags: [{ 
        type: String // Array of strings e.g., ["Followed Plan", "Patience"]
    }],
    thesisNotes: {
        type: String,
        default: ""
    },
    mistakesNotes: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Add an index to make fetching a user's journal blazing fast
tradesSchema.index({ userid: 1, closedAt: -1 });

const trades = mongoose.model("Trades", tradesSchema);
export default trades;