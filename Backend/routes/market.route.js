import express from "express";
import { getCandles, getQuote, getAllQuotes } from "../controllers/market.controller.js";

const router = express.Router();

// GET /markets/candles/:symbol?interval=1min&outputsize=100
router.get("/candles/:symbol", getCandles);

// GET /markets/quote/:symbol  — single asset quote
router.get("/quote/:symbol", getQuote);

// GET /markets/all-quotes  — batch quotes for all tracked assets
router.get("/all-quotes", getAllQuotes);

export default router;