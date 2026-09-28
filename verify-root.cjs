const { chromium } = require("playwright");
const { piiProbes } = require("./scripts/pii.cjs");
(async () => {
  const b = await chromium.launch();
  const report = [];
  for (const [w, h, tag] of [[1280, 900, "desktop"], [768, 1024, "tablet"], [390, 844, "mobile"]]) {
    const c = await b.newContext({ viewport: { width: w, height: h } });
    const p = await c.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push("PE:" + e.message));
    p.on("console", (m) => {
      if (m.type() === "error") errs.push(m.text());
    });
    p.on("response", (r) => {
      if (r.status() >= 400) errs.push(r.status() + " " + r.url());
    });
    await p.goto("http://localhost:4323/", { waitUntil: "networkidle" });
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `shots/bi-${tag}-full.png`, fullPage: true, scale: "css" });
    if (tag !== "mobile") await p.screenshot({ path: `shots/bi-${tag}-fold.png`, scale: "css" });
    const over = await p.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    const pii = await p.evaluate((probes) => {
      const t = document.body.innerText;
      return probes.filter((h) => t.includes(h));
    }, piiProbes());
    report.push({ tag, over, errors: errs, pii });
    await c.close();
  }
  // light theme + theme persistence
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage();
  await p.goto("http://localhost:4323/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.click("label.switch .slider");
  await p.waitForTimeout(500);
  const themeAfter = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await p.screenshot({ path: "shots/bi-light.png", scale: "css" });
  report.push({ themeAfter });
  // language links
  await p.click('a[hreflang="zh-Hant-TW"]');
  await p.waitForLoadState("networkidle");
  report.push({ zhLink: p.url() });
  await b.close();
  console.log(JSON.stringify(report, null, 1));
})();
