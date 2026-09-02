/**
 * Action Executor
 * All database write operations — triggered by intent classifier.
 * Separated from RAG read pipeline for clean architecture.
 */

const DsaLecture = require('../models/DsaLecture');
const DailyTracker = require('../models/DailyTracker');
const DsaProgress = require('../models/DsaProgress');
const ApplicationTracker = require('../models/ApplicationTracker');
const vectorStore = require('./vectorStore');

const dateToday = () => new Date().toISOString().split('T')[0];

/**
 * LOG_DAILY — Upsert today's daily tracker entry
 */
async function logDailyUpdate(entities, rawPrompt) {
  const date = entities.date || dateToday();
  const dsaDone = !!(entities.dsaTopic || entities.problemCount ||
    /dsa|solved|leetcode|practice|problem/i.test(rawPrompt));
  const projectWork = /project|build|dev|coding|feature/i.test(rawPrompt);
  const aiLearning = /\bai\b|rag|ml|machine learning|deep learning|learning/i.test(rawPrompt);
  const appsCount = entities.appCount || (/applied/i.test(rawPrompt) && !entities.company ? 1 : 0);

  const update = {
    date,
    dsaDone,
    dsaTopic: entities.dsaTopic || (dsaDone ? 'DSA Practice' : ''),
    applicationsSent: appsCount,
    projectWork,
    project: projectWork ? 'Tracker Development' : '',
    aiLearning,
    notes: rawPrompt,
  };

  await DailyTracker.findOneAndUpdate(
    { date: { $regex: date } },
    update,
    { upsert: true, new: true }
  );

  // If specific company was mentioned, also log application
  let companyMsg = '';
  if (entities.company) {
    await logApplication(entities, rawPrompt);
    companyMsg = ` Also logged your application to **${entities.company}**. `;
  }

  // Invalidate vector store cache so next query reflects new data
  vectorStore.lastBuilt = null;

  return {
    reply: `✅ Got it, Aryan! Daily log for **${date}** saved.\n- DSA: **${dsaDone ? `Yes${entities.dsaTopic ? ` (${entities.dsaTopic})` : ''}` : 'No'}**\n- Applications Sent: **${appsCount}**\n- Project Work: **${projectWork ? 'Yes' : 'No'}**\n- AI Learning: **${aiLearning ? 'Yes' : 'No'}**${companyMsg}\n\nKeep pushing! 🚀`,
    actionExecuted: 'DAILY_LOG_UPSERT',
  };
}

/**
 * ADD_APPLICATION — Create a new job application entry
 */
async function logApplication(entities, rawPrompt) {
  const count = await ApplicationTracker.countDocuments();
  const company = entities.company || 'Unknown Company';
  const role = entities.role || 'Software Engineer';
  const platform = entities.platform || 'LinkedIn';

  const newApp = await ApplicationTracker.create({
    srNo: count + 1,
    dateApplied: entities.date || dateToday(),
    company,
    role,
    platform,
    status: 'Applied',
    notes: rawPrompt,
  });

  vectorStore.lastBuilt = null;

  return {
    reply: `💼 Application logged!\n- **Company**: ${company}\n- **Role**: ${role}\n- **Platform**: ${platform}\n- **Status**: Applied\n- **Date**: ${newApp.dateApplied}\n\nGood luck! Fingers crossed 🤞`,
    actionExecuted: 'APPLICATION_CREATED',
  };
}

/**
 * UPDATE_DSA — Update DSA progress for a topic
 */
async function updateDsaProgress(entities, rawPrompt) {
  if (!entities.dsaTopic) {
    return { reply: `Which DSA topic did you work on? (e.g. Arrays, Trees, DP)`, actionExecuted: null };
  }

  const topicRegex = new RegExp(entities.dsaTopic, 'i');
  const existing = await DsaProgress.findOne({ topic: topicRegex });

  if (!existing) {
    return { reply: `I couldn't find topic **"${entities.dsaTopic}"** in your DSA sheet. Check the topic name.`, actionExecuted: null };
  }

  const increment = entities.problemCount || 1;
  const newSolved = Math.min((existing.problemsSolved || 0) + increment, existing.totalProblems || 999);
  const pct = existing.totalProblems > 0 ? Math.round((newSolved / existing.totalProblems) * 100) : 0;

  await DsaProgress.findByIdAndUpdate(existing._id, {
    problemsSolved: newSolved,
    percentComplete: pct,
    status: pct >= 100 ? 'Completed' : pct >= 50 ? 'In Progress' : 'Started',
  });

  vectorStore.lastBuilt = null;

  return {
    reply: `🎯 DSA Progress updated!\n- **Topic**: ${existing.topic}\n- **Solved**: ${newSolved} / ${existing.totalProblems} (${pct}%)\n- **Status**: ${pct >= 100 ? '✅ Completed!' : pct >= 50 ? '🔥 In Progress' : '📝 Started'}\n\n${pct >= 80 ? 'You\'re crushing it! 🔥' : 'Keep grinding! 💪'}`,
    actionExecuted: 'DSA_PROGRESS_UPDATED',
  };
}

/**
 * UPDATE_LECTURE — Mark a lecture as completed
 */
async function updateLecture(entities, rawPrompt) {
  // Try to find by title match from rawPrompt
  const titleWords = rawPrompt.replace(/watched?|finished?|completed?|lecture|video|mark/gi, '').trim();
  const lectures = await DsaLecture.find({}).lean();

  // Find best matching lecture
  let bestMatch = null;
  let bestScore = 0;
  lectures.forEach(l => {
    const matches = titleWords.toLowerCase().split(' ').filter(w => w.length > 3 && l.title?.toLowerCase().includes(w)).length;
    if (matches > bestScore) { bestScore = matches; bestMatch = l; }
  });

  if (!bestMatch || bestScore === 0) {
    const pendingTitles = lectures.filter(l => l.status !== 'Completed').slice(0, 3).map(l => `"${l.title}"`).join(', ');
    return { reply: `I couldn't find that lecture. Pending lectures include: ${pendingTitles}. Try saying the exact title!`, actionExecuted: null };
  }

  await DsaLecture.findByIdAndUpdate(bestMatch._id, { status: 'Completed' });
  vectorStore.lastBuilt = null;

  return {
    reply: `🎥 Lecture marked complete!\n- **"${bestMatch.title}"** → ✅ Completed\n\nOne step closer to mastery! 🚀`,
    actionExecuted: 'LECTURE_UPDATED',
  };
}

module.exports = { logDailyUpdate, logApplication, updateDsaProgress, updateLecture };
