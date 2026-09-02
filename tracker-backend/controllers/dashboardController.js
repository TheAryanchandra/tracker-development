const DsaLecture = require('../models/DsaLecture');
const DailyTracker = require('../models/DailyTracker');
const DsaProgress = require('../models/DsaProgress');
const ApplicationTracker = require('../models/ApplicationTracker');

exports.getDashboardStats = async (req, res) => {
  try {
    const [lectures, dailyLogs, dsaProgress, applications] = await Promise.all([
      DsaLecture.find().lean(),
      DailyTracker.find().sort({ date: 1 }).lean(),
      DsaProgress.find().lean(),
      ApplicationTracker.find().lean(),
    ]);

    // DSA Lectures Stats
    const totalLectures = lectures.length;
    const completedLectures = lectures.filter(l => String(l.status).toLowerCase() === 'completed').length;
    const lectureProgressPercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    // DSA Problems Stats
    const totalDsaProblems = dsaProgress.reduce((acc, curr) => acc + (curr.totalProblems || 0), 0);
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

    res.json({
      success: true,
      data: {
        startDate,
        daysElapsed,
        currentDsaStreak,
        longestDsaStreak,
        totalAppsLogged: effectiveTotalApps,
        avgAppsPerLoggedDay: parseFloat(avgAppsPerLoggedDay),
        interviewsInProgress,
        offersReceived,
        solvedDsaProblems,
        totalDsaProblems,
        solvedProblems: solvedDsaProblems,
        totalProblems: totalDsaProblems,
        overallDsaPercent,
        dsaProgress: {
          totalProblems: totalDsaProblems,
          solvedProblems: solvedDsaProblems,
          problemsSolved: solvedDsaProblems,
          percent: overallDsaPercent,
          percentComplete: overallDsaPercent,
        },
        dsaLectures: {
          total: totalLectures,
          completed: completedLectures,
          percent: lectureProgressPercent,
        },
        applications: {
          total: effectiveTotalApps,
          byStatus: {
            Applied: applications.filter(a => String(a.status).toLowerCase().includes('app')).length,
            Interviewing: interviewsInProgress,
            Offer: offersReceived,
            Rejected: applications.filter(a => String(a.status).toLowerCase().includes('reject')).length,
          },
        },
        dailyTracker: {
          daysTracked,
          dsaDoneDays: dailyLogs.filter(d => d.dsaDone).length,
          projectDoneDays: dailyLogs.filter(d => d.projectWork).length,
          aiLearningDays: dailyLogs.filter(d => d.aiLearning).length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
