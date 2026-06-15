import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

// Load env vars FIRST before any other imports that may use them
dotenv.config();

import userRoutes from "../Backend/routes/user.route.js";
import marketRoutes from "../Backend/routes/market.route.js";
import adminRoutes from "../Backend/routes/admin.route.js";
import { startMarketData } from "./services/marketDataService.js";

const app    = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

// ── Socket.IO ─────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Tune transport for lower latency
  transports: ["websocket", "polling"],
  pingTimeout: 20000,
  pingInterval: 25000,
});

// Attach io to app so controllers can access it if needed
app.set("io", io);

// Start live market data feeds
startMarketData(io);

// ── Express middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/user",    userRoutes);
app.use("/markets", marketRoutes);
app.use("/admin", adminRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// ── MongoDB ───────────────────────────────────────────────────────────────
const MONGO_URL = process.env.mongodb_uri || process.env.MONGO_URI;
if (MONGO_URL) {
  mongoose
    .connect(MONGO_URL)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err.message));
} else {
  console.warn("⚠️  mongodb_uri not set — running without DB");
}

// ── Server ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || process.env.port || 2222;

server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`   Socket.IO ready`);
});

server.on("error", err => {
  console.error("Server error:", err);
});