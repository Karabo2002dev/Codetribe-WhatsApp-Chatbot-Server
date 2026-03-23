"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueryById = exports.getAllQueries = void 0;
exports.getAssignedQueries = getAssignedQueries;
exports.respondToQueryController = respondToQueryController;
const QueryService = __importStar(require("../services/queryService"));
const queryService_1 = require("../services/queryService");
async function getAssignedQueries(req, res, next) {
    try {
        const facilitatorId = req.user?.id;
        if (!facilitatorId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: facilitator ID is missing",
            });
        }
        console.log(`Fetching queries for facilitator ID: ${facilitatorId}`);
        const result = await (0, queryService_1.findQueriesByFacilitator)(facilitatorId);
        res.status(200).json({
            success: true,
            message: "Assigned queries fetched successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
const getAllQueries = async (_req, res, next) => {
    try {
        const queries = await QueryService.getAllQueries();
        res.status(200).json({
            success: true,
            message: "Queries fetched successfully",
            data: queries,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllQueries = getAllQueries;
const getQueryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Query ID is required",
            });
        }
        const query = await QueryService.getQueryById(id);
        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Query fetched successfully",
            data: query,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getQueryById = getQueryById;
async function respondToQueryController(req, res, next) {
    try {
        const { response, queryId } = req.body;
        const facilitatorId = req.user?.id;
        if (!facilitatorId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: facilitator ID is missing",
            });
        }
        if (!queryId) {
            return res.status(400).json({
                success: false,
                message: "Query ID is required",
            });
        }
        if (!response || !response.trim()) {
            return res.status(400).json({
                success: false,
                message: "Response is required",
            });
        }
        const query = await QueryService.getQueryById(queryId);
        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found",
            });
        }
        await (0, queryService_1.respondToQueryService)(queryId, response);
        res.status(200).json({
            success: true,
            message: "Response sent to learner successfully",
        });
    }
    catch (err) {
        if (err.message === "QUERY_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Query not found",
            });
        }
        if (err.message === "UNAUTHORIZED_FACILITATOR") {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to respond to this query",
            });
        }
        next(err);
    }
}
