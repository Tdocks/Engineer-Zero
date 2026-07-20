#!/usr/bin/env node
/**
 * Hardened homepage readability QC — no Cursor browser MCP.
 * Uses Playwright with short timeouts; writes screenshots + JSON report.
 *
 * Usage: node scripts/qc-marketing-readability.mjs
 * Env:   BASE_URL (default http://127.0.0.1:3000)
 */
import { chromium, devices } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUT_DIR = join(process.cwd(), ".tmp", "marketing-qc");
const NAV_TIMEOUT_MS = 15_000;
const ACTION_TIMEOUT_MS = 8_000;
const OVERALL_MS = 90_000;

const SECTIONS = [
  { id: "nav", selector: ".marketing > nav", label: "Nav" },
  { id: "hero", selector: ".market-hero", label: "Hero" },
  { id: "paths", selector: "#paths", label: "Paths" },
  { id: "experience", selector: "#experience", label: "Experience" },
  { id: "tracks", selector: "#tracks", label: "Tracks" },
  { id: "method", selector: ".method", label: "Method" },
  { id: "footer", selector: ".market-footer", label: "Footer" },
];

const SAMPLE_SELECTORS = {
  nav: [".marketing > nav a:not(.brand)", ".marketing .nav-cta"],
  hero: [".market-hero h1", ".market-hero > .hero-copy > p", ".proof li", ".hero-primary"],
  paths: [".path-card b", ".path-card small", ".path-picker-model", ".path-picker-intro .eyebrow"],
  experience: ["#experience .eyebrow", "#experience h2", ".signal-list h3", ".signal-list p"],
  tracks: [
    ".public-tracks h3",
    ".public-tracks > article > p",
    ".public-tracks li",
    ".public-tracks li small",
    ".public-tracks header small",
    ".public-tracks footer a",
  ],
  method: [".method h2", ".method-copy p", ".method-copy .secondary"],
  footer: [".market-footer", ".market-footer span"],
};

function parsePx(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function parseLetterSpacing(value, fontSizePx) {
  if (!value || value === "normal") return 0;
  if (value.endsWith("em") && fontSizePx) return Number.parseFloat(value) * fontSizePx;
  if (value.endsWith("px")) return Number.parseFloat(value);
  return null;
}

async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function measureSelector(page, selector) {
  const loc = page.locator(selector).first();
  if ((await loc.count()) === 0) return { selector, missing: true };
  return loc.evaluate((el, sel) => {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      selector: sel,
      missing: false,
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || "").trim().slice(0, 80),
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      fontFamily: cs.fontFamily,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      minHeight: cs.minHeight,
      height: `${Math.round(rect.height)}px`,
      width: `${Math.round(rect.width)}px`,
    };
  }, selector);
}

function scoreSample(sample, role) {
  const fails = [];
  if (sample.missing) {
    fails.push("missing element");
    return fails;
  }
  const fontPx = parsePx(sample.fontSize);
  const heightPx = parsePx(sample.height);
  const minH = parsePx(sample.minHeight);
  const trackingPx = parseLetterSpacing(sample.letterSpacing, fontPx);
  const trackingEm = fontPx && trackingPx != null ? trackingPx / fontPx : null;

  if (role === "prose") {
    if (fontPx != null && fontPx < 17) fails.push(`prose ${fontPx}px < 17px`);
  }
  if (role === "label") {
    if (fontPx != null && fontPx < 13) fails.push(`label ${fontPx}px < 13px`);
  }
  if (role === "proof") {
    if (fontPx != null && fontPx < 15) fails.push(`proof ${fontPx}px < 15px`);
  }
  if (role === "heading" && trackingEm != null && trackingEm < -0.04) {
    fails.push(`tracking ${trackingEm.toFixed(3)}em < -0.04em`);
  }
  if (role === "cta") {
    const target = Math.max(heightPx || 0, minH || 0);
    if (target < 44) fails.push(`cta height ${target}px < 44px`);
  }
  return fails;
}

const ROLE_BY_SELECTOR = {
  ".market-hero > .hero-copy > p": "prose",
  ".signal-list p": "prose",
  ".method-copy p": "prose",
  ".public-tracks > article > p": "prose",
  ".path-picker-intro .eyebrow": "label",
  "#experience .eyebrow": "label",
  ".path-card small": "label",
  ".path-picker-model": "label",
  ".public-tracks li": "label",
  ".public-tracks li small": "label",
  ".public-tracks header small": "label",
  ".market-footer": "label",
  ".market-footer span": "label",
  ".proof li": "proof",
  ".market-hero h1": "heading",
  "#experience h2": "heading",
  ".method h2": "heading",
  ".public-tracks h3": "heading",
  ".signal-list h3": "heading",
  ".marketing .nav-cta": "cta",
  ".hero-primary": "cta",
  ".public-tracks footer a": "cta",
  ".method-copy .secondary": "cta",
};

async function qcViewport(browser, viewportName, viewport) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
  });
  context.setDefaultTimeout(ACTION_TIMEOUT_MS);
  context.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
  const page = await context.newPage();
  const sectionResults = [];

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("main.marketing", { timeout: NAV_TIMEOUT_MS });

  const shotPath = join(OUT_DIR, `${viewportName}-full.png`);
  await page.screenshot({ path: shotPath, fullPage: true });

  for (const section of SECTIONS) {
    const root = page.locator(section.selector).first();
    const present = (await root.count()) > 0;
    const fails = [];
    const samples = [];

    if (!present) {
      fails.push("section missing");
    } else {
      await root.scrollIntoViewIfNeeded();
      const sectionShot = join(OUT_DIR, `${viewportName}-${section.id}.png`);
      await root.screenshot({ path: sectionShot });

      for (const sel of SAMPLE_SELECTORS[section.id] || []) {
        const sample = await measureSelector(page, sel);
        const role = ROLE_BY_SELECTOR[sel] || "other";
        const sampleFails = scoreSample(sample, role);
        samples.push({ ...sample, role, fails: sampleFails });
        for (const f of sampleFails) fails.push(`${sel}: ${f}`);
      }

      if (section.id === "method") {
        const marker = page.locator(".method-marker");
        if ((await marker.count()) > 0) {
          const visible = await marker.evaluate((el) => getComputedStyle(el).display !== "none");
          if (visible) fails.push(".method-marker still visible (should be hidden for readability)");
        }
      }

      if (section.id === "hero") {
        const consoleAside = page.locator(".market-hero .mission-console");
        if ((await consoleAside.count()) > 0) {
          fails.push("mission-console still inside hero");
        }
      }

      if (viewport.width <= 430 && (section.id === "experience" || section.id === "method")) {
        const cols = await root.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
        const trackCount = (cols.match(/px|fr|%/g) || []).length;
        if (trackCount > 1 && !cols.includes("none")) {
          // single 1fr still one track; multi-column strings have multiple values
          const parts = cols.split(/\s+/).filter(Boolean);
          if (parts.length > 1) fails.push(`mobile still multi-column: ${cols}`);
        }
      }
    }

    sectionResults.push({
      id: section.id,
      label: section.label,
      pass: fails.length === 0,
      fails,
      samples,
    });
  }

  await context.close();
  return {
    viewport: viewportName,
    width: viewport.width,
    height: viewport.height,
    fullPageScreenshot: shotPath,
    sections: sectionResults,
  };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const started = Date.now();
  const browser = await chromium.launch({
    headless: true,
    timeout: NAV_TIMEOUT_MS,
  });

  try {
    const report = await withTimeout(
      (async () => {
        const desktop = await qcViewport(browser, "desktop", { width: 1280, height: 800 });
        const mobile = await qcViewport(browser, "mobile", { width: 390, height: 844 });
        return {
          baseUrl: BASE_URL,
          generatedAt: new Date().toISOString(),
          elapsedMs: Date.now() - started,
          viewports: [desktop, mobile],
        };
      })(),
      OVERALL_MS,
      "full marketing QC",
    );

    const allFails = [];
    for (const vp of report.viewports) {
      for (const section of vp.sections) {
        if (!section.pass) {
          for (const f of section.fails) allFails.push(`[${vp.viewport}/${section.id}] ${f}`);
        }
      }
    }
    report.pass = allFails.length === 0;
    report.failCount = allFails.length;
    report.failures = allFails;

    const reportPath = join(OUT_DIR, "report.json");
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`Marketing readability QC: ${report.pass ? "PASS" : "FAIL"}`);
    console.log(`Report: ${reportPath}`);
    console.log(`Screenshots: ${OUT_DIR}`);
    if (!report.pass) {
      for (const f of allFails) console.log(`  - ${f}`);
      process.exitCode = 1;
    }
  } finally {
    await browser.close().catch(() => {});
  }
}

// Fix syntax - I used invalid "async withTimeout" - need to fix the function declaration
main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
