'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button, Card, CardContent, Input, Label, Textarea, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { ArrowLeft, Code2 } from 'lucide-react'
import { generateEmailHTML } from '@/lib/communications/email-template'

const DEFAULT_TITLE = 'Esempio: Benvenuto in 22Club'
const DEFAULT_MESSAGE =
  "Questo è un messaggio di esempio. Qui vedi come apparirà l'email ai destinatari.\n\nPuoi usare il nome del destinatario ({{athlete_name}}) nel testo."
const DEFAULT_ATHLETE_NAME = 'Mario'

const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{title}}</title>
<style>
body{ margin:0; padding:0; background:#000000; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:#ffffff; }
.wrapper{ width:100%; background:#000000; padding:40px 16px; }
.container{ max-width:560px; margin:0 auto; background:#0b0b0b; border-radius:14px; overflow:hidden; border:1px solid #1f1f1f; }
.header{ padding:32px 24px; text-align:center; border-bottom:1px solid #1f1f1f; }
.logo{ width:160px; }
.body{ padding:32px 28px; }
.greeting{ font-size:15px; color:#9ca3af; margin-bottom:12px; }
.title{ font-size:22px; font-weight:600; margin-bottom:16px; color:#ffffff; }
.message{ font-size:15px; line-height:1.7; color:#d1d5db; margin-bottom:28px; }
.info-box{ background:#050505; border:1px solid #1f1f1f; border-radius:10px; padding:16px; margin-bottom:26px; font-size:14px; color:#cbd5e1; }
.button{ display:inline-block; background:#02B3BF; color:#ffffff !important; text-decoration:none; padding:12px 22px; border-radius:8px; font-size:14px; font-weight:600; }
.footer{ border-top:1px solid #1f1f1f; padding:20px 24px; text-align:center; }
.brand{ color:#02B3BF; font-weight:600; margin-bottom:6px; }
.small{ font-size:12px; color:#6b7280; }
</style>
</head>
<body>
<div class="wrapper"><div class="container">
<div class="header"><img src="LOGO_URL_QUI" class="logo" alt="22Club"></div>
<div class="body">
<p class="greeting">Ciao {{athlete_name}},</p>
<h1 class="title">{{title}}</h1>
<div class="message">{{message}}</div>
<div class="info-box">{{info_block}}</div>
<a href="{{cta_link}}" class="button">{{cta_text}}</a>
</div>
<div class="footer"><div class="brand">22Club</div><div class="small">Questa email è stata inviata automaticamente dal sistema.<br>Non rispondere a questo messaggio.</div></div>
</div></div>
</body>
</html>`

export default function ComunicazioniTemplatePage() {
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [athleteName, setAthleteName] = useState(DEFAULT_ATHLETE_NAME)
  const [orgName, setOrgName] = useState('22Club')
  const [infoBlock, setInfoBlock] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [customHtml, setCustomHtml] = useState('')
  const [editorTab, setEditorTab] = useState<'campi' | 'html'>('campi')

  const metadata = useMemo(
    () => ({
      athlete_name: athleteName,
      org_name: orgName,
      info_block: infoBlock,
      cta_link: ctaLink || '#',
      cta_text: ctaText,
      logo_url: logoUrl || undefined,
      ...{ email_template: customHtml.trim() || DEFAULT_HTML_TEMPLATE },
    }),
    [athleteName, orgName, infoBlock, ctaLink, ctaText, logoUrl, customHtml],
  )

  const sampleHtml = useMemo(
    () => generateEmailHTML(title, message, metadata),
    [title, message, metadata],
  )

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-4xl flex flex-col space-y-4 sm:space-y-6 px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-text-primary text-2xl sm:text-3xl font-bold tracking-tight">
              Template email
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Modifica i campi per vedere l’anteprima o il template HTML
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/comunicazioni">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna a Comunicazioni
            </Link>
          </Button>
        </div>

        <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as 'campi' | 'html')} className="w-full">
          <TabsList className="inline-flex h-10 rounded-full bg-background-secondary p-1 text-text-tertiary">
            <TabsTrigger value="campi">Campi contenuto</TabsTrigger>
            <TabsTrigger value="html">
              <Code2 className="mr-2 h-4 w-4" />
              Template HTML
            </TabsTrigger>
          </TabsList>
          <TabsContent value="campi" className="mt-4">
            <Card variant="outlined" className="border-border">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-title">Titolo</Label>
                  <Input
                    id="template-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titolo email"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-athlete">Nome destinatario (anteprima)</Label>
                  <Input
                    id="template-athlete"
                    value={athleteName}
                    onChange={(e) => setAthleteName(e.target.value)}
                    placeholder="Nome atleta"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-message">Messaggio</Label>
                  <Textarea
                    id="template-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Testo dell'email..."
                    rows={4}
                    className="bg-background resize-y min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-org">Nome organizzazione</Label>
                  <Input
                    id="template-org"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="22Club"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-info">Blocco info (box evidenziato)</Label>
                  <Textarea
                    id="template-info"
                    value={infoBlock}
                    onChange={(e) => setInfoBlock(e.target.value)}
                    placeholder="Testo opzionale nel box info..."
                    rows={3}
                    className="bg-background resize-y font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-cta-link">Link pulsante CTA</Label>
                    <Input
                      id="template-cta-link"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      placeholder="https://..."
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-cta-text">Testo pulsante CTA</Label>
                    <Input
                      id="template-cta-text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Vai all'app"
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-logo">URL logo (vuoto = default)</Label>
                  <Input
                    id="template-logo"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://... oppure lascia vuoto"
                    className="bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="html" className="mt-4">
            <Card variant="outlined" className="border-border">
              <CardContent className="p-4 sm:p-6">
                <Label htmlFor="template-html">HTML template (placeholders: &#123;&#123;title&#125;&#125;, &#123;&#123;message&#125;&#125;, &#123;&#123;athlete_name&#125;&#125;, &#123;&#123;info_block&#125;&#125;, &#123;&#123;cta_link&#125;&#125;, &#123;&#123;cta_text&#125;&#125;, LOGO_URL_QUI)</Label>
                <Textarea
                  id="template-html"
                  value={customHtml || DEFAULT_HTML_TEMPLATE}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  placeholder={DEFAULT_HTML_TEMPLATE}
                  rows={18}
                  className="mt-2 bg-background font-mono text-sm resize-y min-h-[320px]"
                />
                <p className="mt-2 text-text-tertiary text-xs">
                  Se compili questo campo viene usato al posto del layout di default. I campi sopra (titolo, messaggio, ecc.) sostituiscono i placeholder nell&apos;anteprima.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="rounded-lg border border-border overflow-hidden bg-background-secondary">
          <div className="px-4 py-2 border-b border-border text-text-tertiary text-sm">
            Anteprima
          </div>
          <iframe
            title="Anteprima template email"
            srcDoc={sampleHtml}
            className="w-full min-h-[560px] border-0 bg-black"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  )
}
