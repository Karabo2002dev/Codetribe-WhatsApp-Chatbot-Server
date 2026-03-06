import { Request, Response } from "express";
import { supabaseServer, SUPABASE_BUCKET } from "../config/supabasServer";
import pool from "../config/db"; // your existing pg pool

function getStoragePath(docKey: string) {
  return `${docKey}`;
}

// GET /admin/doc?docKey=codetribe_kb
export async function getAdminDoc(req: Request, res: Response) {
  try {
    const docKey = String(req.query.docKey || "").trim();
    console.log("getAdminDoc called with docKey:", docKey);
    if (!docKey) return res.status(400).json({ error: "docKey is required" });

    const storagePath = getStoragePath(docKey);

    const { data, error } = await supabaseServer.storage
      .from(SUPABASE_BUCKET)
      .download(storagePath);

    if (error || !data) {
      return res.status(404).json({
        error: "Document not found in storage",
        details: error?.message,
        storagePath,
      });
    }

    const text = await data.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Stored document is not valid JSON", storagePath });
    }

    return res.json({
      docKey,
      storagePath,
      content: json,
    });
  } catch (e: any) {
    console.error("getAdminDoc error:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
}

export async function saveAdminDoc(req: Request, res: Response) {
  try {
    const docKey = String(req.body?.docKey || "").trim();
    const content = req.body?.content;

    if (!docKey) return res.status(400).json({ error: "docKey is required" });
    if (!content) return res.status(400).json({ error: "content is required" });

    const storagePath = getStoragePath(docKey);

    // ensure updatedAt exists (optional, but helpful)
    const updatedContent =
      typeof content === "object" && content !== null
        ? { ...content, docKey, updatedAt: new Date().toISOString() }
        : content;

    const body = JSON.stringify(updatedContent, null, 2);

    const { error: uploadError } = await supabaseServer.storage
      .from(SUPABASE_BUCKET)
      .upload(storagePath, body, {
        contentType: "application/json",
        upsert: true, // replace existing
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    // Update/insert row in rag_documents
    await pool.query(
      `
      INSERT INTO rag_documents (doc_key, storage_path, updated_at)
      VALUES ($1, $2, now())
      ON CONFLICT (doc_key)
      DO UPDATE SET storage_path = EXCLUDED.storage_path, updated_at = now()
      `,
      [docKey, storagePath]
    );

    return res.json({
      message: "Saved successfully",
      docKey,
      storagePath,
    });
  } catch (e: any) {
    console.error("saveAdminDoc error:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
}