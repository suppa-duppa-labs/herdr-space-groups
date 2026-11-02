import { ChevronDown, Folder, FolderPlus, Plus, SquarePen, Terminal, X } from 'lucide-react'
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

type Point = { x: number; y: number }

type S = {
  product: string[]
  platformOpen: boolean
  writing: string[] | null
  loose: string[]
  active: string
  focused: string | null
  pressed: string | null
  over: string | null
  leaving: string | null
  landing: string | null
  menu: Point
  menuOpen: boolean
  menuAt: string | null
  dialog: boolean
  query: string
  hidden: boolean
}

const initial: S = {
  product: ['web', 'design'],
  platformOpen: false,
  writing: null,
  loose: ['notes', 'mobile', 'logs'],
  active: 'web',
  focused: null,
  pressed: null,
  over: null,
  leaving: null,
  landing: null,
  menu: { x: 0, y: 0 },
  menuOpen: false,
  menuAt: null,
  dialog: false,
  query: '',
  hidden: false,
}

const poster: S = {
  ...initial,
  product: ['web', 'design', 'mobile'],
  writing: ['notes'],
  loose: ['logs'],
  platformOpen: true,
  active: 'api',
  focused: 'api',
}

const PLATFORM = ['api', 'infra']
const ORDER = ['product', 'platform', 'writing', ...Object.keys(SPACES)]
const GROUP = 28
const ROW = 30
const HOME = { x: 216, y: 330 }

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
  if (s.writing) {
    group('writing')
    s.writing.forEach((id) => space(id, true))
  } else out.push({ key: 'writing', kind: 'group', y, shown: false, grouped: false })
  s.loose.forEach((id) => space(id, false))
  return out.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key))
}

const GROUPS: Record<string, string> = { product: 'Product', platform: 'Platform', writing: 'Writing' }

function Chevron({ open }: { open: boolean }) {
  return <ChevronDown size={12} strokeWidth={2} className="sg-chev" style={{ rotate: open ? '0deg' : '-90deg' }} />
}

function GroupHead({ id, open, s }: { id: string; open: boolean; s: S }) {
  const holds = !open && id === 'platform' && PLATFORM.includes(s.active)
  return (
    <div className="sg-group" data-target={`group-${id}`} data-on={s.over === id || holds || undefined}>
      <Folder size={14} strokeWidth={2} className="sg-dim" />
      <span className="sg-group-name">{GROUPS[id]}</span>
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

function Menu({ at, hover }: { at: Point; hover: string | null }) {
  const item = (id: string, icon: React.ReactNode, label: string, hint?: string) => (
    <div className="sg-mi" data-target={`menu-${id}`} data-on={hover === id || undefined}>
      {icon}
      <span className="sg-grow">{label}</span>
      {hint && <span className="sg-hint">{hint}</span>}
    </div>
  )
  return (
    <div className="sg-menu" style={{ left: at.x, top: at.y }}>
      {item('rename', <SquarePen size={14} strokeWidth={2} className="sg-mi-icon" />, 'Rename', 'shift-f2')}
      <div className="sg-sep" />
      {item('move', <Folder size={14} strokeWidth={2} className="sg-mi-icon" />, 'Move to group…')}
      <div className="sg-sep" />
      {item('close', <X size={14} strokeWidth={2} className="sg-mi-icon" />, 'Close')}
    </div>
  )
}

function MoveDialog({ query }: { query: string }) {
  const name = query.trim()
  const groups = ['Product', 'Platform'].filter((g) => g.toLowerCase().includes(name.toLowerCase()))
  const choices = [...groups.map((g) => ({ key: g, fresh: false, label: g })), ...(name ? [{ key: 'new', fresh: true, label: `New group “${name}”` }] : [])]
  return (
    <div className="sg-dialog">
      <div className="sg-dialog-head">
        <span className="sg-dialog-title">Move notes to a group</span>
        <span className="sg-hint">Esc</span>
      </div>
      <div className="sg-field">
        {query ? <span>{query}</span> : <span className="sg-placeholder">Group</span>}
        <span className="sg-field-caret" data-empty={!query || undefined} />
      </div>
      <div className="sg-choices">
        {choices.map((c, i) => (
          <div key={c.key} className="sg-choice" data-target={`choice-${c.key}`} data-on={i === 0 || undefined}>
            {c.fresh ? <FolderPlus size={14} strokeWidth={2} className="sg-mi-icon" /> : <Folder size={14} strokeWidth={2} className="sg-mi-icon" />}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

async function script(a: Act<S>) {
  a.mark('open')
  await a.wait(500)
  const notes = a.rect('space-notes')
  const press = { x: notes.x + notes.width * 0.42, y: notes.y + notes.height / 2 }
  await a.move(press)
  await a.click(undefined, { right: true })
  a.mark('menu')
  await a.set({ menu: { x: press.x + 2, y: press.y + 2 }, menuOpen: true })
  await a.wait(350)
  const move = a.rect('menu-move')
  await a.move({ x: move.x + move.width * 0.45, y: move.y + move.height / 2 }, { onMove: (at) => {
    const over = at.y >= move.y && at.y <= move.y + move.height ? 'move' : null
    a.put({ menuAt: over })
  } })
  await a.set({ menuAt: 'move' })
  await a.wait(150)
  await a.click()
  a.mark('dialog')
  await a.set({ menuOpen: false, dialog: true })
  await a.wait(450)
  await a.type('query', 'Writing', { interval: 70 })
  await a.wait(350)
  const fresh = a.rect('choice-new')
  await a.move({ x: fresh.x + fresh.width * 0.4, y: fresh.y + fresh.height / 2 })
  await a.wait(100)
  await a.click()
  a.mark('created')
  await a.set({ dialog: false, leaving: 'notes' })
  await a.wait(100)
  await a.set({ leaving: null, landing: 'notes', writing: ['notes'], loose: ['mobile', 'logs'] })
  await a.wait(650)
  await a.set({ landing: null })
  await a.wait(300)
  const row = a.rect('space-mobile')
  await a.move({ x: row.x + row.width * 0.62, y: row.y + row.height / 2 })
  await a.wait(150)
  a.mark('drag')
  const head = a.rect('group-product')
  const to = { x: head.x + head.width * 0.62, y: head.y + head.height / 2 }
  await a.drag(to, (at) => {
    const over = at.y >= head.y && at.y <= head.y + head.height ? 'product' : null
    a.put({ pressed: 'mobile', over })
  }, { duration: 1200 })
  a.mark('drop')
  await a.set({ leaving: 'mobile' })
  await a.wait(100)
  await a.set({ pressed: null, over: null, leaving: null, landing: 'mobile', product: ['web', 'design', 'mobile'], loose: ['logs'] })
  await a.wait(650)
  await a.set({ landing: null })
  await a.wait(100)
  const agent = a.rect('agent-api')
  await a.move({ x: agent.x + agent.width * 0.5, y: agent.y + agent.height * 0.55 })
  await a.wait(120)
  await a.click()
  a.mark('unfold')
  await a.set({ focused: 'api', active: 'api', platformOpen: true })
  await a.wait(500)
  await a.move({ x: 392, y: 430 }, { duration: 900 })
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
  a.place(HOME)
  await a.set({ hidden: false })
  await a.wait(300)
}

export default function SpaceGroupsHero() {
  return (
    <Stage
      width={496}
      height={546}
      initial={initial}
      poster={poster}
      script={script}
      play="loop"
      theme="dark"
      cursor={{ at: HOME }}
      className="sg"
    >
      {(s) => {
        const entries = layout(s)
        return (
          <>
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
                          ? <GroupHead id={e.key} open={e.key !== 'platform' || s.platformOpen} s={s} />
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
            <div className="sg-layer" data-on={s.menuOpen || undefined}>
              <Menu at={s.menu} hover={s.menuAt} />
            </div>
            <div className="sg-layer" data-on={s.dialog || undefined}>
              <MoveDialog query={s.query} />
            </div>
          </>
        )
      }}
    </Stage>
  )
}
