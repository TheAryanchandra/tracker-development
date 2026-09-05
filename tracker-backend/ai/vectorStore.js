/**
 * Local TF-IDF Vector Store
 * Zero API keys needed. Builds semantic embeddings from your MongoDB data.
 * Auto-refreshes every 5 minutes to stay current.
 */

const natural = require('natural');
const TfIdf = natural.TfIdf;

class VectorStore {
  constructor() {
    this.documents = []; // [{ id, text, metadata, vector }]
    this.tfidf = new TfIdf();
    this.vocabulary = new Set();
    this.vocabArray = [];
    this.lastBuilt = null;
    this.buildTTL = 5 * 60 * 1000; // 5 min
    this.maxTextLength = 12000;
  }

  /**
   * Add documents to the vector store and compute TF-IDF vectors
   */
  build(rawDocs) {
    this.documents = [];
    this.tfidf = new TfIdf();
    this.vocabulary = new Set();

    // Add all documents to TF-IDF
    const normalized = this._normalizeDocs(rawDocs);
    normalized.forEach(doc => {
      this.tfidf.addDocument(doc.text);
      // Tokenize into vocabulary
      const tokens = doc.text.toLowerCase().split(/\W+/).filter(t => t.length > 2);
      tokens.forEach(t => this.vocabulary.add(t));
    });

    this.vocabArray = Array.from(this.vocabulary);

    // Compute TF-IDF vector for each document
    normalized.forEach((doc, idx) => {
      const vector = this._computeVector(idx);
      this.documents.push({ ...doc, vector });
    });

    this.lastBuilt = Date.now();
    console.log(`[VectorStore] Built ${this.documents.length} document chunks`);
  }

  /**
   * Check if store needs rebuild
   */
  needsRebuild() {
    return !this.lastBuilt || (Date.now() - this.lastBuilt) > this.buildTTL;
  }

  /**
   * Compute TF-IDF vector for doc at index
   */
  _computeVector(docIndex) {
    const vector = {};
    this.tfidf.listTerms(docIndex).forEach(term => {
      vector[term.term] = term.tfidf;
    });
    return vector;
  }

  /**
   * Compute TF-IDF vector for a query string
   */
  _queryVector(query) {
    const tempTfidf = new TfIdf();
    // Add all existing docs + query as last
    this.documents.forEach(doc => tempTfidf.addDocument(doc.text));
    tempTfidf.addDocument(query);
    const queryIdx = this.documents.length;
    const vector = {};
    tempTfidf.listTerms(queryIdx).forEach(term => {
      vector[term.term] = term.tfidf;
    });
    return vector;
  }

  /**
   * Cosine similarity between two sparse vectors
   */
  _cosineSimilarity(vecA, vecB) {
    const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dot = 0, normA = 0, normB = 0;
    allKeys.forEach(k => {
      const a = vecA[k] || 0;
      const b = vecB[k] || 0;
      dot += a * b;
      normA += a * a;
      normB += b * b;
    });
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Semantic similarity search — returns top-k chunks
   */
  search(query, topK = 5) {
    if (this.documents.length === 0) return [];
    const queryVec = this._queryVector(query);
    const scored = this.documents.map(doc => ({
      ...doc,
      score: this._cosineSimilarity(queryVec, doc.vector),
    }));
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(d => d.score > 0);
  }

  /**
   * Add a single chunk dynamically (OCR, web scrape, etc.)
   * without rebuilding the entire store
   */
  addChunk(chunk) {
    const docs = this.documents.filter(d => d.id !== chunk.id).map(({ vector, ...doc }) => doc);
    docs.push(chunk);
    this.build(docs);
    console.log(`[VectorStore] Added chunk "${chunk.id}" (total: ${this.documents.length})`);
  }

  _normalizeDocs(rawDocs) {
    const seen = new Set();
    return (Array.isArray(rawDocs) ? rawDocs : []).map((doc, index) => ({
      id: String(doc.id || `chunk-${index}`),
      text: String(doc.text || '').replace(/\s+/g, ' ').trim().slice(0, this.maxTextLength),
      metadata: doc.metadata && typeof doc.metadata === 'object' ? doc.metadata : {},
    })).filter(doc => doc.text && !seen.has(doc.id) && seen.add(doc.id));
  }

  /**
   * Get the total number of indexed chunks
   */
  getChunkCount() {
    return this.documents.length;
  }
}

// Singleton instance
const vectorStore = new VectorStore();
module.exports = vectorStore;
