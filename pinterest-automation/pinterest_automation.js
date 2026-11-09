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
 *     - Each master is tagged as  case | gpu | cpu  in master_setup.json via a Chrome setup
 *       screen: drag boxes over mid-image price badges, then click the type.
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
const BADGE_CROP_RATIO = Number(process.env.BADGE_CROP_RATIO || 0.12); // bottom % removed (SHOP NOW bar, rating, URL footer)
const TOP_CROP_RATIO = Number(process.env.TOP_CROP_RATIO || 0.22);  // top % removed on pin images (source's own headline)
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

/** HTML for the in-browser setup screen: draw boxes over sales badges, then pick the image type. */
function taggerHtml(name, idx, total) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Master image setup ${idx}/${total}</title>
<style>
  body{margin:0;background:#0b1220;color:#e2e8f0;font:15px "Segoe UI",Arial,sans-serif;display:flex;flex-direction:column;height:100vh}
  header{padding:12px 18px;background:#111a2e;border-bottom:1px solid #22304d;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  header b{color:#fff} .step{color:#22c55e;font-weight:700}
  button{font:600 14px inherit;padding:9px 14px;border-radius:8px;border:0;cursor:pointer}
  .role{background:#ef4444;color:#fff} .role:hover{background:#dc2626} .ghost{background:#1e293b;color:#e2e8f0}
  main{flex:1;display:flex;justify-content:center;align-items:center;overflow:hidden;padding:12px}
  #wrap{position:relative;max-height:100%;cursor:crosshair;user-select:none}
  #img{display:block;max-height:calc(100vh - 110px);max-width:calc(100vw - 30px)}
  .box{position:absolute;border:3px solid #ef4444;background:rgba(239,68,68,.35)}
</style></head><body>
<header>
  <span><b>Image ${idx} of ${total}</b> · ${name}</span>
  <span><span class="step">1.</span> Drag a box over every price badge / SHOP NOW / rating / "BEST $..." sticker</span>
  <button class="ghost" id="undo">Undo box</button><span id="count">0 boxes</span>
  <span><span class="step">2.</span> What does it show?</span>
  <button class="role" data-r="case">PC case / full build</button>
  <button class="role" data-r="gpu">GPU vs GPU</button>
  <button class="role" data-r="cpu">CPU vs CPU</button>
</header>
<main><div id="wrap"><img id="img"></div></main>
<script>
  const masks=[]; let start=null, cur=null;
  const wrap=document.getElementById('wrap'), img=document.getElementById('img');
  window.loadImg=(src)=>new Promise(r=>{img.onload=r;img.src=src;});
  const rel=(e)=>{const b=img.getBoundingClientRect();return{x:Math.min(Math.max((e.clientX-b.left)/b.width,0),1),y:Math.min(Math.max((e.clientY-b.top)/b.height,0),1)}};
  const paint=()=>{wrap.querySelectorAll('.box').forEach(b=>b.remove());
    for(const m of masks.concat(cur?[cur]:[])){const d=document.createElement('div');d.className='box';
      Object.assign(d.style,{left:m.x*100+'%',top:m.y*100+'%',width:m.w*100+'%',height:m.h*100+'%'});wrap.appendChild(d);}
    document.getElementById('count').textContent=masks.length+' box'+(masks.length===1?'':'es');};
  wrap.addEventListener('mousedown',e=>{e.preventDefault();start=rel(e);cur={x:start.x,y:start.y,w:0,h:0};});
  window.addEventListener('mousemove',e=>{if(!start)return;const p=rel(e);
    cur={x:Math.min(p.x,start.x),y:Math.min(p.y,start.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};paint();});
  window.addEventListener('mouseup',()=>{if(cur&&cur.w>0.01&&cur.h>0.01)masks.push(cur);start=null;cur=null;paint();});
  document.getElementById('undo').onclick=()=>{masks.pop();paint();};
  document.querySelectorAll('.role').forEach(b=>b.onclick=()=>{window.__result={role:b.dataset.r,masks};});
</script></body></html>`;
}

/**
 * master_setup.json stores, per source image: its type (case | gpu | cpu) and the
 * boxes covering its sales badges. Missing images open in a Chrome setup screen.
 * Use --retag to redo every image.
 */
async function loadMasterMap(masters) {
  const mapFile = path.join(TEMPLATE_DIR(), 'master_setup.json');
  const setup = hasFlag('retag') ? {} : await readJson(mapFile, {});
  const todo = masters.filter((m) => !setup[m.name] || !['case', 'gpu', 'cpu'].includes(setup[m.name].role));
  if (!todo.length) return setup;

  log(`🖍  ${todo.length} master image(s) need setup — a Chrome window will open.`);
  log('   For each image: drag boxes over the price/sales badges, then click the image type.');
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized', ...SANDBOX_ARGS] });
  try {
    const page = (await browser.pages())[0] || (await browser.newPage());
    for (const [i, m] of todo.entries()) {
      const buf = await fsp.readFile(m.file);
      await page.goto('about:blank'); // fresh window, so the previous image's answer can't carry over
      await page.setContent(taggerHtml(m.name, i + 1, todo.length));
      await page.evaluate((src) => window.loadImg(src), `data:image/jpeg;base64,${buf.toString('base64')}`);
      await page.bringToFront();
      await page.waitForFunction(() => window.__result, { timeout: 0, polling: 300 });
      setup[m.name] = await page.evaluate(() => window.__result);
      await writeJson(mapFile, setup);
      log(`   ✔ ${m.name}: ${setup[m.name].role}, ${setup[m.name].masks.length} badge box(es) masked`);
    }
  } finally {
    await browser.close();
  }
  log(`📝 Saved → ${mapFile}  (redo any time with --retag)`);
  return setup;
}

/** Runs inside the headless page: crops, de-badges, adds banner and optional headline panel. */
async function renderInPage(opts) {
  const { src, W, H, badgeCrop, topCrop, bannerH, bannerText, brandLine, headline, chip, masks = [] } = opts;
  const raw = new Image();
  raw.src = src;
  await raw.decode();

  // ---- Mask the badge boxes you drew: fill each with the colour around it, feathered ----
  const img = document.createElement('canvas');
  img.width = raw.naturalWidth; img.height = raw.naturalHeight;
  img.naturalWidth = img.width; img.naturalHeight = img.height;
  const mctx = img.getContext('2d');
  mctx.drawImage(raw, 0, 0);
  for (const mk of masks) {
    const pad = Math.round(Math.max(img.width, img.height) * 0.012);
    const x = Math.max(0, Math.round(mk.x * img.width) - pad), y = Math.max(0, Math.round(mk.y * img.height) - pad);
    const w = Math.min(img.width - x, Math.round(mk.w * img.width) + pad * 2), h = Math.min(img.height - y, Math.round(mk.h * img.height) + pad * 2);
    // most common colour in a ring just outside the box (= the background, not the shadow or the case)
    const gap = pad * 2, ring = Math.max(8, pad);
    const bins = new Map();
    const sample = (sx, sy, sw, sh) => {
      sx = Math.max(0, sx); sy = Math.max(0, sy);
      sw = Math.min(img.width - sx, sw); sh = Math.min(img.height - sy, sh);
      if (sw <= 0 || sh <= 0) return;
      const d = mctx.getImageData(sx, sy, sw, sh).data;
      for (let i = 0; i < d.length; i += 16) {
        const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4);
        const v = bins.get(k) || [0, 0, 0, 0];
        v[0] += d[i]; v[1] += d[i + 1]; v[2] += d[i + 2]; v[3]++;
        bins.set(k, v);
      }
    };
    sample(x - gap - ring, y - gap - ring, w + (gap + ring) * 2, ring);   // above
    sample(x - gap - ring, y + h + gap, w + (gap + ring) * 2, ring);      // below
    sample(x - gap - ring, y - gap, ring, h + gap * 2);                   // left
    sample(x + w + gap, y - gap, ring, h + gap * 2);                      // right
    let best = null;
    for (const v of bins.values()) if (!best || v[3] > best[3]) best = v;
    const col = best ? `rgb(${Math.round(best[0] / best[3])},${Math.round(best[1] / best[3])},${Math.round(best[2] / best[3])})` : '#0b1220';
    mctx.save();
    mctx.filter = `blur(${pad}px)`;
    mctx.fillStyle = col;
    mctx.fillRect(x - pad / 2, y - pad / 2, w + pad, h + pad);
    mctx.restore();
    mctx.fillStyle = col;
    mctx.fillRect(x + pad / 2, y + pad / 2, w - pad, h - pad);
  }
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const FONT = '"Segoe UI", Inter, Arial, sans-serif';

  // Source rect: bottom price-badge strip removed; for pin images the source's own
  // top headline is cropped too, so it never clashes with our title.
  const sx = 0, sw = img.naturalWidth;
  const sy = Math.round(img.naturalHeight * (headline ? topCrop : 0));
  const sh = Math.round(img.naturalHeight * (1 - badgeCrop)) - sy;
  const drawCover = (dx, dy, dw, dh) => {
    const s = Math.max(dw / sw, dh / sh);
    const cw = dw / s, ch = dh / s;
    ctx.drawImage(img, sx + (sw - cw) / 2, sy + (sh - ch) / 2, cw, ch, dx, dy, dw, dh);
  };

  // ---- Measure the headline panel first (solid, never overlaps the photo) ----
  let panelH = 0, lines = [], size = 70;
  const padX = 50, chipH = 46;
  if (headline) {
    const maxW = W - padX * 2;
    const wrap = () => {
      ctx.font = `800 ${size}px ${FONT}`;
      lines = []; let line = '';
      for (const word of headline.split(' ')) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; } else line = test;
      }
      if (line) lines.push(line);
    };
    wrap();
    while (lines.length > 3 && size > 44) { size -= 3; wrap(); }
    panelH = 40 + chipH + 22 + lines.length * size * 1.14 + 34;
  }

  // Blurred backdrop
  ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H);
  ctx.filter = 'blur(42px) brightness(0.45) saturate(1.2)';
  drawCover(-60, -60, W + 120, H + 120);
  ctx.filter = 'none';

  // Photo area sits between the headline panel and the banner
  const areaY = panelH, areaH = H - bannerH - panelH;
  const srcRatio = sw / sh, areaRatio = W / areaH;
  if (Math.abs(srcRatio - areaRatio) / areaRatio < 0.2) {
    drawCover(0, areaY, W, areaH);
  } else {
    const s = Math.min(W / sw, areaH / sh);
    const dw = sw * s, dh = sh * s;
    ctx.drawImage(img, sx, sy, sw, sh, (W - dw) / 2, areaY + (areaH - dh) / 2, dw, dh);
  }

  // Fade into the banner (hides any badge remnant above the cut)
  const fadeTop = H - bannerH - 120;
  const grad = ctx.createLinearGradient(0, fadeTop, 0, H - bannerH);
  grad.addColorStop(0, 'rgba(11,18,32,0)');
  grad.addColorStop(1, 'rgba(11,18,32,1)');
  ctx.fillStyle = grad; ctx.fillRect(0, fadeTop, W, 120);

  // ---- Headline panel ----
  if (headline) {
    const g2 = ctx.createLinearGradient(0, panelH - 30, 0, panelH + 30);
    g2.addColorStop(0, 'rgba(11,18,32,1)'); g2.addColorStop(1, 'rgba(11,18,32,0)');
    ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, panelH);
    ctx.fillStyle = g2; ctx.fillRect(0, panelH - 30, W, 60);
    ctx.font = `800 24px ${FONT}`;
    const cw = ctx.measureText(chip).width + 40;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.roundRect(padX, 40, cw, chipH, 23); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(chip, padX + 20, 40 + chipH / 2 + 1);
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, padX, 40 + chipH + 22 + i * size * 1.14));
  }

  // ---- Bottom banner (replaces the sales/price area completely) ----
  const by = H - bannerH;
  ctx.fillStyle = '#0b1220'; ctx.fillRect(0, by, W, bannerH);
  ctx.fillStyle = '#22c55e'; ctx.fillRect(0, by, W, 6);
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
  do { ctx.font = `800 ${fs}px ${FONT}`; fs--; } while (ctx.measureText(bannerText).width > maxTextW && fs > 18);
  ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(bannerText, textX, by + bannerH / 2 - 16);
  ctx.font = `500 26px ${FONT}`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(brandLine, textX, by + bannerH / 2 + 34);

  return { data: c.toDataURL('image/jpeg', 0.93), w: c.width, h: c.height };
}

async function renderImage(page, srcFile, outFile, extra = {}) {
  const buf = await fsp.readFile(srcFile);
  const src = `data:image/jpeg;base64,${buf.toString('base64')}`;
  const res = await page.evaluate(renderInPage, {
    src, W: OUT_W, H: OUT_H, badgeCrop: BADGE_CROP_RATIO, topCrop: TOP_CROP_RATIO, bannerH: BANNER_H,
    bannerText: BANNER_TEXT, brandLine: BRAND_LINE, headline: extra.headline || null, chip: extra.chip || '', masks: extra.masks || [],
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
      const { role, masks } = map[m.name];
      const out = path.join(TEMPLATE_DIR(), `${role}_master_${++roleCount[role]}.jpg`);
      await renderImage(page, m.file, out, { masks });
      byRole[role].push({ file: m.file, masks });
      log(`   ✔ ${m.name}  →  ${path.basename(out)} (${role}, ${OUT_W}x${OUT_H})`);
    }
    for (const [cat, role] of Object.entries(CATEGORY_ROLE)) {
      if (pins.some((p) => p.cat === cat) && !byRole[role].length) {
        throw new Error(`No "${role}" master image tagged. ${cat.toUpperCase()} pins need one — run again with --retag.`);
      }
    }

    // Per-pin images (category-matched master + headline)
    const used = { case: 0, gpu: 0, cpu: 0 };
    for (const p of pins) {
      const list = byRole[p.role];
      const src = list[used[p.role]++ % list.length];
      p.image = path.join(PIN_IMG_DIR(), `pin_${pad3(p.n)}.jpg`);
      await renderImage(page, src.file, p.image, { headline: p.title, chip: CATEGORY_CHIP[p.cat], masks: src.masks });
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

async function fieldText(handle) {
  return handle.evaluate((el) => (el.value !== undefined && el.tagName !== 'DIV' ? el.value : el.innerText) || '').catch(() => '');
}
const squash = (s) => (s || '').replace(/\s+/g, ' ').trim();

async function stepTitle(page, pin) {
  const el = await waitForAny(page, [
    '#storyboard-selector-title', 'textarea[id*="title" i]', 'input[id*="title" i]',
    '[placeholder="Add a title"]', '[placeholder*="title" i]', '[aria-label*="title" i][contenteditable="true"]',
  ]);
  if (!el) throw new Error('title field not found');
  await clearAndType(page, el, pin.title);
  const got = squash(await fieldText(el));
  if (got !== squash(pin.title)) throw new Error(`title did not stick (got "${got.slice(0, 60)}")`);
}

/** Pasted, not typed, so Pinterest's hashtag suggestions can't change the text. */
async function stepDescription(page, pin) {
  const el = await waitForAny(page, [
    '[data-test-id="storyboard-description-field-container"] [contenteditable="true"]',
    '[data-test-id="editor-with-mentions"] [contenteditable="true"]',
    'div[aria-label*="description" i][contenteditable="true"]',
    '#storyboard-selector-description', 'textarea[id*="description" i]', '[placeholder*="description" i]',
    '[contenteditable="true"][role="combobox"]', '[contenteditable="true"][role="textbox"]',
  ]);
  if (!el) throw new Error('description field not found');
  await el.click();
  await page.keyboard.down(SELECT_ALL_KEY); await page.keyboard.press('KeyA'); await page.keyboard.up(SELECT_ALL_KEY);
  await page.keyboard.press('Backspace');
  const probe = squash(pin.description).slice(0, 40);
  const ok = async () => squash(await fieldText(el)).includes(probe);

  await el.evaluate((node, text) => {
    const dt = new DataTransfer(); dt.setData('text/plain', text);
    node.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, pin.description);
  await sleep(700);
  if (!(await ok())) {
    await el.evaluate((node, text) => { node.focus(); document.execCommand('insertText', false, text); }, pin.description);
    await sleep(700);
  }
  if (!(await ok())) {
    await page.keyboard.type(pin.description.replace(/\n+/g, ' '), { delay: 5 });
  }
  await page.keyboard.press('Escape'); // close any suggestion popup
  if (!(await ok())) throw new Error('description did not stick');
}

async function stepLink(page, pin) {
  const el = await waitForAny(page, ['#WebsiteField', 'input[id*="link" i]', 'input[placeholder*="link" i]', 'textarea[placeholder*="link" i]', 'input[type="url"]']);
  if (!el) throw new Error('link field not found');
  await clearAndType(page, el, pin.link);
  await page.keyboard.press('Tab');
  const got = squash(await fieldText(el));
  if (!got.includes(`pin=${pin.n}`)) throw new Error(`link did not stick (got "${got}")`);
}

/** Opens the board picker, chooses BOARD_NAME and verifies it is shown as selected. */
async function stepBoard(page) {
  const want = BOARD_NAME.trim().toLowerCase();
  const dropdownSel = ['[data-test-id="board-dropdown-select-button"]', '[data-test-id*="board-dropdown"] button', '[data-test-id*="board-dropdown"]', 'button[aria-label*="board" i]'];
  const isSelected = async () => {
    const h = await waitForAny(page, dropdownSel, { timeout: 1500 });
    const t = h ? squash(await h.evaluate((e) => e.innerText)).toLowerCase() : '';
    return t.includes(want);
  };
  if (await isSelected()) return;

  let btn = await waitForAny(page, dropdownSel, { timeout: 8000 });
  if (!btn) btn = await findByText(page, ['Choose a board'], { selector: 'button, [role="button"], div', exact: false });
  if (!btn) {
    // the field may already show another board (e.g. the last one used): click the box under the "Board" label
    const label = await findByText(page, ['Board'], { selector: 'label, div, span, h2, h3', exact: true, timeout: 4000 });
    if (label) {
      const box = await label.evaluateHandle((el) => {
        let e = el.parentElement;
        while (e && e !== document.body) {
          const r = e.getBoundingClientRect();
          if (e.querySelector('button, [role="button"], [role="combobox"], svg') && r.height > 40) return e.querySelector('button, [role="button"], [role="combobox"]') || e;
          e = e.parentElement;
        }
        return el;
      });
      btn = box.asElement();
    }
  }
  if (!btn) throw new Error('board dropdown not found');
  await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await btn.click();
  await sleep(1200);

  const search = await waitForAny(page, ['#pickerSearchField', '[role="dialog"] input', 'input[placeholder*="Search" i]', 'input[aria-label*="Search" i]'], { timeout: 6000 });
  if (search) { await clearAndType(page, search, BOARD_NAME); await sleep(1500); }

  // click the board row whose text starts with the board name (outside the dropdown button)
  const clicked = await page.evaluate((want, dropdownSel) => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const dd = dropdownSel.map((s) => document.querySelector(s)).filter(Boolean);
    const cands = [];
    for (const el of document.querySelectorAll('[data-test-id*="board-row"], [data-test-id*="board"] [role="button"], [role="option"], [role="button"], div, span')) {
      if (dd.some((d) => d.contains(el)) || el.closest('input')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const t = norm(el.innerText);
      if (t === want || t.startsWith(want + ' ')) cands.push({ el, area: r.width * r.height, exact: t === want });
    }
    if (!cands.length) return false;
    // smallest exact text node, then climb to its clickable row
    cands.sort((a, b) => (b.exact - a.exact) || (a.area - b.area));
    let target = cands[0].el;
    const row = target.closest('[data-test-id*="board-row"], [role="option"], [role="button"], button');
    if (row && !dd.some((d) => d.contains(row))) target = row;
    target.scrollIntoView({ block: 'center' });
    target.click();
    return true;
  }, want, dropdownSel);
  await sleep(1200);
  if (await isSelected()) return;

  // keyboard fallback: first result in the filtered list
  if (search) { await search.focus().catch(() => {}); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await sleep(1200); }
  if (await isSelected()) return;
  throw new Error(`board "${BOARD_NAME}" was not selected${clicked ? ' (clicked, but not applied)' : ' (not in list — check the exact name / PIN_BOARD)'}`);
}

/** Picks a day in Pinterest's calendar popup (react-datepicker based, with generic fallback). */
async function pickDateInCalendar(page, when) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  for (let i = 0; i < 14; i++) {
    const r = await page.evaluate((y, m, d, months) => {
      const cal = document.querySelector('.react-datepicker, [role="dialog"] [role="grid"], [role="grid"], table');
      if (!cal) return { s: 'nocal' };
      const root = cal.closest('.react-datepicker') || cal.parentElement || cal;
      const header = (root.querySelector('.react-datepicker__current-month, [aria-live], h2, h3, [role="heading"]') || {}).textContent || root.innerText.slice(0, 40);
      const hm = months.findIndex((mm) => header.includes(mm));
      const hy = Number((header.match(/20\d\d/) || [y])[0]);
      if (hm >= 0 && (hy !== y || hm !== m)) return { s: (hy * 12 + hm) < (y * 12 + m) ? 'next' : 'prev' };
      const days = [...root.querySelectorAll('.react-datepicker__day, [role="gridcell"], td button, td')]
        .filter((el) => !/outside-month|disabled/.test(el.className) && el.getAttribute('aria-disabled') !== 'true' && el.textContent.trim() === String(d));
      if (!days.length) return { s: 'noday' };
      days[0].click();
      return { s: 'ok' };
    }, when.getFullYear(), when.getMonth(), when.getDate(), months);
    if (r.s === 'ok') return true;
    if (r.s === 'next' || r.s === 'prev') {
      const nav = await waitForAny(page, r.s === 'next'
        ? ['.react-datepicker__navigation--next', 'button[aria-label*="Next" i]']
        : ['.react-datepicker__navigation--previous', 'button[aria-label*="Previous" i]'], { timeout: 2000 });
      if (!nav) return false;
      await nav.click(); await sleep(400); continue;
    }
    return false;
  }
  return false;
}

async function stepSchedule(page, when) {
  // 1) "Publish at a later date"
  const later = await waitForAny(page, ['#pin-draft-schedule-publish-later', 'input[type="radio"][value*="later" i]', 'input[type="radio"][id*="later" i]'], { timeout: 4000, visible: false })
    || await findByText(page, ['Publish at a later date', 'Publish later', 'Schedule for later', 'Later'], { selector: 'label, [role="radio"], button, div, span' });
  if (!later) throw new Error('"Publish at a later date" option not found');
  await later.evaluate((el) => (el.closest('label') || el).scrollIntoView({ block: 'center' }));
  await later.click().catch(() => later.evaluate((el) => el.click()));
  await sleep(1000);
  const laterOn = await later.evaluate((el) => {
    const input = el.matches('input') ? el : el.querySelector('input') || document.getElementById(el.getAttribute('for') || '');
    return input ? input.checked : el.getAttribute('aria-checked') !== 'false';
  }).catch(() => true);
  if (!laterOn) await later.evaluate((el) => el.click());

  // 2) Date — open the calendar and click the day; typing is only a fallback
  const date = fmtDate(when);
  const dateEl = await waitForAny(page, ['#pin-draft-schedule-date-field', 'input[id*="schedule-date" i]', 'input[id*="date" i]', 'input[placeholder*="date" i]', 'input[aria-label*="date" i]']);
  if (!dateEl) throw new Error('schedule date field not found');
  await dateEl.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await dateEl.click();
  await sleep(700);
  let picked = await pickDateInCalendar(page, when);
  if (!picked) {
    await clearAndType(page, dateEl, date);
    await page.keyboard.press('Enter');
  }
  await page.keyboard.press('Escape');
  await sleep(500);
  const dateVal = squash(await fieldText(dateEl));
  const monthShort = when.toLocaleString('en-US', { month: 'short' });
  const dayOk = new RegExp(`(^|\\D)0?${when.getDate()}(\\D|$)`).test(dateVal);
  if (!dayOk && !dateVal.includes(monthShort)) throw new Error(`could not set date ${date} (field shows "${dateVal}")`);

  // 3) Time — open the list (type to filter) and click the matching option
  const t12 = fmtTime12(when), t24 = fmtTime24(when);
  const timeEl = await waitForAny(page, ['#pin-draft-schedule-time-field', 'select[id*="time" i]', 'input[id*="time" i]', 'input[aria-label*="time" i]', 'input[placeholder*="time" i]']);
  if (!timeEl) throw new Error('schedule time field not found');
  const tag = await timeEl.evaluate((el) => el.tagName);
  const n = (s) => (s || '').replace(/\s+/g, '').toLowerCase();
  if (tag === 'SELECT') {
    const value = await timeEl.evaluate((el, a, b) => {
      const n = (s) => (s || '').replace(/\s+/g, '').toLowerCase();
      const o = [...el.options].find((o) => [n(a), n(b)].includes(n(o.text)) || [n(a), n(b)].includes(n(o.value)));
      return o ? o.value : null;
    }, t12, t24);
    if (!value) throw new Error(`time ${t12} not in dropdown`);
    await timeEl.select(value);
  } else {
    await timeEl.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await timeEl.click();
    await sleep(600);
    let opt = await findByText(page, [t12, t24], { selector: '[role="option"], [role="menuitem"], li, button', timeout: 2500 });
    if (!opt) {
      await clearAndType(page, timeEl, t12);
      await sleep(600);
      opt = await findByText(page, [t12, t24], { selector: '[role="option"], [role="menuitem"], li, button', timeout: 2500 });
    }
    if (opt) { await opt.evaluate((el) => el.scrollIntoView({ block: 'center' })); await opt.click(); }
    else await page.keyboard.press('Enter');
  }
  await sleep(700);
  const timeVal = tag === 'SELECT'
    ? await timeEl.evaluate((el) => el.options[el.selectedIndex]?.text || '')
    : await fieldText(timeEl);
  if (![n(t12), n(t24)].some((t) => n(timeVal).includes(t))) throw new Error(`could not set time ${t12} (field shows "${timeVal}")`);
  return { date: dateVal || date, time: t12 };
}

/** Clicks the red Schedule button and confirms Pinterest accepted it. */
async function stepClickScheduleAndConfirm(page) {
  const btn = await findByText(page, ['Schedule'], { selector: 'button, [role="button"]', exact: true, timeout: 10000 });
  if (!btn) throw new Error('red "Schedule" button not found (the button still says "Publish", so the later date was not applied)');
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
  if (disabled) throw new Error('Schedule button is disabled (a required field is missing)');

  const before = await countScheduledMentions(page);
  const urlBefore = page.url();
  await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await btn.click();

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
  throw new Error('clicked Schedule but Pinterest showed no confirmation within 30s');
}

/** Saves a screenshot + HTML of the page when a step fails (send these to fix selectors). */
async function saveDebug(page, pin, step) {
  try {
    const dir = path.join(ROOT, 'debug');
    await fsp.mkdir(dir, { recursive: true });
    const base = path.join(dir, `pin_${pad3(pin.n)}_${step}`);
    await page.screenshot({ path: `${base}.png`, fullPage: true });
    await fsp.writeFile(`${base}.html`, await page.content());
    log(`   🧾 Debug saved: ${base}.png / .html`);
  } catch { /* page may be gone */ }
}

/** Title currently in the builder form ('' if none). */
async function currentTitle(page) {
  const el = await waitForAny(page, ['#storyboard-selector-title', '[placeholder="Add a title"]', 'textarea[id*="title" i]', 'input[id*="title" i]'], { timeout: 4000 });
  return el ? squash(await fieldText(el)) : '';
}

/**
 * Pinterest saves a draft the moment an image is uploaded. To never create a
 * second draft for the same pin, reuse one that already exists:
 *   1) the form already shows this pin (same tab after a failure, or Pinterest
 *      re-opened the last draft), or
 *   2) a draft with exactly this title is in the drafts list -> open it.
 * Only when neither exists is the image uploaded.
 */
async function openOrCreateDraft(page, pin) {
  const want = squash(pin.title);
  if ((await currentTitle(page)) === want) return 'reused open draft';
  const listed = await page.evaluate((want) => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
    let best = null, bestArea = Infinity;
    for (const el of document.querySelectorAll('div, span, a, [role="button"], li')) {
      if (el.closest('input, textarea, [contenteditable="true"]')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (norm(el.innerText) === want && r.width * r.height < bestArea) { best = el; bestArea = r.width * r.height; }
    }
    if (!best) return false;
    (best.closest('a, [role="button"], button, [data-test-id*="draft" i]') || best).click();
    return true;
  }, want);
  if (listed) {
    await sleep(3000);
    if ((await currentTitle(page)) === want) return 'reused existing draft';
  }
  await stepUpload(page, pin);
  return 'new draft';
}

/**
 * Fills and schedules one pin. Pass `page` to continue in the same tab after a
 * failure (no new tab, no new upload, so no duplicate drafts).
 */
async function schedulePin(browser, pin, when, page = null) {
  if (!page || page.isClosed()) {
    page = await browser.newPage();
    page.on('dialog', (d) => d.accept().catch(() => {}));
  }
  let step = 'open';
  try {
    if (!page.url().includes('pin-creation-tool')) {
      await page.goto(PIN_BUILDER_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(4000);
    }
    if (/login/i.test(page.url())) throw new Error('not logged in');
    step = 'upload'; const draft = await openOrCreateDraft(page, pin); log(`   🖼  ${draft}`);
    step = 'title'; await stepTitle(page, pin);
    step = 'description'; await stepDescription(page, pin);
    step = 'link'; await stepLink(page, pin);
    step = 'board'; await stepBoard(page); log(`   📋 Board: ${BOARD_NAME} ✔`);
    step = 'schedule'; const slot = await stepSchedule(page, when); log(`   🗓  ${slot.date} ${slot.time} ✔`);
    step = 'confirm'; const how = await stepClickScheduleAndConfirm(page);
    log(`   ✅ Confirmed (${how}). Waiting ${SAVE_WAIT_MS / 1000}s for Pinterest to save…`);
    await sleep(SAVE_WAIT_MS);
    await closePage(page); // close the tab cleanly to free RAM
    return { ok: true };
  } catch (err) {
    await saveDebug(page, pin, step);
    // left open on failure: retry continues in this same tab/draft
    return { ok: false, error: `[${step}] ${err.message}`, page };
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

  rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await prepareImages(queue);
  if (hasFlag('prepare')) { log('✅ Prepare-only run finished. Review assets/ then run without --prepare.'); rl.close(); return; }

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

      let result, page = null;
      while (true) {
        result = await schedulePin(browser, pin, when, page);
        if (result.ok) break;
        page = result.page; // keep the same tab + draft: never upload this pin twice
        log(`   ❌ ${result.error}`);
        if (process.env.AUTO_SKIP_ON_ERROR === '1') { await closePage(page); break; }
        const a = (await ask('   Choose: [r]etry in the same draft  [m]anual (I scheduled it myself in the open tab)  [s]kip  [q]uit > ')).toLowerCase();
        if (a === 'r') continue;
        if (a === 'm') { await sleep(SAVE_WAIT_MS); await closePage(page); result = { ok: true, manual: true }; break; }
        await closePage(page);
        if (a === 'q') { await writeJson(PROGRESS_FILE(), progress); return; }
        break; // skip (its draft stays in Pinterest and is reused next run)
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
