# Changelog

All notable changes to Gem are recorded here. Each version also has a matching
[GitHub Release](https://github.com/Rapidlaunchcode-ApS/gem/releases) with downloads
and SHA-256 checksums. Format loosely follows [Keep a Changelog](https://keepachangelog.com);
Gem is pre-1.0, so minor versions may include breaking changes.

## [0.2.17] — 2026-07-10

- **First-run onboarding window.** Gem now opens a proper welcome window on first launch that explains it lives in the menu bar / system tray, shows the shortcut, and how to use it — so a cold start no longer looks like "nothing happened" (the main "Windows won't launch" report). Re-openable anytime from the tray → *How to use Gem…*.
- **Configurable open shortcut.** The global hotkey is now a setting. Windows reserves **Ctrl+Shift+V** for "paste as plain text", so Gem now defaults to **Ctrl+Alt+V** on Windows (choose from a few presets in Settings → Shortcut). macOS stays on ⌘⇧V.
- **More resilient startup** — a tray-icon failure no longer aborts launch; onboarding and the shortcut still come up.
- Tray menu gains **How to use Gem…** and **Settings…** entries.

## [0.2.16] — 2026-07-09

- **Glass tuned to match the design mockup** — panel, cards, search, segments and Settings now use the approved Liquid Glass tokens (translucent surfaces, bright glass edges, top sheen) in both light and dark.
- **More polished card entries** — glassier tiles with a top sheen, translucent colored headers, and more depth.
- **Smoother open/close animation** — replaced the JS opacity timer with a GPU-composited CSS transition, fixing the minimize jitter.

## [0.2.14] — 2026-07-09

- Opening **Settings** now dims and blurs the clipboard panel behind it (a proper modal backdrop).
- **Clearer Liquid Glass** — more translucent surfaces with brighter specular edges and a stronger sheen, in both light and dark.

## [0.2.13] — 2026-07-09

- **Liquid Glass redesign.** The whole app is now far more translucent and glassy — stronger frosted blur, specular top-edge highlights, and a soft sheen on every surface (panel, cards, search, segments, Settings). The panel uses an adaptive frosted material so **light and dark are the same glass**, differing only in a subtle tint. Card headers become translucent colored glass.
- More generous spacing in the Settings window (section gaps and row breathing room).

## [0.2.12] — 2026-07-09

- Settings window now sits **above** the panel (the panel drops its always-on-top level while Settings is open).
- Fixed being unable to click away to dismiss the UI — auto-hide is now app-wide, so clicking out of the Settings window dismisses everything; moving focus between the panel and Settings is ignored.
- Added an **open/close animation**: the panel fades and warps up from the bottom on open, and fades out on close. Paste still hides instantly.

## [0.2.11] — 2026-07-09

- Opening Settings no longer minimizes the clipboard panel — it stays visible in the background. (Superseded by 0.2.12, which fixes the follow-on z-order/dismiss issues.)

## [0.2.10] — 2026-07-09

- Settings now opens as its own **screen-centered window** instead of being cramped inside the panel.
- API keys show a **masked preview** (first characters + dots) with an explicit **Save** button; the full key never leaves the main process.
- **Per-provider AI model picker** (OpenAI / Gemini / Anthropic), each defaulting to that provider's cheapest model (Haiku 4.5 / GPT-5 nano / Flash-Lite).

## [0.2.9] — 2026-07-08

- Clicking a clip copies it and **keeps the panel open** with a brief "Copied ✓" flash; the panel auto-hides when you switch away.

## [0.2.8] — 2026-07-08

- **Click to copy**: clicking a clip copies it to the clipboard and closes the panel so you can paste right away. Enter still pastes in place.

## [0.2.7] — 2026-07-08

- **First-run onboarding** walkthrough explaining the menu-bar app, ⌘⇧V, pasting, and pinboards.
- **In-app auto-updates** via electron-updater against the GitHub releases feed (Settings → Updates). Available from this version onward.

## [0.2.6] — 2026-07-07

- Refreshed **app/Dock icon** (dimensional emerald gem) and a solid, clearer **menu-bar glyph**.
- First-launch welcome notification + auto-opened panel.

## [0.2.5] — 2026-07-07

- **Universal macOS build** (Intel + Apple Silicon), signed with Developer ID and notarized.

## [0.2.4] — 2026-07-07

- macOS build is now **signed with a Developer ID and notarized by Apple** — opens with no Gatekeeper warning.

## [0.2.3] — 2026-07-07

- Fixed the macOS "Gem is damaged and can't be opened" error (ad-hoc signing).
- Cleaner social/preview (OG) image with the brand font.

## [0.2.2] — 2026-07-07

- AI titles kick in for shorter clips (from ~20 characters) and show a shimmering "Naming…" label while generating. AI titles remain opt-in (BYOK).

## [0.2.1] — 2026-07-07

- The panel now **floats**: inset from the screen edges with rounded corners and a soft shadow, on macOS and Windows.

## [0.2.0] — 2026-07-07

- **Windows support** (`Gem-Windows-Setup.exe`, x64) with an acrylic panel and Ctrl+Shift+V.
- New look: emerald gem on warm charcoal, no blue anywhere.

## [0.1.0] — 2026-07-07

- First public release for macOS: ⌘⇧V glass panel, context-aware cards (code, markdown, links, colors, images), pinboards, optional BYOK AI titles, and retention control.
