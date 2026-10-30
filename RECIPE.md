# Space groups

The Spaces sidebar with groups you make by hand: inside each machine's section, foldable group headers with their spaces indented under them, and the spaces in no group below.
Everything else is Herdr's own Spaces sidebar.

![Space groups](preview.png)

**What you see:**

- The Spaces sidebar as Herdr ships it (title row with +, a header per machine once one isn't this computer, avatar rows 30px tall, worktree rows 28px under their checkout, repo/branch/ahead/behind hints), on `chrome`.
- Inside each machine's section, first its groups in the order they were made, then its spaces in no group.
- A group header: 26px tall, 8px side padding, rounded 7, a 13px `folder.svg` in `dim`, the name at 12px in `muted`, and a chevron (down open, right folded) at 11px in `dim`; `hover` background.
- A group's space rows are indented 12px from the left.
- A folded group hides its rows; when it holds the shown space, its header gets the `selected` background.
- The collapsed rail (sidebar under 160px) shows a centered folder icon per group, and hides a folded group's numbered rows.

**How it behaves:**

- Click a space to switch to it; click a group header to fold or unfold it.
- Right-click a space: Rename, items other mods added, New worktree, Open worktree, Remove worktree (for a worktree), then Move to group… and Remove from group (only when in one), then Close.
  A worktree row nested under its checkout has no group items: it goes with its checkout's group.
- Move to group… opens a 380px dialog titled "Move <space> to a group": a Group field over the machine's groups filtered by what is typed, the current one checked, and "New group “<text>”" last when no group has that name.
  ↑/↓ move, Enter or a click picks, Esc closes.
- Right-click a group header: Rename group (a dialog with the name selected, Save disabled while empty or taken on that machine) and Delete group (its spaces go back to no group).
- Drag a space onto a space row of the same machine: the accent line shows where it lands; on release it joins that row's group and moves there (`space.move`).
  Onto a group header (highlighted `selected`): it joins that group.
  A nested worktree row only moves.
- Groups live in shared `space-groups`: `{ groups: [{ id, name, machine, folded }], spaces: { <space id>: <group id> } }`.
  Space ids carry their machine.
  An entry whose space is gone is dropped once that machine's layout is `ready`.

**Built from:**

- One mod, `space-groups`, used as the content of the layout's spaces block; it opens its menu (popup, 200 wide, at most 360 tall) and dialogs as overlays of itself with `props.role` = `menu`, `move` or `rename`.
- `sidebar.js` and `menu.js` start from Herdr's `spaces` and `menu` mods; `groups.js` holds the shared state; `dialogs.js` the two dialogs.
- Icons from `mods/workspace-chrome/`: folder, folder-plus, minus, check, chevrons, plus the ones the shipped sidebar and menu use.
- Other mods add space menu items through shared `space-groups.menu`: `{ <mod>: [{ label, icon?, spaces?, except?, overlay }] }`; the overlay opens with `space` added to its props.

**Watch out:**

- Mods can't import another mod's files, so the shipped sidebar and menu are copied, not extended.
- A dialog with no height fits its content, and a scrolling list inside it collapses unless it gets an explicit height.
- `localStorage` is per mod copy; groups are in shared state so every copy and layout agrees.
- Don't prune entries for a machine that is loading or away: its spaces are missing then.

**Done when:**

- `herdr-app check` passes.
- A layout whose spaces block uses `space-groups` shows group headers inside each machine section, ungrouped spaces below, and the shipped rows unchanged.
- Move to group… with a new name creates the group and moves the space; Remove from group puts it back below.
- Folding survives a restart; deleting a group leaves its spaces ungrouped.
- Dragging a space onto another group's row or header moves it into that group.
