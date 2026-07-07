import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '..'),
    outputFileTracingIncludes: {
      '/api/[[...path]]': ['../backend/dist/**/*'],
    },
    serverComponentsExternalPackages: [
      '@google/generative-ai',
      'bcryptjs',
      'cookie-parser',
      'cors',
      'express',
      'express-mongo-sanitize',
      'express-rate-limit',
      'express-slow-down',
      'helmet',
      'ioredis',
      'jsonwebtoken',
      'mongoose',
      'morgan',
      'multer',
      'rate-limit-redis',
    ],
  },
};

export default nextConfig;
