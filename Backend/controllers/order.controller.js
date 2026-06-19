import mongoose from "mongoose";
import orders from "../schemas/orders.schema.js";
import positions from "../schemas/positions.schema.js";
import User from "../schemas/user.schema.js";
import trades from "../schemas/tradeHis.schema.js"; 

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
    qty: position.quantity,
    avg: position.avgPrice,
    side: "long"
});

const executeOrder = async order => {
    if (order.status !== "Pending") return order;

    const executionPrice = roundMoney(order.marketPrice);
    const orderValue = roundMoney(executionPrice * order.quantity);

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
            const existing = await positions.findOne({ userid: order.userid, symbol: order.symbol });
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
                    quantity: order.quantity,
                    avgPrice: executionPrice
                });
            }
        } catch (error) {
            await User.updateOne({ _id: order.userid }, { $inc: { virtualBalance: orderValue } });
            throw error;
        }
    } else {
        // --- SELL LOGIC (CLOSING POSITION & LOGGING TRADE) ---
        const position = await positions.findOne({
            userid: order.userid,
            symbol: order.symbol,
            quantity: { $gte: order.quantity }
        });

        if (!position) {
            const error = new Error("Not enough quantity available to sell");
            error.status = 400;
            throw error;
        }

        // 2. CALCULATE REALIZED PNL
        const realizedPnl = roundMoney((executionPrice - position.avgPrice) * order.quantity);

        try {
            // Add funds back to user
            await User.updateOne(
                { _id: order.userid },
                { $inc: { virtualBalance: orderValue } }
            );

            // 3. CREATE THE TRADE JOURNAL ENTRY
            await trades.create({
                userid: order.userid,
                symbol: order.symbol,
                entryPrice: position.avgPrice,
                exitPrice: executionPrice,
                quantity: order.quantity,
                realizedPnl: realizedPnl,
                openedAt: position.createdAt, 
                closedAt: new Date(),
                aiMetrics: order.aiMetrics // <-- Captures the AI metrics logged at the time of the sell order
            });

        } catch (error) {
            throw error;
        }

        // Reduce position quantity or delete if 0
        position.quantity = roundMoney(position.quantity - order.quantity);
        if (position.quantity === 0) await position.deleteOne();
        else await position.save();
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
        positions.find({ userid, quantity: { $gt: 0 } }).sort({ updatedAt: -1 }),
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
            product: product || "MIS",
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
                    // Keep rejected-by-balance/holdings orders open so the user can cancel them.
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