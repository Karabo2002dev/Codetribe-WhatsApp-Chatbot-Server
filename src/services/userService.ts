import pool from "../config/db";
import { Role } from "../types/role";

export type Facilitator = {
  firebase_uid: string;
  email: string;
};

export type User = {
  email: string;
  fullName: string;
  phoneNumber: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
};

export async function registerUser(phone: string) {
  await pool.query(
    `
    INSERT INTO users (phone)
    VALUES ($1)
    ON CONFLICT (phone) DO NOTHING
    `,
    [phone]
  );
}

export async function getAllUsers(): Promise<User[] | null> {
  const { rows } = await pool.query<User>(`
    SELECT email, fullname AS "fullName", phone_number AS "phoneNumber", role, is_active AS "isActive", created_at AS "createdAt"
    FROM users
  `);
  
  return rows;
  
}

export async function getAvailableFacilitator(): Promise<Facilitator | null> {
  const { rows } = await pool.query<Facilitator>(`
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
