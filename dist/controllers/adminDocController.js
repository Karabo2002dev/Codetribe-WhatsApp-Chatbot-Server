"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDoc = getAdminDoc;
exports.saveAdminDoc = saveAdminDoc;
const supabasServer_1 = require("../config/supabasServer");
const db_1 = __importDefault(require("../config/db")); // your existing pg pool
function getStoragePath(docKey) {
    return `${docKey}`;
}
async function getAdminDoc(req, res) {
    try {
        const docKey = String(req.query.docKey || "").trim();
        console.log("getAdminDoc called with docKey:", docKey);
        if (!docKey)
            return res.status(400).json({ error: "docKey is required" });
        const storagePath = getStoragePath(docKey);
        const { data, error } = await supabasServer_1.supabaseServer.storage
            .from(supabasServer_1.SUPABASE_BUCKET)
            .download(storagePath);
        if (error || !data) {
            return res.status(404).json({
                error: "Document not found in storage",
                details: error?.message,
                storagePath,
            });
        }
        const text = await data.text();
        let json;
        try {
            json = JSON.parse(text);
        }
        catch {
            return res.status(500).json({ error: "Stored document is not valid JSON", storagePath });
        }
        return res.json({
            docKey,
            storagePath,
            content: json,
        });
    }
    catch (e) {
        console.error("getAdminDoc error:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
}
async function saveAdminDoc(req, res) {
    try {
        const docKey = String(req.body?.docKey || "").trim();
        const content = req.body?.content;
        if (!docKey)
            return res.status(400).json({ error: "docKey is required" });
        if (!content)
            return res.status(400).json({ error: "content is required" });
        const storagePath = getStoragePath(docKey);
        // ensure updatedAt exists (optional, but helpful)
        const updatedContent = typeof content === "object" && content !== null
            ? { ...content, docKey, updatedAt: new Date().toISOString() }
            : content;
        const body = JSON.stringify(updatedContent, null, 2);
        const { error: uploadError } = await supabasServer_1.supabaseServer.storage
            .from(supabasServer_1.SUPABASE_BUCKET)
            .upload(storagePath, body, {
            contentType: "application/json",
            upsert: true, // replace existing
        });
        if (uploadError) {
            return res.status(500).json({ error: uploadError.message });
        }
        // Update/insert row in rag_documents
        await db_1.default.query(`
      INSERT INTO rag_documents (doc_key, storage_path, updated_at)
      VALUES ($1, $2, now())
      ON CONFLICT (doc_key)
      DO UPDATE SET storage_path = EXCLUDED.storage_path, updated_at = now()
      `, [docKey, storagePath]);
        return res.json({
            message: "Saved successfully",
            docKey,
            storagePath,
        });
    }
    catch (e) {
        console.error("saveAdminDoc error:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
}
