import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '116px',
          position: 'relative',
        }}
      >
        {/* Open book forming E — left spine */}
        <div style={{ position: 'absolute', left: 128, top: 168, width: 40, height: 224, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: '4px', boxShadow: '0 5px 16px rgba(0,0,0,0.22)' }} />
        {/* Top bar */}
        <div style={{ position: 'absolute', left: 168, top: 168, width: 240, height: 68, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: '4px 16px 16px 4px', boxShadow: '0 5px 16px rgba(0,0,0,0.22)' }} />
        {/* Middle bar (shorter) */}
        <div style={{ position: 'absolute', left: 168, top: 268, width: 180, height: 56, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: '4px 16px 16px 4px', boxShadow: '0 5px 16px rgba(0,0,0,0.22)' }} />
        {/* Bottom bar */}
        <div style={{ position: 'absolute', left: 168, top: 356, width: 240, height: 36, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: '4px 16px 16px 4px', boxShadow: '0 5px 16px rgba(0,0,0,0.22)' }} />
        {/* AI sparkle — main */}
        <div style={{ position: 'absolute', top: 76, right: 76, width: 64, height: 64, background: 'linear-gradient(135deg, #67e8f9, #06b6d4)', clipPath: 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)', filter: 'blur(0px)' }} />
        {/* AI sparkle — accent */}
        <div style={{ position: 'absolute', top: 148, right: 56, width: 28, height: 28, background: '#a5f3fc', clipPath: 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)' }} />
      </div>
    ),
    { ...size }
  );
}
