/**
 * Playwright Browser Automation Primitives for Jarvis AI
 * ─────────────────────────────────────────────────────────────────────────────
 * Enables headless browser rendering, JS execution, dynamic scraping (LinkedIn,
 * LeetCode, SPA sites, documentation), screenshot capture, and interactive DOM parsing.
 * Has graceful fallback to Cheerio / node-fetch if headless browser is unavailable.
 */

let playwright = null;
try {
  playwright = require('playwright');
} catch (e) {
  try {
    playwright = require('playwright-chromium');
  } catch (err) {
    console.log('[Playwright] Playwright package not natively loaded. Will attempt fallback or runtime launch.');
  }
}

const cheerio = require('cheerio');
const fetch = require('node-fetch');

let browserInstance = null;

/**
 * Launch or reuse singleton Playwright browser instance
 */
async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }
  if (!playwright) return null;

  try {
    browserInstance = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    console.log('[Playwright] Headless Chromium browser started');
    return browserInstance;
  } catch (err) {
    console.warn('[Playwright] Browser launch failed:', err.message);
    return null;
  }
}

/**
 * Scrape dynamic website with Playwright
 */
async function scrapeDynamicUrl(url, options = {}) {
  const timeout = options.timeout || 15000;
  const waitForSelector = options.waitForSelector || null;

  const browser = await getBrowser();
  if (browser) {
    let context = null;
    let page = null;
    try {
      context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
      });
      page = await context.newPage();

      await page.goto(url, { waitUntil: 'networkidle', timeout });

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 5000 }).catch(() => {});
      }

      const title = await page.title();
      const contentText = await page.evaluate(() => {
        // Remove scripts, styles, headers, footers for clean markdown text
        const scripts = document.querySelectorAll('script, style, noscript, nav, footer');
        scripts.forEach(s => s.remove());
        return document.body.innerText || '';
      });

      const cleanText = contentText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .slice(0, 10000);

      await page.close();
      await context.close();

      return {
        success: true,
        title,
        url,
        text: cleanText,
        engine: 'playwright',
      };
    } catch (err) {
      if (page) await page.close().catch(() => {});
      if (context) await context.close().catch(() => {});
      console.warn(`[Playwright] Dynamic scrape error for ${url}, trying fallback:`, err.message);
    }
  }

  // Fallback to static HTTP scrape if Playwright fails or isn't installed
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      timeout: 10000,
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    $('script, style, noscript, nav, footer').remove();

    const title = $('title').text() || url;
    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000);

    return {
      success: true,
      title,
      url,
      text,
      engine: 'cheerio-fallback',
    };
  } catch (err) {
    return {
      success: false,
      url,
      error: err.message,
    };
  }
}

/**
 * Capture page screenshot encoded as base64 (for vision models)
 */
async function capturePageScreenshot(url) {
  const browser = await getBrowser();
  if (!browser) return { success: false, error: 'Playwright browser not available' };

  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const screenshotBuffer = await page.screenshot({ fullPage: false, type: 'jpeg', quality: 75 });
    await page.close();
    await context.close();

    return {
      success: true,
      url,
      base64Image: screenshotBuffer.toString('base64'),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Shutdown Playwright browser on server exit
 */
async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}

module.exports = {
  scrapeDynamicUrl,
  capturePageScreenshot,
  closeBrowser,
};
