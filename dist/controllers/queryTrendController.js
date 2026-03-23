"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchQueryTrend = fetchQueryTrend;
const queryTrendsService_1 = require("../services/queryTrendsService");
async function fetchQueryTrend(req, res, next) {
    try {
        const { month } = req.query;
        if (!month || typeof month !== "string") {
            return res.status(400).json({
                success: false,
                message: "Month is required in the format YYYY-MM",
            });
        }
        const monthRegex = /^\d{4}-\d{2}$/;
        if (!monthRegex.test(month)) {
            return res.status(400).json({
                success: false,
                message: "Invalid month format. Use YYYY-MM",
            });
        }
        const trend = await (0, queryTrendsService_1.getMonthlyQueryTrend)(month);
        if (!trend) {
            return res.status(404).json({
                success: false,
                message: "No query trend data found for the selected month",
            });
        }
        res.status(200).json({
            success: true,
            message: "Query trend fetched successfully",
            data: trend,
        });
    }
    catch (error) {
        console.error("Error fetching query trend:", error);
        next(error);
    }
}
