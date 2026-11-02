#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const STAGESHOW_REPO = 'https://github.com/benjitaylor/skills'
const STAGESHOW_COMMIT = '802057409787133703c56001080169e347305572'
const FONTS = ['@fontsource-variable/geist@5.3.0', '@fontsource-variable/jetbrains-mono@5.3.0']
const SCENE = 'space-groups'
const FPS = 25

const here = dirname(fileURLToPath(import.meta.url))
const checkout = join(here, '.stageshow')
const kit = join(checkout, 'stageshow')
const out = join(here, `${SCENE}.gif`)
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' })

if (!existsSync(join(kit, 'package.json'))) {
  rmSync(checkout, { recursive: true, force: true })
  run('git', ['clone', '--filter=blob:none', '--no-checkout', STAGESHOW_REPO, checkout])
  run('git', ['checkout', STAGESHOW_COMMIT], checkout)
}
if (!existsSync(join(kit, 'node_modules', '@fontsource-variable', 'geist'))) {
  run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], kit)
  run('npm', ['install', '--no-save', '--ignore-scripts', '--no-audit', '--no-fund', ...FONTS], kit)
}
const sceneDir = join(kit, 'examples', SCENE)
rmSync(sceneDir, { recursive: true, force: true })
cpSync(join(here, 'scene'), sceneDir, { recursive: true })

const load = (name, entry) => import(pathToFileURL(join(kit, 'node_modules', name, entry)).href)
const { createServer } = await load('vite', 'dist/node/index.js')
const { build } = await load('esbuild', 'lib/main.js')
const { chromium } = await load('playwright-core', 'index.mjs')

const clock = await build({
  entryPoints: [join(kit, 'kit', 'clock.ts')],
  bundle: true,
  format: 'iife',
  globalName: 'stageshowClock',
  write: false,
})
const init = `${clock.outputFiles[0].text};stageshowClock.installVirtualClock({ fps: ${FPS}, epoch: 0 })`

const server = await createServer({
  root: join(kit, 'playground'),
  configFile: join(kit, 'playground', 'vite.config.ts'),
  logLevel: 'warn',
  server: { host: '127.0.0.1', port: 0, strictPort: false },
})
await server.listen()
const url = `${server.resolvedUrls.local[0]}?capture=${SCENE}`

const frames = mkdtempSync(join(tmpdir(), `${SCENE}-`))
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' })
  await page.addInitScript(init)
  await page.goto(url)
  const stage = page.locator('#example .ss-stage').first()
  await stage.waitFor()
  await page.evaluate(() => document.fonts.ready)
  const tick = () => page.evaluate(async () => {
    const control = window.__stageshow.clock
    for (let i = 0; i < 8 && control.layoutPending; i++) await control.flushLayout()
    await control.step(1)
    for (let i = 0; i < 8 && control.layoutPending; i++) await control.flushLayout()
    return document.querySelector('#example .ss-stage')?.getAttribute('data-mark') ?? ''
  })
  const marks = {}
  let previous = ''
  let first = Infinity
  let length = Infinity
  for (let frame = 0; frame < first + length; frame++) {
    if (frame > FPS * 60) throw new Error('The scene did not loop within a minute')
    await stage.screenshot({ path: join(frames, `${String(frame).padStart(5, '0')}.png`), animations: 'allow' })
    const mark = await tick()
    if (mark && mark !== previous) (marks[mark] ??= []).push(frame + 1)
    previous = mark
    if (marks.open?.length === 2) {
      first = marks.open[0]
      length = marks.open[1] - marks.open[0]
    }
  }
  console.log(`${length} frames, ${(length / FPS).toFixed(2)}s loop`)
  mkdirSync(dirname(out), { recursive: true })
  run('ffmpeg', [
    '-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', String(first), '-i', join(frames, '%05d.png'),
    '-frames:v', String(length),
    '-vf', 'split[a][b];[a]palettegen=max_colors=256:stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=none:diff_mode=rectangle',
    '-loop', '0', out,
  ])
  console.log(out)
} finally {
  await browser.close()
  await server.close()
  rmSync(frames, { recursive: true, force: true })
}
