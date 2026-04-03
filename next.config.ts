import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** Middleware e altro possono usare solo CAPACITOR=true (es. in .env.local). */
const isCapacitor = process.env.CAPACITOR === 'true'
/**
 * Export statico solo per la pipeline Capacitor (`npm run build:capacitor`), non per `next build` web:
 * altrimenti CAPACITOR=true in .env.local abiliterebbe output: 'export' e fallirebbe sulle API routes.
 */
const isCapacitorStaticExport =
  process.env.CAPACITOR === 'true' && process.env.CAPACITOR_NEXT_EXPORT === 'true'

const nextConfig: NextConfig = {
  // Forza la root di tracing su questa app per evitare l'avviso multi-lockfile
  outputFileTracingRoot: path.join(__dirname),

  // Export statico per Capacitor (app native)
  // Richiede CAPACITOR_NEXT_EXPORT=true (impostato negli script build:capacitor*)
  ...(isCapacitorStaticExport && {
    output: 'export',
    // Escludi API routes dal build per Capacitor (non supportate con export statico)
    distDir: '.next',
  }),

  // Ottimizzazioni per file system
  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  // Header di sicurezza (solo per web, non per Capacitor)
  // Nota: Headers non vengono applicati con output: 'export'
  // Per Capacitor, la sicurezza è gestita dal sistema operativo
  ...(!isCapacitor && {
    async headers() {
      const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.supabase.co https://*.supabase.in https://*.public.blob.vercel-storage.com;
        media-src 'self' blob: data: https://*.supabase.co https://*.supabase.in https://*.public.blob.vercel-storage.com;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co;
        frame-ancestors 'self';
        form-action 'self';
        base-uri 'self';
        object-src 'none';
      `
        .replace(/\s{2,}/g, ' ')
        .trim()

      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: cspHeader,
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
            },
          ],
        },
      ]
    },
  }),

  // Performance ottimizzazioni
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Ottimizza importazioni per ridurre bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@fullcalendar/react',
      '@fullcalendar/core',
      'recharts',
      'date-fns',
      // Zod non viene ottimizzato per evitare problemi con z.enum e tree-shaking
    ],
    // Turbo mode per migliorare performance di compilazione (Next.js 15)
    // Migliora cache e risoluzione moduli per build più veloci
    // Migrato da experimental.turbo a turbopack (Next.js 15.5+)
    // turbo: {}, // Deprecato, rimosso per eliminare warning
  },

  // Escludi moduli opzionali dal bundle (importati dinamicamente solo quando necessari)
  // Migrato da experimental.serverComponentsExternalPackages a serverExternalPackages (Next.js 15)
  serverExternalPackages: ['resend', 'twilio', 'web-push'],

  // Transpila Recharts per garantire compatibilità
  transpilePackages: ['recharts'],

  // Ottimizza per sviluppo
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Configurazione Fast Refresh
  // Disabilitato in dev: Strict Mode monta/smonta/rimonta i componenti e fa abortire le fetch
  // di Supabase Auth (_initialize/_refreshAccessToken) → "Failed to fetch" / AbortError in console
  reactStrictMode: process.env.NODE_ENV === 'production',

  // Ottimizza immagini
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Permetti immagini da Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Fallback per domini legacy (deprecato ma mantenuto per compatibilità)
    domains: [],
  },

  // Webpack ottimizzazioni
  webpack: (config, { isServer, dev }) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@prisma\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /@opentelemetry\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      // Ignora moduli opzionali (resend, twilio, web-push) - importati dinamicamente solo quando necessari
      // Questi moduli sono gestiti come esterni tramite serverComponentsExternalPackages
      {
        module: /resend/,
        message: /Module not found|Can't resolve/,
      },
      {
        module: /twilio/,
        message: /Module not found|Can't resolve/,
      },
      {
        module: /web-push/,
        message: /Module not found|Can't resolve/,
      },
      // Ignora warning next.config.compiled.js (file generato automaticamente da Next.js)
      // Questo è un warning innocuo causato dalla cache filesystem di webpack
      {
        message: /Can't resolve.*next\.config\.compiled\.js/,
      },
      {
        message: /Caching failed for pack.*next\.config\.compiled\.js/,
      },
      {
        message: /while resolving.*next\.config\.compiled\.js/,
      },
      {
        message: /\[webpack\.cache\.PackFileCacheStrategy\].*next\.config\.compiled\.js/,
      },
    ]

    // Ottimizzazioni per sviluppo
    if (dev) {
      // Migliora performance di sviluppo
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/test-results/**',
          '**/.cursor/**',
        ],
      }

      // Cache per sviluppo: usa memory cache invece di filesystem per evitare warning
      // Il warning su next.config.compiled.js è causato dalla cache filesystem che cerca
      // di includere un file generato dinamicamente da Next.js
      // In produzione questo problema non si presenta
      config.cache = {
        type: 'memory', // Usa memory cache invece di filesystem per evitare il warning
      }

      // Ottimizzazioni per compilazione incrementale più veloce
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
      }
    }

    if (!isServer) {
      // Riduci bundle size per client
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk per node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              maxSize: 244000, // 244KB
            },
            // Chunk separato per librerie pesanti
            fullcalendar: {
              test: /@fullcalendar/,
              name: 'fullcalendar',
              chunks: 'all',
              priority: 30,
              maxSize: 244000,
            },
            recharts: {
              test: /recharts/,
              name: 'recharts',
              chunks: 'all',
              priority: 30,
              maxSize: 244000,
            },
            lucide: {
              test: /lucide-react/,
              name: 'lucide',
              chunks: 'all',
              priority: 25,
              maxSize: 244000,
            },
            // Common chunk per codice condiviso
            common: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              maxSize: 244000,
            },
          },
        },
      }

      // Ottimizza resolve per ridurre tempo di risoluzione moduli
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          '@': path.resolve(__dirname, 'src'),
        },
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        modules: ['node_modules'],
      }
    }
    return config
  },
}

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: '22club',

  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
})
