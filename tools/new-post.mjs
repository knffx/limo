// 新建一篇文章。node tools/new-post.mjs <zh|ja|en> "标题" [slug] [--translated]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2).filter((a) => a !== '--translated');
const translated = process.argv.includes('--translated');
const [lang, title, slugArg] = args;

if (!lang || !title || !['zh', 'ja', 'en'].includes(lang)) {
  console.error('用法: node tools/new-post.mjs <zh|ja|en> "标题" [slug] [--translated]');
  process.exit(1);
}

const today = new Date();
const iso = today.toISOString().slice(0, 10);

// slug 只允许 ASCII 小写字母、数字、连字符；标题里的中文不会进文件名
function safeSlug(input) {
  const s = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s.length >= 2 ? s : '';
}

const slug = safeSlug(slugArg) || iso + '-' + Math.random().toString(36).slice(2, 6);

const dir = path.join(ROOT, 'content', lang, 'posts');
fs.mkdirSync(dir, { recursive: true });

const file = path.join(dir, slug + '.md');
if (fs.existsSync(file)) {
  console.error('已存在: ' + file);
  process.exit(1);
}

const template = `---
title: ${title}
date: ${iso}
summary: 
translated: ${translated}
---

开始写。
`;

fs.writeFileSync(file, template, 'utf8');
console.log('已创建 ' + path.relative(ROOT, file));
console.log('跑一次构建就能看到:  node tools/build.mjs');
