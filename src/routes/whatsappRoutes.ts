import { Router } from "express";
import { whatsappWebhook } from "../webhook/whatsappWebhook";

const router = Router();

router.post("/webhook", whatsappWebhook);

export default router;
