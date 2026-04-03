import { RootRedirectSegmentSkeleton } from '@/components/layout/route-loading-skeletons'

/**
 * Segmento root (`/`) durante sospensione — stesso pattern del redirect verso `/login`.
 */
export default function RootSegmentLoading() {
  return <RootRedirectSegmentSkeleton />
}
