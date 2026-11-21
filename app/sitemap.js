export default function sitemap() {
  const base = 'https://ai-code-pool.netlify.app';
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/submit`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];
}
