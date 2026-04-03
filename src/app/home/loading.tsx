import { HomeAthletePageContentSkeleton } from '@/components/layout/route-loading-skeletons'

/** Skeleton nel fallback Suspense sotto `HomeLayoutClient` (chrome reale già montata). */
export default function HomeSegmentLoading() {
  return <HomeAthletePageContentSkeleton />
}
