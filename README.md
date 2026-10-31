# Space groups for Herdr

Folders for the Spaces sidebar of the [Herdr](https://herdr.dev) desktop app.
Put your spaces in groups you name yourself, fold the ones you are not working on, and drag spaces between them.
Groups are kept per machine and survive restarts.

<p align="center">
  <img src="preview.png" width="268" alt="Spaces sidebar with groups">
</p>

## Install

Ask the agent in your Herdr window:

```text
Read ~/.config/herdr-app/AGENTS.md, then add this mod: github.com/suppa-duppa-labs/herdr-space-groups
```

Or by hand, on the computer that runs the Herdr app (run it again to update):

```sh
mkdir -p ~/.config/herdr-app/mods && curl -fsSL https://github.com/suppa-duppa-labs/herdr-space-groups/archive/main.tar.gz | tar -xz -C ~/.config/herdr-app/mods --strip-components=2 herdr-space-groups-main/mods/space-groups
```

## Turn it on

Herdr's shipped layouts are read-only, so first duplicate yours with Duplicate layout in the command palette, or:

```sh
herdr-app do layout.clone '{"name":"main","as":"my-layout"}'
```

In `~/.config/herdr-app/layouts/my-layout.json`, set the Spaces block's `"mod"` to `"space-groups"`:

```json
{ "id": "spaces", "type": "block", "content": { "mod": "space-groups" } }
```

## Use

<p align="center">
  <img src="screenshots/menu.png" width="450" alt="The space menu with Move to group and Remove from group">
</p>

| To | Do |
|---|---|
| Make a group or move a space into one | Right-click the space and choose **Move to group…**, then pick a group or type a new name. |
| Move or reorder spaces | Drag a space onto another space or onto a group's header. |
| Reorder groups | Drag a group's header above or below another, or right-click it and choose **Move up** or **Move down**. |
| Fold, rename or delete a group | Click its header to fold it, or right-click it for **Rename group** and **Delete group**. |

Switching to a space in a folded group unfolds it.

<p align="center">
  <img src="screenshots/move.png" width="410" alt="The Move to group dialog">
</p>

## Notes

Groups are stored on the computer running the app, in `shared.json` under `space-groups`, and make no network requests.
Tested with Herdr app 0.1.9; other mods can add space menu items through `space-groups.menu`, see [RECIPE.md](RECIPE.md), the brief to build the mod from scratch.
MIT, see [LICENSE](LICENSE); `sidebar.js` and `menu.js` are adapted from the [Herdr app](https://github.com/herdrdev/herdr-app)'s `spaces` and `menu` mods under Apache 2.0, see [NOTICE](NOTICE).
