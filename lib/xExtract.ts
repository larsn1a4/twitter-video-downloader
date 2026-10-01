// Extraction logic for X/Twitter content.
//
// Tweets:  FxEmbed v2 API (https://api.fxtwitter.com/2/status/{id}) — no auth.
//          Fallback: vxtwitter API (https://api.vxtwitter.com/i/status/{id}).
// Broadcasts (x.com/i/broadcasts/{id}):
//          X's public broadcast API (no auth):
//            1. https://api.x.com/1.1/broadcasts/show.json?ids={id}
//               -> broadcasts.{id}.media_key
//            2. https://api.x.com/1.1/live_video_stream/status/{media_key}
//               -> source.noRedirectPlaybackUrl (HLS playlist, live or replay)

export interface VideoVariant {
  quality: string;
  width: number;
  height: number;
  bitrate: number;
  url: string;
  container: 'mp4' | 'm3u8';
}

export interface VideoClip {
  label: string;
  thumbnail: string;
  duration: number | null;
  /** mp4 variants, best quality first */
  variants: VideoVariant[];
  /** HLS playlist URL when present (live streams / VOD) */
  streamUrl: string | null;
}

export interface ExtractResult {
  id: string;
  kind: 'tweet' | 'broadcast';
  text: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  thumbnail: string;
  createdAt: string;
  /** true when the content is a currently-running live broadcast */
  isLive: boolean;
  clips: VideoClip[];
}

export class ExtractError extends Error {
  code: 'invalid-url' | 'not-found' | 'no-video' | 'upstream';
  constructor(code: ExtractError['code'], message?: string) {
    super(message || code);
    this.code = code;
  }
}

/** Accepts x.com / twitter.com / fx / vx status URLs, or a bare numeric tweet id. */
export function parseTweetUrl(input: string): string | null {
  if (!input) return null;
  const t = input.trim();
  const m = t.match(
    /(?:twitter\.com|x\.com|fxtwitter\.com|fixvx\.com|vxtwitter\.com)\/(?:#!\/)?(?:\w+|i)\/status(?:es)?\/(\d+)/i,
  );
  if (m?.[1]) return m[1];
  if (/^\d{6,}$/.test(t)) return t;
  return null;
}

/** Accepts x.com/i/broadcasts/{broadcast_id} URLs. */
export function parseBroadcastId(input: string): string | null {
  if (!input) return null;
  const m = input
    .trim()
    .match(/(?:twitter\.com|x\.com)\/i\/broadcasts\/([A-Za-z0-9]+)/i);
  return m?.[1] ?? null;
}

function qualityLabel(w: number, h: number): string {
  const d = Math.max(w || 0, h || 0);
  if (d >= 3000) return '4K';
  if (d >= 2000) return '1440p';
  if (d >= 1500) return '1080p';
  if (d >= 1000) return '720p';
  if (d >= 700) return '480p';
  if (d >= 500) return '360p';
  if (d > 0) return '240p';
  return 'MP4';
}

async function fetchJson(url: string, timeoutMs = 15000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
        Accept: 'application/json',
      },
    });
    const ct = r.headers.get('content-type') || '';
    if (!r.ok || !ct.includes('json')) throw new ExtractError('upstream');
    return await r.json();
  } catch (e) {
    if (e instanceof ExtractError) throw e;
    throw new ExtractError('upstream');
  } finally {
    clearTimeout(t);
  }
}

/** Build mp4 variants + m3u8 for one FxEmbed video object. */
function clipFromFxVideo(v: any, label: string): VideoClip {
  const mp4s: VideoVariant[] = [];
  let m3u8: string | null = null;
  for (const f of v.formats || []) {
    if (!f?.url) continue;
    if (f.container === 'm3u8') {
      if (!m3u8) m3u8 = f.url;
      continue;
    }
    if (f.container === 'mp4') {
      const dm = String(f.url).match(/\/(\d+)x(\d+)\//);
      const w = dm ? parseInt(dm[1], 10) : v.width || 0;
      const h = dm ? parseInt(dm[2], 10) : v.height || 0;
      mp4s.push({
        quality: qualityLabel(w, h),
        width: w,
        height: h,
        bitrate: f.bitrate || 0,
        url: f.url,
        container: 'mp4',
      });
    }
  }
  if (!mp4s.length && v.url && v.format === 'video/mp4') {
    mp4s.push({
      quality: qualityLabel(v.width, v.height),
      width: v.width || 0,
      height: v.height || 0,
      bitrate: 0,
      url: v.url,
      container: 'mp4',
    });
  }
  mp4s.sort((a, b) => b.bitrate - a.bitrate || b.width - a.width);
  const seen = new Set<string>();
  const variants = mp4s.filter((x) =>
    seen.has(x.url) ? false : (seen.add(x.url), true),
  );
  return {
    label,
    thumbnail: v.thumbnail_url || '',
    duration: typeof v.duration === 'number' ? v.duration : null,
    variants,
    streamUrl: m3u8,
  };
}

function fromFxV2(status: any): ExtractResult | null {
  const media = status?.media || {};
  const videos: any[] = media?.videos || [];
  if (!videos.length) return null;

  const clips = videos.map((v, i) =>
    clipFromFxVideo(v, videos.length > 1 ? `Video ${i + 1}` : 'Video'),
  );
  const hasAny = clips.some((c) => c.variants.length > 0 || c.streamUrl);
  if (!hasAny) return null;

  const a = status.author || {};
  return {
    id: String(status.id ?? ''),
    kind: 'tweet',
    text: status.text || '',
    authorName: a.name || '',
    authorHandle: a.screen_name || '',
    authorAvatar: a.avatar_url || '',
    thumbnail: clips[0]?.thumbnail || '',
    createdAt: status.created_at || '',
    isLive: false,
    clips,
  };
}

function fromVxV1(id: string, j: any): ExtractResult | null {
  const me: any[] = j?.media_extended || [];
  const found = me.filter(
    (m) => (m.type === 'video' || m.type === 'gif') && typeof m.url === 'string',
  );
  if (!found.length) return null;
  const clips: VideoClip[] = found.map((v, i) => ({
    label: found.length > 1 ? `Video ${i + 1}` : 'Video',
    thumbnail: v.thumbnail_url || '',
    duration: null,
    variants: [
      {
        quality: 'MP4',
        width: 0,
        height: 0,
        bitrate: 0,
        url: v.url,
        container: 'mp4',
      },
    ],
    streamUrl: null,
  }));
  return {
    id,
    kind: 'tweet',
    text: j.text || '',
    authorName: j.user_name || '',
    authorHandle: j.user_screen_name || '',
    authorAvatar: '',
    thumbnail: clips[0]?.thumbnail || '',
    createdAt: j.date || '',
    isLive: false,
    clips,
  };
}

async function extractTweet(id: string): Promise<ExtractResult> {
  // Lane 1 — FxEmbed v2
  try {
    const j = await fetchJson(`https://api.fxtwitter.com/2/status/${id}`);
    if (j?.code === 200 && j.status && j.status.type !== 'tombstone') {
      const r = fromFxV2(j.status);
      if (r) return r;
      throw new ExtractError('no-video');
    }
    if (j?.code === 404 || j?.code === 401) throw new ExtractError('not-found');
    throw new ExtractError('upstream');
  } catch (e) {
    if (e instanceof ExtractError && e.code !== 'upstream') throw e;
    // Lane 2 — vxtwitter fallback
    try {
      const j2 = await fetchJson(`https://api.vxtwitter.com/i/status/${id}`);
      const r2 = fromVxV1(id, j2);
      if (r2) return r2;
      throw new ExtractError('no-video');
    } catch (e2) {
      if (e2 instanceof ExtractError) throw e2;
      throw new ExtractError('upstream');
    }
  }
}

async function extractBroadcast(broadcastId: string): Promise<ExtractResult> {
  const show = await fetchJson(
    `https://api.x.com/1.1/broadcasts/show.json?ids=${encodeURIComponent(
      broadcastId,
    )}&include_events=true`,
  );
  const b = show?.broadcasts?.[broadcastId];
  if (!b) throw new ExtractError('not-found');

  const mediaKey: string | undefined = b.media_key;
  if (!mediaKey) throw new ExtractError('not-found');

  // NOTE: this endpoint returns JSON but sends no Content-Type header,
  // so it needs a lenient parse instead of fetchJson().
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  let streamInfo: any;
  try {
    const r2 = await fetch(
      `https://api.x.com/1.1/live_video_stream/status/${encodeURIComponent(
        mediaKey,
      )}`,
      {
        signal: ctrl.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
          Accept: 'application/json',
        },
      },
    );
    if (!r2.ok) throw new ExtractError('upstream');
    streamInfo = await r2.json();
  } catch (e) {
    if (e instanceof ExtractError) throw e;
    throw new ExtractError('upstream');
  } finally {
    clearTimeout(timer);
  }
  const playbackUrl: string | undefined =
    streamInfo?.source?.noRedirectPlaybackUrl;
  if (!playbackUrl) throw new ExtractError('upstream');

  const state: string = (b.state || '').toUpperCase();
  const isLive = state === 'RUNNING';
  const thumb: string = b.image_url || '';

  return {
    id: broadcastId,
    kind: 'broadcast',
    text: b.status || b.replay_title_edited || '',
    authorName: b.user_display_name || '',
    authorHandle: b.username || b.twitter_username || '',
    authorAvatar: b.profile_image_url || '',
    thumbnail: thumb,
    createdAt: b.start_ms ? new Date(Number(b.start_ms)).toISOString() : '',
    isLive,
    clips: [
      {
        label: isLive ? 'Live broadcast' : 'Broadcast replay',
        thumbnail: thumb,
        duration: null,
        variants: [],
        streamUrl: playbackUrl,
      },
    ],
  };
}

export async function extractVideo(
  input: string,
): Promise<ExtractResult> {
  const broadcastId = parseBroadcastId(input);
  if (broadcastId) return extractBroadcast(broadcastId);
  const tweetId = parseTweetUrl(input);
  if (tweetId) return extractTweet(tweetId);
  throw new ExtractError('invalid-url');
}
