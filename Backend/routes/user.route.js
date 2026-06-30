import express from "express";
import { adjustVirtualFunds, deleteAccount, login, otp_for_reset_password, resetPaperAccount, signup, updateProfile } from "../controllers/user.controller.js";
import { addToWatchlist, getMyWatchlist, removeFromWatchlist } from "../controllers/watchlist.controller.js";
import { getMyPositions } from "../controllers/postions.schema.js";
import { cancelOrder, getMyOrders, newOrder, processOrders } from "../controllers/order.controller.js";

// Import the new trade journal controllers
import { getMyJournal, updateTradeJournal } from "../controllers/tradeHis.controller.js";
import { report_bug } from "../controllers/bugReport.controller.js";
import { Limiter } from "../middlewares/RateLimiter.js";

const router = express.Router()

// authentication routes
router.post("/signup" , signup)
router.post("/login",login)

// watchlist routes
router.get("/Watchlist/:userid" , getMyWatchlist)
router.post("/Watchlist", addToWatchlist)
router.delete("/Watchlist/:userid", removeFromWatchlist)

// positions routes 
router.get("/Positions/:userid" , getMyPositions)

// paper trading routes
router.get("/Orders/:userid", getMyOrders)
router.post("/Orders", newOrder)
router.post("/Orders/process/:userid", processOrders)
router.patch("/Orders/:userid/:orderid/cancel", cancelOrder)

// account routes
router.patch("/profile/:userid", updateProfile)
router.post("/reset/:userid", resetPaperAccount)
router.post("/funds/:userid", adjustVirtualFunds)
router.delete("/account/:userid", deleteAccount)

// --- TRADE JOURNAL ROUTES ---
router.get("/TradeJournal/:userid", getMyJournal)
router.patch("/Trades/:tradeid", updateTradeJournal)

// -- Bug report --
router.post("/BugReport",report_bug)

// Password changing
router.post("/ForgotPassword",Limiter,otp_for_reset_password)

export default router;