/**
 * Upgraded Hybrid Vector Store Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Primary: Dual Memory Source (TF-IDF Index + Hugging Face @xenova/transformers Embeddings)
 * Optional Cloud: MongoDB Atlas Vector Search ($vectorSearch aggregate pipeline)
 *
 * Implements Rule 2:
 * Wire @xenova/transformers embeddings into vectorStore next to the existing TF-IDF index.
 * Feed both into context — TF-IDF is preserved, ensuring retrieval cannot regress.
 */

const natural = require('natural');
const TfIdf = natural.TfIdf;
const mongoose = require('mongoose');
const JarvisDocument = require('../models/JarvisDocument');
const { generateEmbedding } = require('./hfService');

class VectorStore {
  constructor() {
    this.documents = []; // [{ id, text, metadata, vector, hfEmbedding }]
    this.tfidf = new TfIdf();
    this.vocabulary = new Set();
    this.vocabArray = [];
    this.lastBuilt = null;
    this.buildTTL = 5 * 60 * 1000; // 5 min
    this.maxTextLength = 12000;
    this.useAtlasVector = false;
    this.embeddingGenerationInProgress = false;
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
   * Build / populate document chunks in memory (for local TF-IDF and HF Embeddings)
   */
  build(rawDocs) {
    const existingEmbeddings = new Map();
    this.documents.forEach(d => {
      if (d.hfEmbedding) existingEmbeddings.set(d.id, d.hfEmbedding);
    });

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
      const hfEmbedding = existingEmbeddings.get(doc.id) || null;
      this.documents.push({ ...doc, vector, hfEmbedding });
    });

    this.lastBuilt = Date.now();
    console.log(`[VectorStore] Built ${this.documents.length} document chunks (TF-IDF index active)`);

    // Asynchronously generate HF embeddings for chunks that don't have them yet
    this._queueEmbeddingGeneration();
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

  _dotProduct(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
      sum += vecA[i] * vecB[i];
    }
    return sum;
  }

  /**
   * Background queue to compute HF embeddings for in-memory documents
   */
  async _queueEmbeddingGeneration() {
    if (this.embeddingGenerationInProgress) return;
    this.embeddingGenerationInProgress = true;

    setImmediate(async () => {
      try {
        let count = 0;
        for (const doc of this.documents) {
          if (!doc.hfEmbedding) {
            const emb = await generateEmbedding(doc.text);
            if (emb) {
              doc.hfEmbedding = emb;
              count++;
            }
          }
        }
        if (count > 0) {
          console.log(`[VectorStore] Computed HF @xenova/transformers embeddings for ${count} chunks.`);
        }
      } catch (err) {
        console.warn('[VectorStore] Background embedding queue error:', err.message);
      } finally {
        this.embeddingGenerationInProgress = false;
      }
    });
  }

  /**
   * Dual Memory Retrieval: Fuses TF-IDF sparse matches + HF dense embeddings
   * Both sources are fed into context to ensure maximum recall.
   */
  async searchHybrid(query, topK = 5) {
    if (this.documents.length === 0) return [];

    // 1. Source A: TF-IDF Retrieval
    const tfidfMatches = this.search(query, topK * 2);
    const scoreMap = new Map();

    tfidfMatches.forEach((doc, rank) => {
      const normalizedScore = (topK * 2 - rank) / (topK * 2);
      scoreMap.set(doc.id, {
        doc,
        tfidfScore: doc.score,
        hfScore: 0,
        combinedScore: normalizedScore * 0.5,
        sources: ['tfidf'],
      });
    });

    // 2. Source B: Hugging Face Embeddings Retrieval
    try {
      const queryEmb = await generateEmbedding(query);
      if (queryEmb) {
        const hfMatches = [];
        for (const doc of this.documents) {
          if (doc.hfEmbedding) {
            const sim = this._dotProduct(queryEmb, doc.hfEmbedding);
            if (sim > 0.15) {
              hfMatches.push({ doc, sim });
            }
          }
        }

        hfMatches.sort((a, b) => b.sim - a.sim);
        const topHf = hfMatches.slice(0, topK * 2);

        topHf.forEach((item, rank) => {
          const normalizedScore = (topK * 2 - rank) / (topK * 2);
          const existing = scoreMap.get(item.doc.id);
          if (existing) {
            existing.hfScore = item.sim;
            existing.combinedScore += normalizedScore * 0.5;
            existing.sources.push('hf_embedding');
          } else {
            scoreMap.set(item.doc.id, {
              doc: item.doc,
              tfidfScore: 0,
              hfScore: item.sim,
              combinedScore: normalizedScore * 0.5,
              sources: ['hf_embedding'],
            });
          }
        });
      }
    } catch (err) {
      console.warn('[VectorStore] HF search query failed, relying on TF-IDF:', err.message);
    }

    // 3. Rank combined results and return topK chunks
    const combined = Array.from(scoreMap.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, topK)
      .map(item => ({
        ...item.doc,
        score: item.combinedScore,
        metadata: {
          ...(item.doc.metadata || {}),
          retrievalSources: item.sources,
          tfidfScore: item.tfidfScore,
          hfScore: item.hfScore,
        },
      }));

    return combined;
  }

  /**
   * Search documents using Atlas Vector Search if enabled, or Dual Hybrid Search (TF-IDF + HF)
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
            metadata: { source: r.source, retrievalSources: ['atlas_vector'] },
            score: r.score,
          }));
        }
      } catch (err) {
        console.warn('[VectorStore] Atlas Vector Search query failed, falling back to Dual Hybrid:', err.message);
      }
    }

    // Dual Hybrid Memory Search (TF-IDF + HF @xenova/transformers)
    return await this.searchHybrid(query, topK);
  }

  /**
   * Synchronous TF-IDF search (preserved for existing code contracts)
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
   * Add chunk to both TF-IDF index and HF embeddings store
   */
  addChunk(chunk) {
    const docs = this.documents.filter(d => d.id !== chunk.id).map(({ vector, ...doc }) => doc);
    docs.push(chunk);
    this.build(docs);

    // Asynchronously generate HF embedding for the newly added chunk
    setImmediate(async () => {
      try {
        const emb = await generateEmbedding(chunk.text);
        if (emb) {
          const target = this.documents.find(d => d.id === chunk.id);
          if (target) {
            target.hfEmbedding = emb;
          }
        }
      } catch (e) {}
    });
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
    const hfEmb = await generateEmbedding(text);
    if (hfEmb) return hfEmb;

    // Fallback pseudo-embedding if model offline
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
