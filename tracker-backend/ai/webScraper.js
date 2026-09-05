/**
 * Web Search & Scraper — Live Internet Retrieval Engine
 * ─────────────────────────────────────────────────────────────
 * Enables Jarvis to answer ANY question with live web data:
 *  - General Web Search via DuckDuckGo HTML / SearXNG / Tech News
 *  - Detailed Web Page Scraping (LinkedIn, LeetCode, GitHub, Docs, News)
 *  - Caches results in-memory and injects them into vector memory
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const vectorStore = require('./vectorStore');
const assistantCache = require('../services/assistantCache');

const scrapeCache = new Map();
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours
const FETCH_TIMEOUT = 8000;
const inflight = new Map();

/**
 * Perform live web search using DuckDuckGo HTML Lite (no API key required)
 */
async function searchWeb(query, maxResults = 5) {
  try {
    const cacheKey = `jarvis:web:${query.toLowerCase().trim()}:${maxResults}`;
    const cached = await assistantCache.get(cacheKey);
    if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached;
    if (inflight.has(cacheKey)) return inflight.get(cacheKey);
    const work = searchWebUncached(query, maxResults, cacheKey).finally(() => inflight.delete(cacheKey));
    inflight.set(cacheKey, work);
    return await work;
  } catch (err) {
    console.warn(`[WebSearch] Search error for "${query}":`, err.message);
    return [];
  }
}

async function searchWebUncached(query, maxResults, cacheKey) {
    const encoded = encodeURIComponent(query);
    const searchUrl = `https://html.google.com/html/?q=${encoded}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: FETCH_TIMEOUT,
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('.result').each((i, el) => {
      if (results.length >= maxResults) return false;
      const titleEl = $(el).find('.result__title a');
      const title = titleEl.text().trim();
      let rawLink = titleEl.attr('href') || '';
      
      // Clean up DuckDuckGo redirect link if necessary
      if (rawLink.includes('uddg=')) {
        try {
          const match = rawLink.match(/uddg=([^&]+)/);
          if (match) rawLink = decodeURIComponent(match[1]);
        } catch (e) {}
      }

      const snippet = $(el).find('.result__snippet').text().trim();

      if (title && snippet) {
        results.push({
          title,
          url: rawLink,
          snippet,
        });
      }
    });

    // If results found, also inject into vector memory for contextual queries
    if (results.length > 0) {
      const memoryText = results.map(r => `[Web Search: ${r.title}]\nSnippet: ${r.snippet}\nLink: ${r.url}`).join('\n\n');
      vectorStore.addChunk({
        id: `websearch-${Buffer.from(cacheKey).toString('base64url').slice(0, 80)}`,
        text: `Web Search Results for "${query}":\n${memoryText}`,
        metadata: { type: 'web_search', query, date: new Date().toISOString() },
      });
    }

    await assistantCache.set(cacheKey, JSON.stringify(results), 600);
    return results;
}

/**
 * Format web search results for AI synthesis
 */
function formatSearchResults(query, results) {
  if (!results || results.length === 0) {
    return `No live web search results found for "${query}".`;
  }
  return `🌐 **Live Web Search Results for "${query}":**\n\n` +
    results.map((r, i) => `**${i + 1}. [${r.title}](${r.url})**\n${r.snippet}`).join('\n\n');
}

/**
 * Detect URL category
 */
function detectUrlType(url) {
  if (url.includes('linkedin.com/jobs')) return 'linkedin_job';
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('naukri.com')) return 'naukri_job';
  if (url.includes('leetcode.com/problems')) return 'leetcode';
  if (url.includes('glassdoor.com')) return 'glassdoor';
  if (url.includes('indeed.com')) return 'indeed_job';
  if (url.includes('github.com')) return 'github';
  return 'general';
}

/**
 * Extract clean text content from HTML
 */
function extractPageContent($, urlType) {
  $('script, style, nav, header, footer, .cookie, .ad, .advertisement, [class*="cookie"], [class*="popup"], [class*="banner"]').remove();

  switch (urlType) {
    case 'linkedin_job':
    case 'naukri_job':
    case 'indeed_job': {
      const title = $('h1').first().text().trim() || $('[class*="job-title"]').first().text().trim();
      const company = $('[class*="company"]').first().text().trim() || $('[class*="employer"]').first().text().trim();
      const location = $('[class*="location"]').first().text().trim();
      const description = $('[class*="description"]').first().text().trim() || $('main').text().trim();
      return {
        title, company, location,
        description: description.slice(0, 3000),
        type: 'job_description',
      };
    }

    case 'leetcode': {
      const title = $('h4, h3, [class*="title"]').first().text().trim();
      const difficulty = $('[class*="difficulty"]').first().text().trim();
      const problem = $('[class*="content"]').first().text().trim() || $('[data-cy="question-content"]').text().trim();
      return {
        title, difficulty,
        description: problem.slice(0, 2000),
        type: 'leetcode_problem',
      };
    }

    case 'github': {
      const repoName = $('[itemprop="name"]').text().trim() || $('h1').text().trim();
      const description = $('[itemprop="description"]').text().trim() || $('[class*="description"]').first().text().trim();
      const readme = $('[id="readme"]').text().trim().slice(0, 2000);
      return { title: repoName, description, readme, type: 'github_repo' };
    }

    default: {
      const title = $('title').text().trim() || $('h1').first().text().trim();
      const meta = $('meta[name="description"]').attr('content') || '';
      const body = $('main, article, [class*="content"], body').first().text()
        .replace(/\s+/g, ' ').trim().slice(0, 3000);
      return { title, description: meta, body, type: 'webpage' };
    }
  }
}

/**
 * Scrape a specific URL
 */
async function scrapeUrl(url) {
  const cached = scrapeCache.get(url);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: FETCH_TIMEOUT,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const urlType = detectUrlType(url);
    const content = extractPageContent($, urlType);

    const result = {
      url,
      urlType,
      fetchedAt: Date.now(),
      success: true,
      ...content,
    };

    scrapeCache.set(url, result);

    const chunkText = `[Web Scrape: ${url}]\nType: ${urlType}\nTitle: ${content.title || ''}\nDescription: ${content.description || ''}\nBody: ${content.body || content.description || ''}`;
    vectorStore.addChunk({
      id: `scrape-${Buffer.from(url).toString('base64url').slice(0, 90)}`,
      text: chunkText,
      metadata: { type: 'web_scrape', url, urlType, date: new Date().toISOString() },
    });

    return result;
  } catch (err) {
    console.error(`[Scraper] Error scraping ${url}:`, err.message);
    return { url, success: false, error: err.message, type: 'error', fetchedAt: Date.now() };
  }
}

function formatScrapeResult(result) {
  if (!result.success) {
    return `❌ Could not scrape ${result.url}: ${result.error}.`;
  }

  switch (result.type) {
    case 'job_description':
      return `🔍 **Job Posting from ${result.url}**\n\n` +
        `**Role**: ${result.title || 'N/A'}\n` +
        `**Company**: ${result.company || 'N/A'}\n` +
        `**Location**: ${result.location || 'N/A'}\n\n` +
        `**Overview**:\n${result.description?.slice(0, 800) || 'N/A'}`;

    case 'leetcode_problem':
      return `💻 **LeetCode: ${result.title}** (${result.difficulty || 'Problem'})\n\n${result.description?.slice(0, 600) || 'N/A'}`;

    case 'github_repo':
      return `📦 **GitHub Repository: ${result.title}**\n\n${result.description}\n\n${result.readme?.slice(0, 500) || ''}`;

    default:
      return `🌐 **Page Summary: ${result.title || result.url}**\n\n${result.description || ''}\n\n${(result.body || '').slice(0, 600)}`;
  }
}

function extractUrls(text) {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
  return text.match(urlRegex) || [];
}

module.exports = { searchWeb, formatSearchResults, scrapeUrl, formatScrapeResult, extractUrls, detectUrlType };
