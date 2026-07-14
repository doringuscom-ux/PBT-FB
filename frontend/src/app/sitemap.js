import api from '@/api';

export default async function sitemap() {
  try {
    const res = await api.get('/seo');
    const seoEntries = res.data;

    // Filter out admin routes just in case
    const validEntries = seoEntries.filter(
      (entry) => !entry.url.toLowerCase().startsWith('/admin')
    );

    return validEntries.map((entry) => ({
      url: `https://pbtadka.com${entry.url === '/' ? '' : entry.url}`,
      lastModified: entry.updatedAt || new Date(),
      changeFrequency: 'daily',
      priority: entry.url === '/' ? 1 : 0.8,
    }));
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Fallback sitemap if backend is unreachable
    return [
      {
        url: 'https://pbtadka.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    ];
  }
}
