// api/cover.js  (Vercel serverless function)
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith('https://uploads.mangadex.org/')) {
    return res.status(400).json({ error: 'Invalid or missing url' });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        // Referer vide/inexistant => MangaDex renvoie la vraie image
        'Referer': '',
        'User-Agent': 'manga-app-indol (contact: your-email@example.com)'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Upstream fetch failed' });
    }

    const buffer = await upstream.arrayBuffer();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
    // cache côté CDN Vercel pour éviter de re-fetch à chaque visite
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: 'Proxy error' });
  }
}