const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const pdfParse = require("pdf-parse");
const Document = require("../models/document.model");

// Embedding model
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "text-embedding-004",
});

// Text splitter
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

/**
 * Extract raw text from a file buffer based on mime type.
 */
async function extractText(buffer, mimeType) {
  if (mimeType === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (mimeType === "text/plain" || mimeType === "text/csv") {
    return buffer.toString("utf-8");
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
async function processDocument({ buffer, mimeType, filename, originalName, size, userId }) {
  const doc = await Document.create({
    user: userId,
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

/**
 * Cosine similarity between two vectors
 */
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
async function searchKnowledgeBase({ query, userId, topK = 5 }) {
  // Embed the query
  const queryEmbedding = await embeddings.embedQuery(query);

  // Fetch all user documents with chunks
  const docs = await Document.find({ user: userId, status: "ready" });

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
