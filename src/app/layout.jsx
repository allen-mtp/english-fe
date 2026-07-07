import 'src/global.css';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { schemeConfig } from 'src/theme/scheme-config';
import { ThemeProvider } from 'src/theme/theme-provider';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { AuthProvider } from 'src/contexts/auth-context';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1',
  viewportFit: 'cover',
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3006');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'English AI - Học tiếng Anh với AI',
    template: '%s | English AI',
  },
  description:
    'Học tiếng Anh thông minh với AI: từ vựng, ngữ pháp, nghe, nói, viết, role-play và lộ trình 30 ngày — cá nhân hóa theo trình độ A1-C2.',
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'English AI',
    title: 'English AI - Học tiếng Anh với AI',
    description:
      'Học tiếng Anh thông minh với AI: từ vựng, ngữ pháp, nghe, nói, viết, role-play và lộ trình 30 ngày.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English AI - Học tiếng Anh với AI',
    description:
      'Học tiếng Anh thông minh với AI: từ vựng, ngữ pháp, nghe, nói, viết, role-play và lộ trình 30 ngày.',
  },
  appleWebApp: {
    capable: true,
    title: 'English AI',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'English AI',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'application-name': 'English AI',
    'msapplication-TileColor': '#6366f1',
  },
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          defaultMode={schemeConfig.defaultMode}
          modeStorageKey={schemeConfig.modeStorageKey}
        />
        <ThemeProvider>
          <MotionLazy>
            <AuthProvider>
              {children}
            </AuthProvider>
          </MotionLazy>
        </ThemeProvider>
      </body>
    </html>
  );
}
