import positions from "../schemas/positions.schema.js";

export const getMyPositions = async (req,res)=>{
    try {
        const result = await positions
            .find({ userid: req.params.userid, quantity: { $gt: 0 } })
            .sort({ updatedAt: -1 });

        return res.status(200).json({ positions: result });
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch positions" });
    }
}
