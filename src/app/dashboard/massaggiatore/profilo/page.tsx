import { redirect } from 'next/navigation'

type Props = {
  searchParams: Promise<{ tab?: string }>
}

/** Il profilo massaggiatore è unificato in `/dashboard/massaggiatore/impostazioni`. */
export default async function MassaggiatoreProfiloRedirectPage({ searchParams }: Props) {
  const sp = await searchParams
  const t = sp.tab
  if (t === 'notifiche') {
    redirect('/dashboard/massaggiatore/impostazioni?tab=notifiche')
  }
  if (t === 'impostazioni') {
    redirect('/dashboard/massaggiatore/impostazioni?tab=account')
  }
  redirect('/dashboard/massaggiatore/impostazioni')
}
