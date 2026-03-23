"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchQueryStats = fetchQueryStats;
const queryServicesStats_1 = require("../services/queryServicesStats");
async function fetchQueryStats(req, res, next) {
    try {
        const stats = await (0, queryServicesStats_1.getQueryStats)();
        if (!stats) {
            return res.status(404).json({
                success: false,
                message: "Query statistics not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Query statistics fetched successfully",
            data: stats,
        });
    }
    catch (error) {
        console.error("Error fetching query stats:", error);
        next(error);
    }
}
