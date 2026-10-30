// 内部链接与资源检查（构建后跑一次）。
const BASE = process.argv[2] || 'http://127.0.0.1:4321';

const pages = [
  '/',
  '/zh/',
  '/ja/',
  '/en/',
  '/zh/lab/',
  '/ja/lab/',
  '/en/lab/',
  '/zh/lab/gacha/',
  '/ja/lab/gacha/',
  '/en/lab/palette/',
  '/zh/writing/',
  '/ja/writing/',
  '/en/writing/',
  '/zh/writing/example/',
  '/zh/about/',
  '/ja/about/',
  '/en/about/',
];

const seen = new Set();
const broken = [];

for (const p of pages) {
  let html;
  try {
    const res = await fetch(BASE + p);
    if (!res.ok) {
      broken.push(['PAGE', p, res.status]);
      continue;
    }
    html = await res.text();
  } catch (e) {
    broken.push(['FETCH', p, e.message]);
    continue;
  }

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|#)/.test(ref)) continue;
    const abs = new URL(ref, BASE + p).pathname;
    if (seen.has(abs)) continue;
    seen.add(abs);
    try {
      const res = await fetch(BASE + abs);
      if (!res.ok) broken.push(['ASSET', p, ref, res.status]);
    } catch (e) {
      broken.push(['ASSET', p, ref, e.message]);
    }
  }
}

console.log(`pages=${pages.length} refs=${seen.size} broken=${broken.length}`);
for (const b of broken) console.log('  ', b.join('  '));
process.exit(broken.length ? 1 : 0);
