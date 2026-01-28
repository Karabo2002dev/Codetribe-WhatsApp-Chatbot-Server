import express, { Application } from "express";
import  "./config/firebase";
import cors from "cors";
import logger from "./middlewares/logger";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(logger)

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("CodeTribe WhatsApp Chatbot Server running");
});

app.use(notFoundHandler);
app.use(errorHandler);



export default app;
