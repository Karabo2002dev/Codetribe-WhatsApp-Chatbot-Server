import pool from "../config/db";
import { Role } from "../types/role";

export type Facilitator = {
  firebase_uid: string;
  email: string;
};

export type User = {
  id?: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

export type UpdateProfileInput = {
  fullName: string;
  email: string;
  phoneNumber: string;
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


export async function getProfileById(id: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    `
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
    `,
    [id]
  );

  return rows[0] ?? null;
}

export async function getProfileByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    `
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
    `,
    [email]
  );

  return rows[0] ?? null;
}

export async function updateProfile(
  id: string|undefined,
  data: UpdateProfileInput
): Promise<User | null> {
  const { fullName, email, phoneNumber } = data;
  console.log(`Updating profile for user ID: ${id} with data:`, data);

  const { rows } = await pool.query<User>(
    `
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
    `,
    [fullName, email, phoneNumber, id]
  );
  console.log(rows)
  return rows[0] ?? null;

}

export async function deleteProfile(id: string | undefined): Promise<boolean> {
  const result = await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
    `,
    [id]
  );

  return (result.rowCount ?? 0) > 0;
}