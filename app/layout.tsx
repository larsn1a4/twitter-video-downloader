import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { siteUrl, siteName } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  themeColor: '#05070f',
  title: {
    default: 'DownX — Download X (Twitter) Videos in HD for Free',
    template: `%s | ${siteName}`,
  },
  description:
    'Free X (Twitter) video downloader. Paste any video or live stream link and save it in up to 4K quality. No sign-up, no software — works on phone, tablet and desktop.',
  keywords: [
    'twitter video downloader',
    'x video downloader',
    'download twitter video',
    'download x video',
    'twitter video download hd',
    'x live stream downloader',
    'save twitter video',
    'twitter gif downloader',
  ],
  authors: [{ name: siteName }],
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName,
    title: 'DownX — Download X (Twitter) Videos in HD',
    description:
      'Paste any X video or live stream link and download it in high quality. Free, fast, no sign-up. Works on all devices.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DownX — Download X (Twitter) videos in HD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DownX — Download X (Twitter) Videos in HD',
    description:
      'Free tool to download X videos and live streams in multiple qualities.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.className} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
