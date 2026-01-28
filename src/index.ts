import app from "./app";
import pool from "./config/db"; 

const PORT = process.env.PORT || 8080;
const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

testConnection();
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
