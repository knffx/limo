---
title: 示例 · 这篇文章可以删掉
date: 2026-10-30
summary: 用来验证写作管线的一篇占位文章。
translated: false
---

这篇是为了证明管线通了：`content/zh/posts/` 里的 markdown 会被渲染成这个页面。删掉这个文件、重新构建，它就从列表里消失。

## 怎么写下一篇

```bat
new.cmd zh "标题"
limo.cmd build
```

中间那个 `zh` 可以换成 `ja` 或 `en`。日英两篇如果只是机翻，加 `--translated`，列表里会挂一个「译」角标。

> 沉默不是没有话说，是话太多，懒得挑。

就这样。
