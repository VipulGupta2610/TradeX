import { api } from "./axios";

export const getTradingAccount = userid => api.get(`/user/Orders/${userid}`);
export const cancelOrder = (userid, orderid) =>
  api.patch(`/user/Orders/${userid}/${orderid}/cancel`);
export const placeOrder = payload => api.post("/user/Orders", payload);

export const getWatchlist = userid => api.get(`/user/Watchlist/${userid}`);
export const addWatchlistItem = payload => api.post("/user/Watchlist", payload);
export const removeWatchlistItem = (userid, symbol) =>
  api.delete(`/user/Watchlist/${userid}`, { data: { symbol } });

export const updateProfile = (userid, payload) =>
  api.patch(`/user/profile/${userid}`, payload);
export const resetPaperAccount = userid => api.post(`/user/reset/${userid}`);
export const adjustVirtualFunds = (userid, amount) =>
  api.post(`/user/funds/${userid}`, { amount });
export const deleteAccount = userid => api.delete(`/user/account/${userid}`);
