/// <reference types="node" />
/**
 * SEO pre-rendering. Runs automatically after `npm run build` (postbuild),
 * and any time you run `npm run seo`.
 *
 * It takes the built dist/index.html and writes one real HTML file per page:
 *   dist/index.html          (home)
 *   dist/hotels.html, about.html, faq.html, contact.html
 *   dist/hotel/<id>-<name>.html   (one per hotel, loaded live from your API)
 * Each file carries its own <title>, description, canonical, social tags,
 * structured data (JSON-LD) and a crawlable text version of the page.
 * It also writes dist/sitemap.xml and dist/robots.txt.
 *
 * Safe to re-run: use `npm run seo` after adding or editing hotels in QloApps.
 * It never fails the build: if the API is offline it still writes the fixed pages.
 */
import fs from 'node:fs';
import path from 'node:path';

// ---- load .env / .env.production (Vite does this for the app, not for scripts) ----
for (const f of ['.env', '.env.production', '.env.local']) {
  try {
    for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* file not present */ }
}

const { SITE_URL, TAB_PATHS, hotelPath } = await import('../src/seo/routes');
const { ABOUT_SECTIONS } = await import('../src/data/about');
const { FAQ_GROUPS } = await import('../src/data/faq');
const { buildSeo, plain, PHONE_E164, DEFAULT_OG_IMAGE } = await import('../src/seo/seoData');
const { mapHotelBasic } = await import('../src/services/hotelMapper');
type Hotel = import('../src/types/hotel').Hotel;

const DIST = path.resolve(process.env.PRERENDER_DIST || 'dist');
const API = (process.env.PRERENDER_API_URL || process.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const OLD_ORIGIN = 'https://discounthotels.pk';
const PHONE_DISPLAY = '+92 322 0957136';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonForScript = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

// ---------------------------------------------------------------- template
const templatePath = path.join(DIST, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error(`[seo] ${templatePath} not found. Run "npm run build" first.`);
  process.exit(1);
}
let template = fs.readFileSync(templatePath, 'utf8').split(OLD_ORIGIN).join(SITE_URL);

function setTag(html: string, re: RegExp, tag: string, label: string): string {
  if (!re.test(html)) throw new Error(`index.html is missing the "${label}" tag the SEO script edits`);
  return html.replace(re, () => tag);
}

// ---------------------------------------------------------------- hotels
async function loadHotels(): Promise<Hotel[] | null> {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 10000);
    const res = await fetch(`${API}/api/hotels`, { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { hotels?: Parameters<typeof mapHotelBasic>[0][] };
    return (data.hotels ?? []).map(mapHotelBasic);
  } catch (e) {
    console.warn(`[seo] Could not load hotels from ${API} (${(e as Error).message}).`);
    return null;
  }
}

// ---------------------------------------------------------------- page bodies (crawlable text)
const NAV = `<nav aria-label="Main navigation"><a href="/">Home</a> <a href="/hotels">Hotels in Karachi</a> <a href="/about">About us</a> <a href="/faq">FAQ</a> <a href="/contact">Contact</a></nav>`;
const AREAS = ['Clifton', 'DHA', 'Shahrah-e-Faisal', 'Dolmen City', 'Karachi Airport', 'I.I. Chundrigar Road', 'Korangi Industrial Area', 'Port Qasim', 'Expo Centre'];

const hotelItem = (h: Hotel) => {
  const desc = plain(h.description || '');
  return `<li><h3><a href="${hotelPath(h)}">${esc(h.name)}</a></h3>` +
    `<p>${h.starCategory}-star hotel${h.address ? ` · ${esc(h.address)}` : ''}</p>` +
    (desc ? `<p>${esc(desc.slice(0, 220))}${desc.length > 220 ? '…' : ''}</p>` : '') + `</li>`;
};
const hotelList = (hotels: Hotel[]) => (hotels.length ? `<ul class="list">${hotels.map(hotelItem).join('')}</ul>` : '');

function bodyFor(tab: string, hotel: Hotel | null, hotels: Hotel[]): string {
  let main = '';
  if (tab === 'hotel-detail' && hotel) {
    const desc = plain(hotel.description || '');
    main = `<h1>${esc(hotel.name)}, Karachi</h1>` +
      `<p>${hotel.starCategory}-star hotel${hotel.address ? ` at ${esc(hotel.address)}` : ''}.</p>` +
      (desc ? `<p>${esc(desc)}</p>` : '') +
      (hotel.policies?.checkInTime ? `<p>Check-in: ${esc(hotel.policies.checkInTime)}. Check-out: ${esc(hotel.policies.checkOutTime)}.</p>` : '') +
      `<p>Open this page with JavaScript enabled to see live room availability and book direct. Questions? Call or WhatsApp <a href="tel:${PHONE_E164}">${PHONE_DISPLAY}</a>.</p>` +
      `<p><a href="/hotels">← All hotels in Karachi</a></p>`;
  } else if (tab === 'hotels') {
    main = `<h1>Hotels in Karachi</h1><p>Browse verified 3, 4 and 5 star hotels in Karachi with transparent nightly rates and live availability.</p>` + hotelList(hotels);
  } else if (tab === 'about') {
    main = `<h1>About Discount Hotels</h1>` +
      ABOUT_SECTIONS.map((s) => `<h2>${esc(s.title)}</h2>` + s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('') + (s.pull ? `<p><strong>${esc(s.pull)}</strong></p>` : '')).join('') +
      `<p><a href="/hotels">Browse Karachi hotels</a></p>`;
  } else if (tab === 'faq') {
    main = `<h1>Frequently asked questions</h1>` +
      FAQ_GROUPS.map((g) => `<h2>${esc(g.title)}</h2>` + (g.note ? `<p>${esc(g.note)}</p>` : '') + g.items.map((it) => `<h3>${esc(it.q)}</h3><p>${esc(it.a)}</p>`).join('')).join('') +
      `<p><a href="/contact">Contact us</a></p>`;
  } else if (tab === 'contact') {
    main = `<h1>Contact DiscountHotels.pk</h1><p>Reach our reservations desk on WhatsApp or phone for availability, group bookings and corporate stays in Karachi.</p>` +
      `<p><a href="tel:${PHONE_E164}">${PHONE_DISPLAY}</a> · <a href="https://wa.me/${PHONE_E164.replace('+', '')}">WhatsApp us</a></p>`;
  } else {
    main = `<h1>Karachi's star hotels, at negotiated rates.</h1>` +
      `<p>Specially negotiated rates and packages at leading Karachi hotels, with more included than the room alone. Request your room online and pay by bank transfer after the hotel confirms.</p>` +
      `<h2>Featured Karachi hotels</h2>` + hotelList(hotels) +
      `<h2>Popular areas in Karachi</h2><p>${AREAS.map(esc).join(' · ')}</p>`;
  }
  return `<!--seo-start--><div id="seo-shell"><style>` +
    `#seo-shell{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#0f172a;background:#f8fafc;min-height:100vh}` +
    `#seo-shell a{color:inherit}#seo-shell header{background:#081225;color:#fff;padding:16px 24px;display:flex;flex-wrap:wrap;gap:12px 28px;align-items:center}` +
    `#seo-shell header strong{font-size:22px}#seo-shell header nav{display:flex;gap:20px;font-size:14px}#seo-shell header a{color:#e2e8f0;text-decoration:none}` +
    `#seo-shell main{max-width:960px;margin:0 auto;padding:32px 24px}#seo-shell h1{font-size:32px;line-height:1.2;margin:0 0 12px}` +
    `#seo-shell h2{font-size:22px;margin:28px 0 8px}#seo-shell h3{font-size:17px;margin:0 0 4px}#seo-shell p{line-height:1.6;color:#334155;margin:6px 0}` +
    `#seo-shell .list{list-style:none;padding:0;display:grid;gap:12px}#seo-shell .list li{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px}` +
    `#seo-shell footer{background:#060e1d;color:#94a3b8;padding:20px 24px;font-size:13px;text-align:center}</style>` +
    `<header><strong>DiscountHotels.pk</strong>${NAV}</header><main>${main}</main>` +
    `<footer>© 2026 DiscountHotels.pk · <a href="tel:${PHONE_E164}">${PHONE_DISPLAY}</a></footer></div><!--seo-end-->`;
}

// ---------------------------------------------------------------- render one page
function render(tab: string, hotel: Hotel | null, hotels: Hotel[]): string {
  const cfg = buildSeo(tab, hotel, 'All Areas', hotels);
  const url = `${SITE_URL}${cfg.path}`;
  const image = cfg.image || DEFAULT_OG_IMAGE;
  const robots = cfg.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';

  let h = template;
  h = setTag(h, /<title>[\s\S]*?<\/title>/, `<title>${esc(cfg.title)}</title>`, 'title');
  h = setTag(h, /<meta name="description"[^>]*>/, `<meta name="description" content="${esc(cfg.description)}" />`, 'description');
  h = setTag(h, /<meta name="robots"[^>]*>/, `<meta name="robots" content="${robots}" />`, 'robots');
  h = setTag(h, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`, 'canonical');
  h = setTag(h, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`, 'og:url');
  h = setTag(h, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(cfg.title)}" />`, 'og:title');
  h = setTag(h, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(cfg.description)}" />`, 'og:description');
  h = setTag(h, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`, 'og:image');
  h = setTag(h, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(cfg.title)}" />`, 'twitter:title');
  h = setTag(h, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(cfg.description)}" />`, 'twitter:description');
  h = setTag(h, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${image}" />`, 'twitter:image');

  // page-specific structured data (replaced on re-run)
  h = h.replace(/\s*<script type="application\/ld\+json" data-seo-page="1">[\s\S]*?<\/script>/g, '');
  const ld = (cfg.jsonLd ?? []).map((o) => `    <script type="application/ld+json" data-seo-page="1">${jsonForScript(o)}</script>\n`).join('');
  h = h.replace('</head>', () => `${ld}  </head>`);

  // crawlable body (replaced on re-run)
  const body = bodyFor(tab, hotel, hotels);
  if (/<!--seo-start-->[\s\S]*?<!--seo-end-->/.test(h)) h = h.replace(/<!--seo-start-->[\s\S]*?<!--seo-end-->/, () => body);
  else if (h.includes('<div id="root"></div>')) h = h.replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
  else throw new Error('index.html must contain <div id="root"></div>');
  return h;
}

// ---------------------------------------------------------------- run
const loaded = await loadHotels();
const hasOldHotelPages = fs.existsSync(path.join(DIST, 'hotel')) && fs.readdirSync(path.join(DIST, 'hotel')).length > 0;
if (loaded === null && hasOldHotelPages) {
  // API is down on a re-run: keep the good pages from last time instead of overwriting them with a thinner version.
  console.warn('[seo] Kept the existing pre-rendered pages unchanged. Start the API and run "npm run seo" again to refresh.');
  process.exit(0);
}
if (loaded === null) console.warn('[seo] Hotel pages were skipped; fixed pages still written. Start the API and run "npm run seo" to add them.');
const hotels: Hotel[] = loaded ?? [];
const written: string[] = [];
const write = (rel: string, content: string) => {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  written.push(rel);
};

// fixed pages (home first: it overwrites index.html, which is also the fallback for unknown URLs)
write('hotels.html', render('hotels', null, hotels));
write('about.html', render('about', null, hotels));
write('faq.html', render('faq', null, hotels));
write('contact.html', render('contact', null, hotels));

// hotel pages (only wipe old ones if the API answered, so an outage never deletes pages)
if (hotels.length) fs.rmSync(path.join(DIST, 'hotel'), { recursive: true, force: true });
for (const hotel of hotels) write(`${hotelPath(hotel).slice(1)}.html`, render('hotel-detail', hotel, hotels));
write('index.html', render('home', null, hotels));

// sitemap + robots
const today = new Date().toISOString().slice(0, 10);
const urls: { loc: string; freq: string; pri: string }[] = [
  { loc: '/', freq: 'daily', pri: '1.0' },
  { loc: TAB_PATHS.hotels, freq: 'daily', pri: '0.9' },
  { loc: TAB_PATHS.about, freq: 'monthly', pri: '0.6' },
  { loc: TAB_PATHS.faq, freq: 'monthly', pri: '0.6' },
  { loc: TAB_PATHS.contact, freq: 'monthly', pri: '0.6' },
  ...hotels.map((h) => ({ loc: hotelPath(h), freq: 'daily', pri: '0.8' })),
];
write('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${esc(SITE_URL + u.loc)}</loc><lastmod>${today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`).join('\n') +
  `\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /booking\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`[seo] Wrote ${written.length} files to ${DIST} (${hotels.length} hotel page${hotels.length === 1 ? '' : 's'}). Site URL: ${SITE_URL}`);
