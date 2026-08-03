<p align="center">
  <img src="https://raw.githubusercontent.com/Rapidlaunchcode-ApS/gem/main/build/logo.png" alt="Gem logo" width="132" height="132">
</p>

<h1 align="center">Gem</h1>

<p align="center">
  A free, open-source, context-aware clipboard manager for <b>macOS</b> and <b>Windows</b>.<br>
  Every copy, kept and understood.
</p>

<p align="center">
  <a href="https://github.com/Rapidlaunchcode-ApS/gem/releases/latest/download/Gem-macOS-universal.zip"><b>Download for Mac</b></a> ·
  <a href="https://github.com/Rapidlaunchcode-ApS/gem/releases/latest/download/Gem-Windows-Setup.exe"><b>Download for Windows</b></a> ·
  <a href="https://www.gemclipboard.app"><b>Gem Clipboard website</b></a> ·
  <a href="CHANGELOG.md"><b>Changelog</b></a>
</p>

<!-- Badges must stay on ONE source line — a newline between them makes GitHub
     break each onto its own row instead of laying them out inline. -->
<p align="center"><img src="https://img.shields.io/github/v/release/Rapidlaunchcode-ApS/gem?color=2fbf71&label=release" alt="Latest release">&nbsp; <img src="https://img.shields.io/github/stars/Rapidlaunchcode-ApS/gem?color=2fbf71" alt="GitHub stars">&nbsp; <img src="https://img.shields.io/github/downloads/Rapidlaunchcode-ApS/gem/total?color=2fbf71&label=downloads" alt="Downloads">&nbsp; <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-2f8f5b" alt="Platforms">&nbsp; <img src="https://img.shields.io/badge/license-MIT-2fbf71" alt="MIT license"></p>

---

## What's new — v0.2.24

- **Fixed a flash when Settings closed by clicking outside the app.** The dim overlay
  now fades out in step with the panel instead of popping off mid-close.

Full history in the [changelog](CHANGELOG.md) · every version also has a
[GitHub Release](https://github.com/Rapidlaunchcode-ApS/gem/releases) with downloads and
SHA-256 checksums.

---

Gem watches your clipboard and turns every copy into something you can actually see —
highlighted code, rendered markdown, link cards, color swatches, screenshot thumbnails.
Press **⌘⇧V** (macOS) or **Ctrl+Alt+V** (Windows) to open the panel over any app, arrow
to the clip you want, and press <kbd>↵</kbd> to paste it straight back into the app you
came from.

Everything stays local — no account, no sync, no telemetry. The only network calls Gem
ever makes are the optional AI titles, and only if you turn them on with your own key.

## Download

**macOS (Universal — Intel & Apple Silicon)** — [`Gem-macOS-universal.zip`](https://github.com/Rapidlaunchcode-ApS/gem/releases/latest/download/Gem-macOS-universal.zip)
Unzip and move **Gem.app** to Applications, then open it. The build is a universal binary
signed with a **Developer ID** certificate and **notarized by Apple**, so it runs natively on
both Intel and Apple Silicon and opens straight away with no security warning.

> Gem is a menu-bar app: after it opens there's no window or Dock icon — look for the **gem
> icon in the menu bar** and press **⌘⇧V** to open the clipboard panel.

> Maintainers: see [SIGNING.md](SIGNING.md) for how the signed + notarized build is produced
> (needs an Apple Developer account).

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
| Open the panel | `⌘⇧V` | `Ctrl+Alt+V` |
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
