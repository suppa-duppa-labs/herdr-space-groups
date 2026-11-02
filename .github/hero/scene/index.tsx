import { ChevronDown, Folder, Plus, Terminal, X } from 'lucide-react'
import '@fontsource-variable/geist'
import '@fontsource-variable/jetbrains-mono'
import { Stage, type Act } from '../../kit'
import './hero.css'

const MARK = { teal: '#22a99a', orange: '#e3814f', blue: '#5b8def', violet: '#8b7cf6', green: '#3fae6a', pink: '#d9649a' }

type Space = { id: string; name: string; color: string; tail?: string }
const SPACES: Record<string, Space> = {
  web: { id: 'web', name: 'web', color: MARK.orange, tail: 'checkout-flow' },
  design: { id: 'design', name: 'design', color: MARK.violet },
  mobile: { id: 'mobile', name: 'mobile', color: MARK.pink },
  api: { id: 'api', name: 'api', color: MARK.teal, tail: 'auth-tokens' },
  infra: { id: 'infra', name: 'infra', color: MARK.green },
  notes: { id: 'notes', name: 'notes', color: MARK.blue },
  logs: { id: 'logs', name: 'logs', color: MARK.violet },
}

type S = {
  product: string[]
  platformOpen: boolean
  loose: string[]
  active: string
  focused: string | null
  pressed: string | null
  over: string | null
  leaving: string | null
  landing: string | null
  hidden: boolean
}

const initial: S = {
  product: ['web', 'design'],
  platformOpen: false,
  loose: ['mobile', 'notes', 'logs'],
  active: 'web',
  focused: null,
  pressed: null,
  over: null,
  leaving: null,
  landing: null,
  hidden: false,
}

const poster: S = {
  ...initial,
  product: ['web', 'design', 'mobile'],
  loose: ['notes', 'logs'],
  platformOpen: true,
  active: 'api',
  focused: 'api',
}

const PLATFORM = ['api', 'infra']
const ORDER = ['product', 'platform', ...Object.keys(SPACES)]
const GROUP = 28
const ROW = 30

type Entry = { key: string; kind: 'group' | 'space'; y: number; shown: boolean; grouped: boolean }

function layout(s: S): Entry[] {
  const out: Entry[] = []
  let y = 0
  const group = (key: string) => {
    out.push({ key, kind: 'group', y, shown: true, grouped: false })
    y += GROUP
  }
  const space = (key: string, grouped: boolean) => {
    out.push({ key, kind: 'space', y, shown: true, grouped })
    y += ROW
  }
  group('product')
  s.product.forEach((id) => space(id, true))
  group('platform')
  const header = y - GROUP
  if (s.platformOpen) PLATFORM.forEach((id) => space(id, true))
  else PLATFORM.forEach((id, i) => out.push({ key: id, kind: 'space', y: header + GROUP + i * ROW, shown: false, grouped: true }))
  s.loose.forEach((id) => space(id, false))
  return out.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key))
}

function Chevron({ open }: { open: boolean }) {
  return <ChevronDown size={12} strokeWidth={2} className="sg-chev" style={{ rotate: open ? '0deg' : '-90deg' }} />
}

function GroupHead({ id, name, open, s }: { id: string; name: string; open: boolean; s: S }) {
  const holds = !open && id === 'platform' && PLATFORM.includes(s.active)
  return (
    <div className="sg-group" data-target={`group-${id}`} data-on={s.over === id || holds || undefined}>
      <Folder size={14} strokeWidth={2} className="sg-dim" />
      <span className="sg-group-name">{name}</span>
      <Chevron open={open} />
    </div>
  )
}

function SpaceRow({ sp, s, grouped }: { sp: Space; s: S; grouped: boolean }) {
  return (
    <div
      className="sg-space"
      data-target={`space-${sp.id}`}
      data-grouped={grouped || undefined}
      data-on={s.active === sp.id || undefined}
      data-pressed-row={s.pressed === sp.id || undefined}
    >
      <span className="sg-avatar" style={{ background: sp.color }}>{sp.name[0].toUpperCase()}</span>
      <span className="sg-name">{sp.name}</span>
      {sp.tail && <span className="sg-tail">{sp.tail}</span>}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="sg-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9.4" stroke="#433b2d" />
      <path d="M12 2.6a9.4 9.4 0 0 1 9.4 9.4" />
    </svg>
  )
}

function Bot() {
  return (
    <svg className="sg-dim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}

function Pane({ id }: { id: string }) {
  const agent = id === 'api'
  return (
    <div className="sg-pane">
      <div className="sg-pane-title">
        {agent ? <Bot /> : <Terminal size={14} strokeWidth={2} className="sg-dim" />}
        <span className="sg-pane-name">{agent ? 'migrations' : 'bash'}</span>
        <span className="sg-pane-path">~/{id}</span>
      </div>
      {agent ? (
        <div className="sg-prompt">
          <div className="sg-out">2 migrations pending</div>
          Apply 0042? (y/n)<span className="sg-caret" />
        </div>
      ) : (
        <div className="sg-prompt">
          {id} $<span className="sg-caret" />
        </div>
      )}
    </div>
  )
}

async function script(a: Act<S>) {
  a.mark('open')
  await a.wait(500)
  const row = a.rect('space-mobile')
  const from = { x: row.x + row.width * 0.62, y: row.y + row.height / 2 }
  await a.move(from)
  await a.wait(150)
  a.mark('drag')
  const head = a.rect('group-product')
  const to = { x: head.x + head.width * 0.62, y: head.y + head.height / 2 }
  await a.drag(to, (at) => {
    const over = at.y >= head.y && at.y <= head.y + head.height ? 'product' : null
    a.put({ pressed: 'mobile', over })
  }, { duration: 1100 })
  a.mark('drop')
  await a.set({ leaving: 'mobile' })
  await a.wait(100)
  await a.set({ pressed: null, over: null, leaving: null, landing: 'mobile', product: ['web', 'design', 'mobile'], loose: ['notes', 'logs'] })
  await a.wait(700)
  await a.set({ landing: null })
  await a.wait(100)
  const agent = a.rect('agent-api')
  await a.move({ x: agent.x + agent.width * 0.5, y: agent.y + agent.height * 0.55 })
  await a.wait(120)
  await a.click()
  a.mark('unfold')
  await a.set({ focused: 'api', active: 'api', platformOpen: true })
  await a.wait(500)
  await a.move({ x: 392, y: 404 }, { duration: 900 })
  await a.wait(1800)
  const plat = a.rect('group-platform')
  await a.move({ x: plat.x + plat.width * 0.62, y: plat.y + plat.height / 2 })
  await a.wait(120)
  await a.click()
  a.mark('fold')
  await a.set({ platformOpen: false })
  await a.wait(1200)
  a.mark('reset')
  await a.set({ hidden: true })
  await a.wait(280)
  await a.snap({ ...initial, hidden: true })
  a.place({ x: 216, y: 301 })
  await a.set({ hidden: false })
  await a.wait(300)
}

export default function SpaceGroupsHero() {
  return (
    <Stage
      width={496}
      height={512}
      initial={initial}
      poster={poster}
      script={script}
      play="loop"
      theme="dark"
      cursor={{ at: { x: 216, y: 301 } }}
      className="sg"
    >
      {(s) => {
        const entries = layout(s)
        return (
          <div className="sg-app" data-hidden={s.hidden || undefined}>
            <div className="sg-sidebar">
              <div className="sg-spaces">
                <div className="sg-head">
                  <span>Spaces</span>
                  <span className="sg-icon-btn"><Plus size={14} strokeWidth={2} /></span>
                </div>
                <div className="sg-list">
                  {entries.map((e) => (
                    <div key={e.key} className="sg-slot" data-shown={e.shown || undefined} data-leaving={s.leaving === e.key || undefined} data-landing={s.landing === e.key || undefined} style={{ transform: `translateY(${e.y}px)` }}>
                      {e.kind === 'group'
                        ? <GroupHead id={e.key} name={e.key === 'product' ? 'Product' : 'Platform'} open={e.key === 'product' || s.platformOpen} s={s} />
                        : <SpaceRow sp={SPACES[e.key]} s={s} grouped={e.grouped} />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="sg-agents">
                <div className="sg-agents-head">
                  <span>Agents</span>
                  <Folder size={14} strokeWidth={2} />
                </div>
                <div className="sg-agents-list">
                  <div className="sg-agent-group">Product</div>
                  <div className="sg-agent">
                    <Bot />
                    <span className="sg-agent-name">web</span>
                    <span className="sg-agent-more">· checkout</span>
                    <span className="sg-grow" />
                    <span className="sg-working"><Spinner /></span>
                  </div>
                  <div className="sg-agent-group">Platform</div>
                  <div className="sg-agent" data-target="agent-api" data-on={s.focused === 'api' || undefined}>
                    <Bot />
                    <span className="sg-agent-name">api</span>
                    <span className="sg-agent-more">· migrations</span>
                    <span className="sg-grow" />
                    <span className="sg-needs">Needs you</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="sg-main">
              <div className="sg-tab">
                <Terminal size={14} strokeWidth={2} />
                <span>1</span>
                <X size={12} strokeWidth={2} className="sg-dim" />
              </div>
              <Pane id={s.active} />
            </div>
          </div>
        )
      }}
    </Stage>
  )
}
