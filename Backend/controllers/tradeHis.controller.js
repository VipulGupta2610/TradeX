import trades from "../schemas/tradeHis.schema.js";

// GET route to fetch all journal entries for a user
export const getMyJournal = async (req, res) => {
    try {
        const { userid } = req.params;
        
        // Fetch all trades, sorted by the most recently closed first
        const journalEntries = await trades.find({ userid }).sort({ closedAt: -1 });
        
        return res.status(200).json(journalEntries);
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch journal entries" });
    }
};

// PATCH route to update journal notes for a specific trade
export const updateTradeJournal = async (req, res) => {
    try {
        const { tradeid } = req.params;
        const { thesisNotes, mistakesNotes, tags, setupName } = req.body;

        const updatedTrade = await trades.findByIdAndUpdate(
            tradeid,
            { 
                $set: { 
                    thesisNotes, 
                    mistakesNotes, 
                    tags, 
                    setupName 
                } 
            },
            { new: true } // Returns the updated document back to the frontend
        );

        if (!updatedTrade) return res.status(404).json({ message: "Trade not found" });

        return res.status(200).json(updatedTrade);
    } catch (error) {
        return res.status(500).json({ message: "Failed to update journal notes" });
    }
};