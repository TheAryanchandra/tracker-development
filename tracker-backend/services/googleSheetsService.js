/**
 * Google Sheets Live Sync Service
 * ─────────────────────────────────────────────────────────────
 * Polls the public Google Sheet every N minutes via the CSV export URL.
 * Maps sheet tabs to MongoDB collections and upserts changes.
 * Broadcasts SHEET_SYNCED event via WebSocket on completion.
 *
 * Sheet ID: 1ohiYsY8ObrkpJLYm963YSjO0rBesJ2iDPGg-i4iQrTA
 * Each tab is exported as CSV: /export?format=csv&gid=<GID>
 */

const fetch = require('node-fetch');
const cron = require('node-cron');
const DsaLecture = require('../models/DsaLecture');
const DailyTracker = require('../models/DailyTracker');
const DsaProgress = require('../models/DsaProgress');
const ApplicationTracker = require('../models/ApplicationTracker');
const { broadcast, WS_EVENTS } = require('./websocketService');

const SHEET_ID = '1ohiYsY8ObrkpJLYm963YSjO0rBesJ2iDPGg-i4iQrTA';

// ── Sheet Tab GIDs ────────────────────────────────────────────
// Get these from the URL when you click each tab: #gid=<number>
// The user's shared link shows gid=381718834 as the active tab
const SHEET_TABS = {
  // Format: { gid: '<GID>', name: '<label for logs>' }
  // We'll auto-detect sheet structure from header row
  main: { gid: '381718834', name: 'Main/DailyTracker' },
};

// Sync metadata tracked in memory
let lastSyncTime = null;
let lastSyncResult = null;
let syncInProgress = false;
let cronJob = null;

/**
 * Parse CSV text into array of objects (using header row as keys)
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.every(v => !v.trim())) continue; // skip blank rows
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Parse a single CSV line, handling quoted fields with commas
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Normalize a header key for matching
 */
const norm = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Get value from a row by fuzzy header match
 */
const getVal = (row, ...patterns) => {
  const keys = Object.keys(row);
  for (const pattern of patterns) {
    const key = keys.find(k => norm(k).includes(norm(pattern)));
    if (key && row[key] !== undefined) return String(row[key]).trim();
  }
  return '';
};

/**
 * Parse Y/N/Yes/No/1/0/True/False to boolean
 */
const parseYN = (val) => {
  const v = String(val).trim().toUpperCase();
  return v === 'Y' || v === 'YES' || v === '1' || v === 'TRUE';
};

/**
 * Detect which model a sheet maps to based on its headers
 */
/**
 * Detect which model a sheet maps to based on its headers and row content
 */
function detectSheetType(headers, sampleRows = []) {
  const h = headers.map(norm).join(',');
  if (h.includes('dsadone') || h.includes('applicationssent') || (h.includes('dsa') && h.includes('date'))) return 'daily';
  if (h.includes('company') && (h.includes('role') || h.includes('status'))) return 'applications';
  if (h.includes('topic') && (h.includes('solved') || h.includes('progress') || h.includes('total'))) return 'dsa_progress';
  if (h.includes('url') && (h.includes('lecture') || h.includes('title') || h.includes('duration'))) return 'lectures';
  if (h.includes('date') && h.includes('notes')) return 'daily';
  if (h.includes('company')) return 'applications';
  if (h.includes('topic')) return 'dsa_progress';

  // Value inspection fallback: check if headers or sample row values contain a date (e.g. 30-Aug-2026, Y/N, etc.)
  const combined = headers.join(' ') + ' ' + (sampleRows[0] ? Object.values(sampleRows[0]).join(' ') : '');
  if (/\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{4}-\d{2}-\d{2}/.test(combined) && (combined.includes('Arrays') || combined.includes('DSA') || combined.includes('Applied') || combined.includes('Lecture'))) {
    return 'daily';
  }

  return 'daily'; // Default to daily tracker for user's main sheet
}

/**
 * Sync a single sheet tab (by GID) to MongoDB
 */
async function syncTab(gid, tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 Tracker-Bot/1.0' },
    timeout: 15000,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet tab GID ${gid}: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);
  
  if (rows.length === 0) return { type: 'empty', count: 0, changes: 0 };

  const headers = Object.keys(rows[0]);
  const sheetType = detectSheetType(headers, rows);

  console.log(`[Sheets] Tab "${tabName}" (${gid}): ${rows.length} rows, detected as "${sheetType}"`);

  switch (sheetType) {
    case 'daily':        return await syncDailyTracker(rows, headers);
    case 'applications': return await syncApplications(rows);
    case 'dsa_progress': return await syncDsaProgress(rows);
    case 'lectures':     return await syncLectures(rows);
    default:
      return await syncDailyTracker(rows, headers);
  }
}

/**
 * Sync Daily Tracker tab (handles named columns and positional columns)
 */
async function syncDailyTracker(rows, headers = []) {
  let changes = 0;

  // Process the header row itself if it was actually a data row (e.g. contains a date)
  const allEntries = [];
  const headerDateMatch = headers.find(h => /\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{4}-\d{2}-\d{2}/.test(h));
  if (headerDateMatch) {
    const pseudoRow = {};
    headers.forEach((h, idx) => { pseudoRow[`col_${idx}`] = h; });
    allEntries.push(pseudoRow);
  }

  rows.forEach(r => allEntries.push(r));

  for (const row of allEntries) {
    const vals = Object.values(row);

    // Try named lookup first, then positional lookup
    let date = getVal(row, 'date');
    if (!date) {
      // Find date by regex in any column value
      const foundDate = vals.find(v => /\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{4}-\d{2}-\d{2}/.test(v));
      if (foundDate) date = foundDate;
    }

    if (!date || date.length < 3) continue;

    // Detect fields positionally if named keys are col_0 etc.
    let dsaDone = parseYN(getVal(row, 'dsadone', 'dsa done', 'dsa'));
    let dsaTopic = getVal(row, 'dsatopic', 'dsa topic', 'topic');
    let applicationsSent = parseInt(getVal(row, 'applications', 'applicationssent', 'apps sent', 'apps') || '0') || 0;
    let project = getVal(row, 'projectname', 'project name', 'project');
    let notes = getVal(row, 'notes', 'remarks', 'comment');

    // Positional fallback for user's sheet layout:
    // [0: sr, 1: apps, 2: date, 3: dsaDone, 4: topic, 5: project, 6: notes]
    if (!dsaTopic && vals.length >= 5) {
      if (!applicationsSent && /^\d+$/.test(vals[1])) applicationsSent = parseInt(vals[1]) || 0;
      if (parseYN(vals[3])) dsaDone = true;
      if (vals[4] && vals[4].length > 2) dsaTopic = vals[4];
      if (vals[5] && vals[5].length > 2) project = vals[5];
      if (vals[6] && vals[6].length > 2) notes = vals[6];
    }

    const data = {
      date,
      dsaDone: dsaDone || !!dsaTopic,
      dsaTopic: dsaTopic || '',
      applicationsSent,
      projectWork: !!project,
      project: project || '',
      aiLearning: notes.toLowerCase().includes('ai') || notes.toLowerCase().includes('copilot'),
      notes: notes || '',
    };

    const existing = await DailyTracker.findOne({ date: { $regex: date.replace(/\//g, '\\/').replace(/-/g, '\\-') } }).lean();
    await DailyTracker.findOneAndUpdate(
      { date: { $regex: date } },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (!existing) changes++;
  }
  return { type: 'daily', count: allEntries.length, changes };
}

/**
 * Sync Application Tracker tab
 */
async function syncApplications(rows) {
  let changes = 0;
  for (const row of rows) {
    const company = getVal(row, 'company');
    if (!company || company.length < 1) continue;

    const dateApplied = getVal(row, 'date', 'dateapplied', 'date applied') || new Date().toISOString().split('T')[0];
    const role = getVal(row, 'role', 'position', 'designation') || 'Software Engineer';
    const status = getVal(row, 'status') || 'Applied';

    const data = {
      dateApplied,
      company,
      role,
      platform: getVal(row, 'platform', 'source', 'via') || 'LinkedIn',
      status,
      followUpDate: getVal(row, 'followup', 'follow up', 'follow-up'),
      notes: getVal(row, 'notes', 'remarks'),
    };

    const existing = await ApplicationTracker.findOne({ company, dateApplied }).lean();
    if (!existing) {
      const count = await ApplicationTracker.countDocuments();
      await ApplicationTracker.create({ srNo: count + 1, ...data });
      changes++;
    } else if (existing.status !== status) {
      await ApplicationTracker.findByIdAndUpdate(existing._id, { status, notes: data.notes });
      changes++;
    }
  }
  return { type: 'applications', count: rows.length, changes };
}

/**
 * Sync DSA Progress tab
 */
async function syncDsaProgress(rows) {
  let changes = 0;
  for (const row of rows) {
    const topic = getVal(row, 'topic', 'category', 'subject');
    if (!topic || topic.length < 2) continue;

    const totalProblems = parseInt(getVal(row, 'total', 'totalproblems', 'total problems') || '0') || 0;
    const problemsSolved = parseInt(getVal(row, 'solved', 'problemssolved', 'problems solved', 'done') || '0') || 0;
    const percent = totalProblems > 0 ? Math.round((problemsSolved / totalProblems) * 100) : 0;
    const status = getVal(row, 'status') ||
      (percent >= 100 ? 'Completed' : percent > 0 ? 'In Progress' : 'Not Started');

    const existing = await DsaProgress.findOne({ topic: new RegExp(topic, 'i') }).lean();
    const wasChanged = !existing ||
      existing.problemsSolved !== problemsSolved ||
      existing.totalProblems !== totalProblems;

    await DsaProgress.findOneAndUpdate(
      { topic: new RegExp(topic, 'i') },
      { topic, totalProblems, problemsSolved, percentComplete: percent, status },
      { upsert: true, new: true }
    );
    if (wasChanged) changes++;
  }
  return { type: 'dsa_progress', count: rows.length, changes };
}

/**
 * Sync DSA Lectures tab
 */
async function syncLectures(rows) {
  let changes = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = getVal(row, 'title', 'name', 'lecture');
    if (!title || title.length < 2) continue;

    const status = getVal(row, 'status') || 'Pending';
    const url = getVal(row, 'url', 'link') || '#';
    const duration = getVal(row, 'duration', 'time', 'length');

    const existing = await DsaLecture.findOne({ title: new RegExp(title.slice(0, 20), 'i') }).lean();
    const wasChanged = !existing || existing.status !== status;

    await DsaLecture.findOneAndUpdate(
      { title: new RegExp(title.slice(0, 20), 'i') },
      { title, url, duration, status, srNo: parseInt(getVal(row, 'sr', 'no', '#') || String(i + 1)) || i + 1 },
      { upsert: true, new: true }
    );
    if (wasChanged) changes++;
  }
  return { type: 'lectures', count: rows.length, changes };
}

/**
 * Main sync function — fetches all tabs and syncs to MongoDB
 */
async function syncGoogleSheet() {
  if (syncInProgress) {
    console.log('[Sheets] Sync already in progress, skipping...');
    return null;
  }

  syncInProgress = true;
  const startTime = Date.now();
  console.log('[Sheets] Starting Google Sheets sync...');

  try {
    const results = {};
    let totalChanges = 0;

    // Sync the main tab (auto-detects type)
    for (const [key, tab] of Object.entries(SHEET_TABS)) {
      try {
        const result = await syncTab(tab.gid, tab.name);
        results[tab.name] = result;
        totalChanges += result.changes || 0;
      } catch (tabErr) {
        console.error(`[Sheets] Error syncing tab "${tab.name}":`, tabErr.message);
        results[tab.name] = { error: tabErr.message };
      }
    }

    // Also try to discover other tabs by checking standard GIDs
    // Many sheets have multiple tabs — we try to fetch and auto-detect
    const additionalGids = await discoverSheetTabs();
    for (const { gid, name } of additionalGids) {
      if (Object.values(SHEET_TABS).some(t => t.gid === gid)) continue; // already synced
      try {
        const result = await syncTab(gid, name);
        results[name] = result;
        totalChanges += result.changes || 0;
      } catch (e) {
        // Silently skip tabs we can't read
      }
    }

    const duration = Date.now() - startTime;
    lastSyncTime = new Date().toISOString();
    lastSyncResult = { results, totalChanges, duration, success: true };

    console.log(`[Sheets] Sync complete in ${duration}ms. ${totalChanges} changes across ${Object.keys(results).length} tab(s).`);

    // Broadcast to all WebSocket clients
    broadcast(WS_EVENTS.SHEET_SYNCED, {
      totalChanges,
      duration,
      results,
      lastSyncTime,
    });

    // If anything changed, also broadcast DATA_UPDATED so dashboard refreshes stats
    if (totalChanges > 0) {
      broadcast(WS_EVENTS.DATA_UPDATED, { source: 'google_sheets', changes: totalChanges });
      // Invalidate RAG vector store so AI knows new data
      try {
        const vectorStore = require('../ai/vectorStore');
        vectorStore.lastBuilt = null;
      } catch (e) { /* ignore */ }
    }

    return lastSyncResult;

  } catch (err) {
    const errorResult = { success: false, error: err.message };
    lastSyncResult = errorResult;
    console.error('[Sheets] Sync error:', err.message);
    broadcast(WS_EVENTS.SYNC_ERROR, { error: err.message });
    return errorResult;

  } finally {
    syncInProgress = false;
  }
}

/**
 * Try to discover other sheet tabs from the spreadsheet
 * Uses the HTML export to find all GIDs
 */
async function discoverSheetTabs() {
  try {
    const htmlUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
    const res = await fetch(htmlUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 Tracker-Bot/1.0' },
      timeout: 10000,
    });
    if (!res.ok) return [];
    
    const html = await res.text();
    // Extract GIDs and sheet names from the HTML
    const gidMatches = [...html.matchAll(/"gid":"?(\d+)"?[^}]*"name":"([^"]+)"/g)];
    const tabs = gidMatches.map(m => ({ gid: m[1], name: m[2] }));
    
    if (tabs.length === 0) {
      // Fallback: try common additional GIDs
      // These are typically 0, 1, 2... for older sheets
      return [
        { gid: '0', name: 'Sheet1' },
        { gid: '1234567890', name: 'Sheet2' },
      ];
    }
    
    console.log(`[Sheets] Discovered ${tabs.length} tab(s):`, tabs.map(t => t.name).join(', '));
    return tabs;
  } catch (e) {
    return [];
  }
}

/**
 * Start the cron job (every 1 minute)
 */
function startSheetsCron() {
  if (cronJob) {
    console.log('[Sheets] Cron already running, skipping start');
    return;
  }

  // Run once immediately after 10s delay (give DB time to connect)
  setTimeout(async () => {
    console.log('[Sheets] Initial sync starting...');
    await syncGoogleSheet();
  }, 10000);

  // Then every 1 minute
  cronJob = cron.schedule('*/1 * * * *', async () => {
    await syncGoogleSheet();
  }, { timezone: 'Asia/Kolkata' });

  console.log('[Sheets] Cron scheduled: every 1 minute (IST)');
}

/**
 * Stop the cron job
 */
function stopSheetsCron() {
  if (cronJob) {
    cronJob.destroy();
    cronJob = null;
    console.log('[Sheets] Cron stopped');
  }
}

/**
 * Get sync status metadata
 */
function getSyncStatus() {
  return {
    lastSyncTime,
    lastSyncResult,
    syncInProgress,
    sheetId: SHEET_ID,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`,
    cronActive: !!cronJob,
  };
}

module.exports = {
  syncGoogleSheet,
  startSheetsCron,
  stopSheetsCron,
  getSyncStatus,
};
