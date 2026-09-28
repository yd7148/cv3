const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "public", "images", "projects");
fs.mkdirSync(outDir, { recursive: true });

const slides = [
  {
    file: "sic-yolo-detection.svg",
    hue: ["#6366f1", "#0ea5e9"],
    tag: "COMPUTER VISION",
    title: "SiC 晶圓表面 YOLO 缺陷檢測",
    sub: "MACHINE VISION / DEEP LEARNING",
    motif: "wafer"
  },
  {
    file: "sic-pilot-factory.svg",
    hue: ["#0ea5e9", "#22d3ee"],
    tag: "SMART MANUFACTURING",
    title: "SiC 第三代半導體試驗工廠",
    sub: "PROCESS INTEGRATION / YIELD",
    motif: "grid"
  },
  {
    file: "comsol-thermal.svg",
    hue: ["#a855f7", "#6366f1"],
    tag: "SIMULATION",
    title: "COMSOL 熱場模擬與散熱最佳化",
    sub: "THERMAL / FINITE ELEMENT",
    motif: "wave"
  },
  {
    file: "jetson-edge-ai.svg",
    hue: ["#22d3ee", "#a855f7"],
    tag: "EDGE AI",
    title: "NVIDIA Jetson 邊緣 AI 應用",
    sub: "Jetson / YOLO INFERENCE",
    motif: "chip"
  }
];

const motifs = {
  wafer: (a, b) => `
    <g opacity="0.85">
      ${Array.from({ length: 7 }, (_, i) => {
        const o = 30 + i * 30;
        return `<circle cx="300" cy="300" r="${o}" fill="none" stroke="${b}" stroke-opacity="${0.5 - i * 0.05}" stroke-width="1.5"/>
        <line x1="${300 - o}" y1="300" x2="${300 + o}" y2="300" stroke="${b}" stroke-opacity="0.18"/>
        <line x1="300" y1="${300 - o}" x2="300" y2="${300 + o}" stroke="${b}" stroke-opacity="0.18"/>`;
      }).join("")}
      <rect x="252" y="252" width="96" height="96" fill="${a}" fill-opacity="0.16" stroke="${a}"/>
      <rect x="272" y="272" width="16" height="16" fill="${a}" fill-opacity="0.9"/>
      <rect x="312" y="296" width="10" height="10" fill="${b}" fill-opacity="0.9"/>
      <rect x="278" y="312" width="8" height="8" fill="#f472b6" fill-opacity="0.85"/>
    </g>`,
  grid: (a, b) => `
    <g opacity="0.8">
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${60 + i * 62}" y="150" width="46" height="300" fill="${i % 2 ? a : b}" fill-opacity="0.14" stroke="${i % 2 ? a : b}" stroke-opacity="0.35"/>`).join("")}
    <path d="M40 420 L500 250" stroke="${a}" stroke-width="2" fill="none" stroke-opacity="0.6"/>
    <path d="M40 470 L500 300" stroke="${b}" stroke-width="2" fill="none" stroke-opacity="0.45"/>
    <path d="M40 380 L500 360" stroke="#f59e0b" stroke-width="1.5" fill="none" stroke-opacity="0.5" stroke-dasharray="6 6"/>
    </g>`,
  wave: (a, b) => `
    <g opacity="0.85" fill="none" stroke-width="2">
    ${Array.from({ length: 12 }, (_, i) => {
      const y = 160 + i * 34;
      const amp = 40 - i * 2;
      return `<path d="M30 ${y} C 140 ${y - amp}, 200 ${y + amp}, 320 ${y} S 470 ${y - amp}, 570 ${y}" stroke="${i % 3 === 0 ? a : b}" stroke-opacity="${0.75 - i * 0.05}"/>`;
    }).join("")}
    </g>
    <rect x="230" y="230" width="140" height="100" fill="#0b1020" fill-opacity="0.7" stroke="${a}"/>
    <text x="300" y="290" font-family="monospace" font-size="34" fill="#e2e8f0" text-anchor="middle">72.4&#176;C</text>`,
  chip: (a, b) => `
    <g opacity="0.9">
      <rect x="220" y="200" width="200" height="200" rx="8" fill="#0b1020" stroke="${a}" stroke-width="2"/>
      <rect x="255" y="235" width="130" height="130" rx="4" fill="${a}" fill-opacity="0.12" stroke="${b}"/>
      <text x="320" y="305" font-family="monospace" font-size="26" fill="#e2e8f0" text-anchor="middle">Jetson</text>
      ${Array.from({ length: 7 }, (_, i) => `<line x1="${240 + i * 20}" y1="200" x2="${240 + i * 20}" y2="170" stroke="${b}" stroke-width="2"/>
      <line x1="${240 + i * 20}" y1="400" x2="${240 + i * 20}" y2="430" stroke="${b}" stroke-width="2"/>
      <line x1="220" y1="${220 + i * 20}" x2="190" y2="${220 + i * 20}" stroke="${b}" stroke-width="2"/>
      <line x1="420" y1="${220 + i * 20}" x2="450" y2="${220 + i * 20}" stroke="${b}" stroke-width="2"/>`).join("")}
    </g>`
};

for (const s of slides) {
  const [a, b] = s.hue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="${s.title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0f1e"/>
      <stop offset="55%" stop-color="#111a33"/>
      <stop offset="100%" stop-color="#060a15"/>
    </linearGradient>
    <linearGradient id="ttl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <pattern id="p" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M30 0H0V30" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <rect width="600" height="600" fill="url(#p)"/>
  <rect x="0" y="0" width="600" height="6" fill="url(#ttl)"/>
  ${motifs[s.motif](a, b)}
  <g font-family="'Segoe UI',system-ui,sans-serif">
    <rect x="40" y="40" width="${s.tag.length * 8.6 + 26}" height="24" fill="${a}" fill-opacity="0.16" stroke="${a}" stroke-opacity="0.5"/>
    <text x="53" y="57" font-size="13" letter-spacing="2" fill="${b}">${s.tag}</text>
    <text x="40" y="524" font-size="27" font-weight="700" fill="#f1f5f9">${s.title}</text>
    <text x="40" y="552" font-family="monospace" font-size="14" letter-spacing="1.6" fill="#94a3b8">${s.sub}</text>
  </g>
</svg>
`;
  fs.writeFileSync(path.join(outDir, s.file), svg, "utf8");
  console.log("wrote", s.file);
}
