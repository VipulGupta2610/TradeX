import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:2222/",
  withCredentials: true,
  timeout: 12000,
});

// Request interceptor — attach auth token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — surface clean error messages
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Network error";
    return Promise.reject(new Error(msg));
  }
);

/**
 * Fetch OHLCV candles for a symbol
 * @param {string} symbol  e.g. "BTCUSDT", "AAPL", "RELIANCE"
 * @param {string} tf      e.g. "1m","5m","1h","1D"
 * @param {number} outputsize
 */
export const fetchCandles = (symbol, tf = "1m", outputsize = 300) =>
  api.get(`/markets/candles/${symbol}`, { params: { tf, outputsize } });

/**
 * Fetch a single real-time quote
 */
export const fetchQuote = (symbol) =>
  api.get(`/markets/quote/${symbol}`);

/**
 * Fetch full price snapshot
 */
export const fetchSnapshot = () =>
  api.get("/markets/snapshot");
