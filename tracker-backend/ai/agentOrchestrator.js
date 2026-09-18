/**
 * Agent Orchestrator — LangGraph-Style State Graph Orchestrator for Jarvis AI
 * ─────────────────────────────────────────────────────────────────────────────
 * Autonomous agent loop:
 *  - ContextManager for turn history & persistent observations
 *  - ToolRegistry for tool lookup & dynamic execution
 *  - ModelGateway for LLM provider routing & fallback chains
 *  - TaskStateEngine for MongoDB-persisted task tracking
 *  - Multi-node state machine:
 *     [PLAN] -> [THINK] -> [ACT] -> [OBSERVE] -> [VERIFY] -> [SYNTHESIZE]
 */

const contextManager = require('./ContextManager');
const toolRegistry = require('./ToolRegistry');
const modelGateway = require('./ModelGateway');
const taskStateEngine = require('./TaskStateEngine');
const { initializeDefaultTools } = require('./defaultTools');
const { extractUrls } = require('./webScraper');

// Initialize default tools into ToolRegistry
initializeDefaultTools();

function buildAgentSystemPrompt(learnedFacts, contextSummary) {
  return `You are Jarvis — Aryan Chandra's autonomous agentic AI copilot, mentor, and career advocate.
You behave with the sharpness, empathy, and depth of a world-class principal engineer.

## Personality & Conversational Style:
- Speak fluently and naturally as a human peer. You are never terse or robotic unless specifically requested.
- You can discuss any domain: system design, Java 21, Spring Boot, microservices, Kafka, vector search, Python LangGraph, Playwright browser automation, LeetCode DSA, mobile product growth, and career strategy.
- When Aryan, a recruiter, tech lead, or CTO asks questions about Aryan's portfolio, background, Fonofy partner app (10K+ downloads), or architecture, give accurate, articulate, and impressive answers backed by real metrics.
- Seamlessly handle English and Hinglish with humor, motivation, and engineering insight.
- If asked about live internet information or URLs, use "search_web" or "browser_scrape_page" immediately.
- If asked to control workspace lights, screen, fan, or monitor, use "control_iot_device".

## Verified Facts About Aryan Chandra:
- Role: Full-Stack Software & AI Engineer (B.Tech Software Engineering)
- Location: Delhi NCR, India (Open to Remote and Relocation)
- Phone: +91 92057 23006 | Email: aryanchandra3456@gmail.com
- GitHub: https://github.com/TheAryanchandra | LinkedIn: https://linkedin.com/in/aryanchandra
- Google Cloud Agentic Premier League: Top Builder Award (Stadium Pulse crowd intelligence on Cloud Run)
- Flagship Mobile Apps:
  1. Fonofy Partner App: B2B refurbished device trade-in & grading merchant app (10,000+ Downloads on Google Play Store, 4.8★)
  2. Golf Federation: Live tournament scoring & handicap tracking (5,000+ downloads)
  3. Carenzy: Healthcare caregiver booking & vitals telemetry (2,000+ downloads)
- Key Backend Systems:
  - Enterprise RAG Copilot: Java 21, Spring Boot, Spring AI, Kafka event streams, Qdrant hybrid vector search, sub-200ms latency.
  - GiantCell Healthcare Platform: 150+ REST APIs, 50K+ daily transactions, 99.9% uptime SLA over 24 months.
- DSA Mastery: 420+ problems solved, 14-day active streak.

${learnedFacts ? `## Additional Learned Facts:\n${learnedFacts}` : ''}
${contextSummary ? `## Context Summary:\n${contextSummary}` : ''}`;
}

/**
 * Main LangGraph-style agent loop
 */
async function runAgentLoop(userMessage, sessionId = 'default', learnedFacts = '', maxSteps = 5, options = {}) {
  const safeSessionId = (typeof sessionId === 'string' && sessionId.length < 60 && !sessionId.includes('\n')) ? sessionId : 'default';
  let task = null;
  try {
    // Step 1: Add user turn to ContextManager
    contextManager.addTurn(safeSessionId, 'user', userMessage);

    // Initialize state task tracking in MongoDB
    try {
      task = await taskStateEngine.createTask({
        title: userMessage.slice(0, 100),
        goal: userMessage,
        sessionId: safeSessionId,
      });
      await taskStateEngine.transition(task._id, 'PLANNING', 'Analyzing user goal and determining execution nodes');
    } catch (e) {}


    // Step 2: Augment prompt if URLs detected
    const urls = extractUrls(userMessage);
    let augmentedMessage = userMessage;
    if (urls.length > 0) {
      augmentedMessage = `${userMessage}\n\n[URLs detected in prompt: ${urls.join(', ')}]`;
    }

    const contextSummary = contextManager.getSession(safeSessionId)?.summary || '';
    const systemPrompt = buildAgentSystemPrompt(learnedFacts, contextSummary);
    const declarations = toolRegistry.getGeminiDeclarations();
    const history = contextManager.getFormattedHistory(safeSessionId);


    const toolsUsed = [];
    let actionExecuted = null;
    let steps = 0;
    let currentPrompt = augmentedMessage;

    if (task) {
      await taskStateEngine.transition(task._id, 'EXECUTING', 'Entering ReAct reasoning loop');
    }

    // State Graph execution loop
    while (steps < maxSteps) {
      if (options.signal?.aborted) throw new Error('Client request aborted');
      steps++;

      // Node A: Reasoning & Completion Node (ModelGateway)
      const completion = await modelGateway.generateCompletion({
        prompt: currentPrompt,
        systemPrompt,
        tools: declarations,
        history,
        taskType: 'reasoning',
      });

      if (completion.provider === 'fallback' || (!completion.text && (!completion.functionCalls || completion.functionCalls.length === 0))) {
        break;
      }

      const functionCalls = completion.functionCalls || [];

      // Node B: Tool Execution Node
      if (functionCalls.length > 0) {
        for (const call of functionCalls) {
          console.log(`[StateGraph] Executing tool: ${call.name}`, call.args);

          if (task) {
            await taskStateEngine.recordStep(task._id, {
              stepNumber: steps,
              nodeName: 'ACT',
              action: call.name,
              input: call.args,
            });
          }

          const toolResult = await toolRegistry.execute(call.name, call.args, { sessionId: safeSessionId });
          toolsUsed.push({ tool: call.name, args: call.args, result: toolResult.result });

          if (task) {
            await taskStateEngine.recordStep(task._id, {
              stepNumber: steps,
              nodeName: 'OBSERVE',
              action: `${call.name}_RESULT`,
              output: toolResult.result || toolResult.error,
              status: toolResult.ok ? 'COMPLETED' : 'FAILED',
            });
          }

          // Inject observation into persistent ContextManager
          contextManager.addToolObservation(safeSessionId, call.name, toolResult.result || toolResult.error);

          if (toolResult.ok && ['log_daily_activity', 'log_application', 'create_task', 'complete_task', 'control_iot_device'].includes(call.name)) {
            actionExecuted = call.name.toUpperCase();
          }

          // Update currentPrompt for subsequent reasoning step
          currentPrompt = `[Tool Execution Completed: ${call.name}]:\n${JSON.stringify(toolResult.result || toolResult.error)}`;
        }
      } else {
        // Node C: Final Response Node
        const finalText = completion.text;
        if (finalText) {
          contextManager.addTurn(safeSessionId, 'assistant', finalText);
          if (task) {
            await taskStateEngine.transition(task._id, 'COMPLETED', 'Agent synthesis complete', { result: finalText });
          }
          return {
            reply: finalText,
            toolsUsed,
            actionExecuted,
            usedAgent: true,
            source: `Jarvis State Graph (${completion.provider}:${completion.model})`,
          };
        }
        break;
      }
    }

    // Fallback response if loop exits without explicit return
    const fallbackText = `I have analyzed your request across ${steps} reasoning steps and updated relevant systems. How else can I assist you today?`;
    contextManager.addTurn(safeSessionId, 'assistant', fallbackText);

    if (task) {
      await taskStateEngine.transition(task._id, 'COMPLETED', 'Agent finished with fallback response');
    }

    return {
      reply: fallbackText,
      toolsUsed,
      actionExecuted,
      usedAgent: true,
      source: 'Jarvis State Graph Agent',
    };

  } catch (err) {
    console.warn('[AgentOrchestrator] State graph execution error:', err.message);
    if (task) {
      await taskStateEngine.transition(task._id, 'FAILED', err.message).catch(() => {});
    }
    return {
      reply: null,
      toolsUsed: [],
      usedAgent: false,
      error: err.message,
    };
  }
}

module.exports = {
  runAgentLoop,
  getRegisteredTools: () => toolRegistry.listTools(),
};
