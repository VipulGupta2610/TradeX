import mongoose from "mongoose";
import Watchlist from "../schemas/watchlist.schema.js";

export const getMyWatchlist = async (req,res)=>{
    try {
        if (!mongoose.isValidObjectId(req.params.userid)) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const items = await Watchlist.find({ userid: req.params.userid }).sort({ createdAt: -1 });
        return res.status(200).json({ watchlist: items });
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch watchlist" });
    }
};

export const addToWatchlist = async (req,res)=>{
    try {
        const { userid, symbol, name, type, exchange } = req.body;
        if (!mongoose.isValidObjectId(userid) || !symbol?.trim()) {
            return res.status(400).json({ message: "User and symbol are required" });
        }

        const item = await Watchlist.findOneAndUpdate(
            { userid, symbol: symbol.trim().toUpperCase() },
            {
                $set: {
                    name: name?.trim() || symbol.trim(),
                    type: type || "Stocks",
                    exchange: exchange || ""
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return res.status(201).json({ message: "Added to watchlist", item });
    } catch (error) {
        return res.status(500).json({ message: "Unable to add symbol" });
    }
};

export const removeFromWatchlist = async (req,res)=>{
    try {
        if (!req.body.symbol?.trim()) {
            return res.status(400).json({ message: "Symbol is required" });
        }
        const item = await Watchlist.findOneAndDelete({
            userid: req.params.userid,
            symbol: req.body.symbol.trim().toUpperCase()
        });
        if (!item) return res.status(404).json({ message: "Watchlist item not found" });
        return res.status(200).json({ message: "Removed from watchlist" });
    } catch (error) {
        return res.status(500).json({ message: "Unable to remove symbol" });
    }
};
