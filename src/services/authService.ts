import admin from "../config/firebase";
import pool from "../config/db";


export interface UserResponse {
  id: number;
  email: string;
  role: string;
}

export const register = async (
  email: string,
  password: string,
  phoneNumber: string,
  fullName: string,
  role: string = "learner"
): Promise<UserResponse> => {
  
  const userRecord = await admin.auth().createUser({
    email,
    password,
  });

  const result = await pool.query<UserResponse>(
    `INSERT INTO users (firebase_uid, email, phone_number, fullname, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, role`,
    [userRecord.uid, userRecord.email, phoneNumber, fullName, role]
  );

  return result.rows[0];
};

export const login = async (token: string): Promise<UserResponse> => {

  const decodedToken = await admin.auth().verifyIdToken(token);
  const result = await pool.query<UserResponse>(
    "SELECT id, email, role FROM users WHERE firebase_uid = $1",
    [decodedToken.uid]
  );

  if (result.rowCount === 0) {
    throw new Error("User not registered in system");
  }

  return result.rows[0];
};
