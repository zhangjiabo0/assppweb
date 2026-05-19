import { Hono } from 'hono';

const bag = new Hono<{ Bindings: Env }>();

bag.get('/bag', async (c) => {
  const guid = c.req.query('guid');

  if (!guid) {
    return c.json({ error: 'Missing guid parameter' }, 400);
  }

  const url = `https://init.itunes.apple.com/bag.xml?guid=${encodeURIComponent(guid)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'iTunes/12.10.9',
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      return c.json({
        error: `Apple returned ${response.status}`,
      }, 502);
    }

    // 直接透传
    const body = await response.arrayBuffer();

    return new Response(body, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store',
      },
    });

  } catch (err) {
    return c.json({
      error: err instanceof Error ? err.message : String(err),
    }, 500);
  }
});

export default bag;
