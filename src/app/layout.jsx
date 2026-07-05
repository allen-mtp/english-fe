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

export const metadata = {
  title: {
    default: 'English Pro - Learn English with AI',
    template: '%s | English Pro',
  },
  description: 'AI-powered English learning: vocabulary, grammar, pronunciation, writing, listening, role-play chat, and personalized roadmap.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'English Pro',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'English Pro',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'application-name': 'English Pro',
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
