# limo.

一个「无言」的个人站。黑卡叙事区 + 纸白阅读区，中日英三语，零依赖静态构建。

## 现在怎么跑

```bat
limo.cmd build        构建到 dist/
limo.cmd dev          构建并起本地预览 → http://127.0.0.1:4321/zh/
new.cmd zh "标题"      新建一篇文章（zh / ja / en）
```

> 这台机器没有全局 Node，`limo.cmd` 和 `new.cmd` 里指向的是 DSH 自带的运行时
> `D:\DSH\resources\runtime\primary-runtime\dependencies\node\bin\node.exe`。
> DSH 升级或换目录后，改那两个 `.cmd` 里的这一行就行。

## 目录

```
content/<lang>/posts/*.md   文章（markdown + front matter）
src/i18n.mjs                三语文案，改全站文字改这里
src/gacha.mjs               扭蛋台词池
src/styles.css              视觉系统
src/client.js               扭蛋 + 配色器交互
tools/build.mjs             生成器（零依赖）
tools/serve.mjs             本地预览服务器
dist/                       构建产物，不要手改
```

## 加一篇文章

```bat
new.cmd zh "今天也没有做成任何事"
```

会生成 `content/zh/posts/2026-10-30-ab12.md`，写完后 `limo.cmd build`。

日文/英文版如果只是机翻，加 `--translated`，列表里会挂一个「译」角标：

```bat
new.cmd ja "今日も何もできなかった" --translated
```

## 改台词

`src/gacha.mjs` 里三个语言各有一个 `common` 数组和一个 `rare` 数组，往下加一行就行。
稀有池概率在文件末尾的 `RARE_CHANCE`。

## 改措辞

`src/i18n.mjs`。首页那句话、按钮、空状态都在这儿。

## 一点设计约定

- **全站纯色**：不铺渐变、不铺纹理。底色只有三种——纯黑、满屏角色色、纸白。
- **每页一个主色，取自角色代表色**：首页 阿良良木历（黑）、lab 八九寺真宵（黄绿满屏）、扭蛋 千石抚子（橙，黑卡浮在上面）、配色器 神原骏河（蓝，黑底）、写作 战场原黑仪（紫满屏）、文章与 about 羽川翼（纸白）。
- 稀有台词的金色借用忍野忍。
- 每页有**巨型编号水印**（00–04，压在底层，顶部被裁掉）和**右侧竖排边注**。
- 扭蛋台词按情绪上色：日常 / 自嘲 / 锐利 / 温柔 / 稀有。改台词时要在 `src/gacha.mjs` 的 `MOODS` 里对齐。
- 转场只挂在"大跨越"的链接上（`data-wipe`）：黑↔纸、首页→lab、lab→工具页。站内小跳硬切。
- 动效是硬的：120–160ms 硬切，不做缓动，不做视差。
- 台词全部原创。物语的语感可以学，句子不能抄。

## 还没做的

- 部署：没有 git。下一步要么装 git，要么用 `dugite`（npm 包里自带 git 二进制）。
- OG 卡片图、RSS、评论。都还没做。
