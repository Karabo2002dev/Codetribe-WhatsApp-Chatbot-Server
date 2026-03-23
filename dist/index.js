"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 8080;
const testConnection = async () => {
    try {
        await db_1.default.query('SELECT NOW()');
        console.log('Database connection successful');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};
testConnection();
app_1.default.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
