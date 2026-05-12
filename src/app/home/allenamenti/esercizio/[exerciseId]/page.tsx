'use client'

import { EsercizioDetailPageContent } from '@/features/athlete-allenamenti'

export { EsercizioDetailPageContent } from '@/features/athlete-allenamenti'

export default function EsercizioDetailPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>
}) {
  return <EsercizioDetailPageContent routeParams={params} />
}
