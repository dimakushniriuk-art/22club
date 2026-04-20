import { wrapEmailLayout, EMAIL_DESIGN } from '@/lib/communications/email-design'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface InvitoClienteEmailParams {
  atletaNome: string
  staffNome: string
  /** Link diretto (atleta già autenticato) */
  acceptUrlDirect: string
  declineUrlDirect: string
  /** Via login, preserva redirect verso Home con query invito */
  acceptUrlViaLogin: string
  declineUrlViaLogin: string
  homeUrl: string
}

export function buildInvitoClienteEmailHtml(p: InvitoClienteEmailParams): string {
  const safeAtleta = escapeHtml(p.atletaNome)
  const safeStaff = escapeHtml(p.staffNome)
  const safeAcceptD = escapeHtml(p.acceptUrlDirect)
  const safeDeclineD = escapeHtml(p.declineUrlDirect)
  const safeAcceptL = escapeHtml(p.acceptUrlViaLogin)
  const safeDeclineL = escapeHtml(p.declineUrlViaLogin)
  const safeHome = escapeHtml(p.homeUrl)

  const bodyHtml = `
    <p style="margin:0 0 16px 0; font-size:15px;">Ciao <strong>${safeAtleta}</strong>,</p>
    <p style="margin:0 0 20px 0;"><strong>${safeStaff}</strong> ti ha invitato a collegarti su <strong>${EMAIL_DESIGN.defaultOrgName}</strong>. L&apos;invito resta <strong>in attesa</strong> finché non scegli un&apos;opzione qui sotto.</p>
    <p style="margin:0 0 12px 0; font-size:14px; font-weight:600;">Se hai già effettuato l&apos;accesso all&apos;app</p>
    <div style="text-align:center; margin:12px 0 24px 0; display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
      <a href="${safeAcceptD}" class="btn-primary" style="display:inline-block; min-width:140px;">Accetta invito</a>
      <a href="${safeDeclineD}" style="display:inline-block; min-width:140px; padding:12px 20px; border-radius:8px; background:#64748b; color:#fff; text-decoration:none; font-weight:600;">Non accetto</a>
    </div>
    <p style="margin:0 0 12px 0; font-size:14px; font-weight:600;">Se non sei ancora dentro l&apos;app</p>
    <p style="margin:0 0 12px 0; font-size:13px; color:${EMAIL_DESIGN.textMuted};">Accedi con il tuo account: dopo il login verrai portato alla Home per completare l&apos;azione.</p>
    <div style="text-align:center; margin:12px 0 24px 0; display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
      <a href="${safeAcceptL}" class="btn-primary" style="display:inline-block; min-width:140px;">Accetta invito (login)</a>
      <a href="${safeDeclineL}" style="display:inline-block; min-width:140px; padding:12px 20px; border-radius:8px; background:#64748b; color:#fff; text-decoration:none; font-weight:600;">Non accetto (login)</a>
    </div>
    <div class="box-info">
      <p style="margin:0 0 8px 0; font-weight:600;">Cosa succede</p>
      <ul style="margin:8px 0 0 0; padding-left:20px; font-size:14px;">
        <li><strong>Accetta</strong>: ti colleghi al professionista e potrai usare Chat e le funzioni previste.</li>
        <li><strong>Non accetto</strong>: l&apos;invito viene rifiutato e non resta in sospeso.</li>
      </ul>
    </div>
    <p style="margin:20px 0 0 0; font-size:14px; color:${EMAIL_DESIGN.textMuted};">Puoi sempre aprire l&apos;invito dalla Home (icona busta) se preferisci decidere dall&apos;app:</p>
    <p style="word-break:break-all; font-size:13px; color:${EMAIL_DESIGN.brandColor}; margin:8px 0 0 0;">${safeHome}</p>
  `.trim()

  return wrapEmailLayout({
    headerTitle: EMAIL_DESIGN.defaultOrgName,
    bodyHtml,
    footerBrand: `${EMAIL_DESIGN.defaultOrgName}`,
    footerDisclaimer:
      'Messaggio automatico relativo all&apos;invito di un professionista. Se non ti aspettavi questa email, puoi ignorarla o rifiutare.',
    pageTitle: 'Invito professionista',
  })
}
