/**
 * buildpc.store — Pinterest Pin Scheduler (Pins #20 → #100)
 * ===========================================================================
 *
 *  1. MASTER IMAGE ENGINE
 *     - Finds  ~/Downloads/Gemini_Generated_Image_w3ecvww3ecvww3ec*.jpg
 *     - Uses Puppeteer (headless canvas) to crop/format every master into an
 *       exact 1000x1500 (2:3) template in  assets/master_templates_flawless/
 *     - Crops away the bottom price-badge strip of the source AND paints a
 *       clean "VERIFIED EXPERT GUIDE — UNBIASED PARTS & SPECS" banner over the
 *       bottom sales area, so no $ badge can ever survive.
 *     - Each master is tagged as  case | gpu | cpu  in master_map.json.
 *       Full PC builds -> case masters, GPU VS -> gpu masters, CPU VS -> cpu.
 *     - A per-pin image (template + headline) is rendered to assets/pins/.
 *
 *  2. TITLES / DESCRIPTIONS
 *     - Every title is validated to be strictly < 85 characters.
 *     - Descriptions carry hashtags (kept under Pinterest's 500-char limit).
 *     - Links: https://buildpc.store/?utm_source=Pinterest&utm_medium=organic&pin=X
 *
 *  3. AUTOMATION
 *     - Non-headless Chrome, asks you to log in to Pinterest first
 *       (session is remembered in ./.pinterest-chrome-profile).
 *     - Resumes at START_FROM_PIN = 20 through 100, skipping any pin already
 *       recorded as scheduled in pinterest_progress.json (safe re-runs).
 *     - 30-minute staggered slots starting at the next free half-hour.
 *     - Verifies the red "Schedule" button was clicked and confirmed, waits
 *       7 seconds for Pinterest to save, then closes the tab (no RAM leaks).
 *
 *  USAGE (PowerShell):
 *     node pinterest_automation.js --prepare     # only build templates + pin images
 *     node pinterest_automation.js --dry-run     # print the queue, no browser
 *     node pinterest_automation.js               # full run (prepare + schedule)
 *     node pinterest_automation.js --start=35    # manual override of the start pin
 *
 *  Works whether your package.json is "type": "module" or CommonJS
 *  (only dynamic import() is used — no require / import statements).
 */

// ============================================================================
// CONFIG
// ============================================================================
const START_FROM_PIN = 20;
const END_AT_PIN = 100;
const INTERVAL_MINUTES = 30;
const MIN_LEAD_MINUTES = 60;            // first slot is at least this far in the future
const SAVE_WAIT_MS = 7000;              // wait after Schedule is confirmed
const MAX_TITLE_LEN = 84;               // strictly UNDER 85
const MAX_DESC_LEN = 500;

const SITE_URL = 'https://buildpc.store';
// Optional per-category landing paths (keep '/' if you have no dedicated pages)
const DEST_PATH = { build: '/', gpu: '/', cpu: '/' };

const BOARD_NAME = process.env.PIN_BOARD || 'PC Build Guides';
const DATE_FORMAT = process.env.PIN_DATE_FORMAT || 'MM/DD/YYYY'; // how Pinterest's date box expects it
const PIN_BUILDER_URL = 'https://www.pinterest.com/pin-creation-tool/';

const MASTER_PREFIX = 'Gemini_Generated_Image_w3ecvww3ecvww3ec';
const BADGE_CROP_RATIO = Number(process.env.BADGE_CROP_RATIO || 0.18); // bottom % of source removed
const OUT_W = 1000;
const OUT_H = 1500;
const BANNER_H = 190;
const BANNER_TEXT = 'VERIFIED EXPERT GUIDE — UNBIASED PARTS & SPECS';
const BRAND_LINE = 'buildpc.store  •  Independent PC build research';

// ============================================================================
// PIN DATA (1–100; pins 1–19 are already live and are kept for numbering)
// ============================================================================
const BUILDS = [
  ['$500', 'Budget Gaming'], ['$600', '1080p Esports'], ['$700', '1080p Gaming'],
  ['$800', 'Streaming Starter'], ['$900', '1080p High-Refresh'], ['$1,000', '1440p Gaming'],
  ['$1,100', 'White Aesthetic'], ['$1,200', '1440p Gaming'], ['$1,300', 'Small Form Factor'],
  ['$1,400', 'Streaming & Gaming'], ['$1,500', '1440p Ultra'], ['$1,600', 'Video Editing'],
  ['$1,750', 'High-End Gaming'], ['$1,800', 'Content Creator'], ['$2,000', '4K Gaming'],
  ['$2,100', 'RGB Showcase'], ['$2,200', 'AI & Machine Learning'], ['$2,500', '4K Ultra Gaming'],
  ['$3,000', 'Ultimate Enthusiast'], ['$3,500', 'Workstation'], ['$4,000', 'Dream'],
  ['$650', 'Student'], ['$750', 'Quiet Office & Gaming'], ['$850', 'All-AMD'],
  ['$950', 'Intel Gaming'], ['$1,050', 'Mini-ITX'], ['$1,150', 'Black & Wood Aesthetic'],
  ['$1,250', 'Fortnite & Valorant'], ['$1,350', '3D Rendering'], ['$1,450', 'Silent'],
  ['$1,650', 'Sim Racing'], ['$1,900', 'Ultrawide Gaming'], ['$2,300', 'Blender Workstation'],
  ['$2,750', 'White 4K Gaming'],
];

const GPU_VS = [
  ['RTX 5090', 'RTX 4090'], ['RTX 5080', 'RTX 4080 Super'], ['RTX 5070 Ti', 'RX 9070 XT'],
  ['RTX 5070', 'RX 9070'], ['RTX 5060 Ti 16GB', 'RX 9060 XT 16GB'], ['RTX 5060', 'Arc B580'],
  ['RX 9070 XT', 'RTX 5080'], ['RTX 5070', 'RTX 4070 Super'], ['RX 9060 XT', 'RTX 4060 Ti'],
  ['Arc B580', 'RTX 4060'], ['Arc B570', 'RX 7600'], ['RTX 5080', 'RX 7900 XTX'],
  ['RTX 5070 Ti', 'RTX 4070 Ti Super'], ['RX 9070', 'RX 7800 XT'], ['RTX 5060 Ti 8GB', 'RTX 5060 Ti 16GB'],
  ['RTX 5090', 'RTX 5080'], ['RX 7900 GRE', 'RTX 5070'], ['RTX 3060 12GB', 'RTX 5060'],
  ['RX 6600', 'Arc B570'], ['RTX 4060', 'RX 7600 XT'], ['RTX 5070', 'RX 9070 XT'],
  ['RTX 5060', 'RX 9060 XT 8GB'], ['RX 9070 XT', 'RX 7900 XT'], ['RTX 5070 Ti', 'RTX 5080'],
  ['RTX 4070', 'RX 7700 XT'], ['Arc B580', 'RX 9060 XT'], ['RTX 5060 Ti', 'RTX 4060 Ti'],
  ['RTX 5090', 'RX 7900 XTX'], ['RTX 3080', 'RTX 5070'], ['RTX 2070 Super', 'RTX 5060'],
  ['RX 6700 XT', 'RX 9060 XT'], ['RTX 4080 Super', 'RX 9070 XT'], ['RTX 5070', 'RTX 3070'],
];

const CPU_VS = [
  ['Ryzen 7 9800X3D', 'Ryzen 7 7800X3D'], ['Ryzen 7 9800X3D', 'Core Ultra 9 285K'],
  ['Ryzen 9 9950X3D', 'Ryzen 9 9950X'], ['Ryzen 5 9600X', 'Core Ultra 5 245K'],
  ['Ryzen 7 9700X', 'Core Ultra 7 265K'], ['Ryzen 5 7600X', 'Core i5-14600K'],
  ['Core i7-14700K', 'Ryzen 7 9700X'], ['Ryzen 9 9900X', 'Core Ultra 9 285K'],
  ['Ryzen 5 9600', 'Ryzen 5 7600'], ['Ryzen 7 7700', 'Core i5-14600K'],
  ['Ryzen 9 9950X3D', 'Core Ultra 9 285K'], ['Ryzen 5 5600X', 'Core i5-12400F'],
  ['Ryzen 7 5700X3D', 'Ryzen 5 7600'], ['Core i5-14400F', 'Ryzen 5 7600'],
  ['Core Ultra 7 265K', 'Core i7-14700K'], ['Ryzen 9 7950X3D', 'Ryzen 9 9950X3D'],
  ['Ryzen 7 9800X3D', 'Ryzen 9 9950X3D'], ['Ryzen 5 8600G', 'Ryzen 5 5600G'],
  ['Ryzen 7 8700G', 'Ryzen 5 9600X'], ['Core i9-14900K', 'Core Ultra 9 285K'],
  ['Ryzen 5 9600X', 'Ryzen 5 7600X'], ['Ryzen 7 9700X', 'Ryzen 7 7700X'],
  ['Core Ultra 5 245K', 'Core i5-14600K'], ['Ryzen 5 5600', 'Ryzen 5 7500F'],
  ['Ryzen 7 5800X3D', 'Ryzen 7 7800X3D'], ['Core i3-14100F', 'Ryzen 5 5600'],
  ['Ryzen 9 9900X3D', 'Ryzen 7 9800X3D'], ['Core i5-13400F', 'Ryzen 5 5600X'],
  ['Core i7-14700K', 'Ryzen 7 9800X3D'], ['Ryzen 5 7600', 'Core Ultra 5 225'],
  ['Ryzen 9 7900', 'Core Ultra 7 265K'], ['Ryzen 7 7800X3D', 'Core i9-14900K'],
  ['Ryzen 5 9600X', 'Ryzen 7 9700X'],
];

const CATEGORY_ROLE = { build: 'case', gpu: 'gpu', cpu: 'cpu' };
const CATEGORY_CHIP = { build: 'FULL PC BUILD GUIDE', gpu: 'GPU SHOWDOWN', cpu: 'CPU SHOWDOWN' };

function hashtag(s) { return '#' + s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

function brandTags(names) {
  const t = new Set();
  for (const n of names) {
    if (/^RTX|^GTX/i.test(n)) { t.add('#nvidia'); t.add('#geforce'); }
    if (/^RX/i.test(n)) { t.add('#amd'); t.add('#radeon'); }
    if (/^Arc/i.test(n)) { t.add('#intelarc'); }
    if (/^Ryzen/i.test(n)) { t.add('#amd'); t.add('#ryzen'); }
    if (/^Core/i.test(n)) { t.add('#intel'); }
  }
  return [...t];
}

function fitTitle(candidates) {
  for (const c of candidates) if (c.length <= MAX_TITLE_LEN) return c;
  // hard fallback: cut on a word boundary
  let t = candidates[candidates.length - 1];
  while (t.length > MAX_TITLE_LEN) t = t.slice(0, t.lastIndexOf(' '));
  return t;
}

function fitDescription(body, tags) {
  const list = [...new Set(tags)];
  let d = `${body}\n\n${list.join(' ')}`;
  while (d.length > MAX_DESC_LEN && list.length > 3) { list.pop(); d = `${body}\n\n${list.join(' ')}`; }
  return d.slice(0, MAX_DESC_LEN);
}

function buildPins() {
  const pins = [];
  let b = 0, g = 0, c = 0;
  for (let n = 1; n <= 100; n++) {
    const cat = ['build', 'gpu', 'cpu'][(n - 1) % 3];
    let title, body, tags;
    if (cat === 'build') {
      const [budget, use] = BUILDS[b++];
      title = fitTitle([
        `The ${budget} ${use} PC Build (2026): Full Parts List & Specs`,
        `${budget} ${use} PC Build (2026): Full Parts List & Specs`,
        `${budget} ${use} PC Build (2026): Parts List`,
        `${budget} ${use} PC Build Guide`,
      ]);
      body = `Planning a ${budget} ${use.toLowerCase()} PC? This verified expert guide walks through every part — CPU, GPU, motherboard, RAM, storage, PSU and case — with unbiased picks, compatibility checks and realistic performance expectations. Save this pin for your next build and tap through for the full parts list.`;
      tags = ['#pcbuild', '#gamingpc', '#pcbuilding', '#custompc', '#pcgaming', '#pcsetup', '#buildapc', '#pcparts', '#techtips'];
    } else if (cat === 'gpu') {
      const [x, y] = GPU_VS[g++];
      title = fitTitle([
        `${x} vs ${y} (2026): Real Benchmarks & Which GPU to Buy`,
        `${x} vs ${y}: Which GPU Should You Buy in 2026?`,
        `${x} vs ${y}: 2026 GPU Comparison`,
        `${x} vs ${y}`,
      ]);
      body = `${x} vs ${y} — which graphics card is the smarter buy in 2026? This unbiased expert comparison covers real-game FPS at 1080p, 1440p and 4K, ray tracing, upscaling, VRAM, power draw and price-to-performance so you can choose the right GPU for your build. Save it for your next upgrade.`;
      tags = [hashtag(x), hashtag(y), '#gpu', '#graphicscard', ...brandTags([x, y]), '#pcbuild', '#gamingpc', '#pcgaming'];
    } else {
      const [x, y] = CPU_VS[c++];
      title = fitTitle([
        `${x} vs ${y} (2026): Benchmarks & Which CPU to Buy`,
        `${x} vs ${y}: Which CPU Should You Buy in 2026?`,
        `${x} vs ${y}: 2026 CPU Comparison`,
        `${x} vs ${y}`,
      ]);
      body = `${x} vs ${y} — which processor should power your next PC? This unbiased expert comparison breaks down gaming FPS, multi-core productivity, platform and upgrade path, thermals, power draw and real value so you can buy with confidence. Save this pin before you pick your CPU.`;
      tags = [hashtag(x), hashtag(y), '#cpu', '#processor', ...brandTags([x, y]), '#pcbuild', '#gamingpc', '#pcbuilding'];
    }
    const link = `${SITE_URL}${DEST_PATH[cat]}?utm_source=Pinterest&utm_medium=organic&pin=${n}`;
    pins.push({ n, cat, role: CATEGORY_ROLE[cat], title, description: fitDescription(body, tags), link });
  }
  return pins;
}

// ============================================================================
// UTILITIES (CJS/ESM-agnostic: everything loaded via dynamic import)
// ============================================================================
let fs, fsp, path, os, readline, puppeteer;
let rl;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toLocaleTimeString()}]`, ...a);
const pad3 = (n) => String(n).padStart(3, '0');
const SANDBOX_ARGS = process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []; // only needed when running as Linux root
const SELECT_ALL_KEY = process.platform === 'darwin' ? 'Meta' : 'Control';

function ask(q) { return new Promise((res) => rl.question(q, (a) => res((a || '').trim()))); }

function argValue(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : undefined;
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

const ROOT = process.cwd();
const TEMPLATE_DIR = () => path.join(ROOT, 'assets', 'master_templates_flawless');
const PIN_IMG_DIR = () => path.join(ROOT, 'assets', 'pins');
const PROGRESS_FILE = () => path.join(ROOT, 'pinterest_progress.json');
const PROFILE_DIR = () => path.join(ROOT, '.pinterest-chrome-profile');

async function readJson(file, fallback) {
  try { return JSON.parse(await fsp.readFile(file, 'utf8')); } catch { return fallback; }
}
async function writeJson(file, data) { await fsp.writeFile(file, JSON.stringify(data, null, 2)); }

// ============================================================================
// 1. MASTER IMAGE ENGINE
// ============================================================================
async function findMasterImages() {
  const dir = process.env.DOWNLOADS_DIR || path.join(os.homedir(), 'Downloads');
  let files = [];
  try { files = await fsp.readdir(dir); } catch { throw new Error(`Downloads folder not found: ${dir} (set DOWNLOADS_DIR)`); }
  const hits = files
    .filter((f) => f.startsWith(MASTER_PREFIX) && /\.jpe?g$/i.test(f))
    .sort((a, b) => a.replace(/\.jpe?g$/i, '').localeCompare(b.replace(/\.jpe?g$/i, ''), undefined, { numeric: true }));
  if (!hits.length) throw new Error(`No "${MASTER_PREFIX}*.jpg" files found in ${dir}`);
  return hits.map((f) => ({ name: f, file: path.join(dir, f) }));
}

/** master_map.json lets you tag every source as case | gpu | cpu. */
async function loadMasterMap(masters) {
  const mapFile = path.join(TEMPLATE_DIR(), 'master_map.json');
  const map = await readJson(mapFile, {});
  const defaults = ['case', 'gpu', 'cpu'];
  let changed = false;
  masters.forEach((m, i) => {
    if (!map[m.name]) { map[m.name] = defaults[i % 3]; changed = true; }
    if (!['case', 'gpu', 'cpu'].includes(map[m.name])) throw new Error(`master_map.json: "${m.name}" must be case, gpu or cpu`);
  });
  if (changed) {
    await writeJson(mapFile, map);
    log(`📝 Wrote ${mapFile}`);
    log('   Default roles were assigned by file order (1st=case, 2nd=gpu, 3rd=cpu, ...).');
    log('   If any image is tagged wrong, edit that file and re-run.');
  }
  return map;
}

/** Runs inside the headless page: crops, de-badges, adds banner and optional headline. */
async function renderInPage(opts) {
  const { src, W, H, badgeCrop, bannerH, bannerText, brandLine, headline, chip } = opts;
  const img = new Image();
  img.src = src;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Source rect with the bottom badge strip removed
  const sw = img.naturalWidth;
  const sh = Math.round(img.naturalHeight * (1 - badgeCrop));
  const drawCover = (dx, dy, dw, dh) => {
    const s = Math.max(dw / sw, dh / sh);
    const cw = dw / s, ch = dh / s;
    ctx.drawImage(img, (sw - cw) / 2, (sh - ch) / 2, cw, ch, dx, dy, dw, dh);
  };

  // Blurred backdrop fills the whole 2:3 canvas
  ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H);
  ctx.filter = 'blur(42px) brightness(0.45) saturate(1.2)';
  drawCover(-60, -60, W + 120, H + 120);
  ctx.filter = 'none';

  const areaH = H - bannerH;
  const srcRatio = sw / sh, areaRatio = W / areaH;
  if (Math.abs(srcRatio - areaRatio) / areaRatio < 0.15) {
    drawCover(0, 0, W, areaH);
  } else {
    // contain: keep the whole product visible, centred on the blurred backdrop
    const s = Math.min(W / sw, areaH / sh);
    const dw = sw * s, dh = sh * s;
    const dy = headline ? Math.max(areaH - dh - 20, (areaH - dh) / 2) : (areaH - dh) / 2;
    ctx.drawImage(img, 0, 0, sw, sh, (W - dw) / 2, dy, dw, dh);
  }

  // Fade into banner (also hides any badge remnant above the cut)
  const fadeTop = areaH - 140;
  const grad = ctx.createLinearGradient(0, fadeTop, 0, areaH);
  grad.addColorStop(0, 'rgba(11,18,32,0)');
  grad.addColorStop(1, 'rgba(11,18,32,1)');
  ctx.fillStyle = grad; ctx.fillRect(0, fadeTop, W, 140);

  // ---- Bottom banner (replaces the sales/price area completely) ----
  const by = areaH;
  ctx.fillStyle = '#0b1220'; ctx.fillRect(0, by, W, bannerH);
  ctx.fillStyle = '#22c55e'; ctx.fillRect(0, by, W, 6);

  // shield-check icon
  const ix = 70, iy = by + bannerH / 2 - 8;
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.moveTo(ix, iy - 38); ctx.lineTo(ix + 32, iy - 26); ctx.lineTo(ix + 32, iy + 2);
  ctx.quadraticCurveTo(ix + 30, iy + 30, ix, iy + 42);
  ctx.quadraticCurveTo(ix - 30, iy + 30, ix - 32, iy + 2);
  ctx.lineTo(ix - 32, iy - 26); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(ix - 14, iy + 2); ctx.lineTo(ix - 3, iy + 13); ctx.lineTo(ix + 16, iy - 10); ctx.stroke();

  const textX = 128, maxTextW = W - textX - 40;
  let fs = 44;
  do { ctx.font = `800 ${fs}px "Segoe UI", Inter, Arial, sans-serif`; fs--; } while (ctx.measureText(bannerText).width > maxTextW && fs > 18);
  ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(bannerText, textX, by + bannerH / 2 - 16);
  ctx.font = '500 26px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(brandLine, textX, by + bannerH / 2 + 34);

  // ---- Optional headline (per-pin images) ----
  if (headline) {
    const padX = 50, maxW = W - padX * 2;
    let size = 72, lines = [];
    const wrap = () => {
      ctx.font = `800 ${size}px "Segoe UI", Inter, Arial, sans-serif`;
      lines = []; let line = '';
      for (const word of headline.split(' ')) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; } else line = test;
      }
      if (line) lines.push(line);
    };
    wrap();
    while (lines.length > 4 && size > 40) { size -= 4; wrap(); }
    const lh = size * 1.12, chipH = 54, boxH = 40 + chipH + 20 + lines.length * lh + 30;
    ctx.fillStyle = 'rgba(11,18,32,0.82)';
    ctx.beginPath(); ctx.roundRect(24, 24, W - 48, boxH, 28); ctx.fill();
    // chip
    ctx.font = '800 26px "Segoe UI", Inter, Arial, sans-serif';
    const cw = ctx.measureText(chip).width + 40;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.roundRect(padX, 52, cw, chipH - 10, 22); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(chip, padX + 20, 52 + (chipH - 10) / 2);
    // title
    ctx.font = `800 ${size}px "Segoe UI", Inter, Arial, sans-serif`;
    ctx.textBaseline = 'top'; ctx.fillStyle = '#ffffff';
    lines.forEach((l, i) => ctx.fillText(l, padX, 52 + chipH + 14 + i * lh));
  }

  return { data: c.toDataURL('image/jpeg', 0.93), w: c.width, h: c.height };
}

async function renderImage(page, srcFile, outFile, extra = {}) {
  const buf = await fsp.readFile(srcFile);
  const src = `data:image/jpeg;base64,${buf.toString('base64')}`;
  const res = await page.evaluate(renderInPage, {
    src, W: OUT_W, H: OUT_H, badgeCrop: BADGE_CROP_RATIO, bannerH: BANNER_H,
    bannerText: BANNER_TEXT, brandLine: BRAND_LINE, headline: extra.headline || null, chip: extra.chip || '',
  });
  if (res.w !== OUT_W || res.h !== OUT_H) throw new Error(`Render size mismatch for ${outFile}: ${res.w}x${res.h}`);
  await fsp.writeFile(outFile, Buffer.from(res.data.split(',')[1], 'base64'));
}

async function prepareImages(pins) {
  await fsp.mkdir(TEMPLATE_DIR(), { recursive: true });
  await fsp.mkdir(PIN_IMG_DIR(), { recursive: true });
  const masters = await findMasterImages();
  const map = await loadMasterMap(masters);
  log(`🖼  Found ${masters.length} master image(s).`);

  const browser = await puppeteer.launch({ headless: true, args: SANDBOX_ARGS });
  try {
    const page = await browser.newPage();
    await page.setContent('<html><body style="margin:0"></body></html>');

    // Master templates
    const byRole = { case: [], gpu: [], cpu: [] };
    const roleCount = { case: 0, gpu: 0, cpu: 0 };
    for (const m of masters) {
      const role = map[m.name];
      const out = path.join(TEMPLATE_DIR(), `${role}_master_${++roleCount[role]}.jpg`);
      await renderImage(page, m.file, out);
      byRole[role].push(m.file);
      log(`   ✔ ${m.name}  →  ${path.basename(out)} (${role}, ${OUT_W}x${OUT_H})`);
    }
    for (const [cat, role] of Object.entries(CATEGORY_ROLE)) {
      if (pins.some((p) => p.cat === cat) && !byRole[role].length) {
        throw new Error(`No "${role}" master image tagged. ${cat.toUpperCase()} pins need one — edit master_map.json.`);
      }
    }

    // Per-pin images (category-matched master + headline)
    const used = { case: 0, gpu: 0, cpu: 0 };
    for (const p of pins) {
      const list = byRole[p.role];
      const src = list[used[p.role]++ % list.length];
      p.image = path.join(PIN_IMG_DIR(), `pin_${pad3(p.n)}.jpg`);
      await renderImage(page, src, p.image, { headline: p.title, chip: CATEGORY_CHIP[p.cat] });
    }
    log(`🖼  Rendered ${pins.length} pin images → ${PIN_IMG_DIR()}`);
  } finally {
    await browser.close();
  }
}

// ============================================================================
// 3. SCHEDULING HELPERS
// ============================================================================
function roundUpToSlot(d) {
  const r = new Date(d);
  r.setSeconds(0, 0);
  const m = r.getMinutes();
  const add = (INTERVAL_MINUTES - (m % INTERVAL_MINUTES)) % INTERVAL_MINUTES;
  r.setMinutes(m + add);
  return r;
}

function firstSlot(progress) {
  let t = process.env.SCHEDULE_START ? new Date(process.env.SCHEDULE_START) : new Date(Date.now() + MIN_LEAD_MINUTES * 60000);
  if (isNaN(t)) throw new Error('SCHEDULE_START is not a valid date (use e.g. 2026-11-10T09:00)');
  const last = progress.lastSlot ? new Date(progress.lastSlot) : null;
  if (last && last.getTime() + INTERVAL_MINUTES * 60000 > t.getTime()) t = new Date(last.getTime() + INTERVAL_MINUTES * 60000);
  return roundUpToSlot(t);
}

function fmtDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return DATE_FORMAT.replace('MM', mm).replace('DD', dd).replace('YYYY', d.getFullYear());
}
function fmtTime12(d) {
  let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`;
}
function fmtTime24(d) { return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }

/** Wait until any of the selectors resolves to an element. */
async function waitForAny(page, selectors, { timeout = 15000, visible = true } = {}) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    for (const s of selectors) {
      const h = await page.$(s).catch(() => null);
      if (h && (!visible || (await h.boundingBox()))) return h;
      if (h) await h.dispose();
    }
    await sleep(300);
  }
  return null;
}

/** Smallest visible element whose text / aria-label matches one of `texts`. */
async function findByText(page, texts, { selector = 'button, [role="button"], [role="option"], [role="menuitem"], [role="radio"], label, a, div, span', exact = true, timeout = 8000 } = {}) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const handle = await page.evaluateHandle((texts, selector, exact) => {
      const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const wanted = texts.map(norm);
      let best = null, bestArea = Infinity;
      for (const el of document.querySelectorAll(selector)) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const cands = [norm(el.innerText), norm(el.getAttribute('aria-label'))];
        const ok = cands.some((t) => t && wanted.some((w) => (exact ? t === w : t.includes(w))));
        if (ok && r.width * r.height < bestArea) { best = el; bestArea = r.width * r.height; }
      }
      return best;
    }, texts, selector, exact);
    const el = handle.asElement();
    if (el) return el;
    await handle.dispose();
    await sleep(300);
  }
  return null;
}

async function clearAndType(page, handle, text) {
  await handle.click({ clickCount: 1 });
  await page.keyboard.down(SELECT_ALL_KEY); await page.keyboard.press('KeyA'); await page.keyboard.up(SELECT_ALL_KEY);
  await page.keyboard.press('Backspace');
  await page.keyboard.type(text, { delay: 8 });
}

async function countScheduledMentions(page) {
  return page.evaluate(() => ((document.body.innerText || '').match(/scheduled/gi) || []).length).catch(() => 0);
}

// ---- Individual builder steps ---------------------------------------------
async function stepUpload(page, pin) {
  const input = await waitForAny(page, ['input[type="file"]'], { timeout: 30000, visible: false });
  if (!input) throw new Error('upload input not found');
  await input.uploadFile(pin.image);
  // wait for the preview to appear (image/blob inside the builder)
  const ok = await waitForAny(page, ['img[src^="blob:"]', '[data-test-id="pin-draft-image"] img', 'img[alt*="preview" i]', 'div[data-test-id*="media"] img'], { timeout: 45000 });
  if (!ok) log('   ⚠ preview not detected — continuing (Pinterest may still be processing)');
  await sleep(1500);
}

async function stepTitle(page, pin) {
  const el = await waitForAny(page, [
    '#storyboard-selector-title', 'textarea[id*="title" i]', 'input[id*="title" i]',
    '[placeholder="Add a title"]', '[placeholder*="title" i]', '[aria-label*="title" i][contenteditable="true"]',
  ]);
  if (!el) throw new Error('title field not found');
  await clearAndType(page, el, pin.title);
}

async function stepDescription(page, pin) {
  const el = await waitForAny(page, [
    '[data-test-id="storyboard-description-field-container"] [contenteditable="true"]',
    '[data-test-id="editor-with-mentions"] [contenteditable="true"]',
    'div[aria-label*="description" i][contenteditable="true"]',
    '[contenteditable="true"][role="combobox"]', 'textarea[id*="description" i]', '[placeholder*="description" i]',
  ]);
  if (!el) throw new Error('description field not found');
  await el.click();
  await page.keyboard.down(SELECT_ALL_KEY); await page.keyboard.press('KeyA'); await page.keyboard.up(SELECT_ALL_KEY);
  await page.keyboard.press('Backspace');
  for (const [i, line] of pin.description.split('\n').entries()) {
    if (i) await page.keyboard.press('Enter');
    await page.keyboard.type(line + (line.endsWith(' ') ? '' : ' '), { delay: 5 });
  }
  await page.keyboard.press('Escape'); // dismiss hashtag suggestions
}

async function stepLink(page, pin) {
  const el = await waitForAny(page, ['#WebsiteField', 'input[id*="link" i]', 'input[placeholder*="link" i]', 'textarea[placeholder*="link" i]']);
  if (!el) throw new Error('link field not found');
  await clearAndType(page, el, pin.link);
  await page.keyboard.press('Tab');
}

async function stepBoard(page) {
  const btn = await waitForAny(page, ['[data-test-id="board-dropdown-select-button"]', 'button[aria-label*="board" i]', '[data-test-id*="board-dropdown"]'], { timeout: 8000 })
    || await findByText(page, ['Choose a board', 'Select'], { exact: false });
  if (!btn) throw new Error('board selector not found');
  await btn.click();
  const search = await waitForAny(page, ['#pickerSearchField', 'input[placeholder*="Search" i]'], { timeout: 8000 });
  if (search) { await search.type(BOARD_NAME, { delay: 15 }); await sleep(1200); }
  const row = await waitForAny(page, [`[data-test-id="board-row-${BOARD_NAME}"]`], { timeout: 3000 })
    || await findByText(page, [BOARD_NAME], { selector: '[role="button"], [role="option"], div[data-test-id*="board-row"], div', timeout: 8000 });
  if (!row) throw new Error(`board "${BOARD_NAME}" not found (set PIN_BOARD)`);
  await row.click();
  await sleep(800);
}

async function stepSchedule(page, when) {
  // 1) Switch to "Publish at a later date"
  const later = await waitForAny(page, ['#pin-draft-schedule-publish-later', 'input[value="later"]'], { timeout: 4000, visible: false })
    || await findByText(page, ['Publish at a later date', 'Publish later', 'Schedule for later'], { exact: false });
  if (!later) throw new Error('"Publish at a later date" option not found');
  await later.evaluate((el) => (el.closest('label') || el).scrollIntoView({ block: 'center' }));
  await later.click().catch(async () => later.evaluate((el) => el.click()));
  await sleep(800);

  // 2) Date
  const date = fmtDate(when);
  const dateEl = await waitForAny(page, ['#pin-draft-schedule-date-field', 'input[id*="date" i]', 'input[placeholder*="date" i]', 'input[aria-label*="date" i]']);
  if (!dateEl) throw new Error('schedule date field not found');
  await clearAndType(page, dateEl, date);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await sleep(500);
  const dateVal = await dateEl.evaluate((el) => el.value || el.innerText || '');
  if (!dateVal.includes(String(when.getDate()))) {
    // calendar fallback: click the day with an aria-label containing the full date
    await dateEl.click();
    const month = when.toLocaleString('en-US', { month: 'long' });
    let picked = false;
    for (let i = 0; i < 3 && !picked; i++) {
      const day = await findByText(page, [`${month} ${when.getDate()}, ${when.getFullYear()}`, `${when.getDate()} ${month} ${when.getFullYear()}`], { exact: false, timeout: 1500 });
      if (day) { await day.click(); picked = true; break; }
      const next = await findByText(page, ['Next month', 'Next'], { exact: false, timeout: 1500 });
      if (next) await next.click(); else break;
    }
    if (!picked) throw new Error(`could not set date ${date} (got "${dateVal}") — try PIN_DATE_FORMAT`);
  }

  // 3) Time
  const t12 = fmtTime12(when), t24 = fmtTime24(when);
  const timeEl = await waitForAny(page, ['#pin-draft-schedule-time-field', 'select[id*="time" i]', 'input[id*="time" i]', '[aria-label*="time" i]']);
  if (!timeEl) throw new Error('schedule time field not found');
  const tag = await timeEl.evaluate((el) => el.tagName);
  if (tag === 'SELECT') {
    const value = await timeEl.evaluate((el, a, b) => {
      const n = (s) => s.replace(/\s+/g, '').toLowerCase();
      const o = [...el.options].find((o) => [n(a), n(b)].includes(n(o.text)) || [n(a), n(b)].includes(n(o.value)));
      return o ? o.value : null;
    }, t12, t24);
    if (!value) throw new Error(`time ${t12} not in dropdown`);
    await timeEl.select(value);
  } else {
    await timeEl.click();
    await sleep(600);
    const opt = await findByText(page, [t12, t24, t12.replace(' ', '')], { selector: '[role="option"], [role="menuitem"], li, button, div', timeout: 5000 });
    if (opt) {
      await opt.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await opt.click();
    } else {
      await clearAndType(page, timeEl, t12);
      await page.keyboard.press('Enter');
    }
  }
  await sleep(600);
  return { date, time: t12 };
}

/** Clicks the red Schedule button and confirms Pinterest accepted it. */
async function stepClickScheduleAndConfirm(page) {
  const btn = await findByText(page, ['Schedule'], { selector: 'button, [role="button"]', exact: true, timeout: 10000 });
  if (!btn) throw new Error('red "Schedule" button not found (Pinterest may still show "Publish" — schedule option not applied)');
  const color = await btn.evaluate((el) => {
    let e = el;
    while (e && e !== document.body) {
      const c = getComputedStyle(e).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
      e = e.parentElement;
    }
    return '';
  });
  const m = color.match(/\d+/g);
  const isRed = m && +m[0] > 150 && +m[1] < 90 && +m[2] < 90;
  log(`   🔴 Schedule button found (bg ${color || 'unknown'}${isRed ? ', red ✔' : ', not red?'})`);
  const disabled = await btn.evaluate((el) => (el.closest('button') || el).disabled || el.getAttribute('aria-disabled') === 'true');
  if (disabled) throw new Error('Schedule button is disabled (missing required field?)');

  const before = await countScheduledMentions(page);
  const urlBefore = page.url();
  await btn.click();

  // confirmation: toast/text "scheduled", navigation, or the builder resetting
  const end = Date.now() + 30000;
  while (Date.now() < end) {
    await sleep(700);
    const after = await countScheduledMentions(page);
    if (after > before) return 'confirmation text';
    if (page.url() !== urlBefore) return 'navigation';
    const stillThere = await findByText(page, ['Schedule'], { selector: 'button, [role="button"]', timeout: 300 });
    const titleLeft = await page.$eval('#storyboard-selector-title, [placeholder="Add a title"]', (el) => el.value || el.innerText || '').catch(() => '');
    if (!stillThere && !titleLeft) return 'builder reset';
    if (stillThere) await stillThere.dispose();
  }
  throw new Error('Clicked Schedule but no confirmation within 30s');
}

async function schedulePin(browser, pin, when) {
  const page = await browser.newPage();
  page.on('dialog', (d) => d.accept().catch(() => {}));
  try {
    await page.goto(PIN_BUILDER_URL, { waitUntil: 'networkidle2', timeout: 90000 });
    if (/login/i.test(page.url())) throw new Error('not logged in');
    await stepUpload(page, pin);
    await stepTitle(page, pin);
    await stepDescription(page, pin);
    await stepLink(page, pin);
    await stepBoard(page);
    const slot = await stepSchedule(page, when);
    log(`   🗓  ${slot.date} ${slot.time}`);
    const how = await stepClickScheduleAndConfirm(page);
    log(`   ✅ Confirmed (${how}). Waiting ${SAVE_WAIT_MS / 1000}s for Pinterest to save…`);
    await sleep(SAVE_WAIT_MS);
    await closePage(page); // close the tab cleanly to free RAM
    return { ok: true };
  } catch (err) {
    // left open on failure so you can finish it manually; caller closes it
    return { ok: false, error: err.message, page };
  }
}

async function closePage(page) {
  if (!page || page.isClosed()) return;
  await page.close({ runBeforeUnload: false }).catch(() => {});
}

async function ensureLoggedIn(browser) {
  const page = await browser.newPage();
  await page.goto('https://www.pinterest.com/login/', { waitUntil: 'domcontentloaded' });
  const isLoggedIn = async () => (await page.cookies('https://www.pinterest.com')).some((c) => c.name === '_auth' && c.value === '1');
  if (await isLoggedIn()) { log('🔐 Already logged in to Pinterest (saved session).'); }
  while (!(await isLoggedIn())) {
    await ask('\n🔐 Log in to Pinterest in the opened Chrome window, then press ENTER here… ');
    if (!(await isLoggedIn())) log('   Still not logged in — please finish logging in.');
  }
  await closePage(page);
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  fs = await import('node:fs');
  fsp = fs.promises;
  path = await import('node:path');
  os = await import('node:os');
  readline = await import('node:readline');

  const start = Number(argValue('start') || START_FROM_PIN);
  const allPins = buildPins();
  const queue = allPins.filter((p) => p.n >= start && p.n <= END_AT_PIN);

  // Validate titles / links
  for (const p of queue) {
    if (p.title.length >= 85) throw new Error(`Pin ${p.n} title is ${p.title.length} chars`);
    if (!p.link.includes(`utm_source=Pinterest&utm_medium=organic&pin=${p.n}`)) throw new Error(`Pin ${p.n} link missing UTM`);
  }
  log(`📌 Queue: pins #${start}–#${END_AT_PIN} (${queue.length} pins). All titles < 85 chars ✔`);

  if (hasFlag('dry-run')) {
    for (const p of queue) console.log(`#${pad3(p.n)} [${p.cat}] (${p.title.length}) ${p.title}\n      ${p.link}`);
    return;
  }

  const mod = await import('puppeteer');
  puppeteer = mod.default || mod;

  await prepareImages(queue);
  if (hasFlag('prepare')) { log('✅ Prepare-only run finished. Review assets/ then run without --prepare.'); return; }

  rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const progress = await readJson(PROGRESS_FILE(), { scheduled: {}, failed: {} });
  progress.scheduled ||= {}; progress.failed ||= {};

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: PROFILE_DIR(),
    args: ['--start-maximized', '--disable-notifications', ...SANDBOX_ARGS],
  });
  // keep one blank tab so Chrome never exits when pin tabs close
  const [home] = await browser.pages();
  const shutdown = async () => { try { await writeJson(PROGRESS_FILE(), progress); } catch {} process.exit(0); };
  process.on('SIGINT', shutdown);

  try {
    await ensureLoggedIn(browser);
    let when = firstSlot(progress);
    let done = 0, skipped = 0;

    for (const pin of queue) {
      if (progress.scheduled[pin.n]) { log(`⏭  Pin #${pin.n} already scheduled (${progress.scheduled[pin.n].at}) — skipping`); continue; }
      log(`\n▶ Pin #${pin.n}/${END_AT_PIN} [${pin.cat}] ${pin.title}`);

      let attempt = 0, result;
      while (true) {
        attempt++;
        result = await schedulePin(browser, pin, when);
        if (result.ok) break;
        log(`   ❌ ${result.error}`);
        if (process.env.AUTO_SKIP_ON_ERROR === '1') { await closePage(result.page); break; }
        if (attempt < 2) { log('   ↻ Retrying automatically once…'); await closePage(result.page); continue; }
        const a = (await ask(`   Choose: [r]etry  [m]anual (I finished & scheduled it in the open tab)  [s]kip  [q]uit > `)).toLowerCase();
        if (a === 'm') { await sleep(SAVE_WAIT_MS); await closePage(result.page); result = { ok: true, manual: true }; break; }
        await closePage(result.page);
        if (a === 'r') continue;
        if (a === 'q') { await writeJson(PROGRESS_FILE(), progress); return; }
        break; // skip
      }

      if (result.ok) {
        progress.scheduled[pin.n] = { at: when.toISOString(), title: pin.title, manual: !!result.manual };
        delete progress.failed[pin.n];
        progress.lastSlot = when.toISOString();
        done++;
        when = new Date(when.getTime() + INTERVAL_MINUTES * 60000);
      } else {
        progress.failed[pin.n] = { error: result.error, at: new Date().toISOString() };
        skipped++;
      }
      await writeJson(PROGRESS_FILE(), progress);
      await sleep(2000);
    }
    log(`\n🏁 Finished. Scheduled this run: ${done}, skipped/failed: ${skipped}. Progress → ${PROGRESS_FILE()}`);
  } finally {
    await writeJson(PROGRESS_FILE(), progress).catch(() => {});
    if (home && !home.isClosed()) await home.goto('about:blank').catch(() => {});
    await ask('Press ENTER to close the browser… ').catch(() => {});
    rl.close();
    await browser.close().catch(() => {});
  }
}

main().catch((e) => {
  console.error('\n💥 Fatal:', e.message);
  if (rl) rl.close();
  process.exit(1);
});
