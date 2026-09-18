/**
 * Model Gateway — Multi-Model Provider Routing & Gateway Engine for Jarvis AI
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamically routes reasoning, coding, vision, and chat prompts across:
 *   1. Google Gemini (via @google/generative-ai SDK)
 *   2. Anthropic Claude (via native Messages REST API)
 *   3. OpenAI GPT (via native Chat Completions REST API)
 * Seamless fallback chain: if provider A encounters rate limit or error,
 * automatically falls back to provider B, then C.
 */

let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {}

// Simple fetch wrapper using node-fetch or global fetch
const doFetch = async (url, options) => {
  if (typeof fetch === 'function') {
    return fetch(url, options);
  }
  const nodeFetch = require('node-fetch');
  return nodeFetch(url, options);
};

class ModelGateway {
  constructor() {
    this.activeModelOverride = null;
  }

  getProviderStatus() {
    return {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
    };
  }

  /**
   * Determine primary provider & model name for requested task
   */
  resolveModel(taskType = 'chat') {
    if (this.activeModelOverride) {
      return this.activeModelOverride;
    }

    // Default primary provider is Gemini if key exists
    if (process.env.GEMINI_API_KEY) {
      return {
        provider: 'gemini',
        modelName: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
      };
    }

    // Fallback to Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
      return {
        provider: 'anthropic',
        modelName: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      };
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      return {
        provider: 'openai',
        modelName: taskType === 'coding' ? 'gpt-4o' : 'gpt-4o-mini',
      };
    }

    return { provider: 'fallback', modelName: 'local-humanoid' };
  }

  setModelOverride(provider, modelName) {
    if (!provider || provider === 'auto') {
      this.activeModelOverride = null;
      console.log('[ModelGateway] Reset to auto model routing');
    } else {
      this.activeModelOverride = { provider, modelName: modelName || 'default' };
      console.log(`[ModelGateway] Override active model to ${provider}:${modelName}`);
    }
    return this.getStatus();
  }

  getStatus() {
    return {
      activeOverride: this.activeModelOverride,
      defaultModel: this.resolveModel('chat'),
      providers: {
        gemini: { available: Boolean(process.env.GEMINI_API_KEY), model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview' },
        anthropic: { available: Boolean(process.env.ANTHROPIC_API_KEY), model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6' },
        openai: { available: Boolean(process.env.OPENAI_API_KEY), model: 'gpt-4o' },
      },
    };
  }

  /**
   * Call Gemini Generative AI SDK
   */
  async callGemini({ prompt, systemPrompt, tools = [], history = [], modelName }) {
    if (!process.env.GEMINI_API_KEY || !GoogleGenerativeAI) {
      throw new Error('Gemini API key or SDK missing');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: modelName || process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
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
      model: modelName || process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
      text,
      functionCalls,
      rawResponse: candidate,
    };
  }

  /**
   * Call Anthropic Claude Messages API
   */
  async callAnthropic({ prompt, systemPrompt, history = [], modelName }) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key missing');
    }

    const messages = [];
    for (const h of history) {
      const role = h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user';
      const text = h.parts?.map((p) => p.text).join(' ') || h.text || '';
      if (text) messages.push({ role, content: text });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: modelName || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
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
      throw new Error(`Anthropic API error (${res.status}): ${errBody}`);
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
  async callOpenAI({ prompt, systemPrompt, history = [], modelName }) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key missing');
    }

    const messages = [
      { role: 'system', content: systemPrompt || 'You are Jarvis, an autonomous AI copilot.' },
    ];
    for (const h of history) {
      const role = h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user';
      const text = h.parts?.map((p) => p.text).join(' ') || h.text || '';
      if (text) messages.push({ role, content: text });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: modelName || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
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
      throw new Error(`OpenAI API error (${res.status}): ${errBody}`);
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
   * Orchestrates completion with fallback chain
   */
  async generateCompletion({ prompt, systemPrompt, tools = [], history = [], taskType = 'chat' }) {
    const primary = this.resolveModel(taskType);
    const providersToTry = [primary.provider];

    // Build fallback queue
    if (primary.provider !== 'gemini' && process.env.GEMINI_API_KEY) providersToTry.push('gemini');
    if (primary.provider !== 'anthropic' && process.env.ANTHROPIC_API_KEY) providersToTry.push('anthropic');
    if (primary.provider !== 'openai' && process.env.OPENAI_API_KEY) providersToTry.push('openai');

    let lastError = null;

    for (const prov of providersToTry) {
      try {
        if (prov === 'gemini') {
          return await this.callGemini({ prompt, systemPrompt, tools, history, modelName: primary.modelName });
        }
        if (prov === 'anthropic') {
          return await this.callAnthropic({ prompt, systemPrompt, history, modelName: primary.modelName });
        }
        if (prov === 'openai') {
          return await this.callOpenAI({ prompt, systemPrompt, history, modelName: primary.modelName });
        }
      } catch (err) {
        console.warn(`[ModelGateway] Provider '${prov}' failed: ${err.message}. Trying next fallback...`);
        lastError = err;
      }
    }

    return {
      provider: 'fallback',
      model: 'local-humanoid',
      text: null,
      functionCalls: [],
      error: lastError?.message || 'All providers failed or no active LLM API keys.',
    };
  }
}

const modelGateway = new ModelGateway();
module.exports = modelGateway;
