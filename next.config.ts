import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Forza la root di tracing su questa app per evitare l'avviso multi-lockfile
  outputFileTracingRoot: path.join(__dirname),

  // Ottimizzazioni per file system
  poweredByHeader: false,
  compress: true,
  generateEtags: true,

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
  reactStrictMode: true,

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

export default nextConfig
