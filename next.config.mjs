/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained build for Docker / VPS deploys
  output: 'standalone',
  reactStrictMode: true,
  // video.twimg.com thumbnails/posters are hot-linked in <img>/<video>
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'video.twimg.com' },
    ],
  },
};

export default nextConfig;
