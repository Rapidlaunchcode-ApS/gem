# Gem

**[Download for macOS](https://github.com/Rapidlaunchcode-ApS/gem/releases/latest/download/Gem-macOS-arm64.zip)** · **[Website](https://gem-clipboard.vercel.app)** · MIT

A free, context-aware clipboard manager for macOS — every copy, kept and understood.
Everything stays local — no account, no sync, no subscription. The only network
calls are the optional BYOK AI titles, made directly to the provider you configure.

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
- **Pinboards** — named boards as tabs; drag a card onto a tab or use the right-click
  menu. Boarded items are kept forever.
- **AI titles (BYOK)** — optionally name new clips automatically with your own
  OpenAI, Gemini or Anthropic API key. The key is stored encrypted via macOS
  `safeStorage` and only ever used from the local app.
- **Retention** — history is deleted after 7 days by default; choose 1 day → 1 year
  or Forever in Settings. Pinned and boarded items are always kept.
- **Search & filter** — type to search, filter chips per content type.
- **Keyboard-first** — `←/→` navigate, `↵` paste into the frontmost app, `Space` quick-look
  preview, `⇥` cycle boards, `⌘P` pin, `⌘⌫` delete, `Esc` close.
- **Menu-bar app** — gem icon in the tray, optional launch at login, no dock icon.

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
