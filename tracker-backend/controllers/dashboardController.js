const DsaLecture = require('../models/DsaLecture');
const DailyTracker = require('../models/DailyTracker');
const DsaProgress = require('../models/DsaProgress');
const ApplicationTracker = require('../models/ApplicationTracker');

exports.getDashboardStats = async (req, res) => {
  try {
    const [lectures, dailyLogs, dsaProgress, applications] = await Promise.all([
      DsaLecture.find(),
      DailyTracker.find(),
      DsaProgress.find(),
      ApplicationTracker.find(),
    ]);

    // DSA Lectures Stats
    const totalLectures = lectures.length;
    const completedLectures = lectures.filter(l => l.status === 'Completed').length;
    const lectureProgressPercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    // DSA Problems Stats
    const totalDsaProblems = dsaProgress.reduce((acc, curr) => acc + (curr.totalProblems || 0), 0);
    const solvedDsaProblems = dsaProgress.reduce((acc, curr) => acc + (curr.problemsSolved || 0), 0);
    const overallDsaPercent = totalDsaProblems > 0 ? Math.round((solvedDsaProblems / totalDsaProblems) * 100) : 0;

    // Applications Stats
    const totalApps = applications.length;
    const totalAppsSentFromDaily = dailyLogs.reduce((acc, curr) => acc + (curr.applicationsSent || 0), 0);
    const appsByStatus = {
      Applied: applications.filter(a => a.status === 'Applied').length,
      Interviewing: applications.filter(a => a.status === 'Interviewing').length,
      Offer: applications.filter(a => a.status === 'Offer').length,
      Rejected: applications.filter(a => a.status === 'Rejected').length,
    };

    // Daily Streak & Recent Activity
    const daysTracked = dailyLogs.length;
    const dsaDoneDays = dailyLogs.filter(d => d.dsaDone).length;
    const projectDoneDays = dailyLogs.filter(d => d.projectWork).length;
    const aiLearningDays = dailyLogs.filter(d => d.aiLearning).length;

    res.json({
      success: true,
      data: {
        dsaLectures: {
          total: totalLectures,
          completed: completedLectures,
          percent: lectureProgressPercent,
        },
        dsaProgress: {
          totalProblems: totalDsaProblems,
          solvedProblems: solvedDsaProblems,
          percent: overallDsaPercent,
          topicsCount: dsaProgress.length,
        },
        applications: {
          total: totalApps || totalAppsSentFromDaily,
          byStatus: appsByStatus,
        },
        dailyTracker: {
          daysTracked,
          dsaDoneDays,
          projectDoneDays,
          aiLearningDays,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
