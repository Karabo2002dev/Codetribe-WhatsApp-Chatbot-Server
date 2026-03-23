"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const db_1 = __importDefault(require("../config/db"));
const verifyFirebaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = await firebase_1.default.auth().verifyIdToken(token);
        const { rows } = await db_1.default.query("SELECT id, role FROM users WHERE firebase_uid = $1", [decoded.uid]);
        req.user = {
            id: rows[0]?.id,
            uid: decoded.uid,
            email: decoded.email,
            role: rows[0]?.role
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
