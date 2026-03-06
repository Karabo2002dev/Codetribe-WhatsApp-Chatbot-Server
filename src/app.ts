import express, { Application } from "express";
import  "./config/firebase";
import cors from "cors";
import logger from "./middlewares/logger";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";
import queryRoutes from "./routes/queryRoutes";
import userRoutes from "./routes/userRoutes";
import adminDocRoutes from "./routes/adminDocRoutes";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logger)


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/whatsapp", whatsappRoutes);
app.use("/api/admin", adminDocRoutes)
app.use("/api/queries", queryRoutes);

app.get("/", (req, res) => {
  res.send("CodeTribe WhatsApp Chatbot Server running");
});

app.use(notFoundHandler);
app.use(errorHandler);



export default app;
