/**
 * Free Multi-Source Job Search Engine
 * ─────────────────────────────────────────────────────────────
 * Fetches real job listings from 100% free APIs:
 *  1. RemoteOK (remoteok.com/api)
 *  2. Remotive (remotive.com/api/remote-jobs)
 *  3. Arbeitnow (arbeitnow.com/api/job-board-api)
 *  4. The Muse (themuse.com/api/public/jobs)
 *  5. Adzuna (optional official API; set ADZUNA_APP_ID and ADZUNA_APP_KEY)
 *
 * Persisted in MongoDB with 24h auto-expiry.
 * Supports pagination, keyword filtering, and source filtering.
 */

const JobListing = require('../models/JobListing');
const { getAllFacts } = require('./longTermMemory');
const JarvisDocument = require('../models/JarvisDocument');

const DEFAULT_TAGS = ['javascript', 'typescript', 'node', 'react', 'next.js', 'fullstack', 'backend', 'software engineer', 'sde', 'swe', 'python', 'java'];
const TARGET_ROLES = ['sde', 'swe', 'software engineer', 'full stack', 'fullstack', 'backend engineer', 'software developer'];
const TARGET_COMPANIES = ['mnc', 'gcc', 'product', 'startup', 'start-up'];
const TARGET_MARKERS = ['sde', 'swe', 'software engineer', 'software developer', 'full stack', 'fullstack', 'backend', 'frontend', 'web developer', 'application developer'];
const FEED_TIMEOUT = 4500;

/**
 * 1. RemoteOK (Free JSON API)
 */
async function fetchRemoteOK(tags = []) {
  try {
    const url = `https://remoteok.com/api?tags=${encodeURIComponent(tags.slice(0, 3).join(','))}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'JarvisJobTracker/2.0' },
      signal: AbortSignal.timeout(FEED_TIMEOUT),
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
    const res = await fetch(url, { signal: AbortSignal.timeout(FEED_TIMEOUT) });
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
    const res = await fetch(url, { signal: AbortSignal.timeout(FEED_TIMEOUT) });
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
    const res = await fetch(url, { signal: AbortSignal.timeout(FEED_TIMEOUT) });
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
    // Resume uploads are persisted by the OCR pipeline. Use recognizable terms
    // from the latest resume/document as additional API search tags.
    const documents = await JarvisDocument.find().sort({ uploadedAt: -1 }).limit(3).lean().catch(() => []);
    const resumeText = documents.map(d => d.content || '').join(' ').toLowerCase();
    const resumeTerms = DEFAULT_TAGS.filter(tag => resumeText.includes(tag));
    return Array.from(new Set([...DEFAULT_TAGS, ...tags, ...resumeTerms]));
  } catch {
    return DEFAULT_TAGS;
  }
}

/** Optional official aggregator. This is intentionally disabled until credentials exist. */
async function fetchAdzuna(search = 'software engineer') {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  try {
    const country = process.env.ADZUNA_COUNTRY || 'in';
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}&results_per_page=30&what=${encodeURIComponent(search)}&content-type=application/json`;
    const data = await (await fetch(url, { signal: AbortSignal.timeout(FEED_TIMEOUT) })).json();
    return (data.results || []).map(j => ({ title: j.title, company: j.company?.display_name || 'Company', location: j.location?.display_name || 'India', type: j.contract_type || 'Full-time', tags: [], salary: j.salary_min ? `${j.salary_min}-${j.salary_max || j.salary_min}` : null, url: j.redirect_url, source: 'Adzuna', postedAt: j.created ? new Date(j.created) : new Date() }));
  } catch (e) { console.warn('[JobSearch] Adzuna failed:', e.message); return []; }
}

function jobMatchScore(job, profileText = '') {
  const haystack = `${job.title} ${job.company} ${(job.tags || []).join(' ')} ${job.location}`.toLowerCase();
  let score = 0;
  TARGET_ROLES.forEach(role => { if (haystack.includes(role)) score += 5; });
  TARGET_COMPANIES.forEach(kind => { if (haystack.includes(kind)) score += 1; });
  DEFAULT_TAGS.forEach(skill => { if (profileText.includes(skill) && haystack.includes(skill)) score += 2; });
  return score;
}

function isRelevantJob(job, query = '') {
  // Use the title as the primary signal. Feed tags are often broad and can
  // misclassify non-engineering roles (for example, a business role tagged
  // with "backend").
  const haystack = String(job.title || '').toLowerCase();
  const requested = query.toLowerCase().trim();
  if (requested && requested.split(/\s+/).some(term => term.length > 2 && haystack.includes(term))) return true;
  return TARGET_MARKERS.some(marker => haystack.includes(marker));
}

/**
 * Sync fresh jobs from APIs into MongoDB
 */
async function syncJobs(query = '', forceRefresh = false) {
  if (!forceRefresh) {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const count = await JobListing.countDocuments({ fetchedAt: { $gte: fourHoursAgo } });
    if (count > 0) return { count, fromCache: true };
  }

  const userTags = await getUserSkillTags();
  const searchQ = query || 'software engineer';

  const [remoteok, remotive, arbeitnow, muse, adzuna] = await Promise.all([
    fetchRemoteOK(userTags),
    fetchRemotive(searchQ),
    fetchArbeitnow(),
    fetchTheMuse(searchQ),
    fetchAdzuna(searchQ),
  ]);

  const allJobs = [...remoteok, ...remotive, ...arbeitnow, ...muse, ...adzuna].filter(j => isRelevantJob(j, query));
  if (allJobs.length === 0) return { count: 0, fromCache: false };

  // Deduplicate by URL or title+company
  const seen = new Set();
  const deduped = [];
  for (const j of allJobs) {
    const key = (j.url || `${j.title}-${j.company}`).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push({ ...j, newFlag: true, fetchedAt: new Date() });
    }
  }

  try {
    await JobListing.deleteMany({});
    await JobListing.insertMany(deduped);
    return { count: deduped.length, fromCache: false };
  } catch (e) {
    console.error('[JobSearch] Insert error:', e.message);
    return { count: deduped.length, fromCache: false };
  }
}

/**
 * Paginated database search over cached jobs
 */
async function searchJobsPaginated({ query = '', source = '', page = 1, limit = 10, forceRefresh = false }) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit) || 10));

  const sync = await syncJobs(query, forceRefresh);

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
    JobListing.find(filter).sort({ postedAt: -1, _id: -1 }).lean(),
    JobListing.distinct('source'),
  ]);

  const facts = await getAllFacts().catch(() => []);
  const documents = await JarvisDocument.find().sort({ uploadedAt: -1 }).limit(3).lean().catch(() => []);
  const profileText = `${facts.map(f => f.value).join(' ')} ${documents.map(d => d.content || '').join(' ')}`.toLowerCase();
  jobs.sort((a, b) => jobMatchScore(b, profileText) - jobMatchScore(a, profileText) || new Date(b.postedAt) - new Date(a.postedAt));
  const pageJobs = jobs.slice((p - 1) * l, p * l);
  const totalPages = Math.ceil(totalCount / l) || 1;

  return {
    jobs: pageJobs,
    pagination: {
      page: p,
      limit: l,
      totalCount,
      totalPages,
      hasNextPage: p < totalPages,
      hasPrevPage: p > 1,
    },
    sources: ['all', ...distinctSources],
    fromCache: sync.fromCache,
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
    fromCache: result.fromCache,
    total: result.pagination.totalCount,
  };
}

module.exports = {
  syncJobs,
  searchJobs,
  searchJobsPaginated,
  formatJobsForResponse,
};
