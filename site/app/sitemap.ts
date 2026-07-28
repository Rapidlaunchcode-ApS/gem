import type { MetadataRoute } from 'next'
import { SITE_URL, VERSION_DATE } from '../lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: VERSION_DATE,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${SITE_URL}/paste-alternative`,
      lastModified: VERSION_DATE,
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ]
}
