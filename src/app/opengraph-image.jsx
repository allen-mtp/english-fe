import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'English AI — Học tiếng Anh thông minh với AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadInterFont(weight) {
  const file = weight === 800 ? 'inter-800.ttf' : 'inter-500.ttf';
  return readFile(join(process.cwd(), 'public/fonts', file));
}

export default async function Image() {
  const [interBold, interMedium] = await Promise.all([loadInterFont(800), loadInterFont(500)]);

  const fonts = [
    { name: 'Inter', data: interBold, weight: 800, style: 'normal' },
    { name: 'Inter', data: interMedium, weight: 500, style: 'normal' },
  ];

  const features = ['Từ vựng', 'Ngữ pháp', 'Nghe · Nói', 'Viết', 'Role-play', 'Lộ trình 30 ngày'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 35%, #7c3aed 70%, #8b5cf6 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            left: -100,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'rgba(6,182,212,0.12)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 72px',
            gap: 56,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 220,
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 55%, #8b5cf6 100%)',
              borderRadius: 50,
              position: 'relative',
              flexShrink: 0,
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '3px solid rgba(255,255,255,0.18)',
            }}
          >
            <div style={{ position: 'absolute', left: 55, top: 72, width: 17, height: 96, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: 72, top: 72, width: 103, height: 29, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: '3px 7px 7px 3px' }} />
            <div style={{ position: 'absolute', left: 72, top: 115, width: 77, height: 24, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: '3px 7px 7px 3px' }} />
            <div style={{ position: 'absolute', left: 72, top: 153, width: 103, height: 15, background: 'linear-gradient(180deg, #ffffff, #eef2ff)', borderRadius: '3px 7px 7px 3px' }} />
            <div
              style={{
                position: 'absolute',
                top: 33,
                right: 33,
                width: 28,
                height: 28,
                background: 'linear-gradient(135deg, #67e8f9, #06b6d4)',
                clipPath: 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 64,
                right: 24,
                width: 12,
                height: 12,
                background: '#a5f3fc',
                clipPath: 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)',
              }}
            />
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-1.5px',
                lineHeight: 1.05,
              }}
            >
              English AI
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.92)',
                lineHeight: 1.3,
                maxWidth: 620,
              }}
            >
              Học tiếng Anh thông minh với AI
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 8,
              }}
            >
              {features.map((label) => (
                <div
                  key={label}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 20,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              A1 → C2 · Cá nhân hóa theo chủ đề · Miễn phí trải nghiệm
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
