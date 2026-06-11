import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  addWatchlistItem,
  cancelOrder as cancelOrderRequest,
  getTradingAccount,
  getWatchlist,
  placeOrder,
  removeWatchlistItem
} from "../api/tradingApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:2222";
const socket = io(API_BASE);

const TICKER_MAP = {
  BTC: "BTC/USD",
  ETH: "ETH/USD",
  SOL: "SOL/USD",
  GOLD: "XAU/USD",
  OIL: "WTI"
};

const normalizeQuote = quote => ({
  symbol: TICKER_MAP[quote.ticker] || quote.ticker || quote.symbol,
  name: quote.name || quote.ticker,
  type: quote.type || "Stocks",
  price: Number(quote.price) || 0,
  prevPrice: Number(quote.prevPrice) || Number(quote.price) || 0,
  changePct: Number(quote.changePct) || 0
});

export function useTradingAccount(userid) {
  const [balance, setBalance] = useState(0);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(Boolean(userid));
  const [error, setError] = useState("");

  const applyAccount = useCallback(data => {
    setBalance(Number(data.balance) || 0);
    setPositions(Array.isArray(data.positions) ? data.positions : []);
    setOrders(Array.isArray(data.orders) ? data.orders : []);
  }, []);

  const refresh = useCallback(async () => {
    if (!userid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [accountResponse, watchlistResponse] = await Promise.all([
        getTradingAccount(userid),
        getWatchlist(userid)
      ]);
      applyAccount(accountResponse.data);
      setWatchlist(watchlistResponse.data.watchlist || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [userid, applyAccount]);

  useEffect(() => {
    if (!userid) return undefined;
    let active = true;

    Promise.all([getTradingAccount(userid), getWatchlist(userid)])
      .then(([accountResponse, watchlistResponse]) => {
        if (!active) return;
        applyAccount(accountResponse.data);
        setWatchlist(watchlistResponse.data.watchlist || []);
      })
      .catch(requestError => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userid, applyAccount]);

  useEffect(() => {
    const updateQuotes = data => {
      const list = Array.isArray(data) ? data : [data];
      setQuotes(previous => {
        const next = { ...previous };
        list.forEach(rawQuote => {
          const quote = normalizeQuote(rawQuote);
          if (quote.symbol) next[quote.symbol] = quote;
        });
        return next;
      });
    };

    const eventName = userid ? `order-update:${userid}` : "";
    socket.on("snapshot", updateQuotes);
    socket.on("price-update", updateQuotes);
    if (eventName) socket.on(eventName, applyAccount);

    return () => {
      socket.off("snapshot", updateQuotes);
      socket.off("price-update", updateQuotes);
      if (eventName) socket.off(eventName, applyAccount);
    };
  }, [userid, applyAccount]);

  const cancelOrder = useCallback(async orderid => {
    const response = await cancelOrderRequest(userid, orderid);
    applyAccount(response.data);
  }, [userid, applyAccount]);

  const closePosition = useCallback(async position => {
    const marketPrice = quotes[position.sym]?.price || position.avg;
    const response = await placeOrder({
      userid,
      symbol: position.sym,
      name: position.name || position.sym,
      exchange: position.exch || "",
      ordertype: "MARKET",
      side: "SELL",
      product: "CNC",
      validity: "DAY",
      quantity: position.qty,
      price: marketPrice,
      marketPrice
    });
    applyAccount(response.data);
  }, [userid, quotes, applyAccount]);

  const addToWatchlist = useCallback(async item => {
    const response = await addWatchlistItem({ userid, ...item });
    setWatchlist(previous => [
      response.data.item,
      ...previous.filter(entry => entry.symbol !== response.data.item.symbol)
    ]);
  }, [userid]);

  const removeFromWatchlist = useCallback(async symbol => {
    await removeWatchlistItem(userid, symbol);
    setWatchlist(previous => previous.filter(item => item.symbol !== symbol));
  }, [userid]);

  const enrichedPositions = useMemo(() => positions.map(position => {
    const quote = quotes[position.sym];
    const currentPrice = quote?.price || position.avg;
    const value = currentPrice * position.qty;
    const cost = position.avg * position.qty;
    const pnl = value - cost;
    return {
      ...position,
      currentPrice,
      value,
      cost,
      pnl,
      pnlPct: cost ? (pnl / cost) * 100 : 0,
      type: quote?.type || (position.sym.includes("/") ? "Crypto" : "Stocks")
    };
  }), [positions, quotes]);

  const metrics = useMemo(() => {
    const invested = enrichedPositions.reduce((sum, position) => sum + position.cost, 0);
    const marketValue = enrichedPositions.reduce((sum, position) => sum + position.value, 0);
    const unrealizedPnl = enrichedPositions.reduce((sum, position) => sum + position.pnl, 0);
    const totalEquity = balance + marketValue;
    const executed = orders.filter(order => order.status === "COMPLETE");
    const buys = executed.filter(order => order.side === "BUY").length;
    const sells = executed.filter(order => order.side === "SELL").length;
    return {
      invested,
      marketValue,
      unrealizedPnl,
      totalEquity,
      executedOrders: executed.length,
      openOrders: orders.filter(order => order.status === "OPEN").length,
      buyOrders: buys,
      sellOrders: sells
    };
  }, [balance, enrichedPositions, orders]);

  return {
    balance,
    positions: enrichedPositions,
    orders,
    watchlist,
    quotes,
    metrics,
    loading,
    error,
    refresh,
    cancelOrder,
    closePosition,
    addToWatchlist,
    removeFromWatchlist
  };
}
