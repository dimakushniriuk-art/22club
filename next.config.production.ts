// Configurazione Next.js ottimizzata per produzione

import type { NextConfig } from 'next'

const productionConfig: NextConfig = {
  // Configurazioni di base
  reactStrictMode: true,
  swcMinify: true,

  // Ottimizzazioni per produzione
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Configurazione immagini
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configurazione headers per sicurezza e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Configurazione redirect per produzione
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/home/',
        permanent: true,
      },
    ]
  },

  // Ottimizzazioni experimental
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@fullcalendar/react',
      '@fullcalendar/core',
      'recharts',
      'date-fns',
      'framer-motion',
    ],
    scrollRestoration: true,
    optimizeCss: true,
  },

  // Configurazione TypeScript e ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configurazione webpack per produzione
  webpack: async (config, { isServer }) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@prisma\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ]

    // Ottimizzazioni per produzione
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,

            // Vendor chunk principale
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              enforce: true,
              maxSize: 244000,
            },

            // Chunk per librerie pesanti
            fullcalendar: {
              test: /@fullcalendar/,
              name: 'fullcalendar',
              chunks: 'all',
              priority: 30,
              enforce: true,
              maxSize: 244000,
            },

            recharts: {
              test: /recharts/,
              name: 'recharts',
              chunks: 'all',
              priority: 30,
              enforce: true,
              maxSize: 244000,
            },

            framer: {
              test: /framer-motion/,
              name: 'framer',
              chunks: 'all',
              priority: 30,
              enforce: true,
              maxSize: 244000,
            },

            // Componenti UI
            ui: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: 'ui-components',
              chunks: 'all',
              priority: 10,
              enforce: true,
              maxSize: 244000,
            },

            // Componenti dashboard
            dashboard: {
              test: /[\\/]src[\\/]components[\\/]dashboard[\\/]/,
              name: 'dashboard-components',
              chunks: 'all',
              priority: 15,
              enforce: true,
              maxSize: 244000,
            },
          },
        },
      }
    }

    // Plugin per analisi bundle
    if (process.env.ANALYZE === 'true') {
      try {
        const bundleAnalyzerModule = await import('webpack-bundle-analyzer')
        const BundleAnalyzerPlugin = (
          bundleAnalyzerModule as { BundleAnalyzerPlugin?: new (...args: unknown[]) => unknown }
        ).BundleAnalyzerPlugin

        if (BundleAnalyzerPlugin) {
          config.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
            }),
          )
        } else {
          console.warn('Bundle analyzer non disponibile: plugin non trovato nel modulo importato.')
        }
      } catch (error) {
        console.warn('Bundle analyzer non disponibile:', error)
      }
    }

    // Ottimizzazioni per produzione
    config.optimization.minimize = true
    config.optimization.usedExports = true
    config.optimization.sideEffects = false

    return config
  },

  // Configurazione output
  output: 'standalone',

  // Configurazione trailing slash
  trailingSlash: false,

  // Configurazione base path (se necessario)
  // basePath: '/22club',
}

export default productionConfig
