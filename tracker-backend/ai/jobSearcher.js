/**
 * Free Multi-Source Job Search Engine
 * ─────────────────────────────────────────────────────────────
 * Fetches real job listings from 100% free APIs:
 *  1. RemoteOK (remoteok.com/api)
 *  2. Remotive (remotive.com/api/remote-jobs)
 *  3. Arbeitnow (arbeitnow.com/api/job-board-api)
 *  4. The Muse (themuse.com/api/public/jobs)
 *
 * Persisted in MongoDB with 24h auto-expiry.
 * Supports pagination, keyword filtering, and source filtering.
 */

const JobListing = require('../models/JobListing');
const { getAllFacts } = require('./longTermMemory');

const DEFAULT_TAGS = ['javascript', 'node', 'react', 'fullstack', 'backend', 'frontend', 'software engineer', 'sde', 'python', 'java'];

/**
 * 1. RemoteOK (Free JSON API)
 */
async function fetchRemoteOK(tags = []) {
  try {
    const url = `https://remoteok.com/api?tags=${encodeURIComponent(tags.slice(0, 3).join(','))}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'JarvisJobTracker/2.0' },
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    return (Array.isArray(data) ? data.slice(1) : [])
      .filter(j => j.position)
      .map(j => ({
        title: j.position || 'Software Engineer',
        company: j.company || 'Tech Company',
        location: j.location || 'Remote',
        type: 'Full-time',
        tags: Array.isArray(j.tags) ? j.tags : [],
        salary: j.salary || null,
        url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
        source: 'RemoteOK',
        postedAt: j.date ? new Date(j.date) : new Date(),
      }));
  } catch (e) {
    console.warn('[JobSearch] RemoteOK failed:', e.message);
    return [];
  }
}

/**
 * 2. Remotive (Free Remote API)
 */
async function fetchRemotive(search = 'software engineer') {
  try {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(search)}&limit=25`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return (data.jobs || []).map(j => ({
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location || 'Remote',
      type: j.job_type || 'Full-time',
      tags: Array.isArray(j.tags) ? j.tags : [j.category].filter(Boolean),
      salary: j.salary || null,
      url: j.url,
      source: 'Remotive',
      postedAt: j.publication_date ? new Date(j.publication_date) : new Date(),
    }));
  } catch (e) {
    console.warn('[JobSearch] Remotive failed:', e.message);
    return [];
  }
}

/**
 * 3. Arbeitnow (Free Tech Jobs API)
 */
async function fetchArbeitnow() {
  try {
    const url = 'https://www.arbeitnow.com/api/job-board-api';
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return (data.data || []).map(j => ({
      title: j.title,
      company: j.company_name,
      location: j.location || (j.remote ? 'Remote' : 'Worldwide'),
      type: j.job_types && j.job_types[0] ? j.job_types[0] : 'Full-time',
      tags: Array.isArray(j.tags) ? j.tags : [],
      salary: null,
      url: j.url,
      source: 'Arbeitnow',
      postedAt: j.created_at ? new Date(j.created_at * 1000) : new Date(),
    }));
  } catch (e) {
    console.warn('[JobSearch] Arbeitnow failed:', e.message);
    return [];
  }
}

/**
 * 4. The Muse (Free public listings)
 */
async function fetchTheMuse(search = 'Software Engineer') {
  try {
    const url = `https://www.themuse.com/api/public/jobs?descending=true&page=1&category=Software+Engineer&level=Entry+Level&level=Mid+Level`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return (data.results || []).map(j => ({
      title: j.name,
      company: j.company?.name || 'Company',
      location: j.locations?.map(l => l.name).join(', ') || 'Remote',
      type: j.type || 'Full-time',
      tags: j.categories?.map(c => c.name) || [],
      salary: null,
      url: j.refs?.landing_page || j.landing_page || '#',
      source: 'TheMuse',
      postedAt: j.publication_date ? new Date(j.publication_date) : new Date(),
    }));
  } catch (e) {
    console.warn('[JobSearch] TheMuse failed:', e.message);
    return [];
  }
}

/**
 * Get user skills to rank relevant jobs
 */
async function getUserSkillTags() {
  try {
    const facts = await getAllFacts();
    const skillFacts = facts.filter(f => f.category === 'skill');
    const tags = [];
    skillFacts.forEach(f => {
      f.value.split(/[\s,;&]+/).forEach(w => {
        const word = w.toLowerCase().trim();
        if (word.length > 2) tags.push(word);
      });
    });
    return tags.length > 0 ? tags : DEFAULT_TAGS;
  } catch {
    return DEFAULT_TAGS;
  }
}

/**
 * Sync fresh jobs from APIs into MongoDB
 */
async function syncJobs(query = '', forceRefresh = false) {
  if (!forceRefresh) {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const count = await JobListing.countDocuments({ fetchedAt: { $gte: fourHoursAgo } });
    if (count >= 10) return count;
  }

  const userTags = await getUserSkillTags();
  const searchQ = query || 'software engineer';

  const [remoteok, remotive, arbeitnow, muse] = await Promise.all([
    fetchRemoteOK(userTags),
    fetchRemotive(searchQ),
    fetchArbeitnow(),
    fetchTheMuse(searchQ),
  ]);

  const allJobs = [...remoteok, ...remotive, ...arbeitnow, ...muse];
  if (allJobs.length === 0) return 0;

  // Deduplicate by URL or title+company
  const seen = new Set();
  const deduped = [];
  for (const j of allJobs) {
    const key = (j.url || `${j.title}-${j.company}`).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push({ ...j, isNew: true, fetchedAt: new Date() });
    }
  }

  try {
    await JobListing.deleteMany({});
    await JobListing.insertMany(deduped);
    return deduped.length;
  } catch (e) {
    console.error('[JobSearch] Insert error:', e.message);
    return deduped.length;
  }
}

/**
 * Paginated database search over cached jobs
 */
async function searchJobsPaginated({ query = '', source = '', page = 1, limit = 10, forceRefresh = false }) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit) || 10));

  await syncJobs(query, forceRefresh);

  const filter = {};
  if (query) {
    const regex = new RegExp(query, 'i');
    filter.$or = [
      { title: regex },
      { company: regex },
      { location: regex },
      { tags: { $in: [regex] } },
    ];
  }
  if (source && source !== 'all') {
    filter.source = new RegExp(`^${source}$`, 'i');
  }

  const [totalCount, jobs, distinctSources] = await Promise.all([
    JobListing.countDocuments(filter),
    JobListing.find(filter)
      .sort({ postedAt: -1, _id: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    JobListing.distinct('source'),
  ]);

  const totalPages = Math.ceil(totalCount / l) || 1;

  return {
    jobs,
    pagination: {
      page: p,
      limit: l,
      totalCount,
      totalPages,
      hasNextPage: p < totalPages,
      hasPrevPage: p > 1,
    },
    sources: ['all', ...distinctSources],
  };
}

/**
 * Format jobs as natural text for Jarvis
 */
function formatJobsForResponse(jobs) {
  if (!jobs || jobs.length === 0) return 'No live jobs matching that criteria right now. Check back soon or try searching for general "fullstack" or "backend"!';

  return jobs.slice(0, 5).map((j, i) => (
    `**${i + 1}. ${j.title}** @ **${j.company}**\n` +
    `   📍 ${j.location || 'Remote'} | 🏷️ ${(j.tags || []).slice(0, 3).join(', ') || 'Tech'}\n` +
    `   ${j.salary ? `💰 ${j.salary} | ` : ''}🔗 [Apply Link](${j.url}) (via ${j.source})`
  )).join('\n\n');
}

/**
 * Backwards-compatible searchJobs wrapper
 */
async function searchJobs(query = '', forceRefresh = false) {
  const result = await searchJobsPaginated({ query, limit: 20, forceRefresh });
  return {
    jobs: result.jobs,
    fromCache: !forceRefresh,
    total: result.pagination.totalCount,
  };
}

module.exports = {
  syncJobs,
  searchJobs,
  searchJobsPaginated,
  formatJobsForResponse,
};
