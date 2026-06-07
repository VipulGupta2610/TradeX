import express from "express";
import { login, signup } from "../controllers/user.controller.js";
import { getMyWatchlist } from "../controllers/watchlist.controller.js";
import { getMyPositions } from "../controllers/postions.schema.js";

const router = express.Router()

// authentication routes
router.post("/signup" , signup)
router.post("/login",login)

// watchlist routes
router.get("/Watchlist/:userid" , getMyWatchlist)

// positions routes 
router.get("/Positions/:userid" , getMyPositions)

export default router