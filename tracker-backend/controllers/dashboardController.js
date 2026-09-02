const DsaLecture = require('../models/DsaLecture');
const DailyTracker = require('../models/DailyTracker');
const DsaProgress = require('../models/DsaProgress');
const ApplicationTracker = require('../models/ApplicationTracker');
const memoryCache = require('../services/cacheService');

const DEFAULT_STATS = {
  startDate: '31-Aug-2026',
  daysElapsed: 1,
  currentDsaStreak: 0,
  longestDsaStreak: 0,
  totalAppsLogged: 0,
  avgAppsPerLoggedDay: '0.0',
  interviewsInProgress: 0,
  offersReceived: 0,
  solvedDsaProblems: 0,
  totalDsaProblems: 100,
  overallDsaPercent: 0,
  dsaLectures: { total: 35, completed: 0, percent: 0 },
  applications: {
    total: 0,
    byStatus: { Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 },
  },
  dailyTracker: {
    daysTracked: 0,
    dsaDoneDays: 0,
    projectDoneDays: 0,
    aiLearningDays: 0,
  },
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [lectures, dailyLogs, dsaProgress, applications] = await Promise.all([
      DsaLecture.find().maxTimeMS(2500).lean().catch(() => []),
      DailyTracker.find().sort({ date: 1 }).maxTimeMS(2500).lean().catch(() => []),
      DsaProgress.find().maxTimeMS(2500).lean().catch(() => []),
      ApplicationTracker.find().maxTimeMS(2500).lean().catch(() => []),
    ]);

    // DSA Lectures Stats
    const totalLectures = lectures.length;
    const completedLectures = lectures.filter(l => String(l.status).toLowerCase() === 'completed').length;
    const lectureProgressPercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    // DSA Problems Stats
    const totalDsaProblems = dsaProgress.reduce((acc, curr) => acc + (curr.totalProblems || 0), 0) || 100;
    const solvedDsaProblems = dsaProgress.reduce((acc, curr) => acc + (curr.problemsSolved || 0), 0);
    const overallDsaPercent = totalDsaProblems > 0 ? Math.round((solvedDsaProblems / totalDsaProblems) * 100) : 0;

    // Applications Stats
    const totalApps = applications.length;
    const totalAppsSentFromDaily = dailyLogs.reduce((acc, curr) => acc + (curr.applicationsSent || 0), 0);
    const effectiveTotalApps = Math.max(totalApps, totalAppsSentFromDaily);

    const interviewsInProgress = applications.filter(a => String(a.status).toLowerCase().includes('interview')).length;
    const offersReceived = applications.filter(a => String(a.status).toLowerCase().includes('offer')).length;

    const daysTracked = dailyLogs.length;
    const avgAppsPerLoggedDay = daysTracked > 0 ? (effectiveTotalApps / daysTracked).toFixed(1) : '0.0';

    // Calculate DSA Streaks
    let currentDsaStreak = 0;
    let longestDsaStreak = 0;
    let tempStreak = 0;

    dailyLogs.forEach(log => {
      if (log.dsaDone) {
        tempStreak++;
        if (tempStreak > longestDsaStreak) longestDsaStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });
    currentDsaStreak = tempStreak;

    const startDate = dailyLogs.length > 0 ? dailyLogs[0].date : '31-Aug-2026';
    const daysElapsed = Math.max(daysTracked, 1);

    const appStatusMap = {
      Applied: applications.filter(a => a.status === 'Applied').length,
      Interviewing: interviewsInProgress,
      Offer: offersReceived,
      Rejected: applications.filter(a => String(a.status).toLowerCase().includes('reject')).length,
    };

    const statsData = {
      startDate,
      daysElapsed,
      currentDsaStreak,
      longestDsaStreak,
      totalAppsLogged: effectiveTotalApps,
      avgAppsPerLoggedDay,
      interviewsInProgress,
      offersReceived,
      solvedDsaProblems,
      totalDsaProblems,
      overallDsaPercent,
      dsaLectures: {
        total: totalLectures || 35,
        completed: completedLectures,
        percent: lectureProgressPercent,
      },
      applications: {
        total: effectiveTotalApps,
        byStatus: appStatusMap,
      },
      dailyTracker: {
        daysTracked,
        dsaDoneDays: dailyLogs.filter(d => d.dsaDone).length,
        projectDoneDays: dailyLogs.filter(d => d.projectWork).length,
        aiLearningDays: dailyLogs.filter(d => d.aiLearning).length,
      },
    };

    // Cache computed stats for immediate fallback
    memoryCache.set('dashboard_stats', statsData, 300);

    res.json({
      success: true,
      data: statsData,
    });
  } catch (error) {
    console.warn('[Dashboard Stats Error]:', error.message);
    const fallback = memoryCache.get('dashboard_stats') || DEFAULT_STATS;
    res.json({
      success: true,
      data: fallback,
    });
  }
};
