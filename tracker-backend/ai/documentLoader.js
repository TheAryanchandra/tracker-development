/**
 * MongoDB → Document Loader
 * Converts all MongoDB collections into text chunks for the vector store.
 * Auto-rebuilds every 5 minutes so the AI always knows your latest data.
 */

const DsaLecture = require('../models/DsaLecture');
const DailyTracker = require('../models/DailyTracker');
const DsaProgress = require('../models/DsaProgress');
const ApplicationTracker = require('../models/ApplicationTracker');
const JarvisDocument = require('../models/JarvisDocument');
const vectorStore = require('./vectorStore');

/**
 * Load all MongoDB data and rebuild the vector store if needed
 */
async function loadAndBuild() {
  if (!vectorStore.needsRebuild()) return;

  try {
    const [lectures, dailyLogs, dsaProgress, applications, savedDocuments] = await Promise.all([
      DsaLecture.find().maxTimeMS(2500).lean().catch(() => []),
      DailyTracker.find().sort({ date: -1 }).limit(60).maxTimeMS(2500).lean().catch(() => []),
      DsaProgress.find().maxTimeMS(2500).lean().catch(() => []),
      ApplicationTracker.find().sort({ dateApplied: -1 }).maxTimeMS(2500).lean().catch(() => []),
      JarvisDocument.find().sort({ uploadedAt: -1 }).limit(100).maxTimeMS(2500).lean().catch(() => []),
    ]);

  const chunks = [];

  // ── DSA Progress chunks ─────────────────────────────────────
  dsaProgress.forEach(p => {
    const pct = p.totalProblems > 0
      ? Math.round((p.problemsSolved / p.totalProblems) * 100)
      : 0;
    chunks.push({
      id: `dsa-progress-${p._id}`,
      text: `DSA topic ${p.topic}: ${p.problemsSolved} out of ${p.totalProblems} problems solved. Progress is ${pct}%. Status: ${p.status || 'in progress'}.`,
      metadata: { type: 'dsa_progress', topic: p.topic, pct },
    });
  });

  // Aggregate DSA summary chunk
  const totalProblems = dsaProgress.reduce((s, p) => s + (p.totalProblems || 0), 0);
  const solvedProblems = dsaProgress.reduce((s, p) => s + (p.problemsSolved || 0), 0);
  const overallPct = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
  const weakTopics = dsaProgress.filter(p => (p.problemsSolved || 0) === 0).map(p => p.topic).join(', ');
  const strongTopics = dsaProgress.filter(p => {
    const pct = p.totalProblems > 0 ? Math.round((p.problemsSolved / p.totalProblems) * 100) : 0;
    return pct >= 80;
  }).map(p => p.topic).join(', ');
  chunks.push({
    id: 'dsa-summary',
    text: `Overall DSA progress: ${solvedProblems} problems solved out of ${totalProblems} total (${overallPct}% complete). Weak topics with zero progress: ${weakTopics || 'none'}. Strong topics (80%+): ${strongTopics || 'none'}.`,
    metadata: { type: 'dsa_summary', totalProblems, solvedProblems, overallPct },
  });

  // ── Lectures chunks ─────────────────────────────────────────
  const completedLectures = lectures.filter(l => String(l.status).toLowerCase() === 'completed');
  const pendingLectures = lectures.filter(l => String(l.status).toLowerCase() !== 'completed');
  chunks.push({
    id: 'lectures-summary',
    text: `DSA lectures: ${completedLectures.length} completed, ${pendingLectures.length} pending out of ${lectures.length} total. Pending titles: ${pendingLectures.slice(0, 5).map(l => l.title).join(', ')}.`,
    metadata: { type: 'lectures', total: lectures.length, completed: completedLectures.length, pending: pendingLectures.length },
  });
  lectures.forEach(l => {
    chunks.push({
      id: `lecture-${l._id}`,
      text: `Lecture: "${l.title}" (${l.duration || 'N/A'} min) — Status: ${l.status || 'pending'}.`,
      metadata: { type: 'lecture', title: l.title, status: l.status },
    });
  });

  // ── Daily Tracker chunks ─────────────────────────────────────
  // Streak calculation
  let currentStreak = 0, maxStreak = 0, tempStreak = 0;
  const sortedLogs = [...dailyLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  sortedLogs.forEach(log => {
    if (log.dsaDone) { tempStreak++; if (tempStreak > maxStreak) maxStreak = tempStreak; }
    else tempStreak = 0;
  });
  currentStreak = tempStreak;

  const daysWithDsa = sortedLogs.filter(l => l.dsaDone).length;
  const totalAppsFromLogs = sortedLogs.reduce((s, l) => s + (l.applicationsSent || 0), 0);
  const recentLog = sortedLogs[sortedLogs.length - 1];
  chunks.push({
    id: 'daily-summary',
    text: `Daily tracker summary: ${sortedLogs.length} days logged. DSA done on ${daysWithDsa} days. Current DSA streak: ${currentStreak} days. Longest streak: ${maxStreak} days. Total applications sent via daily logs: ${totalAppsFromLogs}. Last logged: ${recentLog?.date || 'N/A'} — DSA: ${recentLog?.dsaDone ? 'Yes' : 'No'}, Topic: ${recentLog?.dsaTopic || 'N/A'}, Notes: ${recentLog?.notes || 'none'}.`,
    metadata: { type: 'daily_summary', currentStreak, maxStreak, daysWithDsa },
  });

  // Recent individual daily logs
  sortedLogs.slice(-10).forEach(log => {
    chunks.push({
      id: `daily-log-${log._id}`,
      text: `Daily log for ${log.date}: DSA done: ${log.dsaDone ? 'yes' : 'no'}, topic: ${log.dsaTopic || 'none'}, applications sent: ${log.applicationsSent || 0}, project work: ${log.projectWork ? 'yes' : 'no'}, AI learning: ${log.aiLearning ? 'yes' : 'no'}, notes: ${log.notes || 'none'}.`,
      metadata: { type: 'daily_log', date: log.date },
    });
  });

  // ── Applications chunks ─────────────────────────────────────
  const totalApps = applications.length;
  const interviews = applications.filter(a => String(a.status).toLowerCase().includes('interview')).length;
  const offers = applications.filter(a => String(a.status).toLowerCase().includes('offer')).length;
  const rejected = applications.filter(a => String(a.status).toLowerCase().includes('reject')).length;
  chunks.push({
    id: 'applications-summary',
    text: `Job applications summary: ${totalApps} total. ${interviews} interviews, ${offers} offers, ${rejected} rejections. Recent companies: ${applications.slice(-8).map(a => `${a.company} (${a.role}) - ${a.status}`).join('; ')}.`,
    metadata: { type: 'applications_summary', totalApps, interviews, offers, rejected },
  });

  applications.forEach(a => {
    chunks.push({
      id: `app-${a._id}`,
      text: `Job application: ${a.company} for ${a.role} role on ${a.dateApplied}. Platform: ${a.platform || 'LinkedIn'}. Status: ${a.status}. Notes: ${a.notes || 'none'}.`,
      metadata: { type: 'application', company: a.company, role: a.role, status: a.status },
    });
  });

  // Uploaded PDFs, notes, spreadsheets and OCR text survive restarts and remain searchable.
  savedDocuments.forEach(doc => {
    chunks.push({
      id: `document-${doc._id}`,
      text: doc.content,
      metadata: { type: 'uploaded_document', filename: doc.filename, docType: doc.docType, ...doc.metadata },
    });
  });

  vectorStore.build(chunks);
  } catch (err) {
    console.warn('[DocLoader Error]:', err.message);
  }
}

module.exports = { loadAndBuild };
