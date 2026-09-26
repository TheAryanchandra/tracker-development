/**
 * Hugging Face Zero-Shot Intent Router (Shadow Mode)
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements Rule 3:
 * Runs in shadow mode to predict user intent routes without altering the live Gemini flow:
 *  - log_activity: Daily tracker, applications, DSA progress, task management
 *  - search_web: Live search queries, URL reading, current trends
 *  - document_ocr: File analysis, resume extraction, screenshot reading
 *  - memory_qna: Recalling learned facts, profile data, streak queries
 *  - general_chat: Technical architecture discussions, coding, conversational
 *
 * Real Gemini call still decides everything for now until shadow telemetry is proven.
 */

const { classifyIntent } = require('./hfService');

const ROUTE_LABELS = [
  'log_activity',
  'search_web',
  'document_ocr',
  'memory_qna',
  'general_chat',
];

// Telemetry & metrics for Shadow Mode verification
const shadowStats = {
  totalRuns: 0,
  matches: 0,
  mismatches: 0,
  routeDistribution: {
    log_activity: 0,
    search_web: 0,
    document_ocr: 0,
    memory_qna: 0,
    general_chat: 0,
  },
  recentLogs: [],
};

const MAX_RECENT_LOGS = 50;

/**
 * Fast pattern heuristic for instant pre-classification if pipeline is loading
 */
function fastPatternRouter(text) {
  const lower = String(text || '').toLowerCase().trim();

  if (/^(log|solved|completed|applied to|watched|streak|add task|create task|track)\b/i.test(lower)) {
    return { route: 'log_activity', score: 0.92, source: 'pattern_heuristic' };
  }
  if (/https?:\/\/[^\s]+|\b(search web|search online|look up|latest|current news|find jobs|hiring trends)\b/i.test(lower)) {
    return { route: 'search_web', score: 0.90, source: 'pattern_heuristic' };
  }
  if (/\b(resume|cv|pdf|screenshot|ocr|image|document|parse file)\b/i.test(lower)) {
    return { route: 'document_ocr', score: 0.88, source: 'pattern_heuristic' };
  }
  if (/\b(who is aryan|my streak|how many problems|remember|what did i tell you|learned fact|my background)\b/i.test(lower)) {
    return { route: 'memory_qna', score: 0.89, source: 'pattern_heuristic' };
  }
  return { route: 'general_chat', score: 0.80, source: 'pattern_heuristic' };
}

/**
 * Predict route using Hugging Face Zero-Shot Classifier
 */
async function predictRoute(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') {
    return { route: 'general_chat', score: 1.0, source: 'default' };
  }

  try {
    const classification = await classifyIntent(userMessage, ROUTE_LABELS);
    if (classification && classification.topLabel) {
      return {
        route: classification.topLabel,
        score: classification.topScore,
        labels: classification.labels,
        scores: classification.scores,
        source: 'hf_zero_shot',
      };
    }
  } catch (err) {
    console.warn('[HF Router] Classification pipeline error, using pattern fallback:', err.message);
  }

  // Graceful fallback to fast pattern router
  return fastPatternRouter(userMessage);
}

/**
 * Run HF Router in Shadow Mode (non-blocking, purely observational)
 * @param {string} userMessage The incoming user prompt
 * @param {string} actualGeminiDecision The decision made by Gemini / live system
 */
function predictRouteShadow(userMessage, actualGeminiDecision = null) {
  setImmediate(async () => {
    try {
      const prediction = await predictRoute(userMessage);
      shadowStats.totalRuns++;
      if (shadowStats.routeDistribution[prediction.route] !== undefined) {
        shadowStats.routeDistribution[prediction.route]++;
      }

      let matched = null;
      if (actualGeminiDecision) {
        matched = prediction.route.toLowerCase() === String(actualGeminiDecision).toLowerCase();
        if (matched) shadowStats.matches++;
        else shadowStats.mismatches++;
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        prompt: userMessage.slice(0, 100),
        predictedRoute: prediction.route,
        score: Number((prediction.score * 100).toFixed(1)),
        source: prediction.source,
        actualGeminiDecision: actualGeminiDecision || 'Gemini Live Flow',
        matched,
      };

      shadowStats.recentLogs.unshift(logEntry);
      if (shadowStats.recentLogs.length > MAX_RECENT_LOGS) {
        shadowStats.recentLogs.pop();
      }

      console.log(
        `[HF Router (Shadow Mode)] Predicted: "${prediction.route}" (${(prediction.score * 100).toFixed(1)}%) | Source: ${prediction.source} | Live Flow: "${actualGeminiDecision || 'Gemini Active'}" | Message: "${userMessage.slice(0, 60)}..."`
      );
    } catch (err) {
      console.warn('[HF Router (Shadow Mode)] Error during shadow observation:', err.message);
    }
  });
}

function getShadowStats() {
  const matchRate = shadowStats.totalRuns > 0 && (shadowStats.matches + shadowStats.mismatches) > 0
    ? ((shadowStats.matches / (shadowStats.matches + shadowStats.mismatches)) * 100).toFixed(1) + '%'
    : 'Pending validation baseline';

  return {
    ...shadowStats,
    matchRate,
  };
}

module.exports = {
  predictRoute,
  predictRouteShadow,
  getShadowStats,
  ROUTE_LABELS,
};
