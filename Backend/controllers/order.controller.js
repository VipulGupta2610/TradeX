import mongoose from "mongoose";
import orders from "../schemas/orders.schema.js";
import positions from "../schemas/positions.schema.js";
import User from "../schemas/user.schema.js";
import trades from "../schemas/tradeHis.schema.js";

// Intraday (MIS) buying power. 5x means only 1/5th of the order value
// needs to be blocked as margin; the rest is "borrowed" for the day.
export const LEVERAGE = 5;

const roundMoney = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const isExecutable = order => {
    if (order.ordertype === "MARKET") return true;
    if (order.ordertype === "LIMIT") {
        return order.side === "BUY"
            ? order.marketPrice <= order.price
            : order.marketPrice >= order.price;
    }
    return order.side === "BUY"
        ? order.marketPrice >= order.price
        : order.marketPrice <= order.price;
};

const serializeOrder = order => ({
    id: order._id,
    sym: order.symbol,
    name: order.name,
    exch: order.exchange,
    type: order.ordertype,
    side: order.side,
    qty: order.quantity,
    price: order.executedPrice ?? order.price,
    requestedPrice: order.price,
    status: order.status === "Executed" ? "COMPLETE" : order.status === "Pending" ? "OPEN" : "CANCELLED",
    time: new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    product: order.product,
    validity: order.validity
});

const serializePosition = position => ({
    id: position._id,
    sym: position.symbol,
    name: position.name,
    exch: position.exchange,
    product: position.product,
    qty: position.quantity, // signed: negative = short (intraday-only) position
    avg: position.avgPrice,
    side: position.quantity < 0 ? "short" : "long",
    margin: position.marginBlocked || 0
});

// ---------------------------------------------------------------------
// CNC (delivery) execution: full cash outlay, no leverage, no shorting.
// ---------------------------------------------------------------------

const executeDeliveryOrder = async (order, executionPrice, orderValue) => {
    if (order.side === "BUY") {
        const account = await User.findOneAndUpdate(
            { _id: order.userid, virtualBalance: { $gte: orderValue } },
            { $inc: { virtualBalance: -orderValue } },
            { new: true }
        );

        if (!account) {
            const error = new Error("Insufficient virtual balance");
            error.status = 400;
            throw error;
        }

        try {
            const existing = await positions.findOne({ userid: order.userid, symbol: order.symbol, product: "CNC" });
            if (existing) {
                const totalQuantity = existing.quantity + order.quantity;
                existing.avgPrice = roundMoney(
                    ((existing.avgPrice * existing.quantity) + orderValue) / totalQuantity
                );
                existing.quantity = totalQuantity;
                existing.name = order.name;
                existing.exchange = order.exchange;
                await existing.save();
            } else {
                await positions.create({
                    userid: order.userid,
                    symbol: order.symbol,
                    name: order.name,
                    exchange: order.exchange,
                    product: "CNC",
                    quantity: order.quantity,
                    avgPrice: executionPrice
                });
            }
        } catch (error) {
            await User.updateOne({ _id: order.userid }, { $inc: { virtualBalance: orderValue } });
            throw error;
        }
    } else {
        const position = await positions.findOne({
            userid: order.userid,
            symbol: order.symbol,
            product: "CNC",
            quantity: { $gte: order.quantity }
        });

        if (!position) {
            const error = new Error("Not enough quantity available to sell");
            error.status = 400;
            throw error;
        }

        const realizedPnl = roundMoney((executionPrice - position.avgPrice) * order.quantity);

        try {
            await User.updateOne({ _id: order.userid }, { $inc: { virtualBalance: orderValue } });

            await trades.create({
                userid: order.userid,
                symbol: order.symbol,
                entryPrice: position.avgPrice,
                exitPrice: executionPrice,
                quantity: order.quantity,
                realizedPnl,
                openedAt: position.createdAt,
                closedAt: new Date(),
                aiMetrics: order.aiMetrics
            });
        } catch (error) {
            throw error;
        }

        position.quantity = roundMoney(position.quantity - order.quantity);
        if (position.quantity === 0) await position.deleteOne();
        else await position.save();
    }
};

// ---------------------------------------------------------------------
// MIS (intraday) execution: 5x leveraged margin + short selling allowed.
// Only the quantity that INCREASES exposure blocks new margin; the
// quantity that CLOSES/COVERS existing exposure releases margin + P&L.
// ---------------------------------------------------------------------

const executeIntradayOrder = async (order, executionPrice, orderValue) => {
    const existing = await positions.findOne({ userid: order.userid, symbol: order.symbol, product: "MIS" });
    const isBuy = order.side === "BUY";

    // Quantity that offsets an existing opposite-direction position.
    const offsettableQty = isBuy
        ? (existing && existing.quantity < 0 ? Math.abs(existing.quantity) : 0)
        : (existing && existing.quantity > 0 ? existing.quantity : 0);

    const closeQty = Math.min(order.quantity, offsettableQty);
    const openQty = order.quantity - closeQty;
    const marginForOpen = roundMoney((openQty * executionPrice) / LEVERAGE);

    if (marginForOpen > 0) {
        const account = await User.findOneAndUpdate(
            { _id: order.userid, virtualBalance: { $gte: marginForOpen } },
            { $inc: { virtualBalance: -marginForOpen } },
            { new: true }
        );

        if (!account) {
            const error = new Error("Insufficient margin for this intraday order");
            error.status = 400;
            throw error;
        }
    }

    try {
        if (closeQty > 0) {
            const releasedMargin = roundMoney((existing.marginBlocked || 0) * (closeQty / offsettableQty));
            const realizedPnl = roundMoney(
                isBuy
                    ? (existing.avgPrice - executionPrice) * closeQty // covering a short
                    : (executionPrice - existing.avgPrice) * closeQty // closing a long
            );

            await trades.create({
                userid: order.userid,
                symbol: order.symbol,
                entryPrice: existing.avgPrice,
                exitPrice: executionPrice,
                quantity: closeQty,
                realizedPnl,
                openedAt: existing.createdAt,
                closedAt: new Date(),
                aiMetrics: order.aiMetrics
            });

            await User.updateOne(
                { _id: order.userid },
                { $inc: { virtualBalance: releasedMargin + realizedPnl } }
            );

            existing.marginBlocked = roundMoney((existing.marginBlocked || 0) - releasedMargin);
        }

        const remainingOffsetQty = offsettableQty - closeQty;

        if (openQty > 0) {
            const signedOpenQty = isBuy ? openQty : -openQty;

            if (existing && offsettableQty > 0) {
                // Fully closed the opposite side, flip into a fresh position.
                existing.quantity = signedOpenQty;
                existing.avgPrice = executionPrice;
                existing.marginBlocked = marginForOpen;
                existing.name = order.name;
                existing.exchange = order.exchange;
                await existing.save();
            } else if (existing) {
                // Adding to an existing same-direction position.
                const totalQuantity = existing.quantity + signedOpenQty;
                existing.avgPrice = roundMoney(
                    ((existing.avgPrice * Math.abs(existing.quantity)) + (openQty * executionPrice)) / Math.abs(totalQuantity)
                );
                existing.quantity = totalQuantity;
                existing.marginBlocked = roundMoney((existing.marginBlocked || 0) + marginForOpen);
                existing.name = order.name;
                existing.exchange = order.exchange;
                await existing.save();
            } else {
                await positions.create({
                    userid: order.userid,
                    symbol: order.symbol,
                    name: order.name,
                    exchange: order.exchange,
                    product: "MIS",
                    quantity: signedOpenQty,
                    avgPrice: executionPrice,
                    marginBlocked: marginForOpen
                });
            }
        } else if (closeQty > 0) {
            if (remainingOffsetQty === 0) {
                await existing.deleteOne();
            } else {
                existing.quantity = isBuy ? -remainingOffsetQty : remainingOffsetQty;
                await existing.save();
            }
        }
    } catch (error) {
        if (marginForOpen > 0) {
            await User.updateOne({ _id: order.userid }, { $inc: { virtualBalance: marginForOpen } });
        }
        throw error;
    }
};

const executeOrder = async order => {
    if (order.status !== "Pending") return order;

    const executionPrice = roundMoney(order.marketPrice);
    const orderValue = roundMoney(executionPrice * order.quantity);

    if (order.product === "MIS") {
        await executeIntradayOrder(order, executionPrice, orderValue);
    } else {
        await executeDeliveryOrder(order, executionPrice, orderValue);
    }

    order.status = "Executed";
    order.executedPrice = executionPrice;
    order.executedAt = new Date();
    await order.save();
    return order;
};

const getTradingState = async userid => {
    const [account, userPositions, userOrders] = await Promise.all([
        User.findById(userid).select("virtualBalance totalPortfolioValue"),
        positions.find({ userid, quantity: { $ne: 0 } }).sort({ updatedAt: -1 }),
        orders.find({ userid }).sort({ createdAt: -1 }).limit(100)
    ]);

    return {
        balance: account?.virtualBalance ?? 0,
        positions: userPositions.map(serializePosition),
        orders: userOrders.map(serializeOrder)
    };
};

export const newOrder = async (req,res)=>{
    let order;
    try {
        // --- EXTRACT aiMetrics FROM req.body ---
        const {
            userid, symbol, name, exchange, ordertype, side, product,
            validity, quantity, price, marketPrice, aiMetrics 
        } = req.body;

        if (!mongoose.isValidObjectId(userid)) {
            return res.status(400).json({ message: "A valid user is required" });
        }

        const normalizedQuantity = Number(quantity);
        const normalizedMarketPrice = Number(marketPrice);
        const normalizedPrice = ordertype === "MARKET" ? normalizedMarketPrice : Number(price);
        const normalizedProduct = ["MIS", "CNC"].includes(product) ? product : "MIS";

        if (!symbol || !["BUY", "SELL"].includes(side) ||
            !["MARKET", "LIMIT", "SL", "SL-M"].includes(ordertype) ||
            !Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0 ||
            !Number.isFinite(normalizedMarketPrice) || normalizedMarketPrice <= 0 ||
            !Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
            return res.status(400).json({ message: "Invalid order details" });
        }

        const account = await User.findById(userid);
        if (!account) return res.status(404).json({ message: "User not found" });
        if (!Number.isFinite(account.virtualBalance)) {
            account.virtualBalance = 100000;
            await account.save();
        }

        order = await orders.create({
            userid,
            symbol: symbol.trim().toUpperCase(),
            name: name?.trim() || symbol,
            exchange: exchange?.trim() || "",
            ordertype,
            side,
            product: normalizedProduct,
            validity: validity || "DAY",
            quantity: normalizedQuantity,
            price: normalizedPrice,
            marketPrice: normalizedMarketPrice,
            aiMetrics: aiMetrics || null // <-- Save the metrics to the database
        });

        if (isExecutable(order)) order = await executeOrder(order);

        const state = await getTradingState(userid);
        req.app.get("io")?.emit(`order-update:${userid}`, state);

        return res.status(201).json({
            message: order.status === "Executed" ? "Order executed" : "Order placed",
            order: serializeOrder(order),
            ...state
        });
    } catch (error) {
        if (order?.status === "Pending" && error.status === 400) {
            await order.deleteOne().catch(() => {});
        }
        return res.status(error.status || 500).json({
            message: error.message || "Unable to place order"
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        return res.status(200).json(await getTradingState(req.params.userid));
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch trading account" });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await orders.findOneAndUpdate(
            { _id: req.params.orderid, userid: req.params.userid, status: "Pending" },
            { status: "Cancelled", cancelledAt: new Date() },
            { new: true }
        );

        if (!order) return res.status(404).json({ message: "Open order not found" });
        const state = await getTradingState(req.params.userid);
        req.app.get("io")?.emit(`order-update:${req.params.userid}`, state);
        return res.status(200).json({ message: "Order cancelled", ...state });
    } catch (error) {
        return res.status(500).json({ message: "Unable to cancel order" });
    }
};

export const processOrders = async (req, res) => {
    try {
        const { symbol, marketPrice } = req.body;
        const numericPrice = Number(marketPrice);
        if (!symbol || !Number.isFinite(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ message: "Invalid market update" });
        }

        const pending = await orders.find({
            userid: req.params.userid,
            symbol: symbol.trim().toUpperCase(),
            status: "Pending"
        });

        for (const order of pending) {
            order.marketPrice = numericPrice;
            if (isExecutable(order)) {
                try {
                    await executeOrder(order);
                } catch (error) {
                    // Keep rejected-by-balance/holdings/margin orders open so the user can cancel them.
                }
            } else {
                await order.save();
            }
        }

        const state = await getTradingState(req.params.userid);
        return res.status(200).json(state);
    } catch (error) {
        return res.status(500).json({ message: "Unable to process open orders" });
    }
};

// ---------------------------------------------------------------------
// Intraday auto square-off: force-closes every open MIS position at the
// given last-traded price, releasing blocked margin + realized P&L.
// Delivery (CNC) positions are never touched by this.
// ---------------------------------------------------------------------

export const squareOffIntradayPosition = async (userid, symbol, lastPrice) => {
    const executionPrice = roundMoney(lastPrice);
    const position = await positions.findOne({
        userid,
        symbol: symbol.trim().toUpperCase(),
        product: "MIS"
    });

    if (!position || position.quantity === 0) return null;

    const qty = Math.abs(position.quantity);
    const isLong = position.quantity > 0;
    const realizedPnl = roundMoney(
        isLong
            ? (executionPrice - position.avgPrice) * qty
            : (position.avgPrice - executionPrice) * qty
    );

    await User.updateOne(
        { _id: userid },
        { $inc: { virtualBalance: (position.marginBlocked || 0) + realizedPnl } }
    );

    await trades.create({
        userid,
        symbol: position.symbol,
        entryPrice: position.avgPrice,
        exitPrice: executionPrice,
        quantity: qty,
        realizedPnl,
        openedAt: position.createdAt,
        closedAt: new Date(),
        aiMetrics: null
    });

    // Log it as a normal executed order too, so it shows up in order history.
    await orders.create({
        userid,
        symbol: position.symbol,
        name: position.name,
        exchange: position.exchange,
        ordertype: "MARKET",
        side: isLong ? "SELL" : "BUY",
        product: "MIS",
        validity: "DAY",
        quantity: qty,
        price: executionPrice,
        marketPrice: executionPrice,
        status: "Executed",
        executedPrice: executionPrice,
        executedAt: new Date()
    });

    await position.deleteOne();

    return { symbol: position.symbol, side: isLong ? "SELL" : "BUY", quantity: qty, price: executionPrice, realizedPnl };
};

// getLastPrice: async (symbol) => number — plug in your live price source.
export const squareOffAllIntradayPositions = async getLastPrice => {
    const openMisPositions = await positions.find({ product: "MIS", quantity: { $ne: 0 } });
    const results = [];

    for (const position of openMisPositions) {
        try {
            const lastPrice = await getLastPrice(position.symbol);
            if (!Number.isFinite(lastPrice) || lastPrice <= 0) continue;

            const result = await squareOffIntradayPosition(position.userid, position.symbol, lastPrice);
            if (result) results.push({ userid: position.userid, ...result });
        } catch (error) {
            console.error(`Square-off failed for ${position.symbol} (user ${position.userid}):`, error.message);
        }
    }

    return results;
};

// HTTP endpoint your scheduler/market-data service can call at market close
// with the latest known price for every symbol that has open MIS positions:
// POST /trading/square-off-intraday  { "prices": { "RELIANCE": 2934.5, ... } }
export const squareOffIntraday = async (req, res) => {
    try {
        const { prices } = req.body;
        if (!prices || typeof prices !== "object" || Array.isArray(prices)) {
            return res.status(400).json({ message: "A 'prices' map of { SYMBOL: lastPrice } is required" });
        }

        const normalizedPrices = {};
        Object.entries(prices).forEach(([symbol, price]) => {
            normalizedPrices[symbol.trim().toUpperCase()] = Number(price);
        });

        const results = await squareOffAllIntradayPositions(symbol => normalizedPrices[symbol]);

        const io = req.app.get("io");
        if (io) {
            const notifiedUsers = new Set(results.map(r => String(r.userid)));
            for (const userid of notifiedUsers) {
                const state = await getTradingState(userid);
                io.emit(`order-update:${userid}`, state);
            }
        }

        return res.status(200).json({ message: "Intraday square-off complete", squaredOff: results });
    } catch (error) {
        return res.status(500).json({ message: "Unable to square off intraday positions" });
    }
};