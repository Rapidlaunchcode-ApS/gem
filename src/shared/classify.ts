import type { ClipKind } from './types'

const URL_RE = /^(https?:\/\/|www\.)[^\s]+$/i
const COLOR_RE =
  /^(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\))$/i

const CODE_HINTS: RegExp[] = [
  /\b(function|const|let|var|return|import|export|class|interface|enum)\b/,
  /\b(def|lambda|elif|self\.)\b/,
  /\b(public|private|protected|static|void|struct|impl|fn|func)\b/,
  /=>|::|->|\|\||&&|===|!==/,
  /^\s*(if|for|while|switch|try)\s*\(/m,
  /[;{}]\s*$/m,
  /^\s*(#include|using namespace|package |from .+ import )/m,
  /<\/?[a-z][\w-]*(\s[^>]*)?>/i,
  /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/im,
  /^\s*[$#]\s+\w+/m
]

const MD_HINTS: RegExp[] = [
  /^#{1,6}\s+\S/m,
  /^\s*[-*+]\s+\S/m,
  /^\s*\d+\.\s+\S/m,
  /\[[^\]]+\]\([^)]+\)/,
  /(^|\n)```/,
  /\*\*[^*]+\*\*/,
  /^>\s+\S/m
]

function scoreHints(text: string, hints: RegExp[]): number {
  return hints.reduce((score, re) => (re.test(text) ? score + 1 : score), 0)
}

export function classifyText(raw: string): ClipKind {
  const text = raw.trim()
  if (URL_RE.test(text)) return 'link'
  if (COLOR_RE.test(text)) return 'color'

  const codeScore = scoreHints(text, CODE_HINTS)
  const mdScore = scoreHints(text, MD_HINTS)
  const multiline = text.includes('\n')

  if (/(^|\n)```/.test(text)) return 'markdown'
  if (codeScore >= 2 || (codeScore >= 1 && multiline && /^\s{2,}/m.test(text))) return 'code'
  if (mdScore >= 2) return 'markdown'
  return 'text'
}
