# README hero

`space-groups.gif` is rendered from `scene/` with [Stageshow](https://github.com/benjitaylor/skills/tree/main/stageshow).

```sh
node .github/hero/render.mjs
```

It needs Node 20.19 or later, git, ffmpeg and Chromium.
Set `CHROME_PATH` when Chromium is not where Playwright looks for it.
The first run downloads Stageshow at a pinned commit into `.github/hero/.stageshow`.
