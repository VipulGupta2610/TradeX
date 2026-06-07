import WebSocket from "ws";

export const marketPrices = {};

export function startMarketData(io) {
    const socket = new WebSocket(
        `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`
    );

    socket.on("open", () => {
        console.log("✅ Connected to Finnhub");

        const symbols = [
            "BINANCE:BTCUSDT",
            "BINANCE:ETHUSDT",
            "BINANCE:SOLUSDT",
            "BINANCE:XRPUSDT",
            "AAPL",
            "TSLA",
            "MSFT",
            "GOOGL"
        ];

        symbols.forEach((symbol) => {
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

        if (!parsed.data) return;

        parsed.data.forEach((trade) => {

            marketPrices[trade.s] = trade.p;

            io.emit("price-update", {
                symbol: trade.s,
                price: trade.p
            });

        });


    });

    socket.on("error", (err) => {
        console.log(err);
    });

    socket.on("close", () => {
        console.log("Finnhub disconnected");
    });
}