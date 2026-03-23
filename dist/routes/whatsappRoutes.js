"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whatsappWebhook_1 = require("../webhook/whatsappWebhook");
const router = (0, express_1.Router)();
router.post("/webhook", whatsappWebhook_1.whatsappWebhook);
exports.default = router;
