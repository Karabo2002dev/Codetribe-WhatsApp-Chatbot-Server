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
exports.login = exports.register = void 0;
const authService = __importStar(require("../services/authService"));
const register = async (req, res, next) => {
    try {
        const { email, password, role, fullName, phoneNumber } = req.body;
        // Input validation
        if (!email || !password || !role || !fullName || !phoneNumber) {
            res.status(400).json({
                success: false,
                message: "All fields are required",
            });
            return;
        }
        const user = await authService.register(email, password, phoneNumber, fullName, role);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });
    }
    catch (err) {
        // Known service errors
        if (err.message === "USER_ALREADY_EXISTS") {
            res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
            return;
        }
        next(err); // pass unexpected errors to global handler
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { token } = req.body;
        // Validate input
        if (!token) {
            res.status(400).json({
                success: false,
                message: "Authentication token is required",
            });
            return;
        }
        const user = await authService.login(token);
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Login successful",
            user,
        });
    }
    catch (err) {
        if (err.message === "INVALID_TOKEN") {
            res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
            return;
        }
        next(err);
    }
};
exports.login = login;
