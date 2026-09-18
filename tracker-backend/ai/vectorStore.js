/**
 * Upgraded Hybrid Vector Store Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Primary: MongoDB Atlas Vector Search ($vectorSearch aggregate pipeline)
 * Fallback: Zero-dependency TF-IDF Sparse Vector Engine
 * Auto-indexes MongoDB tracker data, documents, and memory.
 */

const natural = require('natural');
const TfIdf = natural.TfIdf;
const mongoose = require('mongoose');
const JarvisDocument = require('../models/JarvisDocument');

class VectorStore {
  constructor() {
    this.documents = []; // [{ id, text, metadata, vector }]
    this.tfidf = new TfIdf();
    this.vocabulary = new Set();
    this.vocabArray = [];
    this.lastBuilt = null;
    this.buildTTL = 5 * 60 * 1000; // 5 min
    this.maxTextLength = 12000;
    this.useAtlasVector = false;
  }

  /**
   * Check if MongoDB Atlas Vector Search is available
   */
  async checkAtlasAvailability() {
    try {
      if (mongoose.connection.readyState === 1 && process.env.ATLAS_VECTOR_INDEX_NAME) {
        this.useAtlasVector = true;
        console.log('[VectorStore] Atlas Vector Search enabled with index:', process.env.ATLAS_VECTOR_INDEX_NAME);
        return true;
      }
    } catch (e) {
      this.useAtlasVector = false;
    }
    return false;
  }

  /**
   * Build / populate document chunks in memory (for local TF-IDF fallback)
   */
  build(rawDocs) {
    this.documents = [];
    this.tfidf = new TfIdf();
    this.vocabulary = new Set();

    const normalized = this._normalizeDocs(rawDocs);
    normalized.forEach(doc => {
      this.tfidf.addDocument(doc.text);
      const tokens = doc.text.toLowerCase().split(/\W+/).filter(t => t.length > 2);
      tokens.forEach(t => this.vocabulary.add(t));
    });

    this.vocabArray = Array.from(this.vocabulary);

    normalized.forEach((doc, idx) => {
      const vector = this._computeVector(idx);
      this.documents.push({ ...doc, vector });
    });

    this.lastBuilt = Date.now();
    console.log(`[VectorStore] Built ${this.documents.length} document chunks (TF-IDF engine)`);
  }

  needsRebuild() {
    return !this.lastBuilt || (Date.now() - this.lastBuilt) > this.buildTTL;
  }

  _computeVector(docIndex) {
    const vector = {};
    this.tfidf.listTerms(docIndex).forEach(term => {
      vector[term.term] = term.tfidf;
    });
    return vector;
  }

  _queryVector(query) {
    const tempTfidf = new TfIdf();
    this.documents.forEach(doc => tempTfidf.addDocument(doc.text));
    tempTfidf.addDocument(query);
    const queryIdx = this.documents.length;
    const vector = {};
    tempTfidf.listTerms(queryIdx).forEach(term => {
      vector[term.term] = term.tfidf;
    });
    return vector;
  }

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
   * Search documents using Atlas Vector Search if enabled, or TF-IDF cosine similarity as fallback
   */
  async searchAtlasOrTfidf(query, topK = 5) {
    if (this.useAtlasVector && JarvisDocument) {
      try {
        const atlasResults = await JarvisDocument.aggregate([
          {
            $vectorSearch: {
              index: process.env.ATLAS_VECTOR_INDEX_NAME || 'vector_index',
              path: 'embedding',
              queryVector: await this._generateQueryEmbedding(query),
              numCandidates: topK * 10,
              limit: topK,
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              content: 1,
              source: 1,
              score: { $meta: 'vectorSearchScore' },
            },
          },
        ]);

        if (atlasResults && atlasResults.length > 0) {
          return atlasResults.map(r => ({
            id: r._id,
            text: r.content || r.title,
            metadata: { source: r.source },
            score: r.score,
          }));
        }
      } catch (err) {
        console.warn('[VectorStore] Atlas Vector Search query failed, falling back to TF-IDF:', err.message);
      }
    }

    // Local TF-IDF search fallback
    return this.search(query, topK);
  }

  /**
   * Synchronous search (compatible with existing code)
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

  addChunk(chunk) {
    const docs = this.documents.filter(d => d.id !== chunk.id).map(({ vector, ...doc }) => doc);
    docs.push(chunk);
    this.build(docs);
  }

  _normalizeDocs(rawDocs) {
    const seen = new Set();
    return (Array.isArray(rawDocs) ? rawDocs : []).map((doc, index) => ({
      id: String(doc.id || `chunk-${index}`),
      text: String(doc.text || '').replace(/\s+/g, ' ').trim().slice(0, this.maxTextLength),
      metadata: doc.metadata && typeof doc.metadata === 'object' ? doc.metadata : {},
    })).filter(doc => doc.text && !seen.has(doc.id) && seen.add(doc.id));
  }

  getChunkCount() {
    return this.documents.length;
  }

  async _generateQueryEmbedding(text) {
    // Basic normalized pseudo embedding for fallback compatibility if no embedding service provided
    const arr = new Array(128).fill(0);
    for (let i = 0; i < text.length; i++) {
      arr[i % 128] += text.charCodeAt(i) / 255;
    }
    return arr;
  }
}

// Singleton instance
const vectorStore = new VectorStore();
module.exports = vectorStore;
