/**
 * Hugging Face Transformers Service for Node.js (via @xenova/transformers)
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides local, in-process, zero-cost ONNX models:
 *  1. Embeddings: Xenova/all-MiniLM-L6-v2 (384-dimensional dense vectors)
 *  2. Router / Classification: Xenova/mobilebert-uncased-mnli (zero-shot classification)
 *  3. Summarizer: Xenova/distilbart-cnn-6-6 (compression for scraped web pages)
 *
 * Runs entirely in-process in Node.js without Python, external APIs, or token fees.
 */

let pipeline = null;
let env = null;

// Lazy load @xenova/transformers to ensure fast initial server startup
async function getTransformers() {
  if (!pipeline) {
    const transformers = await import('@xenova/transformers');
    pipeline = transformers.pipeline;
    env = transformers.env;

    // Cache models locally in .cache/huggingface
    if (env) {
      env.allowLocalModels = false; // allow downloading from HF hub on first use
      env.useBrowserCache = false;
    }
  }
  return { pipeline, env };
}

// Singletons for pipelines
let embeddingPipeline = null;
let classificationPipeline = null;
let summarizationPipeline = null;

let embeddingLoading = false;
let classificationLoading = false;
let summarizationLoading = false;

/**
 * 1. Generate text embedding vector (384-dimensional) using all-MiniLM-L6-v2
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') return null;

  try {
    if (!embeddingPipeline && !embeddingLoading) {
      embeddingLoading = true;
      const { pipeline } = await getTransformers();
      console.log('[HF Service] Initializing embedding model: Xenova/all-MiniLM-L6-v2...');
      embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
      console.log('[HF Service] Embedding model loaded successfully.');
      embeddingLoading = false;
    }

    if (!embeddingPipeline) {
      return null;
    }

    // Mean pooling and L2 normalization
    const output = await embeddingPipeline(text.slice(0, 1000), {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(output.data);
  } catch (err) {
    console.warn('[HF Service] Embedding generation error:', err.message);
    embeddingLoading = false;
    return null;
  }
}

/**
 * 2. Classify intent / route using zero-shot classification
 */
async function classifyIntent(text, candidateLabels) {
  if (!text || typeof text !== 'string' || !Array.isArray(candidateLabels)) {
    return null;
  }

  try {
    if (!classificationPipeline && !classificationLoading) {
      classificationLoading = true;
      const { pipeline } = await getTransformers();
      console.log('[HF Service] Initializing zero-shot router: Xenova/mobilebert-uncased-mnli...');
      classificationPipeline = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli', {
        quantized: true,
      });
      console.log('[HF Service] Zero-shot router loaded successfully.');
      classificationLoading = false;
    }

    if (!classificationPipeline) {
      return null;
    }

    const result = await classificationPipeline(text.slice(0, 500), candidateLabels);
    return {
      topLabel: result.labels[0],
      topScore: result.scores[0],
      labels: result.labels,
      scores: result.scores,
    };
  } catch (err) {
    console.warn('[HF Service] Classification error:', err.message);
    classificationLoading = false;
    return null;
  }
}

/**
 * 3. Summarize scraped web content to ~150 tokens
 */
async function summarizeText(text, maxWords = 150) {
  if (!text || typeof text !== 'string') return '';
  if (text.length < 250) return text; // already brief

  try {
    if (!summarizationPipeline && !summarizationLoading) {
      summarizationLoading = true;
      const { pipeline } = await getTransformers();
      console.log('[HF Service] Initializing summarizer model: Xenova/distilbart-cnn-6-6...');
      summarizationPipeline = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
        quantized: true,
      });
      console.log('[HF Service] Summarizer model loaded successfully.');
      summarizationLoading = false;
    }

    if (summarizationPipeline) {
      const summaryResult = await summarizationPipeline(text.slice(0, 2000), {
        max_new_tokens: maxWords,
        min_new_tokens: 30,
      });
      if (summaryResult && summaryResult[0]?.summary_text) {
        return summaryResult[0].summary_text.trim();
      }
    }
  } catch (err) {
    console.warn('[HF Service] Summarization model error, using extractive compression:', err.message);
    summarizationLoading = false;
  }

  // Fast extractive fallback if model is warming up or unavailable
  return extractKeySummary(text, maxWords);
}

/**
 * Extractive fallback compression (fast sentence selection based on information density)
 */
function extractKeySummary(text, maxWords = 150) {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !s.includes('cookie') && !s.includes('subscribe'));

  let wordCount = 0;
  const picked = [];

  for (const s of sentences) {
    const words = s.split(/\s+/).length;
    if (wordCount + words <= maxWords) {
      picked.push(s);
      wordCount += words;
    } else if (picked.length === 0) {
      picked.push(s.split(/\s+/).slice(0, maxWords).join(' ') + '...');
      break;
    } else {
      break;
    }
  }

  return picked.join(' ');
}

module.exports = {
  generateEmbedding,
  classifyIntent,
  summarizeText,
  extractKeySummary,
};
