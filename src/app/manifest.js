export default function manifest() {
  return {
    name: 'English Pro — Learn English with AI',
    short_name: 'English Pro',
    description: 'AI-powered English learning: vocabulary, grammar, pronunciation, writing, listening, role-play chat, and personalized roadmap.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f172a',
    theme_color: '#6366f1',
    categories: ['education', 'productivity'],
    lang: 'en',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
