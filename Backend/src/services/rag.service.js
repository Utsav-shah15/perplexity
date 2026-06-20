const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { PDFParse } = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Document = require("../models/document.model");

const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

// Embedding model
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});

// Text splitter
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Extract raw text from a file buffer based on mime type.
async function extractText(buffer, mimeType) {
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const data = await parser.getText();
    return data.text;
  }
  if (mimeType === "text/plain" || mimeType === "text/csv") {
    return buffer.toString("utf-8");
  }
  if (mimeType && mimeType.startsWith("image/")) {
    if (!genAI) {
      throw new Error("Google API Key is not configured for image analysis.");
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response = await model.generateContent([
      "Describe the contents of this image in detail. Extract any visible text (OCR), identify charts, diagrams, mockups, or visual structures, and explain the key elements and context shown in the image. This description will be stored in a knowledge base for semantic search.",
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: mimeType
        }
      }
    ]);
    return response.response.text();
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

/**
 * Process an uploaded file:
 * 1. Extract text
 * 2. Split into chunks
 * 3. Embed each chunk using Gemini
 * 4. Save to MongoDB Document model
 */
async function processDocument({ buffer, mimeType, filename, originalName, size, userId, workspaceId }) {
  const doc = await Document.create({
    user: userId,
    workspace: workspaceId || null,
    filename,
    originalName,
    mimeType,
    size,
    status: "processing",
    chunks: [],
  });

  try {
    // Step 1: Extract text
    const rawText = await extractText(buffer, mimeType);

    // Step 2: Split into chunks
    const textChunks = await splitter.splitText(rawText);

    // Step 3: Embed all chunks (batch)
    const embeddingVectors = await embeddings.embedDocuments(textChunks);

    // Step 4: Build chunk array
    const chunks = textChunks.map((content, i) => ({
      content,
      embedding: embeddingVectors[i],
      chunkIndex: i,
    }));

    // Step 5: Save embeddings to document
    doc.chunks = chunks;
    doc.status = "ready";
    await doc.save();

    return doc;
  } catch (err) {
    doc.status = "failed";
    await doc.save();
    throw err;
  }
}


// Cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

/**
 * Search user's knowledge base for chunks relevant to a query.
 * Returns top-k matching chunks as a formatted string.
 */
async function searchKnowledgeBase({ query, userId, workspaceId, topK = 5 }) {
  // Embed the query
  const queryEmbedding = await embeddings.embedQuery(query);

  // Fetch documents — filter by workspace
  const filter = { user: userId, status: "ready" };
  if (workspaceId) {
    filter.workspace = workspaceId;
  } else {
    filter.workspace = null;
  }
  const docs = await Document.find(filter);

  if (docs.length === 0) {
    return "No documents found in the knowledge base.";
  }

  // Compute cosine similarity for every chunk across all docs
  const scored = [];
  for (const doc of docs) {
    for (const chunk of doc.chunks) {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      scored.push({
        score,
        content: chunk.content,
        source: doc.originalName,
      });
    }
  }

  // Sort by score descending, take top-k
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, topK);

  if (topChunks.length === 0) {
    return "No relevant content found in knowledge base.";
  }

  return topChunks
    .map((c, i) => `[${i + 1}] Source: ${c.source}\n${c.content}`)
    .join("\n\n");
}

module.exports = { processDocument, searchKnowledgeBase, embeddings };
