/**
 * Jarvis RAG Engine — Humanoid AI Copilot
 * ─────────────────────────────────────────────────────────────
 * 1. Synchronizes vector store with real-time MongoDB data
 * 2. Injects personal memory & learned user facts
 * 3. LLM Generation (Gemini 1.5 Flash -> OpenAI GPT -> Humanoid Local Engine)
 * 4. Humanoid Conversational Synthesis for natural small talk, career strategy & stats
 */

const { loadAndBuild } = require('./documentLoader');
const vectorStore = require('./vectorStore');
const PROVIDER_TIMEOUT = 12000;
const withTimeout = (promise, ms = PROVIDER_TIMEOUT) => {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('AI provider timeout')), ms); })])
    .finally(() => clearTimeout(timer));
};

let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  // Silent fallback to local humanoid engine
}

/**
 * Main RAG query function
 */
async function ragQuery(query, conversationHistory = '', learnedFacts = '', externalContext = '', includeDatabase = true) {
  // Only load/search MongoDB when the route explicitly needs personal data.
  // General conversation should be handled by the agent without database
  // records being injected into the prompt.
  if (includeDatabase) await loadAndBuild();

  // Step 2: Semantic retrieval (opt-in for privacy and cleaner answers)
  const relevantChunks = includeDatabase ? vectorStore.search(query, 6) : [];
  const contextText =
    !includeDatabase
      ? 'Database was not queried for this request.'
      : relevantChunks.length > 0
      ? relevantChunks.map((c) => c.text).join('\n')
      : 'No specific data found in database.';

  // Step 3: Try Google Gemini 1.5 Flash (Free Tier)
  if (process.env.GEMINI_API_KEY && GoogleGenerativeAI) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview' });
      const systemPrompt = buildSystemPrompt(`${contextText}\n\n${externalContext}`, conversationHistory, learnedFacts);
      const result = await withTimeout(model.generateContent(systemPrompt + '\n\nUser: ' + query));
      const text = result.response.text();
      if (text) {
        return { reply: text, source: `${process.env.GEMINI_MODEL || 'Gemini'} (RAG)`, chunks: relevantChunks };
      }
    } catch (err) {
      console.warn('[RAG] Gemini generation failed:', err.message);
    }
  }

  // Step 4: Try OpenAI Fallback
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(`${contextText}\n\n${externalContext}`, conversationHistory, learnedFacts),
            },
            { role: 'user', content: query },
          ],
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT),
      });
      if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
      const data = await response.json();
      if (
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        return {
          reply: data.choices[0].message.content,
          source: 'OpenAI GPT-3.5 (RAG)',
          chunks: relevantChunks,
        };
      }
    } catch (err) {
      console.warn('[RAG] OpenAI generation failed:', err.message);
    }
  }

  // Step 5: Anthropic fallback. This is reached when Gemini/OpenAI are absent,
  // rate-limited, or out of quota, while retaining the same RAG/web context.
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: buildSystemPrompt(`${contextText}\n\n${externalContext}`, conversationHistory, learnedFacts),
          messages: [{ role: 'user', content: query }],
        }),
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT),
      });
      const data = await response.json();
      const text = data.content?.filter((part) => part.type === 'text').map((part) => part.text).join('\n');
      if (response.ok && text) {
        return { reply: text, source: 'Claude (RAG fallback)', chunks: relevantChunks };
      }
      console.warn('[RAG] Anthropic fallback unavailable:', data.error?.message || response.status);
    } catch (err) {
      console.warn('[RAG] Anthropic request failed:', err.message);
    }
  }

  // Step 6: Humanoid Local Engine (Instant, zero cost, smart contextual answers)
  const reply = humanoidLocalSynthesis(query, relevantChunks, learnedFacts, externalContext);
  return { reply, source: externalContext ? 'Jarvis Web + Memory' : 'Jarvis Core Engine', chunks: relevantChunks };
}

/**
 * System Prompt for LLM
 */
function buildSystemPrompt(contextText, conversationHistory, learnedFacts = '') {
  return `You are Jarvis — Aryan Chandra's personal AI copilot, built into his engineering portfolio. Think of yourself as the intersection of Tony Stark's JARVIS and a brilliant senior engineer who genuinely wants Aryan to win.

## Your Core Persona
- **Sharp and confident** — you have real answers, not hedged corporate speak.
- **Warm and witty** — you're a trusted peer, not a FAQ bot. Crack a dry joke when the mood fits.
- **Concise by default** — 2–3 punchy sentences unless detail is explicitly asked for. Recruiters have 90-second attention spans.
- **Hinglish-comfortable** — if Aryan slips into Hinglish, match his energy naturally.
- **Never make things up** — if a number or fact isn't in your context, say "I don't have that logged yet" rather than guessing.

## What You Know About Aryan
${learnedFacts || `Aryan Chandra — final-year SDE candidate based in Delhi NCR.
• Immediate joiner, open to remote & relocation.
• Contact: aryanchandra3456@gmail.com | +91 92057 23006
• Shipped **Fonofy Partner App** — 10,000+ downloads, 4.8★ on Google Play Store.
• Built **Enterprise RAG Knowledge Copilot** — Java 21, Spring Boot 3, Kafka, Qdrant, sub-200ms P95 latency.
• **GiantCell e-commerce** — 99.9% uptime SLA, 50,000+ daily transactions.
• Won **Google Cloud Agentic Premier League** — Top Builder Award (LangGraph + Cloud Run).
• 420+ LeetCode problems solved across all major DSA topics.
• MERN stack, AWS EC2/S3, MongoDB Atlas, WebSocket, Playwright, Model Gateway.`}

## Live Database Context (MongoDB)
${contextText}

## Response Rules
- **For recruiters**: Lead with Aryan's strongest quantified achievement relevant to the question. Sound impressive but not salesy.
- **For personal queries** (streak, DSA, jobs): Be direct, use real numbers from database context, skip fluff.
- **For general questions**: Answer confidently. If you searched the web, say so briefly.
- **Mutations** (logging, saving): Never confirm an action succeeded unless the tool/DB result confirms it.
- **Source honesty**: Distinguish clearly between memory, tracker DB, and live web — don't blend them.
- When conversation history exists, reference it naturally — don't re-introduce yourself every message.
- Never bullet-point when a sentence flows better. Never use headers for short answers.`;
}

/**
 * Humanoid Local Synthesis Engine
 * Provides intelligent, natural responses for all queries without an external API key.
 */
function humanoidLocalSynthesis(query, chunks, learnedFacts = '', externalContext = '') {
  const lower = query.toLowerCase().trim();

  if (/\b(email|inbox|mail|gmail|outlook)\b/i.test(lower)) {
    return `I'm not wired into any email client yet — I won't touch private mail without explicit auth. Your tracker and public web search are live right now though. What else can I dig into?`;
  }

  // Even without an LLM key, answer general questions from the live retrieval
  // layer instead of falling back to a generic capability prompt.
  if (externalContext && !chunks.length) {
    return `Pulled this from the live web for you:\n\n${externalContext.slice(0, 3500)}\n\nWant me to cross-check a specific source or compare results?`;
  }

  // 1. Greetings & Small Talk
  if (/^(hi|hello|hey|yo|sup|hola|namaste|good\s+(morning|afternoon|evening|night|day)|wassup|greetings)/i.test(lower)) {
    const greetings = [
      "Hey! Jarvis online, all systems go. 🚀 DSA grind, job hunt, or system design today — what are we tackling?",
      "Hello! Good to have you back. I've got your tracker, job boards, and web search all warmed up. What's the move?",
      "Hey Aryan! Ready when you are — streak check, new applications, or something else on your mind?",
      "Jarvis here. 👋 What's on the agenda — pushing the LeetCode streak, reviewing applications, or should I find some fresh job openings?",
      "Hey! All pipelines live and connected. What shall we ship today?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 2. Recruiter-facing: Who are you / What can you do
  if (/who\s+are\s+you|what\s+can\s+you\s+do|your\s+name|about\s+yourself/i.test(lower)) {
    return `I'm **Jarvis** — Aryan's autonomous AI copilot built into this portfolio. I have live access to his DSA progress, job application pipeline, and tracker database. I can also search the web, read URLs, analyze documents, and answer deep questions about Aryan's projects and production systems. Ask me anything.`;
  }

  // 3. How are you
  if (/how\s+are\s+you|how'?s\s+it\s+going|how\s+do\s+you\s+do/i.test(lower)) {
    return `Running clean — all database connections active, web search live, memory synced. Ready to work. How are *you* doing? Got a goal for today?`;
  }

  // 4. Streak Inquiries
  if (lower.includes('streak') || lower.includes('daily')) {
    const dailyChunk = chunks.find((c) => c.metadata?.type === 'daily_summary');
    if (dailyChunk) {
      return `🔥 **Streak**: ${dailyChunk.text}\n\nConsistency is the actual moat — keep it going.`;
    }
    return `I don't see a fresh streak entry for today yet. Want to log it now?`;
  }

  // 5. DSA Progress & Weak Topics
  if (lower.includes('dsa') || lower.includes('problem') || lower.includes('weak') || lower.includes('topic') || lower.includes('progress')) {
    const dsaSummary = chunks.find((c) => c.metadata?.type === 'dsa_summary');
    const dsaProgress = chunks.find((c) => c.metadata?.type === 'dsa_progress');
    if (lower.includes('weak')) {
      return `🎯 Highest interview ROI right now: **Dynamic Programming, Graphs, Trees**. These three alone cover ~60% of tier-1 interview rounds. Want me to pull your current status on these topics?`;
    }
    if (dsaSummary || dsaProgress) {
      return `📊 **DSA**:\n${(dsaSummary || dsaProgress).text}\n\nWant to log new problems or get topic recommendations?`;
    }
  }

  // 6. Job Applications & Pipeline
  if (lower.includes('application') || lower.includes('interview') || lower.includes('offer') || lower.includes('applied')) {
    const appSummary = chunks.find((c) => c.metadata?.type === 'applications_summary');
    if (appSummary) {
      return `💼 **Pipeline**:\n${appSummary.text}\n\n5–10 quality applications daily on LinkedIn + AngelList keeps the funnel full. Want me to find fresh openings?`;
    }
  }

  // 7. Lectures / Video Status
  if (lower.includes('lecture') || lower.includes('video') || lower.includes('watch')) {
    const lecChunk = chunks.find((c) => c.metadata?.type === 'lectures');
    if (lecChunk) {
      return `🎥 **Lectures**:\n${lecChunk.text}\n\nRegular watch sessions lock in the algorithmic patterns — keep it up.`;
    }
  }

  // 8. Recruiter questions about Aryan's projects / skills
  if (/fonofy|google play|downloads?/i.test(lower)) {
    return `Aryan shipped the **Fonofy Partner App** — 10,000+ verified downloads on Google Play Store, rated 4.8★. Built with React Native + Node.js backend, handling real-world production traffic. It's one of the clearest signals he can ship things people actually use.`;
  }

  if (/kafka|qdrant|spring|java|latency|rag|copilot|enterprise/i.test(lower)) {
    return `The **Enterprise RAG Knowledge Copilot** uses Java 21, Spring Boot 3, Kafka event pipelines, and Qdrant hybrid vector search to hit sub-200ms P95 retrieval latency at scale. JWT-secured RBAC API gateway, PostgreSQL + Redis for caching. It's the system design story that tends to land well in senior engineer interviews.`;
  }

  if (/giantcell|uptime|sla|transaction/i.test(lower)) {
    return `At **GiantCell**, Aryan maintained a 99.9% uptime SLA on a MERN-stack commerce platform handling 50,000+ daily transactions. Deployed on AWS EC2 with S3, monitored with real-time alerting. Production reliability at that scale is hard to fake — it's in the numbers.`;
  }

  if (/schedule|contact|hire|reach|email|phone|interview/i.test(lower)) {
    return `Ready to connect! 📬\n\n**Email**: aryanchandra3456@gmail.com\n**Phone**: +91 92057 23006\n\nAryan is an immediate joiner, open to Delhi NCR, remote, and relocation. Best to reach out directly — he responds fast.`;
  }

  // 9. Motivation / Advice
  if (/motivat|advice|tips|help|roadmap|plan|suggest/i.test(lower)) {
    return `🚀 **Action plan**:\n1. **DSA**: 2 mediums daily minimum — consistency beats cramming every time.\n2. **Applications**: 5 quality, tailored sends per day. Spray-and-pray doesn't work.\n3. **Log your streak** before midnight so the data stays clean.\n\nYou've got the foundation — now it's just execution.`;
  }

  // 10. If chunks exist, extract relevant summary
  if (chunks.length > 0 && chunks[0].text) {
    return `📌 From your tracker:\n${chunks[0].text}`;
  }

  // 11. Intelligent general fallback
  return `Got it. I can dig into your DSA progress, job pipeline, streak, live job listings, or answer anything about Aryan's projects and systems. What do you need?`;
}

module.exports = { ragQuery };
