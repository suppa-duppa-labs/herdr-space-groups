# Space groups for Herdr

Folders for the Spaces sidebar of the [Herdr](https://herdr.dev) desktop app.
Put your spaces in groups you name yourself, fold the ones you are not working on, and drag spaces between them.

<p align="center">
  <img src="preview.png" width="268" alt="Spaces sidebar with groups">
</p>

- **Groups per machine.** Each machine's section gets its own groups, with the spaces in no group listed below them.
- **Fold away.** Click a group's header to fold it; a folded group that holds the shown space stays highlighted.
- **Drag and drop.** Drag a space onto another group's space or header to move it there.
- **Kept across restarts.** Groups and their folded state survive restarts and app updates.
- **Everything else stays.** It is Herdr's own Spaces sidebar with groups added: switching, the space menu, worktrees under their checkout, repo and branch hints, the collapsed rail.

## Install

Ask the agent in your Herdr window:

```text
Read ~/.config/herdr-app/AGENTS.md, then add this mod: github.com/suppa-duppa-labs/herdr-space-groups
```

It reads [RECIPE.md](RECIPE.md) and the files, copies `mods/space-groups/` into `~/.config/herdr-app/mods/`, and checks it.

Or by hand, on the computer that runs the Herdr app:

```sh
mkdir -p ~/.config/herdr-app/mods && curl -fsSL https://github.com/suppa-duppa-labs/herdr-space-groups/archive/main.tar.gz | tar -xz -C ~/.config/herdr-app/mods --strip-components=2 herdr-space-groups-main/mods/space-groups
herdr-app check ~/.config/herdr-app/mods/space-groups
```

Run the same lines again to update.

If you install it under another folder name, change `MOD` in `groups.js` to match, because the menu and dialogs open as overlays of the mod by that name.

## Turn it on

The mod replaces the Spaces sidebar in a layout of your own.
Herdr's shipped layouts are read-only, so if you are on one of them, duplicate it first with Duplicate layout in the command palette, or:

```sh
herdr-app do layout.clone '{"name":"main","as":"my-layout"}'
```

That also switches to the copy.
In `~/.config/herdr-app/layouts/my-layout.json`, set the Spaces block's `"mod"` to `"space-groups"`:

```json
{ "id": "spaces", "type": "block", "content": { "mod": "space-groups" } }
```

The window picks it up within a second.

## Use

<p align="center">
  <img src="screenshots/menu.png" width="450" alt="The space menu with Move to group and Remove from group">
</p>

| To | Do |
|---|---|
| Make a group | Right-click a space, choose **Move to group…**, type a new name and press Enter. |
| Move a space to a group | **Move to group…** and pick one of that machine's groups, or drag the space onto a space in that group or onto the group's header. |
| Take a space out | Right-click it and choose **Remove from group**, or drag it onto a space in no group. |
| Reorder spaces | Drag a space onto another space; it lands at that spot and joins that space's group. |
| Fold a group | Click its header. |
| Rename a group | Right-click its header and choose **Rename group**. |
| Delete a group | Right-click its header and choose **Delete group**; its spaces go back to no group. |

A worktree listed under its checkout goes with its checkout's group.

<p align="center">
  <img src="screenshots/move.png" width="410" alt="The Move to group dialog">
</p>

Groups are kept on the computer running the app, in its shared state (`shared.json`, key `space-groups`).
They hold spaces by id, which includes the machine (`server/sp1f…`).
A closed space leaves its group once its machine's spaces can be read again, so a machine that is away keeps its groups.

Like Herdr's own sidebar, the mod runs `git` in each space's folder for the repo and branch hints and `hc machine ls` for the machine list.
It makes no network requests of its own.

## Uninstall

1. In your layout, set the Spaces block's `"mod"` back to `"spaces"`.
2. Delete `~/.config/herdr-app/mods/space-groups`.

Your groups stay in `shared.json` and come back if you install the mod again.

## Compatibility

- Tested with Herdr app 0.1.9.
- Standalone: needs no other mod, program or setting.
- `sidebar.js` and `menu.js` start from Herdr's own `spaces` and `menu` mods, so later changes to Herdr's sidebar reach this one only when it is updated.

## Adding items to the space menu

Other mods can add items to a space's right-click menu through the shared key `space-groups.menu`.
Each mod writes its own entry, an array of items:

```js
import { shared, setShared } from "herdr";

setShared("space-groups.menu", {
  ...(shared("space-groups.menu") ?? {}),
  "my-mod": [
    { label: "Open board…", icon: "mods/my-mod/board.svg", overlay: { mod: "my-mod", kind: "dialog", width: 480 } },
  ],
});
```

- `overlay` is opened as given, with `space` (the space's id) added to its `props`.
- `spaces` shows the item only for those space ids, and `except` hides it for them.
- `icon` is optional, a path in the app's folder drawn tinted.

## License

MIT, see [LICENSE](LICENSE).
`sidebar.js` and `menu.js` are adapted from the `spaces` and `menu` mods of the [Herdr app](https://github.com/herdrdev/herdr-app), under the Apache License 2.0; see [NOTICE](NOTICE) and [LICENSE-APACHE](LICENSE-APACHE).
[RECIPE.md](RECIPE.md) is the brief to build the mod from scratch.
