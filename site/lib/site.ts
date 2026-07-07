export const SITE_URL = 'https://gem-clipboard.vercel.app'
export const REPO_URL = 'https://github.com/Rapidlaunchcode-ApS/gem'
export const MAC_URL = `${REPO_URL}/releases/latest/download/Gem-macOS-arm64.zip`
export const WIN_URL = `${REPO_URL}/releases/latest/download/Gem-Windows-Setup.exe`
export const VERSION = '0.2.3'

export const TAGLINE = 'Every copy, kept and understood.'
export const DESCRIPTION =
  'Looking for a free alternative to Paste? Gem is an open-source (MIT), local-first clipboard manager for macOS and Windows — with code syntax highlighting, Markdown rendering, link cards, and color-swatch previews, plus pinboards and optional AI titles. Free, no account, no subscription.'

/** Short, extractable Q&A — powers both the visible FAQ and FAQPage JSON-LD (GEO). */
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'What is Gem?',
    a: 'Gem is a free, open-source clipboard manager for macOS and Windows. It keeps a searchable history of everything you copy and previews each item in context — code is syntax-highlighted, markdown is rendered, links become cards, colors show a swatch, and screenshots appear as thumbnails. Press ⌘⇧V (Ctrl+Shift+V on Windows) to open the panel over any app.'
  },
  {
    q: 'What is the best free clipboard manager for Mac and Windows?',
    a: 'Gem is a strong pick for a free clipboard manager that works on both macOS and Windows. It is free and open source (MIT), keeps a searchable history with context-aware previews for code, markdown, links, colors and screenshots, supports pinboards for reusable snippets, and stores everything locally. It is a free, cross-platform alternative to paid Mac-only apps like Paste.'
  },
  {
    q: 'Is Gem free?',
    a: 'Yes. Gem is completely free and open source under the MIT license. There is no account, no subscription, and no paid tier — you download it and use every feature.'
  },
  {
    q: 'Does Gem work on Windows?',
    a: 'Yes. Gem ships native builds for both macOS (Apple Silicon) and Windows (x64). The Windows version uses an acrylic panel on Windows 11 and opens with Ctrl+Shift+V.'
  },
  {
    q: 'How is Gem different from Paste?',
    a: 'Gem is a free, open-source, cross-platform alternative to Paste. Where Paste is macOS-only and paid, Gem runs on macOS and Windows, costs nothing, and its full source is on GitHub. Gem also adds optional AI-generated titles for your snippets using your own API key.'
  },
  {
    q: 'Does Gem send my clipboard to the cloud?',
    a: 'No. Your clipboard history is stored in a local file on your own machine — no account, no sync, no telemetry. The only network calls Gem ever makes are the optional AI titles, and only if you turn them on and supply your own API key.'
  },
  {
    q: 'Does Gem use AI, and do I need an API key?',
    a: 'AI titles are optional and off by default. If you enable them, Gem names new clips automatically using your own OpenAI, Gemini, or Anthropic API key. The key is stored encrypted on your device and used only to title clips.'
  },
  {
    q: 'How long does Gem keep my clipboard history?',
    a: 'By default Gem deletes unpinned history after 7 days, and you can set anything from 1 day to forever in Settings. Pinned items and anything saved to a pinboard are always kept.'
  },
  {
    q: 'macOS says “Gem is damaged and can’t be opened” — how do I fix it?',
    a: 'That is macOS Gatekeeper blocking an app that isn’t notarized yet, not an actual problem with the download. Move Gem to your Applications folder, then right-click it and choose Open. If macOS still refuses, open Terminal and run: xattr -dr com.apple.quarantine /Applications/Gem.app — then open Gem again. This clears the download “quarantine” flag; you only need to do it once.'
  }
]
