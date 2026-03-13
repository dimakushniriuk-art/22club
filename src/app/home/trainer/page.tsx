'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { ArrowLeft, User, Mail, Phone, Award, BookOpen, Briefcase, Quote, Target, Video, ImageIcon, ClipboardList, FileText } from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'
import type { TrainerProfileFull } from '@/types/trainer-profile'
import { gradients } from '@/lib/design-tokens'

type TrainerProfile = {
  pt_id: string
  pt_nome: string
  pt_cognome: string
  pt_email: string | null
  pt_telefono: string | null
  pt_avatar_url: string | null
}

export default function TrainerProfilePage() {
  const supabase = useSupabaseClient()
  const { loading: authLoading } = useAuth()
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null)
  const [fullProfile, setFullProfile] = useState<TrainerProfileFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullLoading, setFullLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .rpc('get_my_trainer_profile')
      .then((res: { data: unknown; error: unknown }) => {
        const { data, error: err } = res
        if (cancelled) return
        setLoading(false)
        if (err) {
          setError((err as { message?: string }).message ?? 'Errore')
          setTrainer(null)
          return
        }
        if (!Array.isArray(data) || data.length === 0) {
          setTrainer(null)
          return
        }
        setTrainer(data[0] as TrainerProfile)
      })
    return () => {
      cancelled = true
    }
  }, [supabase])

  useEffect(() => {
    if (!trainer?.pt_id) {
      setFullProfile(null)
      return
    }
    let cancelled = false
    setFullLoading(true)
    ;(supabase as unknown as { rpc: (name: string, args: { p_profile_id: string }) => Promise<{ data: unknown; error: unknown }> })
      .rpc('get_trainer_profile_full', { p_profile_id: trainer.pt_id })
      .then(({ data, error: err }) => {
        if (cancelled) return
        setFullLoading(false)
        if (err || data == null) {
          setFullProfile(null)
          return
        }
        setFullProfile(data as TrainerProfileFull)
      })
    return () => {
      cancelled = true
    }
  }, [trainer?.pt_id, supabase])

  if (authLoading) {
    return (
      <div
        className="bg-background min-h-dvh space-y-3 px-3 sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 flex items-center justify-center"
        style={{ overflow: 'auto' }}
      >
        <p className="text-text-secondary text-sm">Caricamento...</p>
      </div>
    )
  }

  const backHref = '/home/profilo'

  const pageContainerClass =
    'relative min-h-0 w-full max-w-full space-y-5 min-[834px]:space-y-6 px-3 pb-6 pt-4 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:py-5'
  const pageContainerStyle: React.CSSProperties = {
    overflow: 'auto',
    minHeight: 'calc(100dvh - 56px)',
    background:
      'radial-gradient(ellipse 120% 80% at 70% -20%, rgba(2,179,191,0.07) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 0% 50%, rgba(6,182,212,0.05) 0%, transparent 45%), #0d0d0d',
  }

  if (error) {
    return (
      <div className={pageContainerClass} style={pageContainerStyle}>
        <Button variant="ghost" size="sm" asChild className="text-text-secondary hover:text-primary">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Link>
        </Button>
        <Card className="border border-border bg-background-secondary/95 backdrop-blur-xl rounded-xl min-[834px]:rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-text-secondary text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!loading && !trainer) {
    return (
      <div className={pageContainerClass} style={pageContainerStyle}>
        <Button variant="ghost" size="sm" asChild className="text-text-secondary hover:text-primary">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Link>
        </Button>
        <Card className="border border-border bg-background-secondary/95 backdrop-blur-xl rounded-xl min-[834px]:rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-text-secondary text-sm">Nessun trainer assegnato.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={pageContainerClass} style={pageContainerStyle}>
      <div
        className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl min-[834px]:p-5"
        style={{
          border: gradients.glassHeaderBorder,
          background: gradients.glassHeaderTeal,
          boxShadow: gradients.glassHeaderShadow,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-70"
          style={{ background: gradients.glassHeaderRadial }}
          aria-hidden
        />
        <div className="relative z-10 flex items-center gap-3">
          <Link
            href={backHref}
            className="h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-secondary hover:bg-primary/15 hover:text-primary transition-colors shrink-0"
            aria-label="Indietro"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-text-primary min-[834px]:text-xl">
              Profilo Trainer
            </h1>
            <p className="truncate text-xs text-text-tertiary">
              {loading ? 'Caricamento...' : trainer ? `${trainer.pt_nome} ${trainer.pt_cognome}` : ''}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
          <CardContent className="p-5 sm:p-6 min-[834px]:p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-background-tertiary/50 animate-pulse" />
              <div className="h-5 w-48 bg-background-tertiary/50 rounded animate-pulse" />
              <div className="h-4 w-32 bg-background-tertiary/30 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ) : trainer ? (
        <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none rounded-xl min-[834px]:rounded-2xl" aria-hidden />
          <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              {trainer.pt_avatar_url ? (
                <div className="relative h-32 w-32 min-[834px]:h-40 min-[834px]:w-40 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={trainer.pt_avatar_url}
                    alt={`${trainer.pt_nome} ${trainer.pt_cognome}`}
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized={trainer.pt_avatar_url.startsWith('http')}
                  />
                </div>
              ) : (
                <div className="flex h-32 w-32 min-[834px]:h-40 min-[834px]:w-40 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <User className="h-16 w-16 min-[834px]:h-20 min-[834px]:w-20" />
                </div>
              )}
              <h2 className="text-text-primary text-xl font-bold mt-4">
                {trainer.pt_nome} {trainer.pt_cognome}
              </h2>
              <p className="text-text-secondary text-sm">Trainer</p>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              {trainer.pt_email && (
                <div className="flex items-center gap-3">
                  <Mail className="text-text-tertiary h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-text-secondary text-xs">Email</p>
                    <a
                      href={`mailto:${trainer.pt_email}`}
                      className="text-primary font-medium text-sm hover:underline truncate block"
                    >
                      {trainer.pt_email}
                    </a>
                  </div>
                </div>
              )}
              {trainer.pt_telefono && (
                <div className="flex items-center gap-3">
                  <Phone className="text-text-tertiary h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-text-secondary text-xs">Telefono</p>
                    <a
                      href={`tel:${trainer.pt_telefono}`}
                      className="text-primary font-medium text-sm hover:underline"
                    >
                      {trainer.pt_telefono}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {fullLoading && (
        <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
          <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6">
            <p className="text-text-secondary text-sm">Caricamento profilo...</p>
          </CardContent>
        </Card>
      )}

      {!fullLoading && fullProfile && (
        <div className="space-y-4">
          {/* Bio */}
          {fullProfile.profile && (fullProfile.profile.descrizione_breve || fullProfile.profile.descrizione_estesa || fullProfile.profile.filosofia || fullProfile.profile.perche_lavoro) && (
            <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
              <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-4">
                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Bio
                </h3>
                <div className="rounded-xl border border-border bg-background-tertiary/50 p-4 space-y-3">
                  {fullProfile.profile.descrizione_breve && <p className="text-text-secondary text-sm">{fullProfile.profile.descrizione_breve}</p>}
                  {fullProfile.profile.descrizione_estesa && <p className="text-text-secondary text-sm whitespace-pre-wrap">{fullProfile.profile.descrizione_estesa}</p>}
                  {fullProfile.profile.filosofia && <p className="text-text-secondary text-sm"><span className="text-text-tertiary">Filosofia: </span>{fullProfile.profile.filosofia}</p>}
                  {fullProfile.profile.perche_lavoro && <p className="text-text-secondary text-sm"><span className="text-text-tertiary">Perché lavoro: </span>{fullProfile.profile.perche_lavoro}</p>}
                  {fullProfile.profile.target_clienti && fullProfile.profile.target_clienti.length > 0 && (
                    <p className="text-text-secondary text-sm"><span className="text-text-tertiary">Target: </span>{fullProfile.profile.target_clienti.join(', ')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificazioni */}
          {fullProfile.certifications && fullProfile.certifications.length > 0 && (
            <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
              <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-4">
                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Certificazioni
                </h3>
                <ul className="space-y-4">
                  {fullProfile.certifications.map((c) => {
                    const isPdf = c.file_url?.toLowerCase().includes('.pdf') ?? false
                    return (
                      <li key={c.id} className="rounded-xl border border-border bg-background-tertiary/50 p-4 space-y-3">
                        <div className="text-text-secondary text-sm">
                          <span className="font-medium text-text-primary">{c.nome}</span>
                          {c.ente && <span> · {c.ente}</span>}
                          {c.anno != null && <span> · {c.anno}</span>}
                        </div>
                        {c.file_url && (
                          <a
                            href={c.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-24 h-24 rounded-lg overflow-hidden border border-border hover:border-primary/50 shrink-0"
                          >
                            {isPdf ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-background-secondary/80 text-primary">
                                <FileText className="h-10 w-10" />
                                <span className="text-[10px] mt-1">PDF</span>
                              </div>
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={c.file_url} alt={c.nome} className="w-full h-full object-cover" />
                            )}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Specializzazioni */}
          {fullProfile.specializations && fullProfile.specializations.length > 0 && (
            <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
              <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-4">
                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Specializzazioni
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {fullProfile.specializations.map((s) => (
                    <li key={s.id} className="rounded-xl border border-border bg-background-tertiary/50 px-3 py-2 text-text-secondary text-sm">
                      <span className="font-medium text-text-primary">{s.nome}</span>{s.livello ? ` · ${s.livello}` : ''}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Formazione */}
          {fullProfile.education && fullProfile.education.length > 0 && (
            <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
              <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-4">
                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Formazione
                </h3>
                <ul className="space-y-4">
                  {fullProfile.education.map((e) => {
                    const isPdf = e.documento_url?.toLowerCase().includes('.pdf') ?? false
                    return (
                      <li key={e.id} className="rounded-xl border border-border bg-background-tertiary/50 p-4 space-y-3">
                        <div className="text-text-secondary text-sm">
                          <span className="font-medium text-text-primary">{e.titolo}</span>
                          {e.istituto && <span> · {e.istituto}</span>}
                          {e.anno != null && <span> · {e.anno}</span>}
                        </div>
                        {e.documento_url && (
                          <a
                            href={e.documento_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-24 h-24 rounded-lg overflow-hidden border border-border hover:border-primary/50 shrink-0"
                          >
                            {isPdf ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-background-secondary/80 text-primary">
                                <FileText className="h-10 w-10" />
                                <span className="text-[10px] mt-1">PDF</span>
                              </div>
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={e.documento_url} alt={e.titolo} className="w-full h-full object-cover" />
                            )}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Corsi */}
          {fullProfile.courses && fullProfile.courses.length > 0 && (
            <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
              <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-4">
                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Corsi
                </h3>
                <ul className="space-y-3">
                  {fullProfile.courses.map((c) => (
                    <li key={c.id} className="rounded-xl border border-border bg-background-tertiary/50 p-4 text-text-secondary text-sm">
                      <span className="font-medium text-text-primary">{c.nome}</span>
                      {(c.durata_valore != null || c.durata_unita) && (
                        <span> · {[c.durata_valore, c.durata_unita].filter(Boolean).join(' ')}</span>
                      )}
                      {c.anno != null && <span> · {c.anno}</span>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Esperienza */}
          {fullProfile.experience && fullProfile.experience.length > 0 && (
            <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
              <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-4">
                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Esperienza
                </h3>
                <ul className="space-y-3">
                  {fullProfile.experience.map((x) => (
                    <li key={x.id} className="rounded-xl border border-border bg-background-tertiary/50 p-4 text-text-secondary text-sm">
                      <span className="font-medium text-text-primary">{x.nome_struttura}</span>
                      {x.ruolo && <span> · {x.ruolo}</span>}
                      <span> · {x.data_inizio}{x.data_fine ? ` – ${x.data_fine}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Testimonianze */}
          {fullProfile.testimonials && fullProfile.testimonials.length > 0 && (
            <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
              <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-4">
                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                  <Quote className="h-4 w-4 text-primary" />
                  Testimonianze
                </h3>
                <ul className="space-y-3">
                  {fullProfile.testimonials.map((t) => (
                    <li key={t.id} className="rounded-xl border border-border bg-background-tertiary/50 p-4 text-text-secondary text-sm border-l-4 border-l-primary/40">
                      &ldquo;{t.feedback}&rdquo;
                      {t.nome_cliente && <span className="block text-text-tertiary text-xs mt-1">— {t.nome_cliente}</span>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Trasformazioni (prima/dopo) */}
          {fullProfile.transformations && fullProfile.transformations.length > 0 && (
            <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
              <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-4">
                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Trasformazioni
                </h3>
                <ul className="space-y-4">
                  {fullProfile.transformations.map((tr) => {
                    const urls = tr.prima_dopo_urls as { prima?: string; dopo?: string; urls?: string[] } | null
                    const prima = urls && typeof urls.prima === 'string' ? urls.prima : null
                    const dopo = urls && typeof urls.dopo === 'string' ? urls.dopo : null
                    const altUrls = urls && Array.isArray(urls.urls) ? urls.urls : []
                    return (
                      <li key={tr.id} className="rounded-xl border border-border bg-background-tertiary/50 p-4 space-y-3">
                        {(tr.obiettivo || tr.risultato) && (
                          <div className="text-text-secondary text-sm space-y-1">
                            {tr.obiettivo && <p><span className="text-text-tertiary">Obiettivo: </span>{tr.obiettivo}</p>}
                            {tr.risultato && <p><span className="text-text-tertiary">Risultato: </span>{tr.risultato}</p>}
                            {tr.durata_settimane != null && <p className="text-text-tertiary text-xs">{tr.durata_settimane} settimane</p>}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-3 items-start">
                          {prima && (
                            <div>
                              <p className="text-text-tertiary text-xs mb-1">Prima</p>
                              <a href={prima} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 rounded-lg overflow-hidden border border-border hover:border-primary/50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={prima} alt="Prima" className="w-full h-full object-cover" />
                              </a>
                            </div>
                          )}
                          {dopo && (
                            <div>
                              <p className="text-text-tertiary text-xs mb-1">Dopo</p>
                              <a href={dopo} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 rounded-lg overflow-hidden border border-border hover:border-primary/50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={dopo} alt="Dopo" className="w-full h-full object-cover" />
                              </a>
                            </div>
                          )}
                          {!prima && !dopo && altUrls.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {altUrls.slice(0, 4).map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary/50">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Media: video + galleria */}
          {fullProfile.profile && (fullProfile.profile.url_video_presentazione || (fullProfile.profile.galleria_urls && fullProfile.profile.galleria_urls.length > 0)) && (
            <Card className="relative overflow-hidden rounded-xl min-[834px]:rounded-2xl border border-border bg-background-secondary/95 backdrop-blur-xl">
              <CardContent className="relative z-10 p-5 sm:p-6 min-[834px]:p-6 space-y-4">
                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Media
                </h3>
                {fullProfile.profile.url_video_presentazione && (
                  <div className="rounded-xl border border-border bg-background-tertiary/50 p-4 space-y-2">
                    <p className="text-text-tertiary text-xs">Video presentazione</p>
                    <a
                      href={fullProfile.profile.url_video_presentazione}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-border hover:border-primary/50 bg-background-secondary/80 text-primary shrink-0"
                    >
                      <Video className="h-10 w-10" />
                      <span className="text-[10px] mt-1">Apri video</span>
                    </a>
                  </div>
                )}
                {fullProfile.profile.galleria_urls && fullProfile.profile.galleria_urls.length > 0 && (
                  <div className="rounded-xl border border-border bg-background-tertiary/50 p-4 space-y-2">
                    <p className="text-text-tertiary text-xs flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" /> Galleria
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {fullProfile.profile.galleria_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 rounded-lg overflow-hidden border border-border hover:border-primary/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
