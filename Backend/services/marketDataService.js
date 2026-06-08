import WebSocket from "ws";

export const marketPrices = {};
export const marketPrevPrices = {};

// Symbol map: internal key → TwelveData subscribe symbol
const SYMBOLS = [
  // Crypto
  { key: "BTC/USD",     display: "BTC/USD",   name: "Bitcoin",            ticker: "BTC",      type: "Crypto"    },
  { key: "ETH/USD",     display: "ETH/USD",   name: "Ethereum",           ticker: "ETH",      type: "Crypto"    },
  { key: "SOL/USD",     display: "SOL/USD",   name: "Solana",             ticker: "SOL",      type: "Crypto"    },
  { key: "XRP/USD",     display: "XRP/USD",   name: "Ripple",             ticker: "XRP",      type: "Crypto"    },
  { key: "BNB/USD",     display: "BNB/USD",   name: "BNB",                ticker: "BNB",      type: "Crypto"    },
  { key: "ADA/USD",     display: "ADA/USD",   name: "Cardano",            ticker: "ADA",      type: "Crypto"    },

  // US Stocks
  { key: "TSLA",        display: "TSLA",      name: "Tesla Inc.",         ticker: "TSLA",     type: "Stocks"    },
  { key: "AAPL",        display: "AAPL",      name: "Apple Inc.",         ticker: "AAPL",     type: "Stocks"    },
  { key: "MSFT",        display: "MSFT",      name: "Microsoft",          ticker: "MSFT",     type: "Stocks"    },
  { key: "GOOGL",       display: "GOOGL",     name: "Alphabet",           ticker: "GOOGL",    type: "Stocks"    },
  { key: "AMZN",        display: "AMZN",      name: "Amazon",             ticker: "AMZN",     type: "Stocks"    },
  { key: "NVDA",        display: "NVDA",      name: "NVIDIA",             ticker: "NVDA",     type: "Stocks"    },

  // Indian Stocks (NSE via TwelveData)
  { key: "RELIANCE:NSE", display: "RELIANCE:NSE", name: "Reliance Industries", ticker: "RELIANCE", type: "Stocks" },
  { key: "TCS:NSE",     display: "TCS:NSE",   name: "Tata Consultancy",   ticker: "TCS",      type: "Stocks"    },
  { key: "INFY:NSE",    display: "INFY:NSE",  name: "Infosys Ltd",        ticker: "INFY",     type: "Stocks"    },
  { key: "HDFCBANK:NSE",display:"HDFCBANK:NSE",name:"HDFC Bank",          ticker: "HDFCBANK", type: "Stocks"    },

  // Forex
  { key: "EUR/USD",     display: "EUR/USD",   name: "Euro / US Dollar",   ticker: "EUR/USD",  type: "Forex"     },
  { key: "GBP/USD",     display: "GBP/USD",   name: "British Pound",      ticker: "GBP/USD",  type: "Forex"     },
  { key: "USD/JPY",     display: "USD/JPY",   name: "US Dollar / Yen",    ticker: "USD/JPY",  type: "Forex"     },
  { key: "USD/INR",     display: "USD/INR",   name: "US Dollar / Rupee",  ticker: "USD/INR",  type: "Forex"     },

  // Commodities
  { key: "XAU/USD",     display: "XAU/USD",   name: "Gold",               ticker: "GOLD",     type: "Commodity" },
  { key: "XAG/USD",     display: "XAG/USD",   name: "Silver",             ticker: "SILVER",   type: "Commodity" },
  { key: "WTI/USD",     display: "WTI/USD",   name: "Crude Oil (WTI)",    ticker: "OIL",      type: "Commodity" },
];

// Build lookup: TwelveData symbol key → metadata
export const symbolMeta = {};
SYMBOLS.forEach(s => { symbolMeta[s.key] = s; });

let reconnectTimer = null;

export function startMarketData(io) {
  function connect() {
    const ws = new WebSocket(
      `wss://ws.twelvedata.com/v1/quotes/price?apikey=${process.env.TWELVE_DATA_KEY}`
    );

    ws.on("open", () => {
      console.log("✅ Connected to TwelveData WebSocket");

      const subscribeMsg = {
        action: "subscribe",
        params: {
          symbols: SYMBOLS.map(s => s.key).join(",")
        }
      };
      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        // TwelveData sends { event: "price", symbol, price, timestamp }
        if (msg.event === "price" && msg.symbol && msg.price != null) {
          const sym = msg.symbol;
          const newPrice = parseFloat(msg.price);
          const oldPrice = marketPrices[sym] ?? newPrice;

          marketPrevPrices[sym] = oldPrice;
          marketPrices[sym] = newPrice;

          const changePct = oldPrice !== 0
            ? (((newPrice - oldPrice) / oldPrice) * 100).toFixed(3)
            : "0.000";

          const meta = symbolMeta[sym];
          if (!meta) return;

          io.emit("price-update", {
            symbol:    sym,
            ticker:    meta.ticker,
            name:      meta.name,
            type:      meta.type,
            price:     newPrice,
            prevPrice: oldPrice,
            changePct: parseFloat(changePct),
            timestamp: msg.timestamp || Date.now()
          });
        }

        // TwelveData also sends heartbeat and subscribe-response events
        if (msg.event === "subscribe-status") {
          console.log("Subscribe status:", JSON.stringify(msg).substring(0, 200));
        }

      } catch (err) {
        console.error("Error parsing TwelveData message:", err.message);
      }
    });

    ws.on("close", (code, reason) => {
      console.warn(`⚠️ TwelveData WS closed [${code}]: ${reason}. Reconnecting in 5s…`);
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 5000);
    });

    ws.on("error", (err) => {
      console.error("TwelveData WS error:", err.message);
      ws.terminate();
    });
  }

  connect();

  // Also expose a snapshot endpoint — emit all known prices to a newly connected socket
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send current snapshot
    const snapshot = SYMBOLS.map(s => {
      const price = marketPrices[s.key];
      const prev  = marketPrevPrices[s.key] ?? price;
      return {
        symbol:    s.key,
        ticker:    s.ticker,
        name:      s.name,
        type:      s.type,
        price:     price ?? null,
        prevPrice: prev ?? null,
        changePct: (price && prev && prev !== 0)
          ? parseFloat((((price - prev) / prev) * 100).toFixed(3))
          : 0,
        timestamp: Date.now()
      };
    }).filter(s => s.price !== null);

    socket.emit("snapshot", snapshot);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}