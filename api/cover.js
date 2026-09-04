// api/cover.js  (Vercel serverless function)
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith('https://uploads.mangadex.org/')) {
    return res.status(400).json({ error: 'Invalid or missing url' });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://mangadex.org/',
        'Origin': 'https://mangadex.org',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    });

    // debug: on inspecte la taille pour détecter si c'est le placeholder
    const contentLength = upstream.headers.get('content-length');

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Upstream fetch failed',
        status: upstream.status,
        contentLength
      });
    }

    const buffer = await upstream.arrayBuffer();

    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
    res.setHeader('X-Debug-Content-Length', contentLength || 'unknown');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}