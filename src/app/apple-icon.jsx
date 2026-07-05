import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const s = 180 / 512;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 55%, #8b5cf6 100%)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', left: 128 * s, top: 168 * s, width: 40 * s, height: 224 * s, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.22)' }} />
        <div style={{ position: 'absolute', left: 168 * s, top: 168 * s, width: 240 * s, height: 68 * s, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: `${4 * s}px ${16 * s}px ${16 * s}px ${4 * s}px`, boxShadow: '0 4px 12px rgba(0,0,0,0.22)' }} />
        <div style={{ position: 'absolute', left: 168 * s, top: 268 * s, width: 180 * s, height: 56 * s, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: `${4 * s}px ${16 * s}px ${16 * s}px ${4 * s}px`, boxShadow: '0 4px 12px rgba(0,0,0,0.22)' }} />
        <div style={{ position: 'absolute', left: 168 * s, top: 356 * s, width: 240 * s, height: 36 * s, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: `${4 * s}px ${16 * s}px ${16 * s}px ${4 * s}px`, boxShadow: '0 4px 12px rgba(0,0,0,0.22)' }} />
        <div style={{ position: 'absolute', top: 76 * s, right: 76 * s, width: 64 * s, height: 64 * s, background: 'linear-gradient(135deg, #67e8f9, #06b6d4)', clipPath: 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)' }} />
        <div style={{ position: 'absolute', top: 148 * s, right: 56 * s, width: 28 * s, height: 28 * s, background: '#a5f3fc', clipPath: 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)' }} />
      </div>
    ),
    { ...size }
  );
}
