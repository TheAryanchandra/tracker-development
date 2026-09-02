/**
 * OCR Engine — Multimodal Vision + PDF Text Extraction
 * ─────────────────────────────────────────────────────────────
 * Extracts text from:
 *  - Images (screenshots, offer letters, JDs) via Gemini Vision
 *  - PDFs via pdf-parse
 * Extracted text is chunked and added to RAG vector store.
 */

const fs = require('fs');
const path = require('path');

let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {}

let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (e) {}

const vectorStore = require('./vectorStore');

/**
 * Detect file type from extension
 */
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) return 'image';
  if (ext === '.pdf') return 'pdf';
  if (['.txt', '.md', '.csv'].includes(ext)) return 'text';
  return 'unknown';
}

/**
 * Convert image file to base64 for Gemini Vision
 */
function fileToBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('base64');
}

/**
 * Get MIME type from extension
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.bmp': 'image/bmp',
    '.pdf': 'application/pdf',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Extract text from image using Gemini Vision (multimodal)
 */
async function extractTextFromImage(filePath, filename) {
  if (!process.env.GEMINI_API_KEY || !GoogleGenerativeAI) {
    return { text: 'Image uploaded (OCR requires Gemini API key)', type: 'image', entities: {} };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imageData = fileToBase64(filePath);
    const mimeType = getMimeType(filename);

    const prompt = `Analyze this image thoroughly and:
1. Extract ALL visible text (OCR)
2. Identify what type of document/image this is (e.g., job description, offer letter, leetcode problem, resume, screenshot, etc.)
3. Extract key structured data: company names, job roles, dates, salaries, skills required, problem names, etc.
4. Summarize the key information in 2-3 sentences

Format your response as:
TYPE: <document type>
EXTRACTED TEXT:
<all visible text>

KEY ENTITIES:
<company/role/date/salary/skills etc>

SUMMARY:
<2-3 sentence summary>`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData, mimeType } },
    ]);

    const responseText = result.response.text();
    
    // Parse structured response
    const typeMatch = responseText.match(/TYPE:\s*(.+)/i);
    const textMatch = responseText.match(/EXTRACTED TEXT:\s*([\s\S]+?)(?=KEY ENTITIES:|$)/i);
    const entitiesMatch = responseText.match(/KEY ENTITIES:\s*([\s\S]+?)(?=SUMMARY:|$)/i);
    const summaryMatch = responseText.match(/SUMMARY:\s*([\s\S]+?)$/i);

    const extractedText = textMatch ? textMatch[1].trim() : responseText;
    const docType = typeMatch ? typeMatch[1].trim() : 'document';
    const entities = entitiesMatch ? entitiesMatch[1].trim() : '';
    const summary = summaryMatch ? summaryMatch[1].trim() : '';

    // Add to RAG vector store for future queries
    const chunkId = `ocr-${Date.now()}`;
    vectorStore.addChunk({
      id: chunkId,
      text: `[Uploaded ${docType}] ${extractedText}\n\nKey info: ${entities}\nSummary: ${summary}`,
      metadata: { type: 'uploaded_document', docType, filename, uploadedAt: new Date().toISOString() },
    });

    return {
      text: extractedText,
      fullAnalysis: responseText,
      type: docType,
      entities,
      summary,
      source: 'Gemini Vision OCR',
    };

  } catch (err) {
    console.error('[OCR] Gemini Vision error:', err.message);
    return { text: `Image uploaded: ${filename} (OCR failed: ${err.message})`, type: 'image', entities: {} };
  }
}

/**
 * Extract text from PDF using pdf-parse
 */
async function extractTextFromPDF(filePath, filename) {
  if (!pdfParse) {
    return { text: 'PDF uploaded (pdf-parse not available)', type: 'pdf', entities: {} };
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = data.text.trim();

    // If we have Gemini, also analyze the PDF content
    let analysis = { type: 'pdf', entities: '', summary: '' };
    if (process.env.GEMINI_API_KEY && GoogleGenerativeAI && text.length > 50) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(
          `Analyze this PDF text and identify: document type, key entities (company, role, dates, skills), and provide a 2-sentence summary.\n\nText:\n${text.slice(0, 3000)}`
        );
        const resp = result.response.text();
        analysis = { type: 'pdf', entities: resp, summary: resp.slice(0, 200) };
      } catch (e) { /* skip analysis if fails */ }
    }

    // Add to RAG vector store
    const chunkId = `pdf-${Date.now()}`;
    vectorStore.addChunk({
      id: chunkId,
      text: `[Uploaded PDF: ${filename}]\n${text}`,
      metadata: { type: 'uploaded_pdf', filename, pages: data.numpages, uploadedAt: new Date().toISOString() },
    });

    return {
      text,
      type: 'pdf',
      pages: data.numpages,
      ...analysis,
      source: 'pdf-parse',
    };

  } catch (err) {
    console.error('[OCR] PDF parse error:', err.message);
    return { text: `PDF uploaded: ${filename} (parse failed)`, type: 'pdf', entities: {} };
  }
}

/**
 * Extract text from plain text file
 */
async function extractTextFromText(filePath, filename) {
  const text = fs.readFileSync(filePath, 'utf-8');
  const chunkId = `txt-${Date.now()}`;
  vectorStore.addChunk({
    id: chunkId,
    text: `[Uploaded text file: ${filename}]\n${text}`,
    metadata: { type: 'uploaded_text', filename, uploadedAt: new Date().toISOString() },
  });
  return { text, type: 'text', source: 'direct-read' };
}

/**
 * Main OCR function — routes to correct extractor by file type
 */
async function processUploadedFile(filePath, filename) {
  const fileType = getFileType(filename);
  console.log(`[OCR] Processing ${fileType} file: ${filename}`);

  switch (fileType) {
    case 'image': return await extractTextFromImage(filePath, filename);
    case 'pdf':   return await extractTextFromPDF(filePath, filename);
    case 'text':  return await extractTextFromText(filePath, filename);
    default:
      return { text: `File uploaded: ${filename}`, type: 'unknown', entities: '' };
  }
}

module.exports = { processUploadedFile, getFileType };
