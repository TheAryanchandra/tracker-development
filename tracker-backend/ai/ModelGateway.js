/**
 * Model Gateway — Cost-Aware Multi-Model Provider Routing & Gateway Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamically routes reasoning, coding, vision, and chat prompts across:
 *   1. Local Ollama (local-first, 100% free offline execution)
 *   2. Google Gemini (via @google/generative-ai SDK or REST)
 *   3. Anthropic Claude (via native Messages REST API)
 *   4. OpenAI GPT (via native Chat Completions REST API)
 *
 * Configurable Modes:
 *   - AUTO: Best available model based on task category & availability.
 *   - FREE_ONLY: Strictly zero-cost execution (Ollama or free tier). Never calls paid APIs.
 *   - LOCAL_ONLY: Only local Ollama instance. Fails cleanly if offline.
 *   - QUALITY: Prioritizes deep reasoning models (Claude / GPT-4o / Gemini Pro).
 *
 * Task Categories:
 *   - BASIC_CHAT, TECHNICAL_REASONING, CODING, RESEARCH, TOOL_EXECUTION
 */

let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {}

const doFetch = async (url, options = {}) => {
  if (typeof fetch === 'function') {
    return fetch(url, options);
  }
  const nodeFetch = require('node-fetch');
  return nodeFetch(url, options);
};

// Task Category Constants
const TASK_TYPES = {
  BASIC_CHAT: 'BASIC_CHAT',
  TECHNICAL_REASONING: 'TECHNICAL_REASONING',
  CODING: 'CODING',
  RESEARCH: 'RESEARCH',
  TOOL_EXECUTION: 'TOOL_EXECUTION',
};

// Routing Modes
const ROUTING_MODES = {
  AUTO: 'AUTO',
  FREE_ONLY: 'FREE_ONLY',
  LOCAL_ONLY: 'LOCAL_ONLY',
  QUALITY: 'QUALITY',
};

class ModelGateway {
  constructor() {
    this.activeModelOverride = null;
    this.mode = process.env.AI_ROUTING_MODE || ROUTING_MODES.AUTO;
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';
    this._ollamaReachable = null;
    this._ollamaLastCheck = 0;
  }

  setRoutingMode(mode) {
    if (ROUTING_MODES[mode]) {
      this.mode = mode;
      console.log(`[ModelGateway] Switched routing mode to ${mode}`);
    }
    return this.getStatus();
  }

  /**
   * Check if local Ollama is running (cached for 30s to avoid latency overhead)
   */
  async checkOllamaHealth() {
    const now = Date.now();
    if (this._ollamaReachable !== null && (now - this._ollamaLastCheck < 30000)) {
      return this._ollamaReachable;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await doFetch(`${this.ollamaBaseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      this._ollamaReachable = res.ok;
      this._ollamaLastCheck = now;
      return res.ok;
    } catch {
      this._ollamaReachable = false;
      this._ollamaLastCheck = now;
      return false;
    }
  }

  getProviderStatus() {
    return {
      ollama: Boolean(this._ollamaReachable),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      mode: this.mode,
    };
  }

  /**
   * Resolve primary provider & model based on Task Category and Routing Mode
   */
  async resolveModel(taskType = TASK_TYPES.BASIC_CHAT) {
    if (this.activeModelOverride) {
      return this.activeModelOverride;
    }

    const isOllamaUp = await this.checkOllamaHealth();

    // 1. LOCAL_ONLY Mode
    if (this.mode === ROUTING_MODES.LOCAL_ONLY) {
      if (isOllamaUp) {
        return { provider: 'ollama', modelName: this.ollamaModel, tier: 'local' };
      }
      return { provider: 'fallback', modelName: 'local-humanoid-rules', tier: 'offline' };
    }

    // 2. FREE_ONLY Mode: Ollama first, then Gemini free tier. Never call Anthropic/OpenAI
    if (this.mode === ROUTING_MODES.FREE_ONLY) {
      if (isOllamaUp) {
        return { provider: 'ollama', modelName: this.ollamaModel, tier: 'local' };
      }
      if (process.env.GEMINI_API_KEY) {
        return { provider: 'gemini', modelName: process.env.GEMINI_MODEL || 'gemini-2.0-flash', tier: 'free_tier' };
      }
      return { provider: 'fallback', modelName: 'local-humanoid-rules', tier: 'offline' };
    }

    // 3. QUALITY Mode: Prioritize top-tier models
    if (this.mode === ROUTING_MODES.QUALITY) {
      if (process.env.ANTHROPIC_API_KEY) {
        return { provider: 'anthropic', modelName: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022', tier: 'premium' };
      }
      if (process.env.OPENAI_API_KEY) {
        return { provider: 'openai', modelName: 'gpt-4o', tier: 'premium' };
      }
      if (process.env.GEMINI_API_KEY) {
        return { provider: 'gemini', modelName: process.env.GEMINI_MODEL || 'gemini-1.5-pro', tier: 'standard' };
      }
    }

    // 4. AUTO Mode (Cost-aware smart default):
    // For basic chat, use Ollama (if available) or Gemini Flash
    if (taskType === TASK_TYPES.BASIC_CHAT) {
      if (isOllamaUp) {
        return { provider: 'ollama', modelName: this.ollamaModel, tier: 'local' };
      }
      if (process.env.GEMINI_API_KEY) {
        return { provider: 'gemini', modelName: process.env.GEMINI_MODEL || 'gemini-2.0-flash', tier: 'free_tier' };
      }
    }

    // For Coding or Deep Reasoning, use Anthropic > OpenAI > Gemini
    if (taskType === TASK_TYPES.CODING || taskType === TASK_TYPES.TECHNICAL_REASONING) {
      if (process.env.ANTHROPIC_API_KEY) {
        return { provider: 'anthropic', modelName: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022', tier: 'premium' };
      }
      if (process.env.OPENAI_API_KEY) {
        return { provider: 'openai', modelName: 'gpt-4o', tier: 'premium' };
      }
      if (process.env.GEMINI_API_KEY) {
        return { provider: 'gemini', modelName: process.env.GEMINI_MODEL || 'gemini-2.0-flash', tier: 'standard' };
      }
    }

    // Default Fallback cascade
    if (process.env.GEMINI_API_KEY) {
      return { provider: 'gemini', modelName: process.env.GEMINI_MODEL || 'gemini-2.0-flash', tier: 'standard' };
    }
    if (process.env.OPENAI_API_KEY) {
      return { provider: 'openai', modelName: 'gpt-4o-mini', tier: 'standard' };
    }
    if (isOllamaUp) {
      return { provider: 'ollama', modelName: this.ollamaModel, tier: 'local' };
    }

    return { provider: 'fallback', modelName: 'local-humanoid-rules', tier: 'offline' };
  }

  setModelOverride(provider, modelName) {
    if (!provider || provider === 'auto') {
      this.activeModelOverride = null;
      console.log('[ModelGateway] Reset to auto model routing');
    } else {
      this.activeModelOverride = { provider, modelName: modelName || 'default', tier: 'override' };
      console.log(`[ModelGateway] Override active model to ${provider}:${modelName}`);
    }
    return this.getStatus();
  }

  getStatus() {
    return {
      activeOverride: this.activeModelOverride,
      mode: this.mode,
      providers: {
        ollama: { available: Boolean(this._ollamaReachable), endpoint: this.ollamaBaseUrl, model: this.ollamaModel },
        gemini: { available: Boolean(process.env.GEMINI_API_KEY), model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' },
        anthropic: { available: Boolean(process.env.ANTHROPIC_API_KEY), model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022' },
        openai: { available: Boolean(process.env.OPENAI_API_KEY), model: 'gpt-4o-mini' },
      },
    };
  }

  /**
   * Call Local Ollama (OpenAI-compatible /v1/chat/completions)
   */
  async callOllama({ prompt, systemPrompt, history = [], modelName, maxTokens = 2048 }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    for (const h of history) {
      const role = h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user';
      const text = h.parts?.map((p) => p.text).join(' ') || h.text || h.content || '';
      if (text) messages.push({ role, content: text });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const res = await doFetch(`${this.ollamaBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName || this.ollamaModel,
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Ollama error (${res.status}): ${errText.slice(0, 200)}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';

      return {
        provider: 'ollama',
        model: modelName || this.ollamaModel,
        text,
        functionCalls: [],
        rawResponse: data,
      };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  /**
   * Call Gemini Generative AI SDK
   */
  async callGemini({ prompt, systemPrompt, tools = [], history = [], modelName, maxTokens = 2048 }) {
    if (!process.env.GEMINI_API_KEY || !GoogleGenerativeAI) {
      throw new Error('Gemini API key or SDK missing');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxTokens,
      },
      tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
    });

    const formattedHistory = [
      { role: 'user', parts: [{ text: 'System instruction: act as Jarvis.' }] },
      { role: 'model', parts: [{ text: systemPrompt || 'You are Jarvis.' }] },
      ...history,
    ];

    const chat = model.startChat({ history: formattedHistory });
    const response = await chat.sendMessage(prompt);
    const candidate = response.response;

    const functionCalls = candidate.functionCalls?.() || [];
    const text = candidate.text?.() || '';

    return {
      provider: 'gemini',
      model: modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      text,
      functionCalls,
      rawResponse: candidate,
    };
  }

  /**
   * Call Anthropic Claude Messages API
   */
  async callAnthropic({ prompt, systemPrompt, history = [], modelName, maxTokens = 2048 }) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key missing');
    }

    const messages = [];
    for (const h of history) {
      const role = h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user';
      const text = h.parts?.map((p) => p.text).join(' ') || h.text || h.content || '';
      if (text) messages.push({ role, content: text });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: modelName || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      system: systemPrompt || 'You are Jarvis, an autonomous humanoid AI assistant.',
      messages,
    };

    const res = await doFetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${errBody.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = data.content?.filter((c) => c.type === 'text').map((c) => c.text).join('\n') || '';

    return {
      provider: 'anthropic',
      model: body.model,
      text,
      functionCalls: [],
      rawResponse: data,
    };
  }

  /**
   * Call OpenAI Chat Completions API
   */
  async callOpenAI({ prompt, systemPrompt, history = [], modelName, maxTokens = 2048 }) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key missing');
    }

    const messages = [
      { role: 'system', content: systemPrompt || 'You are Jarvis, an autonomous AI copilot.' },
    ];
    for (const h of history) {
      const role = h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user';
      const text = h.parts?.map((p) => p.text).join(' ') || h.text || h.content || '';
      if (text) messages.push({ role, content: text });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: modelName || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    };

    const res = await doFetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${errBody.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
      provider: 'openai',
      model: body.model,
      text,
      functionCalls: [],
      rawResponse: data,
    };
  }

  /**
   * Orchestrates completion with fallback chain, respecting FREE_ONLY & LOCAL_ONLY policies
   */
  async generateCompletion({ prompt, systemPrompt, tools = [], history = [], taskType = TASK_TYPES.BASIC_CHAT, maxTokens = 2048 }) {
    const startTime = Date.now();
    const primary = await this.resolveModel(taskType);
    const providersToTry = [primary.provider];

    // Build compliant fallback queue based on mode
    if (this.mode === ROUTING_MODES.LOCAL_ONLY) {
      // strictly Ollama only
    } else if (this.mode === ROUTING_MODES.FREE_ONLY) {
      if (primary.provider !== 'gemini' && process.env.GEMINI_API_KEY) providersToTry.push('gemini');
    } else {
      // AUTO or QUALITY
      if (primary.provider !== 'ollama' && this._ollamaReachable) providersToTry.push('ollama');
      if (primary.provider !== 'gemini' && process.env.GEMINI_API_KEY) providersToTry.push('gemini');
      if (primary.provider !== 'anthropic' && process.env.ANTHROPIC_API_KEY) providersToTry.push('anthropic');
      if (primary.provider !== 'openai' && process.env.OPENAI_API_KEY) providersToTry.push('openai');
    }

    let lastError = null;

    for (const prov of providersToTry) {
      try {
        let result = null;
        if (prov === 'ollama') {
          result = await this.callOllama({ prompt, systemPrompt, history, modelName: primary.modelName, maxTokens });
        } else if (prov === 'gemini') {
          result = await this.callGemini({ prompt, systemPrompt, tools, history, modelName: primary.modelName, maxTokens });
        } else if (prov === 'anthropic') {
          result = await this.callAnthropic({ prompt, systemPrompt, history, modelName: primary.modelName, maxTokens });
        } else if (prov === 'openai') {
          result = await this.callOpenAI({ prompt, systemPrompt, history, modelName: primary.modelName, maxTokens });
        }

        if (result && (result.text || (result.functionCalls && result.functionCalls.length > 0))) {
          const duration = Date.now() - startTime;
          console.log(`[ModelGateway Telemetry] Provider: ${prov} | Model: ${result.model} | Task: ${taskType} | Latency: ${duration}ms`);
          return result;
        }
      } catch (err) {
        console.warn(`[ModelGateway] Provider '${prov}' failed: ${err.message}. Trying next fallback...`);
        lastError = err;
      }
    }

    const duration = Date.now() - startTime;
    console.error(`[ModelGateway Telemetry] All configured providers failed after ${duration}ms. Reason: ${lastError?.message}`);

    return {
      provider: 'fallback',
      model: 'local-humanoid-rules',
      text: null,
      functionCalls: [],
      error: lastError?.message || 'All providers failed or no active LLM API keys.',
    };
  }
}

const modelGateway = new ModelGateway();
module.exports = modelGateway;
module.exports.TASK_TYPES = TASK_TYPES;
module.exports.ROUTING_MODES = ROUTING_MODES;
