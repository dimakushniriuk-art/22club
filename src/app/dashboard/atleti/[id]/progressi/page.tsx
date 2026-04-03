import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

/** La scheda atleta espone già il riepilogo nel tab Progressi; questa URL resta per compatibilità e bookmark. */
export default async function AtletaProgressiRedirectPage({ params }: Props) {
  const { id } = await params
  redirect(`/dashboard/atleti/${id}?tab=progressi`)
}
