import "dotenv/config";
import fs from "fs";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pool from "../config/db";
import { chunkTextQA } from "../utils/chuncker";
import { insertVector } from "../vectorStore/pgVector";

type ExtractedPage = { pageNum: number; text: string };

const extractPdfPages = async (filePath: string): Promise<ExtractedPage[]> => {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const pages: ExtractedPage[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items.map((item: any) => item.str).join("\n");

    pages.push({ pageNum, text: pageText });
  }

  return pages;
};

const runIngestion = async (): Promise<void> => {
  try {
    console.log("🚀 Starting document ingestion...");

    const pdfPath = path.join(process.cwd(), "docs", "codetribe-rag-qa.pdf");

    const docName = path.basename(pdfPath);

    const pages = await extractPdfPages(pdfPath);
    console.log(`📄 PDF pages extracted: ${pages.length}`);

    const fullText =
      pages
        .map((p) => `\n[PAGE ${p.pageNum}]\n${p.text}`)
        .join("\n\n") + "\n";

    const chunks = chunkTextQA(fullText);
    console.log(`✂️ Split into ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (chunk.trim().length < 80) continue;

      await insertVector({
        content: chunk,
        source: "pdf",
        docName,
        chunkIndex: i,
      });
    }

    console.log("✅ Document ingestion completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Ingestion failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runIngestion();