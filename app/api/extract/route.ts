import { NextRequest, NextResponse } from 'next/server';
import { extractVideo, parseBroadcastId, parseTweetUrl, ExtractError } from '@/lib/xExtract';

// Simple in-memory rate limiter: 30 requests / minute / IP.
const hits = new Map<string, { n: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  e.n += 1;
  // occasional cleanup so the map doesn't grow forever
  if (hits.size > 5000 && Math.random() < 0.01) {
    for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
  }
  return e.n > 30;
}

const EN_ERRORS: Record<string, string> = {
  'invalid-url':
    'Invalid link. Paste a video post link (x.com/.../status/...) or a live broadcast link (x.com/i/broadcasts/...).',
  'not-found':
    'Could not find that post. It may be deleted or from a private account.',
  'no-video':
    'No video found in this link. Make sure the post contains a video.',
  upstream:
    'Could not reach the extraction service right now. Please try again shortly.',
};

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'local';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }
  const rawUrl = String(body?.url ?? '');
  const id = parseTweetUrl(rawUrl) || parseBroadcastId(rawUrl);
  if (!id) {
    return NextResponse.json({ error: EN_ERRORS['invalid-url'] }, { status: 400 });
  }

  try {
    const data = await extractVideo(rawUrl);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (e) {
    const code =
      e instanceof ExtractError ? e.code : ('upstream' as const);
    const status = code === 'invalid-url' ? 400 : code === 'upstream' ? 502 : 404;
    return NextResponse.json(
      { error: EN_ERRORS[code] || EN_ERRORS.upstream },
      { status },
    );
  }
}
