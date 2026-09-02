/**
 * Notification Service
 * Generates smart push-ready notifications:
 * - New job alerts (from job searcher)
 * - Streak at-risk warnings
 * - DSA reminders
 * - Application follow-up nudges
 */

const Notification = require('../models/Notification');
const { searchJobs } = require('../ai/jobSearcher');
const DailyTracker = require('../models/DailyTracker');
const ApplicationTracker = require('../models/ApplicationTracker');

/**
 * Push a notification into MongoDB
 */
async function push(type, title, body, icon = '🔔', url = '/', data = {}) {
  try {
    return await Notification.create({ type, title, body, icon, url, data });
  } catch (e) {
    console.error('[Notify] push error:', e.message);
  }
}

/**
 * Fetch new jobs and create job_alert notifications for new listings
 */
async function checkNewJobs() {
  try {
    const { jobs, fromCache } = await searchJobs('software engineer fullstack', false);
    if (fromCache || jobs.length === 0) return 0;

    // Create a single digest notification instead of one per job
    const topJobs = jobs.slice(0, 3);
    const body = topJobs.map(j => `• ${j.title} @ ${j.company}`).join('\n');
    await push('job_alert', `🆕 ${jobs.length} New Jobs Found`, body, '💼', '/jobs');
    console.log(`[Notify] Created job alert: ${jobs.length} new jobs`);
    return jobs.length;
  } catch (e) {
    console.error('[Notify] checkNewJobs error:', e.message);
    return 0;
  }
}

/**
 * Check DSA streak status and warn if at risk
 */
async function checkStreakWarning() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = await DailyTracker.findOne({ date: { $regex: todayStr } });
    if (!todayLog || !todayLog.dsaDone) {
      const hour = new Date().getHours();
      // Only warn in evening hours (after 6 PM IST = 12:30 UTC)
      if (hour >= 13 || hour < 2) {
        // Check if they had a streak going
        const recentLogs = await DailyTracker.find().sort({ date: -1 }).limit(3).lean();
        const hadStreak = recentLogs.slice(1).some(l => l.dsaDone);
        if (hadStreak) {
          await push('streak_warning', '⚡ Streak at Risk!', "You haven't logged DSA today. Don't break your streak — even 1 problem counts!", '🔥', '/daily-tracker');
        }
      }
    }
  } catch (e) {
    console.error('[Notify] checkStreakWarning error:', e.message);
  }
}

/**
 * Check for applications pending follow-up (applied 7+ days ago, no update)
 */
async function checkApplicationFollowUps() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const stale = await ApplicationTracker.find({
      status: 'Applied',
      dateApplied: { $lte: sevenDaysAgo },
    }).limit(5).lean();

    if (stale.length > 0) {
      const companies = stale.map(a => a.company).join(', ');
      await push(
        'application_update',
        `📬 Follow Up with ${stale.length} Companies`,
        `Consider following up with: ${companies}`,
        '📋',
        '/applications'
      );
    }
  } catch (e) {
    console.error('[Notify] checkApplicationFollowUps error:', e.message);
  }
}

/**
 * Run all checks — called by scheduler
 */
async function runAllChecks() {
  console.log('[Notify] Running all notification checks...');
  await Promise.allSettled([
    checkNewJobs(),
    checkStreakWarning(),
    checkApplicationFollowUps(),
  ]);
  console.log('[Notify] Notification checks complete');
}

module.exports = { push, checkNewJobs, checkStreakWarning, checkApplicationFollowUps, runAllChecks };
