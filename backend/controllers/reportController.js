import Order from "../models/Order.js";
import StockLedger from "../models/StockLedger.js";

function parseYearMonth(year, month) {
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return null;
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end };
}

export async function monthlyStockReport(req, res, next) {
  try {
    const { year, month } = req.query;
    const range = parseYearMonth(year, month);
    if (!range) return res.status(400).json({ message: "year and month required" });

    const rows = await StockLedger.aggregate([
      { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
      {
        $group: {
          _id: "$medicine",
          netChangeQty: { $sum: "$changeQty" },
          entries: { $sum: 1 },
        },
      },
      { $sort: { netChangeQty: 1 } },
    ]);

    res.json({ range, rows });
  } catch (err) {
    next(err);
  }
}

export async function monthlySalesReport(req, res, next) {
  try {
    const { year, month } = req.query;
    const range = parseYearMonth(year, month);
    if (!range) return res.status(400).json({ message: "year and month required" });

    const rows = await Order.aggregate([
      { $match: { createdAt: { $gte: range.start, $lt: range.end }, orderStatus: { $ne: "CANCELLED" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.medicine",
          name: { $first: "$items.name" },
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.unitPrice"] } },
          orders: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          qty: 1,
          revenue: { $round: ["$revenue", 2] },
          ordersCount: { $size: "$orders" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json({ range, rows });
  } catch (err) {
    next(err);
  }
}

export async function invoiceReport(req, res, next) {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(String(from)) : null;
    const toDate = to ? new Date(String(to)) : null;

    const match = {};
    if (fromDate && !Number.isNaN(fromDate.getTime())) match.createdAt = { ...(match.createdAt || {}), $gte: fromDate };
    if (toDate && !Number.isNaN(toDate.getTime())) match.createdAt = { ...(match.createdAt || {}), $lte: toDate };

    const items = await Order.find(match).select("invoiceNo user subtotal discount total paymentMethod paymentStatus orderStatus createdAt").sort({ createdAt: -1 }).limit(500);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

