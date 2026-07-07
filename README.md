<p align="center">
  <img src="https://raw.githubusercontent.com/Rapidlaunchcode-ApS/gem/main/build/logo.png" alt="Gem logo" width="132" height="132">
</p>

<h1 align="center">Gem</h1>

<p align="center">
  A free, open-source, context-aware clipboard manager for <b>macOS</b> and <b>Windows</b>.<br>
  Every copy, kept and understood.
</p>

<p align="center">
  <a href="https://github.com/Rapidlaunchcode-ApS/gem/releases/latest/download/Gem-macOS-arm64.zip"><b>Download for Mac</b></a> ·
  <a href="https://github.com/Rapidlaunchcode-ApS/gem/releases/latest/download/Gem-Windows-Setup.exe"><b>Download for Windows</b></a> ·
  <a href="https://gem-clipboard.vercel.app"><b>Gem Clipboard website</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/v/release/Rapidlaunchcode-ApS/gem?color=2fbf71&label=release" alt="Latest release">
  <img src="https://img.shields.io/github/stars/Rapidlaunchcode-ApS/gem?color=2fbf71" alt="GitHub stars">
  <img src="https://img.shields.io/github/downloads/Rapidlaunchcode-ApS/gem/total?color=2fbf71&label=downloads" alt="Downloads">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-2f8f5b" alt="Platforms">
  <img src="https://img.shields.io/badge/license-MIT-2fbf71" alt="MIT license">
</p>

---

Gem watches your clipboard and turns every copy into something you can actually see —
highlighted code, rendered markdown, link cards, color swatches, screenshot thumbnails.
Press **⌘⇧V** (macOS) or **Ctrl+Shift+V** (Windows) to open the panel over any app, arrow
to the clip you want, and press <kbd>↵</kbd> to paste it straight back into the app you
came from.

Everything stays local — no account, no sync, no telemetry. The only network calls Gem
ever makes are the optional AI titles, and only if you turn them on with your own key.

## Download

**macOS (Apple Silicon)** — [`Gem-macOS-arm64.zip`](https://github.com/Rapidlaunchcode-ApS/gem/releases/latest/download/Gem-macOS-arm64.zip)
Unzip and move **Gem.app** to Applications. The build is ad-hoc signed but not notarized
yet, so macOS asks once. Open Gem, click **Done**, then go to **System Settings → Privacy &
Security** and click **Open Anyway** next to Gem (on older macOS, right-click Gem → **Open**).
If that doesn't appear, clear the download quarantine and reopen:

```bash
xattr -dr com.apple.quarantine /Applications/Gem.app
```

> Maintainers: see [SIGNING.md](SIGNING.md) to produce a fully signed + notarized build that
> opens with no warning (needs an Apple Developer account).

**Windows (x64)** — [`Gem-Windows-Setup.exe`](https://github.com/Rapidlaunchcode-ApS/gem/releases/latest/download/Gem-Windows-Setup.exe)
Run the installer. It isn't code-signed yet, so if SmartScreen warns, choose
**More info → Run anyway**.

Gem lives in the menu bar / system tray (look for the gem icon) — there's no dock or
taskbar window.

## Features

- **Context-aware previews** — every copy is classified automatically:
  - **Code** → syntax-highlighted with automatic language detection
  - **Markdown** → rendered preview
  - **Links** → hostname + URL card
  - **Colors** (`#hex`, `rgb()`, `hsl()`) → live swatch
  - **Images / screenshots** → thumbnail previews
  - Plain text otherwise
- **Pinboards** — organize reusable snippets into named boards (regexes, signatures,
  templates). Drag a card onto a board tab or use the right-click menu. Boarded items
  are kept forever.
- **AI titles (bring your own key)** — optionally name new clips automatically with your
  own OpenAI, Gemini, or Anthropic API key. Off by default; the key is stored encrypted
  on-device and used only to title clips. A shimmering “Naming…” label shows while a
  title is generated.
- **Retention** — unpinned history is deleted after 7 days by default; choose anything
  from 1 day to Forever in Settings. Pinned and boarded items are always kept.
- **Search & filter** — type to search; filter chips per content type.
- **Light / dark** — follows the system appearance, or force a theme in Settings.
- **Menu-bar / tray app** — optional launch at login, no dock or taskbar clutter.

## Keyboard shortcuts

| Action | macOS | Windows |
| --- | --- | --- |
| Open the panel | `⌘⇧V` | `Ctrl+Shift+V` |
| Move between clips | `←` / `→` | `←` / `→` |
| Paste into the previous app | `↵` | `↵` |
| Quick-look preview | `Space` | `Space` |
| Switch pinboards | `⇥` | `⇥` |
| Pin / unpin | `⌘P` | `Ctrl+P` |
| Delete | `⌘⌫` | `Ctrl+Backspace` |
| Close | `Esc` | `Esc` |

> **Paste in place** simulates a paste keystroke in the frontmost app. On macOS this needs
> **Accessibility** permission (System Settings → Privacy & Security). Without it the item is
> still on your clipboard — just press ⌘V / Ctrl+V yourself.

## Privacy & storage

History is a plain file on your machine:

- **macOS:** `~/Library/Application Support/Gem/`
- **Windows:** `%APPDATA%\Gem\`

(`history.json` + an `images/` folder.) Delete the folder to reset everything. AI-title API
keys are stored encrypted via the OS keychain (`safeStorage`) and never leave the app except
in the request to the provider you chose.

## Development

Built with Electron, React, and TypeScript. Uses **pnpm**.

```bash
pnpm install
pnpm dev          # run with hot reload
pnpm typecheck    # strict TS across main / preload / renderer
pnpm dist         # build a macOS .app into dist/
pnpm dist:win     # build a Windows installer into dist/
```

## License

[MIT](LICENSE) © Rapidlaunchcode
