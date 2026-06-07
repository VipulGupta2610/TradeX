import express from "express";
import { getCandles } from "../controllers/market.controller.js";

const router = express.Router()

router.get("/candles/:symbol",getCandles)

export default router;