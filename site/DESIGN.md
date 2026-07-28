# Gem site — design notes

The marketing site for Gem (`site/`, Next.js App Router). The visual identity —
warm paper ground, Bricolage Grotesque display over Instrument Sans body,
emerald accent, scrollytelling demo — was established before this file and is
not up for re-litigation here. This file records the references that ground
changes to it, so future work isn't generated from the model's internal average
of "SaaS landing page."

## Design read

A keyboard-first desktop utility that sells a *panel you summon over other
apps*. The product is the proof: the register is product-shot-led, quiet, and
factual — closer to Linear/ToDesktop than to a consumer app's photography.
Because it is free and open source, the page never needs to sell hard; it needs
to show the thing working and get out of the way.

## References

Pulled from Mobbin (`search_sections`, 2026-07-28) while auditing the pinboards
section. Query: *desktop utility app feature section with a two-column split,
product screenshot on one side and a short heading plus supporting body copy on
the other.*

- **[Linear](https://mobbin.com/sites/sections/8b3beefe-4449-4b8c-a498-d6633521e8a8)**
  — each claim gets its own bordered card with a product-detail image; one
  heading, one short body block, never two stacked paragraphs. Emulate: one
  idea per unit.
- **[Hex](https://mobbin.com/sites/sections/582c5a98-003a-4c9c-829d-0a491a6c36ce)**
  — splits a section into two labelled columns, then puts the *secondary*
  details in a compact icon-chip row underneath, visibly lighter than the body
  copy. Emulate: secondary detail changes treatment, not just position.
- **[ToDesktop](https://mobbin.com/sites/sections/90fefda0-8306-46f4-875c-6a8a37fed96f)**
  — closest register match (Electron-app tooling). Feature cards above, then a
  single dense strip of minor capabilities ("Hotkeys · Custom Menus ·
  Multi-window support…"). Emulate: the long tail of small features belongs in
  one compact row, not in prose.
- **[Wispr Flow](https://mobbin.com/sites/sections/ddc48c4a-43de-4cdc-89f0-791148ca1b3e)**
  — platform availability as pills *above* the heading rather than a sentence
  inside the copy. Emulate: platform facts are chrome, not prose.
- **Notion / Dropbox** — both returned the equal-width 3-card feature grid.
  Logged as an **anti-reference**: `web-design-nogos` bans defaulting to that
  shape, and this page correctly does not use it.

**What this changed:** the pinboards section had picked up a second
`.section-lede` paragraph of identical weight under its heading. No reference
does that — two equal paragraphs blur which one is the section's claim. It is
now one short `.section-note` (smaller, `--ink-faint`), matching how all four
usable references treat a supporting detail.

## Component matching

No section was hand-built this round — the only change was to copy and text
hierarchy inside an existing, already-designed section, so no
`component-library` / 21st.dev lookup applied. A new section here does need
one: catalog first (`docs/catalog/index.md`), then 21st.dev, then hand-build,
logging matches and misses in this file.
