import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#05070f',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* glow accents */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -100,
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(99,102,241,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -80,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.45) 0%, rgba(124,58,237,0) 70%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 20,
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>
            DownX
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 78,
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          <div>Download X (Twitter)</div>
          <div>videos in HD — free</div>
        </div>

        <div style={{ fontSize: 32, color: '#94a3b8', marginTop: 28 }}>
          Paste a link. Pick a quality. Save it to any device.
        </div>
      </div>
    ),
    { ...size }
  );
}
