import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

declare global {
  var vi: (typeof import('vitest'))['vi']
}

// Make vi available globally
globalThis.vi = vi

// Mock per Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Istanza Supabase condivisa per i mock (usata da client e barrel)
const sharedSupabaseInstance = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi
      .fn()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  }),
}

// Mock per Framer Motion: non passare al DOM props non-HTML (whileHover, whileTap, etc.)
// Usa import('react') per avere la stessa istanza React dell'app e evitare body vuoto in JSDOM
vi.mock('framer-motion', async () => {
  const react = await import('react')
  const React = react.default
  const framerProps = new Set([
    'whileHover',
    'whileTap',
    'whileFocus',
    'whileDrag',
    'whileInView',
    'initial',
    'animate',
    'exit',
    'transition',
    'variants',
    'onAnimationStart',
    'onAnimationComplete',
    'layout',
    'layoutId',
  ])
  const createMotion = (tag: string) => {
    const Motion = (props: Record<string, unknown>) => {
      const filtered: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(props)) {
        if (k === 'children' || !framerProps.has(k)) filtered[k] = v
      }
      return React.createElement(tag, filtered, props.children as React.ReactNode)
    }
    Motion.displayName = `Motion.${tag}`
    return Motion
  }
  const motion = new Proxy(
    { div: createMotion('div'), button: createMotion('button'), span: createMotion('span') },
    {
      get(target, prop: string) {
        if (prop in target) return (target as Record<string, unknown>)[prop]
        return createMotion(prop)
      },
    },
  )
  const AnimatePresenceMock = ({ children }: { children: React.ReactNode }) => children
  AnimatePresenceMock.displayName = 'AnimatePresence'
  return {
    motion,
    AnimatePresence: AnimatePresenceMock,
  }
})

// Mock per Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => sharedSupabaseInstance,
  supabase: sharedSupabaseInstance,
  handleRefreshTokenError: vi.fn(() => false),
}))

// Mock per barrel @/lib/supabase (createClient + supabase)
vi.mock('@/lib/supabase', () => ({
  createClient: () => sharedSupabaseInstance,
  supabase: sharedSupabaseInstance,
}))

// Mock per haptic feedback
vi.mock('@/lib/haptics', () => ({
  triggerHaptic: vi.fn(),
  haptics: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    light: vi.fn(),
    medium: vi.fn(),
    heavy: vi.fn(),
  },
  isHapticSupported: vi.fn().mockReturnValue(false),
  requestHapticPermission: vi.fn().mockResolvedValue(false),
}))

// Mock per window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock per IntersectionObserver (Next use-intersection fa `new IntersectionObserver()`)
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock per ResizeObserver (stesso pattern costruttore)
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Cleanup dopo ogni test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Setup globale
beforeAll(() => {
  // Configurazione globale per i test
})

afterAll(() => {
  // Cleanup globale
})
