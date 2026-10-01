import { NextRequest, NextResponse } from 'next/server';

// Proxies the mp4 through our server so the browser saves it as a file
// (cross-origin <a download> is ignored by browsers) and so it works on mobile.
const ALLOWED_HOSTS = new Set(['video.twimg.com', 'pbs.twimg.com']);

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const raw = sp.get('url');
  const name = (sp.get('name') || 'x-video').replace(/[^\w\-.]+/g, '_').slice(0, 80);

  if (!raw) {
    return NextResponse.json({ error: 'missing url' }, { status: 400 });
  }
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return NextResponse.json({ error: 'bad url' }, { status: 400 });
  }
  if (u.protocol !== 'https:' || !ALLOWED_HOSTS.has(u.hostname)) {
    return NextResponse.json({ error: 'host not allowed' }, { status: 403 });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120_000);
  try {
    const upstream = await fetch(u.toString(), {
      signal: ctrl.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
        Referer: 'https://x.com/',
      },
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'upstream fetch failed' }, { status: 502 });
    }
    const ct = upstream.headers.get('content-type') || 'video/mp4';
    return new NextResponse(upstream.body as unknown as BodyInit, {
      headers: {
        'Content-Type': ct,
        'Content-Disposition': `attachment; filename="${name}.mp4"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'download failed' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
