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

let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  // Silent fallback to local humanoid engine
}

/**
 * Main RAG query function
 */
async function ragQuery(query, conversationHistory = '', learnedFacts = '', externalContext = '') {
  // Step 1: Ensure vector store is fresh
  await loadAndBuild();

  // Step 2: Semantic retrieval
  const relevantChunks = vectorStore.search(query, 6);
  const contextText =
    relevantChunks.length > 0
      ? relevantChunks.map((c) => c.text).join('\n')
      : 'No specific data found in database.';

  // Step 3: Try Google Gemini 1.5 Flash (Free Tier)
  if (process.env.GEMINI_API_KEY && GoogleGenerativeAI) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const systemPrompt = buildSystemPrompt(`${contextText}\n\n${externalContext}`, conversationHistory, learnedFacts);
      const result = await model.generateContent(systemPrompt + '\n\nUser: ' + query);
      const text = result.response.text();
      if (text) {
        return { reply: text, source: 'Gemini 1.5 Flash (RAG)', chunks: relevantChunks };
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
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(`${contextText}\n\n${externalContext}`, conversationHistory, learnedFacts),
            },
            { role: 'user', content: query },
          ],
          temperature: 0.7,
        }),
      });
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

  // Step 5: Humanoid Local Engine (Instant, zero cost, smart contextual answers)
  const reply = humanoidLocalSynthesis(query, relevantChunks, learnedFacts, externalContext);
  return { reply, source: externalContext ? 'Jarvis Web + Memory' : 'Jarvis Core Engine', chunks: relevantChunks };
}

/**
 * System Prompt for LLM
 */
function buildSystemPrompt(contextText, conversationHistory, learnedFacts = '') {
  return `You are Jarvis — Aryan's ultra-smart, humanoid AI life and career copilot. You are sharp, witty, loyal, direct, and encouraging like Tony Stark's Jarvis, tailored specifically for a high-performing software engineering student.

## What I Know About Aryan (from conversations & memory):
${learnedFacts || 'Aryan Chandra — Software Engineering student working on DSA mastery and tech job search.'}

## Live Database Knowledge (from MongoDB):
${contextText}

## Conversation History:
${conversationHistory || 'Fresh session.'}

## Humanoid Personality Guidelines:
- Speak naturally like a brilliant peer and mentor, never like a dry FAQ robot.
- When greeted, respond warmly and ask what's on the agenda today (DSA, jobs, system design).
- Use live numbers from the database when asked about progress, streak, or stats.
- Keep responses concise (2 to 4 sentences) unless a detailed breakdown is explicitly requested.
- Support both English and Hinglish seamlessly.`;
}

/**
 * Humanoid Local Synthesis Engine
 * Provides intelligent, natural responses for all queries without an external API key.
 */
function humanoidLocalSynthesis(query, chunks, learnedFacts = '', externalContext = '') {
  const lower = query.toLowerCase().trim();

  // Even without an LLM key, answer general questions from the live retrieval
  // layer instead of falling back to a generic capability prompt.
  if (externalContext && !chunks.length) {
    return `I checked the live web for you. Here’s the useful signal I found:\n\n${externalContext.slice(0, 3500)}\n\nIf you want, I can compare these results or verify a specific source.`;
  }

  // 1. Greetings & Small Talk
  if (/^(hi|hello|hey|yo|sup|hola|namaste|good\s+(morning|afternoon|evening|night|day)|wassup|greetings)/i.test(lower)) {
    const greetings = [
      "Hey Aryan! 👋 Jarvis here, systems fully calibrated. What's on our agenda today — solving DSA problems, tracking job applications, or checking our streak?",
      "Hello Aryan! Great to see you. Ready to push forward on your software engineering roadmap today. What shall we tackle?",
      "Hey there! All database pipelines are live and synchronized. What would you like to review or log today?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 2. Identity & Capabilities
  if (/who\s+are\s+you|what\s+can\s+you\s+do|your\s+name|about\s+yourself/i.test(lower)) {
    return `I am **Jarvis** — your personalized AI copilot for software engineering growth. I have real-time access to your DSA progress across 18 topics, job pipeline, lecture logs, and live job boards (RemoteOK, Remotive, Arbeitnow). You can talk to me, log daily achievements, ask for career advice, or command me to search for jobs!`;
  }

  // 3. How are you / Mood
  if (/how\s+are\s+you|how'?s\s+it\s+going|how\s+do\s+you\s+do/i.test(lower)) {
    return `Running at peak performance! All database connections are active and monitoring your growth metrics. How are you feeling about today's goals?`;
  }

  // 4. Streak Inquiries
  if (lower.includes('streak') || lower.includes('daily')) {
    const dailyChunk = chunks.find((c) => c.metadata?.type === 'daily_summary');
    if (dailyChunk) {
      return `🔥 **Streak Status**: ${dailyChunk.text}\n\nKeep the momentum going — daily consistency is the fastest path to cracking tier-1 interviews!`;
    }
  }

  // 5. DSA Progress & Weak Topics
  if (lower.includes('dsa') || lower.includes('problem') || lower.includes('weak') || lower.includes('topic') || lower.includes('progress')) {
    const dsaSummary = chunks.find((c) => c.metadata?.type === 'dsa_summary');
    const dsaProgress = chunks.find((c) => c.metadata?.type === 'dsa_progress');
    if (lower.includes('weak')) {
      return `🎯 **Recommended Focus**: Dynamic Programming, Graphs, and Trees typically yield the highest interview ROI. Based on your tracker, prioritizing non-started topics will quickly elevate your readiness!`;
    }
    if (dsaSummary || dsaProgress) {
      return `📊 **DSA Overview**:\n${(dsaSummary || dsaProgress).text}\n\n💡 Would you like to log newly solved problems or get practice recommendations?`;
    }
  }

  // 6. Job Applications & Pipeline
  if (lower.includes('application') || lower.includes('interview') || lower.includes('offer') || lower.includes('applied')) {
    const appSummary = chunks.find((c) => c.metadata?.type === 'applications_summary');
    if (appSummary) {
      return `💼 **Application Funnel**:\n${appSummary.text}\n\n💡 Tip: Aim for 5-10 tailored applications daily on LinkedIn & AngelList to maintain a strong interview pipeline.`;
    }
  }

  // 7. DSA Lectures / Video Status
  if (lower.includes('lecture') || lower.includes('video') || lower.includes('watch')) {
    const lecChunk = chunks.find((c) => c.metadata?.type === 'lectures');
    if (lecChunk) {
      return `🎥 **Lecture Progress**:\n${lecChunk.text}\n\nKeep watching regularly to solidify core algorithmic patterns!`;
    }
  }

  // 8. Motivation & Advice
  if (/motivat|advice|tips|help|roadmap|plan|suggest/i.test(lower)) {
    return `🚀 **Jarvis Action Plan**:\n1. **DSA**: Solve at least 2 medium LeetCode problems daily.\n2. **Applications**: Send 5 quality applications with tailored resumes.\n3. **Consistency**: Log your daily streak before midnight.\n\nYou're on the right trajectory — let's execute today!`;
  }

  // 9. If chunks exist, extract relevant summary
  if (chunks.length > 0 && chunks[0].text) {
    return `📌 **Here is what I found in your database**:\n${chunks[0].text}`;
  }

  // 10. Intelligent general fallback
  return `I hear you, Aryan! I'm ready to assist. You can ask me about your DSA progress, job search pipeline, streak status, find tech openings, or log today's accomplishments. What would you like to do?`;
}

module.exports = { ragQuery };
