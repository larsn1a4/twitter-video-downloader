import Downloader from '@/components/Downloader';
import { siteUrl, siteName } from '@/lib/site';

const faqs = [
  {
    q: 'How do I download a video from X (Twitter)?',
    a: 'Copy the link of the post containing the video from the X app or website, paste it in the box above, click "Get video", then choose your preferred quality and hit Download. The file saves directly to your device.',
  },
  {
    q: 'Can I download live streams from X?',
    a: 'Yes. If the link is a live broadcast, you will get an option to record the stream and convert it to an MP4 file on the fly. This requires ffmpeg on the server — it is included automatically in the provided Docker image.',
  },
  {
    q: 'What download qualities are available?',
    a: 'We list every quality X provides for the video, from 240p up to 1080p and 4K when available. The highest quality is preselected for you.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. The site is fully responsive and works on phones, tablets and desktops — no app installation needed.',
  },
  {
    q: 'Do I need an account or sign-in?',
    a: 'No. The tool is completely free and requires no account or sign-in. Just paste the link and download.',
  },
  {
    q: 'Is downloading videos legal?',
    a: 'Only download content you own the rights to or are allowed to use (your own videos, licensed content, or fair personal use). Respecting copyright is your responsibility.',
  },
];

const features = [
  {
    t: 'Multiple qualities',
    d: 'From 240p to 4K — pick the quality that fits your device and connection.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    ),
  },
  {
    t: 'Live streams',
    d: 'Record live broadcasts from X and convert them to MP4 in one click.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
    ),
  },
  {
    t: 'No sign-up',
    d: 'No accounts, no software installs. Everything runs in your browser.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
  {
    t: 'All devices',
    d: 'A responsive design that works flawlessly on phone, tablet and desktop.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
  },
  {
    t: 'Fast & free',
    d: 'Direct extraction of video links with no middlemen and no paywalls.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    t: 'Private by design',
    d: 'Links are processed on the fly — we store nothing about you.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
];

const steps = [
  {
    t: 'Copy the link',
    d: 'In the X app, tap Share on the post with the video, then "Copy link".',
  },
  {
    t: 'Paste it here',
    d: 'Paste the link in the box above and click "Get video".',
  },
  {
    t: 'Download',
    d: 'Pick the quality you want and hit Download — done.',
  },
];

function Logo({ size = 'h-9 w-9' }: { size?: string }) {
  return (
    <span
      className={`flex ${size} items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30`}
    >
      <svg className="h-1/2 w-1/2 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M8 5.5v13l11-6.5z" />
      </svg>
    </span>
  );
}

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'DownX — X (Twitter) Video Downloader',
        alternateName: siteName,
        url: `${siteUrl}/`,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free tool to download videos and live streams from X (formerly Twitter) in high quality.',
        inLanguage: 'en',
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'HowTo',
        name: 'How to download a video from X (Twitter)',
        description:
          'Save any video or live stream from X to your device in three steps.',
        inLanguage: 'en',
        step: steps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.t,
          text: s.d,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header id="top" className="sticky top-0 z-20 border-b border-white/10 bg-[#05070f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-3.5">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-white">
            {siteName}
          </span>
          <nav className="ml-auto hidden items-center gap-7 text-sm text-slate-400 sm:flex">
            <a href="#how" className="transition hover:text-white">
              How it works
            </a>
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div
          className="blob absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-600"
          aria-hidden
        />
        <div
          className="blob absolute -left-32 top-40 h-[300px] w-[300px] rounded-full bg-sky-500"
          style={{ animationDelay: '-6s' }}
          aria-hidden
        />
        <div
          className="blob absolute -right-32 top-64 h-[300px] w-[300px] rounded-full bg-violet-600"
          style={{ animationDelay: '-3s' }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            100% free — no sign-up required
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-6xl">
            Download videos
            <br />
            from <span className="text-gradient">X in seconds</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            Paste any X (Twitter) video or live stream link and save it in up
            to 4K. Works on your phone, tablet and desktop.
          </p>

          <div className="mt-9 text-left">
            <Downloader />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            {['No watermark', 'Unlimited downloads', 'Private & secure'].map(
              (t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="how" className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Get any video in <span className="text-gradient">3 steps</span>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="glass lift rounded-3xl p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-base font-extrabold text-white shadow-lg shadow-indigo-500/25">
                {i + 1}
              </div>
              <h3 className="mt-5 font-semibold text-white">{s.t}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-y border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Why <span className="text-gradient">{siteName}</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-7 text-slate-400">
            A clean, focused tool that does one thing well — saving X videos to
            your device.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.t} className="glass lift rounded-3xl p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/25">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                    {f.icon}
                  </svg>
                </div>
                <h3 className="mt-5 font-semibold text-white">{f.t}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Frequently asked <span className="text-gradient">questions</span>
        </h2>
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="faq glass rounded-2xl px-6 py-5">
              <summary className="flex items-center justify-between gap-4 font-semibold text-white">
                {f.q}
                <svg className="chev h-5 w-5 shrink-0 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="faq-body">
                <div className="faq-inner">
                  <p className="pt-4 text-sm leading-8 text-slate-400">{f.a}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/30 via-[#0b1030] to-violet-600/20 p-10 text-center sm:p-14">
          <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to save your first video?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
              It takes less than 10 seconds — paste a link and hit download.
            </p>
            <a
              href="#top"
              className="btn-gradient mt-7 inline-block rounded-xl px-8 py-3.5 font-semibold text-white"
            >
              Start downloading
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2.5">
              <Logo size="h-8 w-8" />
              <span className="font-bold text-white">{siteName}</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#how" className="transition hover:text-white">
                How it works
              </a>
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#faq" className="transition hover:text-white">
                FAQ
              </a>
              <a href="/guide" className="transition hover:text-white">
                Guide
              </a>
            </nav>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-7 text-slate-500">
            Disclaimer: this tool is for lawful personal use only. Only
            download content you own the rights to or are permitted to
            download, and respect copyright and X&apos;s terms of service. We
            are not responsible for misuse.
          </p>
          <p className="mt-4 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
