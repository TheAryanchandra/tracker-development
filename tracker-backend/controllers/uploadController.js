const xlsx = require('xlsx');
const DsaLecture = require('../models/DsaLecture');
const DailyTracker = require('../models/DailyTracker');
const DsaProgress = require('../models/DsaProgress');
const ApplicationTracker = require('../models/ApplicationTracker');

// Helper to normalize keys
const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file (.xlsx, .xls)' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;

    const summaryResults = {
      dsaLectures: 0,
      dailyTracker: 0,
      dsaProgress: 0,
      applicationTracker: 0,
    };

    // Mode: mode can be 'replace' (clear existing) or 'append' (default: replace if specified or overwrite)
    const mode = req.body.mode || 'replace';

    for (const sheetName of sheetNames) {
      const normalizedSheetName = normalizeKey(sheetName);
      const sheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

      if (!rawData || rawData.length === 0) continue;

      // 1. DSA Lectures Sheet
      if (normalizedSheetName.includes('dsalecture') || normalizedSheetName.includes('lecture')) {
        if (mode === 'replace') await DsaLecture.deleteMany({});
        
        const lectures = rawData.map((row, index) => {
          const keys = Object.keys(row);
          const getVal = (pattern) => {
            const matchedKey = keys.find(k => normalizeKey(k).includes(pattern));
            return matchedKey ? row[matchedKey] : '';
          };

          return {
            srNo: parseInt(getVal('sr') || getVal('#') || index + 1) || index + 1,
            url: String(getVal('url') || getVal('link') || '#'),
            title: String(getVal('title') || getVal('name') || `Lecture ${index + 1}`),
            duration: String(getVal('duration') || getVal('time') || ''),
            status: String(getVal('status') || 'Pending'),
          };
        }).filter(item => item.title && item.url);

        if (lectures.length > 0) {
          await DsaLecture.insertMany(lectures);
          summaryResults.dsaLectures = lectures.length;
        }
      }

      // 2. Daily Tracker Sheet
      else if (normalizedSheetName.includes('dailytracker') || normalizedSheetName.includes('daily')) {
        if (mode === 'replace') await DailyTracker.deleteMany({});

        const logs = rawData.map((row) => {
          const keys = Object.keys(row);
          const getVal = (pattern) => {
            const matchedKey = keys.find(k => normalizeKey(k).includes(pattern));
            return matchedKey ? row[matchedKey] : '';
          };

          const parseYN = (val) => String(val).trim().toUpperCase().startsWith('Y') || String(val) === '1' || String(val).toLowerCase() === 'true';

          return {
            date: String(getVal('date') || new Date().toISOString().split('T')[0]),
            dsaDone: parseYN(getVal('dsadone')),
            dsaTopic: String(getVal('dsatopic') || getVal('topic') || ''),
            applicationsSent: parseInt(getVal('applications') || getVal('apps') || 0) || 0,
            projectWork: parseYN(getVal('projectwork')),
            project: String(getVal('project') || ''),
            aiLearning: parseYN(getVal('ailearning')),
            notes: String(getVal('notes') || ''),
          };
        }).filter(item => item.date);

        if (logs.length > 0) {
          await DailyTracker.insertMany(logs);
          summaryResults.dailyTracker = logs.length;
        }
      }

      // 3. DSA Progress Sheet
      else if (normalizedSheetName.includes('dsaprogress') || normalizedSheetName.includes('progress')) {
        if (mode === 'replace') await DsaProgress.deleteMany({});

        const progressItems = rawData.map((row) => {
          const keys = Object.keys(row);
          const getVal = (pattern) => {
            const matchedKey = keys.find(k => normalizeKey(k).includes(pattern));
            return matchedKey ? row[matchedKey] : '';
          };

          const total = parseInt(getVal('total') || getVal('totalproblems') || 0) || 0;
          const solved = parseInt(getVal('solved') || getVal('problemssolved') || 0) || 0;
          const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

          return {
            topic: String(getVal('topic') || getVal('category') || '').trim(),
            totalProblems: total,
            problemsSolved: solved,
            percentComplete: percent,
            status: String(getVal('status') || (solved >= total && total > 0 ? 'Completed' : 'In Progress')),
          };
        }).filter(item => item.topic);

        if (progressItems.length > 0) {
          for (const item of progressItems) {
            await DsaProgress.findOneAndUpdate(
              { topic: item.topic },
              item,
              { upsert: true, new: true }
            );
          }
          summaryResults.dsaProgress = progressItems.length;
        }
      }

      // 4. Application Tracker Sheet
      else if (normalizedSheetName.includes('application') || normalizedSheetName.includes('app') || normalizedSheetName.includes('job')) {
        if (mode === 'replace') await ApplicationTracker.deleteMany({});

        const apps = rawData.map((row, index) => {
          const keys = Object.keys(row);
          const getVal = (pattern) => {
            const matchedKey = keys.find(k => normalizeKey(k).includes(pattern));
            return matchedKey ? row[matchedKey] : '';
          };

          return {
            srNo: parseInt(getVal('sr') || getVal('#') || index + 1) || index + 1,
            dateApplied: String(getVal('date') || getVal('dateapplied') || new Date().toISOString().split('T')[0]),
            company: String(getVal('company') || 'Unknown Company'),
            role: String(getVal('role') || getVal('position') || 'Software Engineer'),
            platform: String(getVal('platform') || getVal('source') || 'LinkedIn'),
            status: String(getVal('status') || 'Applied'),
            followUpDate: String(getVal('follow') || getVal('followupdate') || ''),
            notes: String(getVal('notes') || ''),
          };
        }).filter(item => item.company);

        if (apps.length > 0) {
          await ApplicationTracker.insertMany(apps);
          summaryResults.applicationTracker = apps.length;
        }
      }
    }

    res.json({
      success: true,
      message: 'Excel data processed and synced across all sections!',
      results: summaryResults,
    });
  } catch (error) {
    console.error('Excel Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume or document file' });
    }

    const fileUrl = `/uploads/resumes/${req.file.filename}`;
    const { applicationId } = req.body;

    let updatedApplication = null;
    if (applicationId) {
      updatedApplication = await ApplicationTracker.findByIdAndUpdate(
        applicationId,
        { resumeUrl: fileUrl, attachmentName: req.file.originalname },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Resume / Document uploaded successfully',
      fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Resume Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
