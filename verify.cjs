const { chromium } = require("playwright");
const { piiProbes } = require("./scripts/pii.cjs");

const PII_PROBES = piiProbes();
const path = require("path");
const fs = require("fs");

const BASE = process.env.BASE || "http://localhost:4323";
const OUT = path.join(__dirname, "shots");

const targets = [
  { slug: "v3-zh-home", url: "/zh/", full: true, schemes: ["light", "dark"] },
  { slug: "v3-en-home", url: "/en/", full: true, schemes: ["light"] },
  { slug: "v3-zh-works", url: "/zh/works/", full: false, schemes: ["light", "dark"] },
  { slug: "v3-zh-work", url: "/zh/works/sic-wafer-yolo/", full: true, schemes: ["light"] },
  { slug: "v3-zh-resume", url: "/zh/resume/", full: true, schemes: ["light"] },
  { slug: "v3-zh-about", url: "/zh/about/", full: false, schemes: ["light"] },
  { slug: "v3-zh-note", url: "/zh/notes/edge-vs-cloud/", full: false, schemes: ["light"] },
  { slug: "v3-zh-contact", url: "/zh/contact/", full: false, schemes: ["light"] },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const report = [];

  for (const t of targets) {
    for (const scheme of t.schemes) {
      const ctx = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        colorScheme: scheme,
        locale: "zh-TW",
      });
      const page = await ctx.newPage();
      const errs = [];
      page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
      page.on("pageerror", (e) => errs.push(String(e)));
      const resp = await page.goto(BASE + t.url, { waitUntil: "networkidle" });
      await page.waitForTimeout(900);
      // force all reveal animations to their end state
      await page.evaluate(() =>
        document.querySelectorAll(".reveal").forEach((e) => e.classList.add("visible"))
      );
      await page.waitForTimeout(500);
      const name = scheme === "light" ? t.slug : t.slug + "-dark";
      await page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: t.full, scale: "css" });
      report.push({
        page: t.url,
        scheme,
        status: resp.status(),
        hOverflow: await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        ),
        errors: errs.length,
        firstError: errs[0] || null,
      });
      await ctx.close();
    }
  }

  // mobile
  const mc = await browser.newContext({ viewport: { width: 375, height: 780 }, locale: "zh-TW" });
  const mp = await mc.newPage();
  await mp.goto(BASE + "/zh/", { waitUntil: "networkidle" });
  await mp.waitForTimeout(700);
  await mp.evaluate(() =>
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("visible"))
  );
  await mp.waitForTimeout(400);
  await mp.screenshot({ path: path.join(OUT, "v3-zh-home-mobile.png"), fullPage: true, scale: "css" });
  report.push({
    page: "/zh/ 375px",
    hOverflow: await mp.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    ),
  });
  await mc.close();

  // interactions: theme toggle, carousel, anchor, privacy, print
  const ic = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
  const ip = await ic.newPage();
  await ip.goto(BASE + "/zh/", { waitUntil: "networkidle" });

  // the reference hides the checkbox (opacity:0;width:0), so drive the label
  const themeBefore = await ip.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await ip.locator("label.switch").click();
  await ip.waitForTimeout(500);
  const themeAfter = await ip.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await ip.locator("label.switch").click();
  await ip.waitForTimeout(400);

  // carousel
  const cBefore = await ip.evaluate(() => document.querySelector("[data-current]")?.textContent);
  await ip.locator("[data-next]").click();
  await ip.waitForTimeout(900);
  const cAfter = await ip.evaluate(() => document.querySelector("[data-current]")?.textContent);
  const slideActive = await ip.evaluate(() => {
    const s = [...document.querySelectorAll("[data-slide]")];
    return s.findIndex((e) => e.style.opacity === "1");
  });

  // anchor nav
  await ip.locator('a.nav-link[href="#projects"]:visible').first().click();
  await ip.waitForTimeout(900);
  const anchor = await ip.evaluate(() => {
    const el = document.getElementById("projects");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), inViewport: r.top < innerHeight && r.bottom > 0 };
  });
  const activeLink = await ip.evaluate(
    () => document.querySelector(".nav-link.active")?.textContent?.trim() ?? null
  );

  // privacy: homepage must contain no PII
  const piiOnHome = await ip.evaluate(() => document.querySelectorAll("[data-pii]").length);
  const piiText = await ip.evaluate(
    (probes) => probes.filter((k) => document.documentElement.outerHTML.includes(k)),
    PII_PROBES
  );

  // hamburger / overlay
  await ip.setViewportSize({ width: 480, height: 800 });
  await ip.waitForTimeout(300);
  await ip.locator("#menu-open-btn").click();
  await ip.waitForTimeout(600);
  const overlayOpen = await ip.evaluate(() => {
    const o = document.getElementById("overlay-menu");
    return o.classList.contains("open") && o.getAttribute("aria-hidden") === "false";
  });
  await ip.screenshot({ path: path.join(OUT, "v3-overlay-mobile.png"), scale: "css" });
  await ic.close();

  // resume print
  const rc = await browser.newContext({ viewport: { width: 1000, height: 1300 } });
  const rp = await rc.newPage();
  await rp.goto(BASE + "/zh/resume/", { waitUntil: "networkidle" });
  const piiScreen = await rp.evaluate(() => {
    const el = document.querySelector("[data-pii]");
    return el ? getComputedStyle(el).color : "none";
  });
  await rp.emulateMedia({ media: "print" });
  const piiPrint = await rp.evaluate(() => {
    const els = Array.from(document.querySelectorAll("[data-pii]"));
    return {
      n: els.length,
      colors: Array.from(new Set(els.map((e) => getComputedStyle(e).color))),
    };
  });
  await rp.pdf({ path: path.join(OUT, "v3-resume-A4.pdf"), format: "A4", printBackground: true });
  await rc.close();

  await browser.close();
  console.log(
    JSON.stringify(
      {
        report,
        themeBefore,
        themeAfter,
        carousel: { before: cBefore, after: cAfter, activeSlide: slideActive },
        anchor,
        activeLink,
        piiFieldsOnHome: piiOnHome,
        piiTextOnHome: piiText,
        overlayOpen,
        piiScreenOnResume: piiScreen,
        piiPrint,
      },
      null,
      2
    )
  );
})();
