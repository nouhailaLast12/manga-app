// api/mangadex/[...path].js  (Vercel catch-all serverless function)
export default async function handler(req, res) {
  const { path = [] } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path;

  // On reconstruit les query params (sauf "path" qui est géré par Vercel)
  const params = new URLSearchParams(req.query);
  params.delete('path');
  const queryString = params.toString();

  const targetUrl = `https://api.mangadex.org/${targetPath}${queryString ? '?' + queryString : ''}`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: { 'Accept': 'application/json' }
    });

    const data = await upstream.json();

    // cache léger côté CDN pour éviter de spammer l'API MangaDex
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800');
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('MangaDex proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}