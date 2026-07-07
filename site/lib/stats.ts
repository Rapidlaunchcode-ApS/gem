const REPO_API = 'https://api.github.com/repos/Rapidlaunchcode-ApS/gem'

export interface RepoStats {
  stars: number
  forks: number
  downloads: number
}

interface GhRelease {
  assets?: { download_count?: number }[]
}

/**
 * Live GitHub stars, forks, and total release downloads. Revalidated hourly
 * (ISR). Returns zeros on any failure so the page never breaks — and since the
 * UI only shows a metric at 500+, zeros simply render nothing.
 */
export async function getRepoStats(): Promise<RepoStats> {
  const headers = { Accept: 'application/vnd.github+json' }
  const opts = { headers, next: { revalidate: 3600 } } as const
  try {
    const [repoRes, relRes] = await Promise.all([
      fetch(REPO_API, opts),
      fetch(`${REPO_API}/releases?per_page=100`, opts)
    ])
    if (!repoRes.ok) return { stars: 0, forks: 0, downloads: 0 }

    const repo = (await repoRes.json()) as { stargazers_count?: number; forks_count?: number }
    const releases = relRes.ok ? ((await relRes.json()) as GhRelease[]) : []
    const downloads = Array.isArray(releases)
      ? releases.reduce(
          (sum, rel) =>
            sum + (rel.assets ?? []).reduce((a, asset) => a + (asset.download_count ?? 0), 0),
          0
        )
      : 0

    return {
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      downloads
    }
  } catch {
    return { stars: 0, forks: 0, downloads: 0 }
  }
}
