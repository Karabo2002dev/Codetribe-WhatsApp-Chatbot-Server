"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.getAllUsers = getAllUsers;
exports.getAvailableFacilitator = getAvailableFacilitator;
exports.getProfileById = getProfileById;
exports.getProfileByEmail = getProfileByEmail;
exports.updateProfile = updateProfile;
exports.deleteProfile = deleteProfile;
const db_1 = __importDefault(require("../config/db"));
async function registerUser(phone) {
    await db_1.default.query(`
    INSERT INTO users (phone)
    VALUES ($1)
    ON CONFLICT (phone) DO NOTHING
    `, [phone]);
}
async function getAllUsers() {
    const { rows } = await db_1.default.query(`
    SELECT 
      id,
      email,
      fullname AS "fullName",
      phone_number AS "phoneNumber",
      role,
      is_active AS "isActive",
      created_at AS "createdAt"
    FROM users
  `);
    return rows;
}
async function getAvailableFacilitator() {
    const { rows } = await db_1.default.query(`
    SELECT u.firebase_uid, u.email
    FROM users u
    WHERE u.role = 'FACILITATOR'
    AND NOT EXISTS (
      SELECT 1
      FROM queries q
      WHERE q.handled_by = u.firebase_uid
      AND q.status IN ('OPEN', 'ESCALATED')
    )
    ORDER BY u.created_at ASC
    LIMIT 1
  `);
    return rows[0] ?? null;
}
async function getProfileById(id) {
    const { rows } = await db_1.default.query(`
    SELECT
      id,
      email,
      fullname AS "fullName",
      phone_number AS "phoneNumber",
      role,
      is_active AS "isActive",
      created_at AS "createdAt"
    FROM users
    WHERE id = $1
    LIMIT 1
    `, [id]);
    return rows[0] ?? null;
}
async function getProfileByEmail(email) {
    const { rows } = await db_1.default.query(`
    SELECT
      id,
      email,
      fullname AS "fullName",
      phone_number AS "phoneNumber",
      role,
      is_active AS "isActive",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM users
    WHERE email = $1
    LIMIT 1
    `, [email]);
    return rows[0] ?? null;
}
async function updateProfile(id, data) {
    const { fullName, email, phoneNumber } = data;
    console.log(`Updating profile for user ID: ${id} with data:`, data);
    const { rows } = await db_1.default.query(`
    UPDATE users
    SET
      fullname = $1,
      email = $2,
      phone_number = $3
    WHERE id = $4
    RETURNING
      id,
      email,
      fullname AS "fullName",
      phone_number AS "phoneNumber",
      role,
      is_active AS "isActive",
      created_at AS "createdAt"
    `, [fullName, email, phoneNumber, id]);
    console.log(rows);
    return rows[0] ?? null;
}
async function deleteProfile(id) {
    const result = await db_1.default.query(`
    DELETE FROM users
    WHERE id = $1
    `, [id]);
    return (result.rowCount ?? 0) > 0;
}
