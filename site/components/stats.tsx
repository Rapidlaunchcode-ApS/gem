import type { RepoStats } from '../lib/stats'

const THRESHOLD = 500

function compact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`
  return String(n)
}

/**
 * Social-proof row. Each metric is shown only once it clears 500, so a young
 * repo shows nothing rather than an unflattering "0 stars".
 */
export function Stats({ stats }: { stats: RepoStats }) {
  const items = [
    { label: 'downloads', value: stats.downloads },
    { label: 'GitHub stars', value: stats.stars },
    { label: 'forks', value: stats.forks }
  ].filter((i) => i.value >= THRESHOLD)

  if (items.length === 0) return null

  return (
    <div className="stats" aria-label="Project stats">
      {items.map((i) => (
        <span className="stats__item" key={i.label}>
          <span className="stats__num">{compact(i.value)}</span>
          <span className="stats__label">{i.label}</span>
        </span>
      ))}
    </div>
  )
}
