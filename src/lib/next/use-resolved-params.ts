import { use } from 'react'

/** Next.js 15+ passes `params` as `Promise` to client `page.tsx` / `layout.tsx`; unwrap with React `use`. */
export function useResolvedParams<P extends Record<string, string | string[] | undefined>>(
  params: Promise<P>,
): P {
  return use(params)
}
