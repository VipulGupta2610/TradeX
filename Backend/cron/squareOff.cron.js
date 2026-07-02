// Backend/cron/squareOff.cron.js
//
// Force-closes every open MIS (intraday) position at the last traded price,
// once a day at market close. CNC (delivery) holdings are never touched.
//
// npm install node-cron

import cron from "node-cron";
import { squareOffAllIntradayPositions } from "../controllers/order.controller.js";
import { marketPrices, symbolMeta } from "../services/marketDataService.js";

// Positions/orders store the symbol the user actually traded (e.g. "RELIANCE",
// "AAPL", "BTC/USD"), but marketPrices is keyed by the TwelveData symbol
// (e.g. "RELIANCE:NSE", "AAPL", "BTC/USD"). Resolve one to the other.
const resolveLastPrice = symbol => {
    const clean = symbol.trim().toUpperCase();

    // Already an exact TwelveData key (covers crypto/forex/commodities/US stocks)
    if (marketPrices[clean] != null) return marketPrices[clean];

    // Match by ticker (covers e.g. "RELIANCE" -> key "RELIANCE:NSE")
    const meta = Object.values(symbolMeta).find(
        m => m.ticker.toUpperCase() === clean || m.key.toUpperCase() === clean
    );
    if (meta && marketPrices[meta.key] != null) return marketPrices[meta.key];

    // Fallback: Indian stocks are sometimes saved without the ":NSE" suffix
    const nseKey = `${clean}:NSE`;
    if (marketPrices[nseKey] != null) return marketPrices[nseKey];

    return undefined;
};

const getLastPrice = async symbol => resolveLastPrice(symbol);

// Runs at 15:25 IST, Monday–Friday (NSE close). Adjust if you want to square
// off US-listed / crypto MIS positions on a separate schedule.
export const scheduleIntradaySquareOff = io => {
    cron.schedule(
        "25 15 * * 1-5",
        async () => {
            console.log("[square-off] Running intraday auto square-off...");
            const results = await squareOffAllIntradayPositions(getLastPrice);
            console.log(`[square-off] Squared off ${results.length} intraday position(s)`);

            if (io) {
                const notifiedUsers = new Set(results.map(r => String(r.userid)));
                notifiedUsers.forEach(userid => {
                    io.emit(`square-off:${userid}`, {
                        message: "Your intraday positions were auto squared-off at market close",
                        results: results.filter(r => String(r.userid) === userid)
                    });
                });
            }
        },
        { timezone: "Asia/Kolkata" }
    );
};