import express, { Application } from "express";
import  "./config/firebase";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("CodeTribe WhatsApp Chatbot Server running");
});

export default app;
