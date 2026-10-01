import { NextRequest, NextResponse } from 'next/server';
import { Parser as M3U8Parser } from 'm3u8-parser';
import muxjs from 'mux.js';

// Converts a live HLS (.m3u8) stream to fragmented MP4 on the fly using
// pure JavaScript (mux.js transmuxes MPEG-TS segments, no ffmpeg needed).
// Only X's own media hosts may be proxied/converted (SSRF guard).
function hostAllowed(hostname: string): boolean {
  if (hostname === 'video.twimg.com') return true;
  // X live broadcast CDNs, e.g. prod-fastly-eu-west-3.video.pscp.tv
  return hostname.endsWith('.video.pscp.tv');
}

const BROWSER_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// Safety: stop very long recordings (30 min).
const MAX_RECORD_MS = 30 * 60 * 1000;

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const u = new URL(url);
  if (u.protocol !== 'https:' || !hostAllowed(u.hostname)) {
    throw new Error('host not allowed');
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': BROWSER_UA, Accept: '*/*' },
    });
    // fetch follows redirects; the final host must also be allowed.
    const finalHost = new URL(r.url || url).hostname;
    if (!hostAllowed(finalHost)) throw new Error('host not allowed');
    return r;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Resolve an HLS master playlist to its best variant playlist URL.
 *
 * X's live playlist endpoint is dynamically generated and sometimes hands
 * plain HLS clients broken `non_transcode` variants. Fetching the master
 * with a browser User-Agent consistently yields working `transcode`
 * variants, so we resolve server-side first.
 */
async function resolveVariantPlaylist(masterUrl: string): Promise<string> {
  const r = await fetchWithTimeout(masterUrl, 15000);
  if (!r.ok) throw new Error(`master playlist HTTP ${r.status}`);
  const text = await r.text();
  if (!text.includes('#EXTM3U')) throw new Error('not an HLS playlist');

  const lines = text.split('\n').map((l) => l.trim());
  let best: { bw: number; url: string } | null = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/#EXT-X-STREAM-INF:[^\n]*BANDWIDTH=(\d+)/);
    if (!m) continue;
    const urlLine = lines
      .slice(i + 1)
      .find((l) => l.length > 0 && !l.startsWith('#'));
    if (!urlLine) continue;
    const bw = parseInt(m[1], 10);
    const abs = new URL(urlLine, r.url || masterUrl).toString();
    // Keep the resolved URL on an allowed host (SSRF guard).
    if (!hostAllowed(new URL(abs).hostname)) continue;
    if (!best || bw > best.bw) best = { bw, url: abs };
  }
  if (best) return best.url;
  // Already a media playlist (has segments)? Use as-is.
  if (/\.(ts|m4s|mp4)(\?|$)/m.test(text)) return masterUrl;
  throw new Error('no playable variant found');
}

interface MediaSegment {
  uri: string;
  seq: number;
}

interface MediaPlaylist {
  segments: MediaSegment[];
  endList: boolean;
  targetDuration: number;
}

async function fetchMediaPlaylist(url: string): Promise<MediaPlaylist> {
  const r = await fetchWithTimeout(url, 15000);
  if (!r.ok) throw new Error(`media playlist HTTP ${r.status}`);
  const text = await r.text();
  if (!text.includes('#EXTM3U')) throw new Error('not an HLS playlist');
  const parser = new M3U8Parser();
  parser.push(text);
  parser.end();
  const m = parser.manifest;
  const segs: any[] = m.segments || [];
  if (segs.some((s) => s.key)) {
    throw new Error('encrypted streams are not supported');
  }
  const base = r.url || url;
  const seq0 = typeof m.mediaSequence === 'number' ? m.mediaSequence : 0;
  return {
    segments: segs.map((s, i) => ({
      uri: new URL(s.uri, base).toString(),
      seq: seq0 + i,
    })),
    endList: !!m.endList,
    targetDuration: typeof m.targetDuration === 'number' ? m.targetDuration : 4,
  };
}

async function fetchSegment(url: string): Promise<Buffer> {
  const r = await fetchWithTimeout(url, 20000);
  if (!r.ok) throw new Error(`segment HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length === 0) throw new Error('empty segment');
  return buf;
}

/** Wraps mux.js Transmuxer: MPEG-TS bytes in, fMP4 (init + fragments) out. */
function createFeeder() {
  const transmuxer = new muxjs.mp4.Transmuxer({
    keepOriginalTimestamps: true,
  });
  const pending: Buffer[] = [];
  transmuxer.on('data', (segment: any) => {
    if (segment.initSegment) pending.push(Buffer.from(segment.initSegment));
    if (segment.data) pending.push(Buffer.from(segment.data));
  });
  return {
    feed(tsBytes: Buffer): Buffer[] {
      transmuxer.push(
        new Uint8Array(tsBytes.buffer, tsBytes.byteOffset, tsBytes.byteLength),
      );
      transmuxer.flush();
      return pending.splice(0, pending.length);
    },
  };
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const raw = sp.get('url');
  const id =
    (sp.get('id') || 'live').replace(/[^\w\-]+/g, '').slice(0, 40) || 'live';

  if (!raw) return NextResponse.json({ error: 'missing url' }, { status: 400 });
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return NextResponse.json({ error: 'bad url' }, { status: 400 });
  }
  if (u.protocol !== 'https:' || !hostAllowed(u.hostname)) {
    return NextResponse.json({ error: 'host not allowed' }, { status: 403 });
  }

  // No ffmpeg needed anymore: conversion is pure JavaScript.

  let variantUrl: string;
  try {
    variantUrl = await resolveVariantPlaylist(u.toString());
  } catch {
    return NextResponse.json(
      { error: 'Could not resolve the stream playlist. Please try again.' },
      { status: 502 },
    );
  }

  const feed = createFeeder();

  // Preflight: resolve + transmux the first segment before responding 200.
  // This avoids handing the client an empty hanging download when the
  // stream cannot be opened.
  let firstPlaylist: MediaPlaylist;
  let nextSeq: number;
  let firstChunks: Buffer[];
  try {
    firstPlaylist = await fetchMediaPlaylist(variantUrl);
    if (firstPlaylist.segments.length === 0) {
      throw new Error('playlist has no segments');
    }
    const first = firstPlaylist.segments[0];
    const bytes = await fetchSegment(first.uri);
    firstChunks = feed.feed(bytes);
    if (firstChunks.length === 0) {
      throw new Error('transmux produced no output');
    }
    nextSeq = first.seq + 1;
  } catch (e: any) {
    console.error('[api/live] preflight failed:', e?.message || e);
    return NextResponse.json(
      {
        error:
          'Could not start recording this stream. It may have ended or blocked the server. Please try again.',
      },
      { status: 502 },
    );
  }

  let aborted = false;
  const deadline = Date.now() + MAX_RECORD_MS;

  const stream = new ReadableStream({
    start(controller) {
      // Replay bytes captured during preflight first.
      for (const d of firstChunks) controller.enqueue(d);

      (async () => {
        let playlist = firstPlaylist;
        let queue = playlist.segments.filter((s) => s.seq >= nextSeq);
        let playlistFailures = 0;

        while (!aborted && Date.now() < deadline) {
          for (const seg of queue) {
            if (aborted || Date.now() >= deadline) break;
            try {
              const bytes = await fetchSegment(seg.uri);
              for (const chunk of feed.feed(bytes)) {
                if (aborted) break;
                controller.enqueue(chunk);
              }
            } catch {
              // Skip a single bad segment rather than killing a long
              // recording; timestamps stay continuous enough for playback.
            }
            nextSeq = seg.seq + 1;
          }
          if (aborted || Date.now() >= deadline) break;
          // VOD / ended replay: playlist is complete, we're done.
          if (playlist.endList) break;

          // Live: wait for new segments, then re-poll the playlist.
          const pollMs = Math.max(
            2000,
            Math.min(6000, (playlist.targetDuration || 4) * 1000),
          );
          await sleep(pollMs);
          if (aborted) break;
          try {
            playlist = await fetchMediaPlaylist(variantUrl);
            playlistFailures = 0;
          } catch {
            playlistFailures += 1;
            if (playlistFailures >= 5) break;
            continue;
          }
          queue = playlist.segments.filter((s) => s.seq >= nextSeq);
        }
      })()
        .catch(() => {})
        .finally(() => {
          try {
            controller.close();
          } catch {}
        });
    },
    cancel() {
      aborted = true;
    },
  });

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="downx-live-${id}.mp4"`,
      'Cache-Control': 'no-store',
    },
  });
}
