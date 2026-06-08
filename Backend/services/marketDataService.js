import WebSocket from "ws";

export const marketPrices = {};

export function startMarketData(io) {
    const socket = new WebSocket(
        `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`
    );

    socket.on("open", () => {
        console.log("✅ Connected to Finnhub");

        // Use a clear separation
        const cryptoSymbols = ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:SOLUSDT", "BINANCE:XRPUSDT"];
        const stockSymbols = ["AAPL", "TSLA", "MSFT", "GOOGL", "RELIANCE", "TCS", "INFY", "HDFCBANK"];

        // Subscribe to everything
        [...cryptoSymbols, ...stockSymbols].forEach((symbol) => {
            socket.send(
                JSON.stringify({
                    type: "subscribe",
                    symbol,
                })
            );
        });
    });

    socket.on("message", (data) => {
        const parsed = JSON.parse(data.toString());

        // LOG THIS to see if stocks are actually arriving
        if (parsed.type === "trade") {
            // console.log("Received data:", parsed.data);
            
            parsed.data.forEach((trade) => {
                marketPrices[trade.s] = trade.p;
                io.emit("price-update", {
                    symbol: trade.s,
                    price: trade.p
                });
            });
        }
    });
    // ... rest of your code
}