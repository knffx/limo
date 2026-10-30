// 静态站点生成器。零依赖，只用到 Node 自带模块。
// 用法：node tools/build.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdown, parseFrontMatter } from './md.mjs';
import { LOCALES, HTML_LANG, t } from '../src/i18n.mjs';
import { poolFor } from '../src/gacha.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'content');

// 每页一个主色，取自物语系列各角色的代表色。
// wipe 是转场色块的颜色（浅色页需要一个看得见的颜色）。
const ACCENT = {
  araragi: { wipe: '#F2EFE9' }, // 阿良良木历 · 黑白
  mayoi: { wipe: '#A9C46C' }, // 八九寺真宵 · 黄绿
  nadeko: { wipe: '#E08A3C' }, // 千石抚子 · 橙
  suruga: { wipe: '#4A6FA5' }, // 神原骏河 · 蓝
  hitagi: { wipe: '#8A6BB8' }, // 战场原黑仪 · 紫
  tsubasa: { wipe: '#F2EFE9' }, // 羽川翼 · 白
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SHORT_LANG = { zh: '中', ja: '日', en: 'EN' };

// 每次构建换一个版本号，避免浏览器拿旧 CSS
const BUILD_ID = Date.now().toString(36);

// ---------- 读文章 ----------

function readPosts(lang) {
  const dir = path.join(CONTENT, lang, 'posts');
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, body } = parseFrontMatter(raw);
      return {
        slug: file.replace(/\.md$/, ''),
        title: data.title || file.replace(/\.md$/, ''),
        date: data.date || '',
        summary: data.summary || '',
        translated: data.translated === true,
        body,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ---------- 页面骨架 ----------
// depth: 当前页面相对 dist 的层数（/zh/ = 1，/zh/lab/ = 2）
// suffix: 去掉语言段之后的路径（'' / 'lab/' / 'writing/'），供语言切换使用

function shell({ lang, depth, theme, title, body, suffix = '', head = '', accent = 'araragi', edge = '' }) {
  const up = '../'.repeat(depth);

  return `<!doctype html>
<html lang="${HTML_LANG[lang]}" data-theme="${theme}" data-accent="${accent}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(t[lang].word)}">
<link rel="icon" href="${up}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${up}styles.css?v=${BUILD_ID}">
<script>try{if(sessionStorage.getItem('limo-wipe')==='1'){sessionStorage.removeItem('limo-wipe');document.documentElement.classList.add('wipe-in');setTimeout(function(){document.documentElement.classList.remove('wipe-in')},1500)}}catch(e){}</script>
${head}
</head>
<body class="t-${theme}">
<div class="wipe" id="wipe" aria-hidden="true"><span class="wipe__label" id="wipeLabel"></span></div>
${edge ? `<aside class="edge" aria-hidden="true">${esc(edge)}</aside>` : ''}
${body}
<script src="${up}client.js?v=${BUILD_ID}" defer></script>
</body>
</html>`;
}

function header(lang, depth, { toTop = false } = {}) {
  const up = '../'.repeat(depth);
  const locRoot = depth === 1 ? './' : '../'.repeat(depth - 1);
  const otherLangs = LOCALES.map(
    (l) => `<a href="${up}${l}/"${l === lang ? ' aria-current="page"' : ''}>${SHORT_LANG[l]}</a>`,
  ).join('');

  return `<header class="top">
  <a class="brand" href="${toTop ? up : locRoot}" data-wipe="limo." data-wipe-color="${ACCENT.araragi.wipe}">limo<span class="dot">.</span></a>
  <nav class="langs" aria-label="language">${otherLangs}</nav>
</header>`;
}

function dock(lang, depth, current) {
  const locRoot = depth === 1 ? './' : '../'.repeat(depth - 1);
  const items = [
    ['lab', t[lang].lab],
    ['writing', t[lang].writing],
    ['about', t[lang].about],
  ];
  return `<nav class="dock" aria-label="sections">${items
    .map(
      ([key, label]) =>
        `<a href="${locRoot}${key}/"${key === current ? ' aria-current="page"' : ''}>${label}</a>`,
    )
    .join('')}</nav>`;
}

const foot = (label) => `<footer class="foot"><span>limo.</span><span>${esc(label)}</span></footer>`;

// 标题横竖混排：首字横排，其余字竖排成一小列。拉丁文不做竖排，只换色。
function mixTitle(str, vertical = true) {
  const chars = Array.from(String(str));
  if (chars.length < 2) return esc(str);

  if (!vertical) {
    return esc(chars.slice(0, -1).join('')) + `<span class="tail">${esc(chars[chars.length - 1])}</span>`;
  }

  const head = chars.shift();
  return `<span class="mh">${esc(head)}</span><span class="mv">${esc(chars.join(''))}</span>`;
}

// ---------- 写文件 ----------

function write(relPath, html) {
  const full = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, 'utf8');
}

function copy(src, destRel) {
  const full = path.join(DIST, destRel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.copyFileSync(path.join(ROOT, src), full);
}

// ---------- 各页面 ----------

function homePage(lang) {
  const s = t[lang];

  const body = `<main class="stage" id="stage">
  <div class="frame" aria-hidden="true"></div>
  <p class="corner corner--tl">limo.</p>
  <p class="corner corner--br">01</p>
  <nav class="langs langs--corner" aria-label="language">${LOCALES.map(
    (l) => `<a href="../${l}/"${l === lang ? ' aria-current="page"' : ''}>${SHORT_LANG[l]}</a>`,
  ).join('')}</nav>

  <h1 class="word">${esc(s.word)}</h1>

  <nav class="dock" aria-label="sections">
    <a href="lab/" data-wipe="${s.lab}" data-wipe-color="${ACCENT.mayoi.wipe}">${s.lab}</a>
    <a href="writing/" data-wipe="${s.writing}" data-wipe-color="${ACCENT.hitagi.wipe}">${s.writing}</a>
    <a href="about/" data-wipe="${s.about}" data-wipe-color="${ACCENT.tsubasa.wipe}">${s.about}</a>
  </nav>
</main>`;

  return shell({ lang, depth: 1, theme: 'ink', title: 'limo.', body, suffix: '', accent: 'araragi' });
}

function labPage(lang) {
  const s = t[lang];
  const entries = [
    ['gacha/', '01', s.gachaName, s.gachaDesc, ACCENT.nadeko.wipe],
    ['palette/', '02', s.paletteName, s.paletteDesc, ACCENT.suruga.wipe],
  ];

  const body = `${header(lang, 2)}
<main class="page">
  <span class="watermark" aria-hidden="true">00</span>
  <p class="kicker">lab</p>
  <h1 class="page__title page__title--mix">${mixTitle(s.labTitle, lang !== 'en')}</h1>
  <p class="page__lead">${esc(s.labLead)}</p>

  <ol class="index">
    ${entries
      .map(
        ([href, num, name, desc, wipe]) => `<li class="index__row">
      <a href="${href}" data-wipe="${num}" data-wipe-color="${wipe}">
        <span class="index__num">${num}</span>
        <span class="index__name">${esc(name)}</span>
        <span class="index__desc">${esc(desc)}</span>
        <span class="index__arrow" aria-hidden="true">→</span>
      </a>
    </li>`,
      )
      .join('\n    ')}
  </ol>
  ${foot('lab')}
</main>`;

  return shell({ lang, depth: 2, theme: 'field', title: `lab · limo.`, body, suffix: 'lab/', accent: 'mayoi', edge: 'lab · 00' });
}

function gachaPage(lang) {
  const s = t[lang];
  const depth = 3; // /zh/lab/gacha/
  const pool = poolFor(lang);
  const data = JSON.stringify({ ...pool, again: s.again, rareLabel: s.rare }).replace(/</g, '\\u003c');

  const body = `${header(lang, depth)}
<main class="page page--narrow">
  <span class="watermark" aria-hidden="true">01</span>
  <p class="kicker">01</p>
  <h1 class="page__title">${esc(s.gachaName)}</h1>
  <p class="page__lead">${esc(s.gachaDesc)}</p>

  <section class="gacha gacha--page" id="gacha" data-mode="button">
    <div class="gacha__box">
      <p class="gacha__label" id="gachaLabel">${s.gachaName}</p>
      <p class="gacha__line" id="gachaLine"></p>
      <button class="gacha__spin" id="gachaSpin" type="button">${s.spin}</button>
      <button class="gacha__again" id="gachaAgain" type="button" hidden>${s.again}</button>
    </div>
  </section>

  <script type="application/json" id="gacha-data">${data}</script>
  ${foot('01')}
</main>`;

  return shell({ lang, depth, theme: 'ink', title: `${s.gachaName} · limo.`, body, suffix: 'lab/gacha/', accent: 'nadeko', edge: 'gacha · 01' });
}

function palettePage(lang) {
  const s = t[lang];
  const depth = 3; // /zh/lab/palette/

  const body = `${header(lang, depth)}
<main class="page page--narrow">
  <span class="watermark" aria-hidden="true">02</span>
  <p class="kicker">02</p>
  <h1 class="page__title">${esc(s.paletteName)}</h1>
  <p class="page__lead">${esc(s.paletteDesc)}</p>

  <section class="palette" id="palette">
    <div class="palette__chips" id="chips" aria-live="polite"></div>

    <div class="palette__controls">
      <label class="slider">
        <span class="slider__name">${s.hue}</span>
        <input type="range" id="hue" min="0" max="360" value="356" step="1">
        <output id="hueOut">356</output>
      </label>
      <label class="slider">
        <span class="slider__name">${s.sat}</span>
        <input type="range" id="sat" min="0" max="100" value="62" step="1">
        <output id="satOut">62</output>
      </label>
      <label class="slider">
        <span class="slider__name">${s.light}</span>
        <input type="range" id="light" min="20" max="88" value="52" step="1">
        <output id="lightOut">52</output>
      </label>
    </div>

    <p class="palette__status" id="status" aria-live="polite"></p>
  </section>
  ${foot('02')}
</main>`;

  return shell({ lang, depth, theme: 'ink', title: `${s.paletteName} · limo.`, body, suffix: 'lab/palette/', accent: 'suruga', edge: 'palette · 02' });
}

function writingPage(lang, posts) {
  const s = t[lang];

  const list = posts.length
    ? `<ol class="index">
    ${posts
      .map(
        (p) => `<li class="index__row">
      <a href="${p.slug}/" data-wipe="${esc(p.date || '')}" data-wipe-color="${ACCENT.hitagi.wipe}">
        <span class="index__num">${esc(p.date || '—')}</span>
        <span class="index__name">${esc(p.title)}</span>
        <span class="index__desc">${p.translated ? `<em class="tag">${s.translated}</em>` : ''}</span>
        <span class="index__arrow" aria-hidden="true">→</span>
      </a>
    </li>`,
      )
      .join('\n    ')}
  </ol>`
    : `<p class="empty">${esc(s.empty)}</p>`;

  const body = `${header(lang, 2)}
<main class="page">
  <span class="watermark" aria-hidden="true">03</span>
  <p class="kicker">writing</p>
  <h1 class="page__title page__title--mix">${mixTitle(s.writingTitle, lang !== 'en')}</h1>
  <p class="page__lead">${esc(s.writingLead)}</p>
  ${list}
  ${foot('writing')}
</main>`;

  return shell({ lang, depth: 2, theme: 'field', title: `writing · limo.`, body, suffix: 'writing/', accent: 'hitagi', edge: 'writing · 03' });
}

function postPage(lang, post) {
  const s = t[lang];
  const locRoot = '../../'; // /zh/writing/<slug>/ → /zh/

  const body = `${header(lang, 3)}
<main class="page page--read">
  <span class="watermark" aria-hidden="true">03</span>
  <article class="post">
    <p class="post__meta">${esc(post.date)}${post.translated ? ` · <em class="tag">${s.translated}</em>` : ''}</p>
    <h1 class="post__title">${esc(post.title)}</h1>
    <div class="prose">${renderMarkdown(post.body)}</div>
  </article>
  <p class="post__back"><a href="${locRoot}writing/" data-wipe="writing" data-wipe-color="${ACCENT.hitagi.wipe}">← ${esc(s.writing)}</a></p>
  ${foot('writing')}
</main>`;

  return shell({ lang, depth: 3, theme: 'paper', title: `${post.title} · limo.`, body, suffix: 'writing/', accent: 'hitagi', edge: 'writing · 03' });
}

function aboutPage(lang) {
  const s = t[lang];

  const body = `${header(lang, 2)}
<main class="page page--read page--about">
  <span class="watermark" aria-hidden="true">04</span>
  <p class="kicker">about</p>
  <div class="about">
    <div class="about__figure" aria-hidden="true">
      <svg viewBox="0 0 200 240" role="img">
        <circle cx="100" cy="96" r="58" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <ellipse cx="100" cy="96" rx="7" ry="18" fill="currentColor"/>
        <path d="M100 154 V182 M100 182 L76 210 M100 182 L124 210" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="100" cy="96" r="84" fill="none" stroke="currentColor" stroke-width="1" opacity=".18"/>
      </svg>
      <p class="about__name">${esc(s.mascotName)}</p>
    </div>
    <div class="about__text">
      <h1 class="page__title page__title--small">${esc(s.aboutTitle)}</h1>
      ${s.aboutBody
        .split('\n\n')
        .map((p) => `<p>${esc(p)}</p>`)
        .join('\n      ')}
    </div>
  </div>
  ${foot('about')}
</main>`;

  return shell({ lang, depth: 2, theme: 'paper', title: `about · limo.`, body, suffix: 'about/', accent: 'tsubasa', edge: 'about · 04' });
}

// ---------- 主流程 ----------

function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  copy('src/styles.css', 'styles.css');
  copy('src/client.js', 'client.js');
  copy('public/favicon.svg', 'favicon.svg');

  // 根路径：跳到默认语言（中文），不记忆选择
  write(
    'index.html',
    `<!doctype html><html lang="zh-Hans"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=./zh/">
<title>limo.</title>
<link rel="icon" href="./favicon.svg" type="image/svg+xml">
<style>html,body{margin:0;height:100%;background:#0E0D0C;color:#F2EFE9;font-family:serif}
body{display:grid;place-items:center;font-size:14px;letter-spacing:.4em}</style>
</head><body><a href="./zh/" style="color:inherit;text-decoration:none">limo.</a></body></html>`,
  );

  const counts = {};

  for (const lang of LOCALES) {
    const posts = readPosts(lang);
    counts[lang] = posts.length;

    write(`${lang}/index.html`, homePage(lang));
    write(`${lang}/lab/index.html`, labPage(lang));
    write(`${lang}/lab/gacha/index.html`, gachaPage(lang));
    write(`${lang}/lab/palette/index.html`, palettePage(lang));
    write(`${lang}/writing/index.html`, writingPage(lang, posts));
    write(`${lang}/about/index.html`, aboutPage(lang));

    for (const post of posts) {
      write(`${lang}/writing/${post.slug}/index.html`, postPage(lang, post));
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`build ok → dist/  (${LOCALES.length} locales, ${total} posts)`);
}

build();
