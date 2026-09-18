/**
 * Tool Registry — Modular Tool Execution & Auditing Engine for Jarvis AI
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides dynamic registration, schema generation, execution wrapping with
 * timeouts, permission controls (mutating vs read-only), and execution logging.
 */

class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.executionLog = [];
    this.maxLogs = 100;
  }

  /**
   * Register a new tool
   * @param {Object} toolDef - { name, description, parameters, category, handler, isMutating, timeoutMs }
   */
  register(toolDef) {
    if (!toolDef.name || !toolDef.handler) {
      throw new Error(`Tool registration failed: 'name' and 'handler' are required.`);
    }

    const tool = {
      name: toolDef.name,
      description: toolDef.description || '',
      parameters: toolDef.parameters || { type: 'object', properties: {} },
      category: toolDef.category || 'general',
      handler: toolDef.handler,
      isMutating: Boolean(toolDef.isMutating),
      timeoutMs: toolDef.timeoutMs || 10000,
      enabled: true,
      registeredAt: new Date(),
    };

    this.tools.set(tool.name, tool);
    console.log(`[ToolRegistry] Registered tool: "${tool.name}" [${tool.category}] (mutating: ${tool.isMutating})`);
    return tool;
  }

  /**
   * Unregister tool
   */
  unregister(name) {
    return this.tools.delete(name);
  }

  /**
   * Check if tool exists
   */
  has(name) {
    return this.tools.has(name) && this.tools.get(name).enabled;
  }

  /**
   * Get tool definition
   */
  get(name) {
    return this.tools.get(name);
  }

  /**
   * List all registered tools
   */
  listTools(category = null) {
    const list = Array.from(this.tools.values()).filter(t => t.enabled);
    if (category) {
      return list.filter(t => t.category === category);
    }
    return list;
  }

  /**
   * Get Gemini Function Declarations Array
   */
  getGeminiDeclarations() {
    return Array.from(this.tools.values())
      .filter(t => t.enabled)
      .map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      }));
  }

  /**
   * Get OpenAI Function Declarations Array
   */
  getOpenAIDeclarations() {
    return Array.from(this.tools.values())
      .filter(t => t.enabled)
      .map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
  }

  /**
   * Execute a tool with timeout, logging, and error recovery
   */
  async execute(name, args = {}, context = {}) {
    if (!this.has(name)) {
      throw new Error(`Tool "${name}" is not registered or disabled.`);
    }

    const tool = this.get(name);
    const startTime = Date.now();
    const logEntry = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      toolName: name,
      category: tool.category,
      isMutating: tool.isMutating,
      args,
      status: 'PENDING',
      durationMs: 0,
      timestamp: new Date(),
    };

    try {
      // Timeout wrapper
      let timer;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Tool "${name}" timed out after ${tool.timeoutMs}ms`)), tool.timeoutMs);
      });

      const handlerPromise = tool.handler(args, context);
      const result = await Promise.race([handlerPromise, timeoutPromise]).finally(() => clearTimeout(timer));

      logEntry.status = 'SUCCESS';
      logEntry.result = typeof result === 'object' ? JSON.stringify(result).slice(0, 300) : String(result).slice(0, 300);
      logEntry.durationMs = Date.now() - startTime;
      this._addLog(logEntry);

      return {
        ok: true,
        tool: name,
        result,
        durationMs: logEntry.durationMs,
      };

    } catch (err) {
      logEntry.status = 'ERROR';
      logEntry.error = err.message;
      logEntry.durationMs = Date.now() - startTime;
      this._addLog(logEntry);

      console.error(`[ToolRegistry] Error executing tool "${name}":`, err.message);
      return {
        ok: false,
        tool: name,
        error: err.message,
        durationMs: logEntry.durationMs,
      };
    }
  }

  _addLog(entry) {
    this.executionLog.unshift(entry);
    if (this.executionLog.length > this.maxLogs) {
      this.executionLog.pop();
    }
  }

  /**
   * Get recent tool execution audit log
   */
  getExecutionLogs(limit = 20) {
    return this.executionLog.slice(0, limit);
  }
}

// Singleton export
const toolRegistry = new ToolRegistry();
module.exports = toolRegistry;
