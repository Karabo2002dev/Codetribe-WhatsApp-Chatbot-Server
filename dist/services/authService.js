"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const db_1 = __importDefault(require("../config/db"));
const register = async (email, password, phoneNumber, fullName, role = "learner") => {
    const userRecord = await firebase_1.default.auth().createUser({
        email,
        password,
    });
    const result = await db_1.default.query(`INSERT INTO users (firebase_uid, email, phone_number, fullname, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, role`, [userRecord.uid, userRecord.email, phoneNumber, fullName, role]);
    return result.rows[0];
};
exports.register = register;
const login = async (token) => {
    const decodedToken = await firebase_1.default.auth().verifyIdToken(token);
    const result = await db_1.default.query("SELECT id, email,phone_number, role, fullname FROM users WHERE firebase_uid = $1", [decodedToken.uid]);
    if (result.rowCount === 0) {
        throw new Error("User not registered in system");
    }
    return result.rows[0];
};
exports.login = login;
