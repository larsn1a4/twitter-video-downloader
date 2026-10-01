'use client';

import { useState } from 'react';

interface VideoVariant {
  quality: string;
  width: number;
  height: number;
  bitrate: number;
  url: string;
  container: 'mp4' | 'm3u8';
}

interface VideoClip {
  label: string;
  thumbnail: string;
  duration: number | null;
  variants: VideoVariant[];
  streamUrl: string | null;
}

interface ExtractResult {
  id: string;
  kind: 'tweet' | 'broadcast';
  text: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  thumbnail: string;
  createdAt: string;
  isLive: boolean;
  clips: VideoClip[];
}

type Status = 'idle' | 'loading' | 'error' | 'done';

function downloadHref(v: VideoVariant, id: string) {
  return `/api/download?url=${encodeURIComponent(v.url)}&name=${encodeURIComponent(
    `downx-${id}-${v.quality}`,
  )}`;
}

function formatDuration(sec: number | null) {
  if (sec == null) return '';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ClipCard({
  clip,
  mediaId,
  defaultOpen,
}: {
  clip: VideoClip;
  mediaId: string;
  defaultOpen: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(
    defaultOpen && clip.variants.length ? clip.variants[0].url : null,
  );

  // Live broadcast / replay: no mp4 variants, only an HLS playlist.
  if (clip.variants.length === 0 && clip.streamUrl) {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
        <p className="flex items-center gap-2 font-semibold text-amber-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          {clip.label} — no MP4 file is ready yet.
        </p>
        <p className="mt-1 text-sm leading-7 text-amber-200/70">
          You can record it and convert it to MP4 on the fly:
        </p>
        <a
          href={`/api/live?url=${encodeURIComponent(
            clip.streamUrl,
          )}&id=${encodeURIComponent(mediaId)}`}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500"
          rel="nofollow"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Record &amp; download as MP4
        </a>
        <p className="mt-2 text-xs text-amber-200/50">
          Recording starts the moment you click. If it fails, the server needs
          ffmpeg (included in the provided Docker image).
        </p>
      </div>
    );
  }

  return (
    <div>
      {preview && (
        <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
          <video
            key={preview}
            src={preview}
            poster={clip.thumbnail || undefined}
            controls
            playsInline
            preload="metadata"
            className="mx-auto max-h-[440px] w-full"
          />
        </div>
      )}
      <h3 className="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        {clip.label} — choose quality
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {clip.variants.map((v, i) => (
          <div
            key={v.url}
            className={`flex items-center gap-2 rounded-xl border p-2 transition ${
              preview === v.url
                ? 'border-indigo-500/60 bg-indigo-500/10'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <button
              type="button"
              onClick={() => setPreview(v.url)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white"
            >
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-sky-300">
                {v.quality}
              </span>
              {i === 0 && (
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  BEST
                </span>
              )}
            </button>
            <a
              href={downloadHref(v, mediaId)}
              className="btn-gradient ml-auto rounded-lg px-5 py-2 text-sm font-semibold text-white"
              rel="nofollow"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Downloader() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [data, setData] = useState<ExtractResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = input.trim();
    if (!url) return;
    setStatus('loading');
    setError('');
    setData(null);
    try {
      const r = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Something went wrong');
      setData(j as ExtractResult);
      setStatus('done');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
      setStatus('error');
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Download video from X"
        className="glass-strong flex flex-col gap-2 rounded-2xl p-2 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <input
            type="url"
            inputMode="url"
            dir="ltr"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a link — x.com/.../status/... or x.com/i/broadcasts/..."
            aria-label="X video or broadcast link"
            className="w-full rounded-xl border border-transparent bg-transparent py-3.5 pl-12 pr-4 text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-white/5"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-gradient flex min-w-[170px] items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === 'loading' ? (
            <>
              <span className="spinner" aria-hidden /> Fetching…
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Get video
            </>
          )}
        </button>
      </form>

      {status === 'error' && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"
        >
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {status === 'done' && data && (
        <div className="glass mt-5 overflow-hidden rounded-3xl">
          {/* Author */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            {data.authorAvatar ? (
              <img
                src={data.authorAvatar}
                alt={data.authorName}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10"
                loading="lazy"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-600 text-lg font-bold text-white">
                {(data.authorName || 'X').charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                {data.authorName || 'X user'}
              </p>
              {data.authorHandle && (
                <p className="truncate text-sm text-slate-400" dir="ltr">
                  @{data.authorHandle}
                </p>
              )}
            </div>
            {data.isLive ? (
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400 ring-1 ring-red-500/30">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                LIVE
              </span>
            ) : data.kind === 'broadcast' ? (
              <span className="ml-auto rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10">
                Replay
              </span>
            ) : (
              data.clips[0]?.duration != null && (
                <span className="ml-auto rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10">
                  {formatDuration(data.clips[0].duration)}
                </span>
              )
            )}
          </div>

          {data.text && (
            <p className="line-clamp-3 px-5 pt-4 text-sm leading-7 text-slate-400">
              {data.text}
            </p>
          )}

          {/* Clips */}
          <div className="space-y-6 px-5 py-5">
            {data.clips.map((clip, i) => (
              <ClipCard
                key={`${clip.label}-${i}`}
                clip={clip}
                mediaId={data.id}
                defaultOpen={i === 0}
              />
            ))}
            <p className="text-xs text-slate-500">
              Click a quality to preview it, then hit Download to save it to
              your device.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
