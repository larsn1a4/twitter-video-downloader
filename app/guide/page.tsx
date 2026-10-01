import type { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl, siteName } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How to Download Twitter / X Videos on iPhone, Android & PC (2026 Guide)',
  description:
    'Step-by-step guide to downloading videos, GIFs and live streams from X (Twitter) on iPhone, Android and desktop. Free, no app needed, up to 4K quality.',
  keywords: [
    'how to download twitter videos',
    'twitter video downloader iphone',
    'download x videos android',
    'save twitter video to camera roll',
    'twitter gif downloader',
    'download twitter video to pc',
    'x live stream downloader',
    'how to save videos from x',
  ],
  alternates: { canonical: '/guide' },
  openGraph: {
    title: 'How to Download Twitter / X Videos — Complete Guide',
    description:
      'Save X videos, GIFs and live streams on iPhone, Android and PC. Free and no sign-up.',
    url: '/guide',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const sections = [
  {
    id: 'iphone',
    h: 'Download X videos on iPhone',
    body: [
      'Open the X app, find the video you want, tap the Share icon under the post and choose "Copy link". Then open Safari and go to this site, paste the link in the box and tap "Get video". Choose your quality and tap Download — the video opens in a new tab; tap the Share button in Safari and select "Save to Files" or "Save Video" to keep it in your Photos app.',
      'Tip: if Safari only plays the video instead of downloading it, long-press the video and choose "Download Linked File". The file then appears in your Files app under Downloads, and you can move it to Photos.',
    ],
  },
  {
    id: 'android',
    h: 'Download X videos on Android',
    body: [
      'In the X app, tap Share on the video post, then "Copy link". Open Chrome, paste the link here and tap "Get video". Pick a quality and hit Download — Chrome will download the MP4 straight to your Downloads folder, and it shows up in your Gallery automatically.',
      'On most Android phones the download notification lets you open the video immediately, or find it later in Files → Downloads.',
    ],
  },
  {
    id: 'pc',
    h: 'Download X videos on PC or Mac',
    body: [
      'Copy the post URL from your browser address bar (it looks like x.com/username/status/123456...). Paste it in the downloader box above and click "Get video". Select the highest quality — up to 1080p or 4K when available — and click Download. The MP4 saves to your default downloads folder.',
      'Desktop browsers give you the most control: you can preview every quality before downloading, which is handy when you want the smallest file for sharing.',
    ],
  },
  {
    id: 'live',
    h: 'Download X live streams and broadcasts',
    body: [
      'Live broadcasts use links like x.com/i/broadcasts/.... Paste that link exactly as you would a normal video link. If the broadcast is still live, you get a "Record & download as MP4" button that captures the stream and converts it on the fly. If the broadcast has ended, the same button saves the full replay.',
      'Recording starts the instant you click, so open the download in a new tab and leave it running until the stream ends — then the file finalizes automatically.',
    ],
  },
  {
    id: 'gif',
    h: 'Download GIFs from X',
    body: [
      'GIFs on X are technically short MP4 videos, so the exact same flow works: copy the post link, paste it here, and download the MP4. You can convert it back to a GIF later with any free converter if you need the GIF format.',
    ],
  },
  {
    id: 'quality',
    h: 'Which quality should I choose?',
    body: [
      'Always pick the highest quality if storage is not an issue — X usually provides 720p, and many newer uploads go up to 1080p or 4K. For quick sharing on messaging apps, 480p or 360p keeps the file small while staying watchable.',
    ],
  },
];

export default function GuidePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline:
          'How to Download Twitter / X Videos on iPhone, Android & PC',
        description:
          'Step-by-step guide to downloading videos, GIFs and live streams from X (Twitter) on any device.',
        inLanguage: 'en',
        author: { '@type': 'Organization', name: siteName },
        publisher: { '@type': 'Organization', name: siteName },
        mainEntityOfPage: `${siteUrl}/guide`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${siteUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Download guide',
            item: `${siteUrl}/guide`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05070f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-2.5 px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <svg className="h-1/2 w-1/2 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              {siteName}
            </span>
          </Link>
          <Link
            href="/"
            className="btn-gradient ml-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            Open downloader
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <nav className="text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Download guide</span>
        </nav>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          How to download videos from{' '}
          <span className="text-gradient">X (Twitter)</span> on any device
        </h1>
        <p className="mt-4 leading-8 text-slate-400">
          X does not offer a built-in download button, but saving any public
          video, GIF or live broadcast takes less than a minute with a free
          online downloader. This guide walks you through the exact steps on
          iPhone, Android and desktop — no app installation, no account, no
          watermarks.
        </p>

        <div className="glass mt-8 rounded-3xl p-6 sm:p-8">
          <h2 className="font-bold text-white">The quick method (all devices)</h2>
          <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {[
              'Copy the link of the X post (or live broadcast) containing the video.',
              'Paste it into the downloader box on the homepage and click "Get video".',
              'Choose your preferred quality and hit Download.',
            ].map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 text-xs font-extrabold text-white">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <Link
            href="/"
            className="btn-gradient mt-6 inline-block rounded-xl px-7 py-3 text-sm font-semibold text-white"
          >
            Try it now — it&apos;s free
          </Link>
        </div>

        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {s.h}
              </h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-3 text-[15px] leading-8 text-slate-400">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <h2 className="font-bold text-white">A note on copyright</h2>
          <p className="mt-3 text-sm leading-8 text-slate-400">
            Only download videos you own, have permission to use, or are
            saving for personal fair use. Reposting someone else&apos;s content
            without credit or permission can violate copyright law and X&apos;s
            terms of service.
          </p>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="btn-gradient inline-block rounded-xl px-8 py-3.5 font-semibold text-white"
          >
            Back to the downloader
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>
    </>
  );
}
