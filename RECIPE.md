# Space groups

The Spaces sidebar with groups you make by hand: inside each machine's section, foldable group headers with their spaces indented under them, and the spaces in no group below.
Everything else is Herdr's own Spaces sidebar.

![Space groups](preview.png)

**What you see:**

- The Spaces sidebar as Herdr ships it (title row with +, a header per machine once one isn't this computer, avatar rows 30px tall, worktree rows 28px under their checkout, repo/branch/ahead/behind hints), on `chrome`.
- Inside each machine's section, first its groups in their stored order (a new one goes last), then its spaces in no group.
- A group header: 26px tall, 8px side padding, rounded 7, a 13px `folder.svg` in `dim`, the name at 12px in `muted`, and a chevron (down open, right folded) at 11px in `dim`; `hover` background.
- A group's space rows are indented 12px from the left.
- A folded group hides its rows; when it holds the shown space, its header gets the `selected` background.
- The collapsed rail (sidebar under 160px) shows a centered folder icon per group, and hides a folded group's numbered rows.
- The Agents list as Herdr ships it, with a third sort, "Grouped by folder" (`folder.svg`), after Priority and Grouped by space.
  It shows a section per group holding agents, local machine first, then the other machines by name, each machine's groups in their stored order, then a "No folder" section.
  Section headers look like Grouped by space's; inside a section agents keep Grouped by space's order and their rows name their space, as in Priority.
  With no agent in any group (or no `space-groups` state at all), it is one plain list with no header.

**How it behaves:**

- Click a space to switch to it; click a group header to fold or unfold it.
- When the shown space changes, by any route (sidebar, agents list, command palette, a notification, keys, another mod), to one in a folded group, that group unfolds and stays unfolded.
  Folding the group that holds the shown space keeps it folded until the shown space changes into it again.
- Right-click a space: Rename, items other mods added, New worktree, Open worktree, Remove worktree (for a worktree), then Move to group… and Remove from group (only when in one), then Close.
  A worktree row nested under its checkout has no group items: it goes with its checkout's group.
- Move to group… opens a 380px dialog titled "Move <space> to a group": a Group field over the machine's groups filtered by what is typed, the current one checked, and "New group “<text>”" last when no group has that name.
  ↑/↓ move, Enter or a click picks, Esc closes.
- Right-click a group header: Rename group (a dialog with the name selected, Save disabled while empty or taken on that machine), Move up and Move down (disabled, in `dim`, for the machine's first and last group), and Delete group (its spaces go back to no group).
- Drag a space onto a space row of the same machine: the accent line shows where it lands; on release it joins that row's group and moves there (`space.move`).
  Onto a group header (highlighted `selected`): it joins that group.
  A nested worktree row only moves.
- Drag a group header onto another group header of the same machine: the same accent line shows whether it lands above or below; on release the group, with its spaces, moves there.
  A click without a drag still folds it.
- Clicking a section header in Grouped by folder folds it in the Agents list only, apart from the group's fold in the sidebar.
- Groups live in shared `space-groups`: `{ groups: [{ id, name, machine, folded }], spaces: { <space id>: <group id> } }`, in the order shown.
  Space ids carry their machine.
  An entry whose space is gone is dropped once that machine's layout is `ready`.

**Built from:**

- One mod, `space-groups`, used as the content of the layout's spaces block; it opens its menu (popup, 200 wide, at most 360 tall) and dialogs as overlays of itself with `props.role` = `menu`, `move` or `rename`.
- `sidebar.js` and `menu.js` start from Herdr's `spaces` and `menu` mods; `groups.js` holds the shared state; `dialogs.js` the two dialogs.
- A second mod, `space-groups-agents`, used as the content of the layout's agents block: Herdr's `agents` mod with the extra sort, reading the groups straight from shared `space-groups` and sharing the sort choice (`agents.sort`) with it; its sort menu opens as an overlay of itself.
- Icons from `mods/workspace-chrome/`: folder, folder-plus, minus, check, chevrons, plus the ones the shipped sidebar and menu use; `arrow-up.svg` and `arrow-down.svg` (Lucide) ship in the mod for Move up and Move down.
- Other mods add space menu items through shared `space-groups.menu`: `{ <mod>: [{ label, icon?, spaces?, except?, overlay }] }`; the overlay opens with `space` added to its props.

**Watch out:**

- Mods can't import another mod's files, so the shipped sidebar, menu and agents list are copied, not extended, and `space-groups-agents` reads the shared state itself.
- A dialog with no height fits its content, and a scrolling list inside it collapses unless it gets an explicit height.
- `localStorage` is per mod copy; groups are in shared state so every copy and layout agrees.
- Don't prune entries for a machine that is loading or away: its spaces are missing then.

**Done when:**

- `herdr-app check` passes.
- A layout whose spaces block uses `space-groups` shows group headers inside each machine section, ungrouped spaces below, and the shipped rows unchanged.
- Move to group… with a new name creates the group and moves the space; Remove from group puts it back below.
- Folding survives a restart; deleting a group leaves its spaces ungrouped.
- Switching to a space in a folded group from outside the sidebar unfolds that group.
- Dragging a space onto another group's row or header moves it into that group.
- Dragging a group header, or Move up / Move down, reorders the machine's groups, and the order survives a restart.
- A layout whose agents block uses `space-groups-agents` offers Grouped by folder, which lists agents under their spaces' groups in the sidebar's group order with the rest under No folder, and the other two sorts unchanged.
