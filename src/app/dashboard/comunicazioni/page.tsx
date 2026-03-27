import ComunicazioniPageClient from './comunicazioni-client'

export default async function ComunicazioniPage({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string | string[] | undefined>>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await Promise.all([params, searchParams])
  return <ComunicazioniPageClient />
}
