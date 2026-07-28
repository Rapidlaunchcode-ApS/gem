# Gem — agent notes

Electron clipboard manager (main / preload / renderer under `src/`), plus the
marketing site in `site/`. `pnpm` only.

- `pnpm dev` — electron-vite with the real app. To inspect renderer CSS without
  launching Electron: `pnpm exec vite src/renderer --port 3111`.
- `pnpm typecheck` — the gate. Runs both tsconfigs.
- `pnpm dist` / `pnpm dist:win` — signed+notarized macOS build / Windows installer.

## Releasing

Every release bumps `package.json` **and** adds a `CHANGELOG.md` entry, ships via
PR, then tags `vX.Y.Z` on main. The GitHub Release must carry all six update-feed
assets (`Gem-macOS-universal.zip` + `.blockmap` + `latest-mac.yml`,
`Gem-Windows-Setup.exe` + `.blockmap` + `latest.yml`) or electron-updater breaks
for everyone already on ≥0.2.7. Push and release run as the
`Rapidlaunchcode-ApS` gh account.

## Autonomy

push-to-main: allowed
