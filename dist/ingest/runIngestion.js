"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfjsLib = __importStar(require("pdfjs-dist/legacy/build/pdf.mjs"));
const db_1 = __importDefault(require("../config/db"));
const chuncker_1 = require("../utils/chuncker");
const pgVector_1 = require("../vectorStore/pgVector");
const extractPdfPages = async (filePath) => {
    const data = new Uint8Array(fs_1.default.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const pages = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join("\n");
        pages.push({ pageNum, text: pageText });
    }
    return pages;
};
const runIngestion = async () => {
    try {
        console.log("🚀 Starting document ingestion...");
        const pdfPath = path_1.default.join(process.cwd(), "docs", "codetribe-rag-qa.pdf");
        const docName = path_1.default.basename(pdfPath);
        const pages = await extractPdfPages(pdfPath);
        console.log(`📄 PDF pages extracted: ${pages.length}`);
        const fullText = pages
            .map((p) => `\n[PAGE ${p.pageNum}]\n${p.text}`)
            .join("\n\n") + "\n";
        const chunks = (0, chuncker_1.chunkTextQA)(fullText);
        console.log(`✂️ Split into ${chunks.length} chunks`);
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (chunk.trim().length < 80)
                continue;
            await (0, pgVector_1.insertVector)({
                content: chunk,
                source: "pdf",
                docName,
                chunkIndex: i,
            });
        }
        console.log("✅ Document ingestion completed!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Ingestion failed:", error);
        process.exit(1);
    }
    finally {
        await db_1.default.end();
    }
};
runIngestion();
