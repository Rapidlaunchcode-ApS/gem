# Gem

A free, context-aware clipboard manager for macOS — every copy, kept and understood.
Everything stays local — no account, no sync, no subscription.

![Electron](https://img.shields.io/badge/Electron-React%20%2B%20TypeScript-blue)

## Features

- **⌘⇧V panel** — a Paste-style bottom panel slides over any app, on any display.
- **Context-aware previews** — every copy is classified automatically:
  - **Code** → syntax-highlighted with auto language detection
  - **Markdown** → rendered preview
  - **Images / screenshots** → thumbnail previews
  - **Links** → hostname + URL card
  - **Colors** (`#hex`, `rgb()`, `hsl()`) → live swatch
  - Plain text otherwise
- **Search & filter** — type to search, filter chips per content type.
- **Keyboard-first** — `←/→` navigate, `↵` paste into the frontmost app, `Space` quick-look
  preview, `⌘P` pin, `⌘⌫` delete, `Esc` close.
- **Pins** — pinned items survive the 500-item history cap and Clear History.
- **Menu-bar app** — lives in the tray (📋), optional launch at login, no dock icon.

## Development

```bash
pnpm install
pnpm dev          # run with hot reload
pnpm typecheck    # strict TS across main/preload/renderer
pnpm dist         # build a .app bundle into dist/
```

## macOS permissions

- **Paste into the frontmost app** uses System Events keystrokes — grant Gem
  (or Electron during development) **Accessibility** permission in
  System Settings → Privacy & Security. Without it, selecting an item still copies it,
  you just press ⌘V yourself.

## Storage

History is stored locally in `~/Library/Application Support/Gem/`
(`history.json` + `images/`). Delete the folder to reset everything.
