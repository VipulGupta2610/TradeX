import axios from "axios";

// Map frontend ticker → TwelveData time_series symbol
const SYMBOL_MAP = {
  // Crypto
  "BTC":       "BTC/USD",
  "ETH":       "ETH/USD",
  "SOL":       "SOL/USD",
  "XRP":       "XRP/USD",
  "BNB":       "BNB/USD",
  "ADA":       "ADA/USD",
  // Also accept raw pair keys
  "BTC/USD":   "BTC/USD",
  "ETH/USD":   "ETH/USD",
  "SOL/USD":   "SOL/USD",
  "XRP/USD":   "XRP/USD",
  "BNB/USD":   "BNB/USD",
  "ADA/USD":   "ADA/USD",
  // Legacy Binance-style keys
  "BTCUSDT":   "BTC/USD",
  "ETHUSDT":   "ETH/USD",
  "SOLUSDT":   "SOL/USD",
  "XRPUSDT":   "XRP/USD",

  // US Stocks
  "AAPL":      "AAPL",
  "TSLA":      "TSLA",
  "MSFT":      "MSFT",
  "GOOGL":     "GOOGL",
  "AMZN":      "AMZN",
  "NVDA":      "NVDA",

  // Indian Stocks
  "RELIANCE":  "RELIANCE:NSE",
  "TCS":       "TCS:NSE",
  "INFY":      "INFY:NSE",
  "HDFCBANK":  "HDFCBANK:NSE",

  // Forex
  "EUR/USD":   "EUR/USD",
  "GBP/USD":   "GBP/USD",
  "USD/JPY":   "USD/JPY",
  "USD/INR":   "USD/INR",

  // Commodities
  "GOLD":      "XAU/USD",
  "XAU/USD":   "XAU/USD",
  "SILVER":    "XAG/USD",
  "XAG/USD":   "XAG/USD",
  "OIL":       "WTI/USD",
  "WTI/USD":   "WTI/USD",
};

export const getCandles = async (req, res) => {
  try {
    const rawSymbol = decodeURIComponent(req.params.symbol);
    const interval  = req.query.interval  || "1min";
    const outputsize= req.query.outputsize|| 100;

    const mappedSymbol = SYMBOL_MAP[rawSymbol] || rawSymbol;

    console.log(`[Candles] ${rawSymbol} → ${mappedSymbol} (${interval})`);

    const response = await axios.get("https://api.twelvedata.com/time_series", {
      params: {
        symbol:     mappedSymbol,
        interval:   interval,
        outputsize: outputsize,
        apikey:     process.env.TWELVE_DATA_KEY,
        order:      "ASC"
      },
      timeout: 10000
    });

    if (response.data.status === "error") {
      return res.status(400).json({ error: response.data.message });
    }

    // Return enriched response
    return res.json({
      ...response.data,
      meta: {
        ...response.data.meta,
        originalSymbol: rawSymbol,
        mappedSymbol
      }
    });

  } catch (error) {
    console.error("[Candles] Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data || error.message
    });
  }
};

// GET /markets/quote/:symbol — current quote with open/high/low/close/change%
export const getQuote = async (req, res) => {
  try {
    const rawSymbol    = decodeURIComponent(req.params.symbol);
    const mappedSymbol = SYMBOL_MAP[rawSymbol] || rawSymbol;

    const response = await axios.get("https://api.twelvedata.com/quote", {
      params: {
        symbol: mappedSymbol,
        apikey: process.env.TWELVE_DATA_KEY
      },
      timeout: 10000
    });

    if (response.data.status === "error") {
      return res.status(400).json({ error: response.data.message });
    }

    return res.json(response.data);
  } catch (error) {
    console.error("[Quote] Error:", error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};

// GET /markets/all-quotes — batch quotes for all tracked symbols
export const getAllQuotes = async (req, res) => {
  try {
    const symbols = [
      "BTC/USD","ETH/USD","SOL/USD","XRP/USD","BNB/USD","ADA/USD",
      "AAPL","TSLA","MSFT","GOOGL","AMZN","NVDA",
      "RELIANCE:NSE","TCS:NSE","INFY:NSE","HDFCBANK:NSE",
      "EUR/USD","GBP/USD","USD/JPY","USD/INR",
      "XAU/USD","XAG/USD","WTI/USD"
    ].join(",");

    const response = await axios.get("https://api.twelvedata.com/quote", {
      params: {
        symbol: symbols,
        apikey: process.env.TWELVE_DATA_KEY
      },
      timeout: 15000
    });

    if (response.data.status === "error") {
      return res.status(400).json({ error: response.data.message });
    }

    return res.json(response.data);
  } catch (error) {
    console.error("[AllQuotes] Error:", error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};