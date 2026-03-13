'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { Button, Input, Textarea, Select, Checkbox } from '@/components/ui'
import { useTrainerProfile } from '@/hooks/use-trainer-profile'
import { supabase } from '@/lib/supabase/client'
import {
  Briefcase,
  FileText,
  Save,
  RefreshCw,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Award,
  BookOpen,
  Target,
  Building2,
  ClipboardList,
  BarChart3,
  Quote,
  ImageIcon,
  Scale,
  FileCheck,
  Smartphone,
  Video,
} from 'lucide-react'
import { useNotify } from '@/lib/ui/notify'
import { uploadTrainerCertificate, uploadTrainerMedia } from '@/lib/trainer-storage'

const MODALITA_OPTS = [
  { value: 'online', label: 'Online' },
  { value: 'in_palestra', label: 'In palestra' },
  { value: 'domicilio', label: 'Domicilio' },
] as const

const STATO_PROFILO_OPTS = [
  { value: 'bozza', label: 'Bozza' },
  { value: 'in_verifica', label: 'In verifica' },
  { value: 'pubblicato', label: 'Pubblicato' },
] as const

const CERT_STATO_OPTS = [
  { value: 'attivo', label: 'Attivo' },
  { value: 'aggiornamento', label: 'In aggiornamento' },
  { value: 'scaduto', label: 'Scaduto' },
] as const

const LIVELLO_OPTS = [
  { value: 'base', label: 'Base' },
  { value: 'avanzato', label: 'Avanzato' },
  { value: 'expert', label: 'Expert' },
] as const

/** Blocco 1: identità (colonne su profiles) */
interface IdentitaState {
  titolo_professionale: string
  anni_esperienza: number | ''
  modalita_lavoro: string[]
  stato_profilo: string
}

const defaultIdentita: IdentitaState = {
  titolo_professionale: '',
  anni_esperienza: '',
  modalita_lavoro: [],
  stato_profilo: 'bozza',
}

export function SettingsTrainerProfileTab() {
  const { notify } = useNotify()
  const {
    profileId,
    profile: trainerProfile,
    education,
    certifications,
    courses,
    specializations,
    experience,
    testimonials,
    transformations,
    loading: profileLoading,
    error: profileError,
    refetch,
    updateProfile,
  } = useTrainerProfile({ enabled: true })

  const [identita, setIdentita] = useState<IdentitaState>(defaultIdentita)
  const [identitaLoading, setIdentitaLoading] = useState(false)
  const [identitaSaving, setIdentitaSaving] = useState(false)
  const [bioSaving, setBioSaving] = useState(false)
  const [educationSaving, setEducationSaving] = useState(false)
  const [educationForm, setEducationForm] = useState<{
    id: string | null
    tipo: string
    titolo: string
    istituto: string
    anno: string
    documento_url: string
  }>({ id: null, tipo: 'laurea', titolo: '', istituto: '', anno: '', documento_url: '' })
  const [showEducationForm, setShowEducationForm] = useState(false)
  const [certificationsSaving, setCertificationsSaving] = useState(false)
  const [certificationsForm, setCertificationsForm] = useState<{
    id: string | null
    nome: string
    ente: string
    anno: string
    numero_certificato: string
    stato: 'attivo' | 'aggiornamento' | 'scaduto'
    file_url: string
  }>({
    id: null,
    nome: '',
    ente: '',
    anno: '',
    numero_certificato: '',
    stato: 'attivo',
    file_url: '',
  })
  const [showCertificationsForm, setShowCertificationsForm] = useState(false)
  const [certUploading, setCertUploading] = useState(false)
  const [certUploadError, setCertUploadError] = useState<string | null>(null)
  const [educationUploading, setEducationUploading] = useState(false)
  const [educationUploadError, setEducationUploadError] = useState<string | null>(null)
  const [coursesSaving, setCoursesSaving] = useState(false)
  const [coursesForm, setCoursesForm] = useState<{
    id: string | null
    nome: string
    durata_valore: string
    durata_unita: string
    anno: string
  }>({ id: null, nome: '', durata_valore: '', durata_unita: 'ore', anno: '' })
  const [showCoursesForm, setShowCoursesForm] = useState(false)
  const [specializationsSaving, setSpecializationsSaving] = useState(false)
  const [specializationsForm, setSpecializationsForm] = useState<{
    id: string | null
    nome: string
    livello: string
    anni_esperienza: string
  }>({ id: null, nome: '', livello: 'base', anni_esperienza: '' })
  const [showSpecializationsForm, setShowSpecializationsForm] = useState(false)
  const [experienceSaving, setExperienceSaving] = useState(false)
  const [experienceForm, setExperienceForm] = useState<{
    id: string | null
    nome_struttura: string
    ruolo: string
    data_inizio: string
    data_fine: string
    collaborazioni: string
    atleti_seguiti: string
  }>({
    id: null,
    nome_struttura: '',
    ruolo: '',
    data_inizio: '',
    data_fine: '',
    collaborazioni: '',
    atleti_seguiti: '',
  })
  const [showExperienceForm, setShowExperienceForm] = useState(false)
  const [testimonialsSaving, setTestimonialsSaving] = useState(false)
  const [testimonialsForm, setTestimonialsForm] = useState<{
    id: string | null
    nome_cliente: string
    eta: string
    obiettivo: string
    durata_percorso: string
    risultato: string
    feedback: string
    valutazione: string
  }>({
    id: null,
    nome_cliente: '',
    eta: '',
    obiettivo: '',
    durata_percorso: '',
    risultato: '',
    feedback: '',
    valutazione: '',
  })
  const [showTestimonialsForm, setShowTestimonialsForm] = useState(false)
  const [transformationsSaving, setTransformationsSaving] = useState(false)
  const [transformationsForm, setTransformationsForm] = useState<{
    id: string | null
    prima_dopo_urls: string
    durata_settimane: string
    obiettivo: string
    risultato: string
    verificato: boolean
    consenso: boolean
  }>({
    id: null,
    prima_dopo_urls: '',
    durata_settimane: '',
    obiettivo: '',
    risultato: '',
    verificato: false,
    consenso: false,
  })
  const [showTransformationsForm, setShowTransformationsForm] = useState(false)
  const [metodoSaving, setMetodoSaving] = useState(false)
  const [risultatiSaving, setRisultatiSaving] = useState(false)
  const [eticaSaving, setEticaSaving] = useState(false)
  const [legaleSaving, setLegaleSaving] = useState(false)
  const [metodo, setMetodoState] = useState({
    valutazione_iniziale: false,
    test_funzionali: false,
    analisi_postura: false,
    misurazioni_corporee: [] as string[],
    periodizzazione: false,
    check_settimanali: false,
    report_progressi: false,
    uso_app: false,
  })
  const [risultati, setRisultatiState] = useState({
    clienti_seguiti: '',
    pct_successo: '',
    media_kg_persi: '',
    media_aumento_forza: '',
  })
  const [etica, setEticaState] = useState({
    no_doping: false,
    no_diete_estreme: false,
    no_promesse_irrealistiche: false,
    focus_salute: false,
    educazione_movimento: false,
    privacy_garantita: false,
  })
  const [legale, setLegaleState] = useState({
    partita_iva: '',
    assicurazione: false,
    assicurazione_url: '',
    registro_professionale: '',
    consenso_immagini_clienti: false,
    termini_accettati: false,
  })
  const [strumentiSaving, setStrumentiSaving] = useState(false)
  const [mediaSaving, setMediaSaving] = useState(false)
  const [strumenti, setStrumentiState] = useState({
    app_monitoraggio: '',
    software_programmazione: '',
    metodi_misurazione: [] as string[],
  })
  const [media, setMediaState] = useState({
    url_video_presentazione: '',
    galleria_urls: [] as string[],
  })
  const [mediaVideoUploading, setMediaVideoUploading] = useState(false)
  const [mediaGalleriaUploading, setMediaGalleriaUploading] = useState(false)
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null)
  const GALLERIA_MAX = 10
  const certFileInputRef = useRef<HTMLInputElement>(null)
  const educationFileInputRef = useRef<HTMLInputElement>(null)
  const mediaVideoInputRef = useRef<HTMLInputElement>(null)
  const mediaGalleriaInputRef = useRef<HTMLInputElement>(null)
  const transformazionePrimaInputRef = useRef<HTMLInputElement>(null)
  const transformazioneDopoInputRef = useRef<HTMLInputElement>(null)
  const [transformazionePrimaUploading, setTransformazionePrimaUploading] = useState(false)
  const [transformazioneDopoUploading, setTransformazioneDopoUploading] = useState(false)
  const [transformazioneUploadError, setTransformazioneUploadError] = useState<string | null>(null)
  const [bio, setBioState] = useState({
    descrizione_breve: '',
    descrizione_estesa: '',
    filosofia: '',
    perche_lavoro: '',
    target_clienti: '',
  })

  const loadIdentita = useCallback(async () => {
    if (!profileId) return
    setIdentitaLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('titolo_professionale, anni_esperienza, modalita_lavoro, stato_profilo')
        .eq('id', profileId)
        .single()
      if (error) throw error
      setIdentita({
        titolo_professionale: (data?.titolo_professionale as string) ?? '',
        anni_esperienza: data?.anni_esperienza ?? '',
        modalita_lavoro: (data?.modalita_lavoro as string[]) ?? [],
        stato_profilo: (data?.stato_profilo as string) ?? 'bozza',
      })
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore caricamento identità', 'error', 'Errore')
    } finally {
      setIdentitaLoading(false)
    }
  }, [profileId, notify])

  useEffect(() => {
    if (profileId) loadIdentita()
  }, [profileId, loadIdentita])

  const toggleModalita = (value: string) => {
    setIdentita((prev) => ({
      ...prev,
      modalita_lavoro: prev.modalita_lavoro.includes(value)
        ? prev.modalita_lavoro.filter((m) => m !== value)
        : [...prev.modalita_lavoro, value],
    }))
  }

  const handleSaveIdentita = async () => {
    if (!profileId) return
    setIdentitaSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          titolo_professionale: identita.titolo_professionale || null,
          anni_esperienza:
            identita.anni_esperienza === '' ? null : Number(identita.anni_esperienza),
          modalita_lavoro: identita.modalita_lavoro.length ? identita.modalita_lavoro : null,
          stato_profilo: identita.stato_profilo || 'bozza',
        })
        .eq('id', profileId)
      if (error) throw error
      notify('Identità professionale salvata', 'success', 'Salvato')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore nel salvataggio', 'error', 'Errore')
    } finally {
      setIdentitaSaving(false)
    }
  }

  const handleSaveBio = async () => {
    const targetArr = bio.target_clienti
      ? bio.target_clienti
          .split(/\n/)
          .map((s) => s.trim())
          .filter(Boolean)
      : null
    const payload = {
      descrizione_breve: bio.descrizione_breve.trim() || null,
      descrizione_estesa: bio.descrizione_estesa.trim() || null,
      filosofia: bio.filosofia.trim() || null,
      perche_lavoro: bio.perche_lavoro.trim() || null,
      target_clienti: targetArr?.length ? targetArr : null,
    }
    setBioSaving(true)
    try {
      const { error } = await updateProfile(payload)
      if (error) throw error
      notify('Bio e presentazione salvate', 'success', 'Salvato')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore nel salvataggio', 'error', 'Errore')
    } finally {
      setBioSaving(false)
    }
  }

  const openEducationForm = (item?: (typeof education)[0]) => {
    if (item) {
      setEducationForm({
        id: item.id,
        tipo: item.tipo,
        titolo: item.titolo,
        istituto: item.istituto ?? '',
        anno: item.anno != null ? String(item.anno) : '',
        documento_url: item.documento_url ?? '',
      })
    } else {
      setEducationForm({
        id: null,
        tipo: 'laurea',
        titolo: '',
        istituto: '',
        anno: '',
        documento_url: '',
      })
    }
    setShowEducationForm(true)
  }

  const closeEducationForm = () => {
    setShowEducationForm(false)
    setEducationForm({
      id: null,
      tipo: 'laurea',
      titolo: '',
      istituto: '',
      anno: '',
      documento_url: '',
    })
  }

  const handleSaveEducation = async () => {
    if (!profileId) return
    if (!educationForm.titolo.trim()) {
      notify('Inserisci il titolo', 'warning', 'Attenzione')
      return
    }
    setEducationSaving(true)
    try {
      if (educationForm.id) {
        const { error } = await supabase
          .from('trainer_education')
          .update({
            tipo: educationForm.tipo.trim() || 'laurea',
            titolo: educationForm.titolo.trim(),
            istituto: educationForm.istituto.trim() || null,
            anno: educationForm.anno === '' ? null : parseInt(educationForm.anno, 10),
            documento_url: educationForm.documento_url.trim() || null,
          })
          .eq('id', educationForm.id)
        if (error) throw error
        notify('Formazione aggiornata', 'success', 'Salvato')
      } else {
        const { error } = await supabase.from('trainer_education').insert({
          profile_id: profileId,
          tipo: educationForm.tipo.trim() || 'laurea',
          titolo: educationForm.titolo.trim(),
          istituto: educationForm.istituto.trim() || null,
          anno: educationForm.anno === '' ? null : parseInt(educationForm.anno, 10),
          documento_url: educationForm.documento_url.trim() || null,
        })
        if (error) throw error
        notify('Formazione aggiunta', 'success', 'Salvato')
      }
      await refetch()
      closeEducationForm()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore salvataggio formazione', 'error', 'Errore')
    } finally {
      setEducationSaving(false)
    }
  }

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Eliminare questo titolo di formazione?')) return
    try {
      const { error } = await supabase.from('trainer_education').delete().eq('id', id)
      if (error) throw error
      notify('Formazione rimossa', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore eliminazione', 'error', 'Errore')
    }
  }

  const openCertificationsForm = (item?: (typeof certifications)[0]) => {
    if (item) {
      setCertificationsForm({
        id: item.id,
        nome: item.nome,
        ente: item.ente ?? '',
        anno: item.anno != null ? String(item.anno) : '',
        numero_certificato: item.numero_certificato ?? '',
        stato: item.stato,
        file_url: item.file_url ?? '',
      })
    } else {
      setCertificationsForm({
        id: null,
        nome: '',
        ente: '',
        anno: '',
        numero_certificato: '',
        stato: 'attivo',
        file_url: '',
      })
    }
    setShowCertificationsForm(true)
  }

  const closeCertificationsForm = () => {
    setShowCertificationsForm(false)
    setCertificationsForm({
      id: null,
      nome: '',
      ente: '',
      anno: '',
      numero_certificato: '',
      stato: 'attivo',
      file_url: '',
    })
  }

  const handleSaveCertification = async () => {
    if (!profileId) return
    if (!certificationsForm.nome.trim()) {
      notify('Inserisci il nome della certificazione', 'warning', 'Attenzione')
      return
    }
    setCertificationsSaving(true)
    try {
      if (certificationsForm.id) {
        const { error } = await supabase
          .from('trainer_certifications')
          .update({
            nome: certificationsForm.nome.trim(),
            ente: certificationsForm.ente.trim() || null,
            anno: certificationsForm.anno === '' ? null : parseInt(certificationsForm.anno, 10),
            numero_certificato: certificationsForm.numero_certificato.trim() || null,
            stato: certificationsForm.stato,
            file_url: certificationsForm.file_url.trim() || null,
          })
          .eq('id', certificationsForm.id)
        if (error) throw error
        notify('Certificazione aggiornata', 'success', 'Salvato')
      } else {
        const { error } = await supabase.from('trainer_certifications').insert({
          profile_id: profileId,
          nome: certificationsForm.nome.trim(),
          ente: certificationsForm.ente.trim() || null,
          anno: certificationsForm.anno === '' ? null : parseInt(certificationsForm.anno, 10),
          numero_certificato: certificationsForm.numero_certificato.trim() || null,
          stato: certificationsForm.stato,
          file_url: certificationsForm.file_url.trim() || null,
        })
        if (error) throw error
        notify('Certificazione aggiunta', 'success', 'Salvato')
      }
      await refetch()
      closeCertificationsForm()
    } catch (e) {
      notify(
        e instanceof Error ? e.message : 'Errore salvataggio certificazione',
        'error',
        'Errore',
      )
    } finally {
      setCertificationsSaving(false)
    }
  }
  const handleCertFileUpload = async (file: File) => {
    setCertUploadError(null)
    setCertUploading(true)
    try {
      const { url } = await uploadTrainerCertificate(file)
      setCertificationsForm((p) => ({ ...p, file_url: url }))
      notify('File caricato. Salva la certificazione per confermare.', 'success', 'Upload')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload fallito'
      setCertUploadError(msg)
      notify(msg, 'error', 'Errore')
    } finally {
      setCertUploading(false)
    }
  }
  const handleEducationFileUpload = async (file: File) => {
    setEducationUploadError(null)
    setEducationUploading(true)
    try {
      const { url } = await uploadTrainerCertificate(file)
      setEducationForm((p) => ({ ...p, documento_url: url }))
      notify('File caricato. Salva la formazione per confermare.', 'success', 'Upload')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload fallito'
      setEducationUploadError(msg)
      notify(msg, 'error', 'Errore')
    } finally {
      setEducationUploading(false)
    }
  }
  const handleMediaVideoUpload = async (file: File) => {
    setMediaUploadError(null)
    setMediaVideoUploading(true)
    try {
      const { url } = await uploadTrainerMedia(file, 'video')
      setMediaState((p) => ({ ...p, url_video_presentazione: url }))
      notify('Video caricato. Salva media per confermare.', 'success', 'Upload')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload fallito'
      setMediaUploadError(msg)
      notify(msg, 'error', 'Errore')
    } finally {
      setMediaVideoUploading(false)
    }
  }
  const handleMediaGalleriaUpload = async (file: File) => {
    if ((media.galleria_urls ?? []).length >= GALLERIA_MAX) {
      notify(`Galleria: massimo ${GALLERIA_MAX} immagini.`, 'warning', 'Attenzione')
      return
    }
    setMediaUploadError(null)
    setMediaGalleriaUploading(true)
    try {
      const { url } = await uploadTrainerMedia(file, 'galleria')
      setMediaState((p) => ({ ...p, galleria_urls: [...(p.galleria_urls ?? []), url] }))
      notify('Immagine aggiunta. Salva media per confermare.', 'success', 'Upload')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload fallito'
      setMediaUploadError(msg)
      notify(msg, 'error', 'Errore')
    } finally {
      setMediaGalleriaUploading(false)
    }
  }

  const handleDeleteCertification = async (id: string) => {
    if (!confirm('Eliminare questa certificazione?')) return
    try {
      const { error } = await supabase.from('trainer_certifications').delete().eq('id', id)
      if (error) throw error
      notify('Certificazione rimossa', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore eliminazione', 'error', 'Errore')
    }
  }

  const openCoursesForm = (item?: (typeof courses)[0]) => {
    if (item) {
      setCoursesForm({
        id: item.id,
        nome: item.nome,
        durata_valore: item.durata_valore != null ? String(item.durata_valore) : '',
        durata_unita: item.durata_unita ?? 'ore',
        anno: item.anno != null ? String(item.anno) : '',
      })
    } else {
      setCoursesForm({ id: null, nome: '', durata_valore: '', durata_unita: 'ore', anno: '' })
    }
    setShowCoursesForm(true)
  }

  const closeCoursesForm = () => {
    setShowCoursesForm(false)
    setCoursesForm({ id: null, nome: '', durata_valore: '', durata_unita: 'ore', anno: '' })
  }

  const handleSaveCourse = async () => {
    if (!profileId) return
    if (!coursesForm.nome.trim()) {
      notify('Inserisci il nome del corso', 'warning', 'Attenzione')
      return
    }
    setCoursesSaving(true)
    try {
      const durataValore =
        coursesForm.durata_valore === '' ? null : parseInt(coursesForm.durata_valore, 10)
      if (coursesForm.id) {
        const { error } = await supabase
          .from('trainer_courses')
          .update({
            nome: coursesForm.nome.trim(),
            durata_valore: durataValore,
            durata_unita: coursesForm.durata_unita.trim() || null,
            anno: coursesForm.anno === '' ? null : parseInt(coursesForm.anno, 10),
          })
          .eq('id', coursesForm.id)
        if (error) throw error
        notify('Corso aggiornato', 'success', 'Salvato')
      } else {
        const { error } = await supabase.from('trainer_courses').insert({
          profile_id: profileId,
          nome: coursesForm.nome.trim(),
          durata_valore: durataValore,
          durata_unita: coursesForm.durata_unita.trim() || null,
          anno: coursesForm.anno === '' ? null : parseInt(coursesForm.anno, 10),
        })
        if (error) throw error
        notify('Corso aggiunto', 'success', 'Salvato')
      }
      await refetch()
      closeCoursesForm()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore salvataggio corso', 'error', 'Errore')
    } finally {
      setCoursesSaving(false)
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Eliminare questo corso?')) return
    try {
      const { error } = await supabase.from('trainer_courses').delete().eq('id', id)
      if (error) throw error
      notify('Corso rimosso', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore eliminazione', 'error', 'Errore')
    }
  }

  // --- Blocco 6: Specializzazioni ---
  const openSpecializationsForm = (item?: (typeof specializations)[0]) => {
    if (item) {
      setSpecializationsForm({
        id: item.id,
        nome: item.nome,
        livello: item.livello ?? 'base',
        anni_esperienza: item.anni_esperienza != null ? String(item.anni_esperienza) : '',
      })
    } else {
      setSpecializationsForm({ id: null, nome: '', livello: 'base', anni_esperienza: '' })
    }
    setShowSpecializationsForm(true)
  }
  const closeSpecializationsForm = () => {
    setShowSpecializationsForm(false)
    setSpecializationsForm({ id: null, nome: '', livello: 'base', anni_esperienza: '' })
  }
  const handleSaveSpecialization = async () => {
    if (!profileId || !specializationsForm.nome.trim()) {
      notify('Inserisci il nome', 'warning', 'Attenzione')
      return
    }
    setSpecializationsSaving(true)
    try {
      const payload = {
        nome: specializationsForm.nome.trim(),
        livello: (specializationsForm.livello as 'base' | 'avanzato' | 'expert') || null,
        anni_esperienza:
          specializationsForm.anni_esperienza === ''
            ? null
            : parseInt(specializationsForm.anni_esperienza, 10),
      }
      if (specializationsForm.id) {
        const { error } = await supabase
          .from('trainer_specializations')
          .update(payload)
          .eq('id', specializationsForm.id)
        if (error) throw error
        notify('Specializzazione aggiornata', 'success', 'Salvato')
      } else {
        const { error } = await supabase
          .from('trainer_specializations')
          .insert({ profile_id: profileId, ...payload })
        if (error) throw error
        notify('Specializzazione aggiunta', 'success', 'Salvato')
      }
      await refetch()
      closeSpecializationsForm()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setSpecializationsSaving(false)
    }
  }
  const handleDeleteSpecialization = async (id: string) => {
    if (!confirm('Eliminare?')) return
    try {
      const { error } = await supabase.from('trainer_specializations').delete().eq('id', id)
      if (error) throw error
      notify('Rimossa', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    }
  }

  // --- Blocco 7: Esperienza ---
  const openExperienceForm = (item?: (typeof experience)[0]) => {
    if (item) {
      setExperienceForm({
        id: item.id,
        nome_struttura: item.nome_struttura,
        ruolo: item.ruolo ?? '',
        data_inizio: item.data_inizio ?? '',
        data_fine: item.data_fine ?? '',
        collaborazioni: item.collaborazioni ?? '',
        atleti_seguiti: item.atleti_seguiti != null ? String(item.atleti_seguiti) : '',
      })
    } else {
      setExperienceForm({
        id: null,
        nome_struttura: '',
        ruolo: '',
        data_inizio: '',
        data_fine: '',
        collaborazioni: '',
        atleti_seguiti: '',
      })
    }
    setShowExperienceForm(true)
  }
  const closeExperienceForm = () => {
    setShowExperienceForm(false)
    setExperienceForm({
      id: null,
      nome_struttura: '',
      ruolo: '',
      data_inizio: '',
      data_fine: '',
      collaborazioni: '',
      atleti_seguiti: '',
    })
  }
  const handleSaveExperience = async () => {
    if (!profileId || !experienceForm.nome_struttura.trim() || !experienceForm.data_inizio) {
      notify('Compila struttura e data inizio', 'warning', 'Attenzione')
      return
    }
    setExperienceSaving(true)
    try {
      const payload = {
        nome_struttura: experienceForm.nome_struttura.trim(),
        ruolo: experienceForm.ruolo.trim() || null,
        data_inizio: experienceForm.data_inizio,
        data_fine: experienceForm.data_fine || null,
        collaborazioni: experienceForm.collaborazioni.trim() || null,
        atleti_seguiti:
          experienceForm.atleti_seguiti === '' ? null : parseInt(experienceForm.atleti_seguiti, 10),
      }
      if (experienceForm.id) {
        const { error } = await supabase
          .from('trainer_experience')
          .update(payload)
          .eq('id', experienceForm.id)
        if (error) throw error
        notify('Esperienza aggiornata', 'success', 'Salvato')
      } else {
        const { error } = await supabase
          .from('trainer_experience')
          .insert({ profile_id: profileId, ...payload })
        if (error) throw error
        notify('Esperienza aggiunta', 'success', 'Salvato')
      }
      await refetch()
      closeExperienceForm()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setExperienceSaving(false)
    }
  }
  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Eliminare?')) return
    try {
      const { error } = await supabase.from('trainer_experience').delete().eq('id', id)
      if (error) throw error
      notify('Rimossa', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    }
  }

  // --- Blocco 10: Testimonianze ---
  const openTestimonialsForm = (item?: (typeof testimonials)[0]) => {
    if (item) {
      setTestimonialsForm({
        id: item.id,
        nome_cliente: item.nome_cliente ?? '',
        eta: item.eta != null ? String(item.eta) : '',
        obiettivo: item.obiettivo ?? '',
        durata_percorso: item.durata_percorso ?? '',
        risultato: item.risultato ?? '',
        feedback: item.feedback,
        valutazione: item.valutazione != null ? String(item.valutazione) : '',
      })
    } else {
      setTestimonialsForm({
        id: null,
        nome_cliente: '',
        eta: '',
        obiettivo: '',
        durata_percorso: '',
        risultato: '',
        feedback: '',
        valutazione: '',
      })
    }
    setShowTestimonialsForm(true)
  }
  const closeTestimonialsForm = () => {
    setShowTestimonialsForm(false)
    setTestimonialsForm({
      id: null,
      nome_cliente: '',
      eta: '',
      obiettivo: '',
      durata_percorso: '',
      risultato: '',
      feedback: '',
      valutazione: '',
    })
  }
  const handleSaveTestimonial = async () => {
    if (!profileId || !testimonialsForm.feedback.trim()) {
      notify('Inserisci il feedback', 'warning', 'Attenzione')
      return
    }
    setTestimonialsSaving(true)
    try {
      const payload = {
        nome_cliente: testimonialsForm.nome_cliente.trim() || null,
        eta: testimonialsForm.eta === '' ? null : parseInt(testimonialsForm.eta, 10),
        obiettivo: testimonialsForm.obiettivo.trim() || null,
        durata_percorso: testimonialsForm.durata_percorso.trim() || null,
        risultato: testimonialsForm.risultato.trim() || null,
        feedback: testimonialsForm.feedback.trim(),
        valutazione:
          testimonialsForm.valutazione === ''
            ? null
            : Math.min(5, Math.max(1, parseInt(testimonialsForm.valutazione, 10) || 0)),
      }
      if (testimonialsForm.id) {
        const { error } = await supabase
          .from('trainer_testimonials')
          .update(payload)
          .eq('id', testimonialsForm.id)
        if (error) throw error
        notify('Testimonianza aggiornata', 'success', 'Salvato')
      } else {
        const { error } = await supabase
          .from('trainer_testimonials')
          .insert({ profile_id: profileId, ...payload })
        if (error) throw error
        notify('Testimonianza aggiunta', 'success', 'Salvato')
      }
      await refetch()
      closeTestimonialsForm()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setTestimonialsSaving(false)
    }
  }
  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Eliminare?')) return
    try {
      const { error } = await supabase.from('trainer_testimonials').delete().eq('id', id)
      if (error) throw error
      notify('Rimossa', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    }
  }

  // --- Blocco 11: Trasformazioni ---
  const openTransformationsForm = (item?: (typeof transformations)[0]) => {
    if (item) {
      setTransformationsForm({
        id: item.id,
        prima_dopo_urls:
          typeof item.prima_dopo_urls === 'object' && item.prima_dopo_urls
            ? JSON.stringify(item.prima_dopo_urls, null, 2)
            : '',
        durata_settimane: item.durata_settimane != null ? String(item.durata_settimane) : '',
        obiettivo: item.obiettivo ?? '',
        risultato: item.risultato ?? '',
        verificato: item.verificato ?? false,
        consenso: item.consenso ?? false,
      })
    } else {
      setTransformationsForm({
        id: null,
        prima_dopo_urls: '',
        durata_settimane: '',
        obiettivo: '',
        risultato: '',
        verificato: false,
        consenso: false,
      })
    }
    setShowTransformationsForm(true)
  }
  const closeTransformationsForm = () => {
    setShowTransformationsForm(false)
    setTransformationsForm({
      id: null,
      prima_dopo_urls: '',
      durata_settimane: '',
      obiettivo: '',
      risultato: '',
      verificato: false,
      consenso: false,
    })
  }
  const handleSaveTransformation = async () => {
    if (!profileId) return
    setTransformationsSaving(true)
    try {
      let urls: Record<string, unknown> | null = null
      if (transformationsForm.prima_dopo_urls.trim()) {
        try {
          urls = JSON.parse(transformationsForm.prima_dopo_urls.trim()) as Record<string, unknown>
        } catch {
          urls = { urls: transformationsForm.prima_dopo_urls.trim().split(/\s+/).filter(Boolean) }
        }
      }
      const payload = {
        prima_dopo_urls: urls,
        durata_settimane:
          transformationsForm.durata_settimane === ''
            ? null
            : parseInt(transformationsForm.durata_settimane, 10),
        obiettivo: transformationsForm.obiettivo.trim() || null,
        risultato: transformationsForm.risultato.trim() || null,
        verificato: transformationsForm.verificato,
        consenso: transformationsForm.consenso,
      }
      type Json = import('@/lib/supabase/types').Json
      const payloadJson = { ...payload, prima_dopo_urls: (payload.prima_dopo_urls ?? null) as Json }
      if (transformationsForm.id) {
        const { error } = await supabase
          .from('trainer_transformations')
          .update(payloadJson)
          .eq('id', transformationsForm.id)
        if (error) throw error
        notify('Trasformazione aggiornata', 'success', 'Salvato')
      } else {
        const { error } = await supabase
          .from('trainer_transformations')
          .insert({ profile_id: profileId, ...payloadJson })
        if (error) throw error
        notify('Trasformazione aggiunta', 'success', 'Salvato')
      }
      await refetch()
      closeTransformationsForm()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setTransformationsSaving(false)
    }
  }
  const handleDeleteTransformation = async (id: string) => {
    if (!confirm('Eliminare?')) return
    try {
      const { error } = await supabase.from('trainer_transformations').delete().eq('id', id)
      if (error) throw error
      notify('Rimossa', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    }
  }
  const parsePrimaDopoUrls = (raw: string): Record<string, string> => {
    if (!raw.trim()) return {}
    try {
      const parsed = JSON.parse(raw.trim()) as Record<string, unknown>
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {
          prima: typeof parsed.prima === 'string' ? parsed.prima : '',
          dopo: typeof parsed.dopo === 'string' ? parsed.dopo : '',
        }
      }
    } catch {
      // ignore
    }
    return {}
  }
  const handleTransformazionePrimaUpload = async (file: File) => {
    setTransformazioneUploadError(null)
    setTransformazionePrimaUploading(true)
    try {
      const { url } = await uploadTrainerMedia(file, 'galleria')
      const current = parsePrimaDopoUrls(transformationsForm.prima_dopo_urls)
      const next = { ...current, prima: url }
      setTransformationsForm((p) => ({ ...p, prima_dopo_urls: JSON.stringify(next, null, 2) }))
      notify(
        'Immagine "prima" caricata. Salva la trasformazione per confermare.',
        'success',
        'Upload',
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload fallito'
      setTransformazioneUploadError(msg)
      notify(msg, 'error', 'Errore')
    } finally {
      setTransformazionePrimaUploading(false)
    }
  }
  const handleTransformazioneDopoUpload = async (file: File) => {
    setTransformazioneUploadError(null)
    setTransformazioneDopoUploading(true)
    try {
      const { url } = await uploadTrainerMedia(file, 'galleria')
      const current = parsePrimaDopoUrls(transformationsForm.prima_dopo_urls)
      const next = { ...current, dopo: url }
      setTransformationsForm((p) => ({ ...p, prima_dopo_urls: JSON.stringify(next, null, 2) }))
      notify(
        'Immagine "dopo" caricata. Salva la trasformazione per confermare.',
        'success',
        'Upload',
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload fallito'
      setTransformazioneUploadError(msg)
      notify(msg, 'error', 'Errore')
    } finally {
      setTransformazioneDopoUploading(false)
    }
  }

  // --- Blocco 8: Metodo ---
  const handleSaveMetodo = async () => {
    setMetodoSaving(true)
    try {
      const { error } = await updateProfile({
        valutazione_iniziale: metodo.valutazione_iniziale,
        test_funzionali: metodo.test_funzionali,
        analisi_postura: metodo.analisi_postura,
        misurazioni_corporee: metodo.misurazioni_corporee.length
          ? metodo.misurazioni_corporee
          : null,
        periodizzazione: metodo.periodizzazione,
        check_settimanali: metodo.check_settimanali,
        report_progressi: metodo.report_progressi,
        uso_app: metodo.uso_app,
      })
      if (error) throw error
      notify('Metodo salvato', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setMetodoSaving(false)
    }
  }

  // --- Blocco 9: Risultati ---
  const handleSaveRisultati = async () => {
    setRisultatiSaving(true)
    try {
      const { error } = await updateProfile({
        clienti_seguiti:
          risultati.clienti_seguiti.trim() === '' ? null : Number(risultati.clienti_seguiti),
        pct_successo: risultati.pct_successo.trim() === '' ? null : Number(risultati.pct_successo),
        media_kg_persi:
          risultati.media_kg_persi.trim() === '' ? null : Number(risultati.media_kg_persi),
        media_aumento_forza: risultati.media_aumento_forza.trim() || null,
      })
      if (error) throw error
      notify('Risultati salvati', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setRisultatiSaving(false)
    }
  }

  // --- Blocco 12: Etica ---
  const handleSaveEtica = async () => {
    setEticaSaving(true)
    try {
      const { error } = await updateProfile({
        no_doping: etica.no_doping,
        no_diete_estreme: etica.no_diete_estreme,
        no_promesse_irrealistiche: etica.no_promesse_irrealistiche,
        focus_salute: etica.focus_salute,
        educazione_movimento: etica.educazione_movimento,
        privacy_garantita: etica.privacy_garantita,
      })
      if (error) throw error
      notify('Etica salvata', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setEticaSaving(false)
    }
  }

  // --- Blocco 13: Dati legali ---
  const handleSaveLegale = async () => {
    setLegaleSaving(true)
    try {
      const { error } = await updateProfile({
        partita_iva: legale.partita_iva.trim() || null,
        assicurazione: legale.assicurazione,
        assicurazione_url: legale.assicurazione_url.trim() || null,
        registro_professionale: legale.registro_professionale.trim() || null,
        consenso_immagini_clienti: legale.consenso_immagini_clienti,
        termini_accettati: legale.termini_accettati,
      })
      if (error) throw error
      notify('Dati legali salvati', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setLegaleSaving(false)
    }
  }

  // --- Strumenti (app, software, metodi) ---
  const handleSaveStrumenti = async () => {
    setStrumentiSaving(true)
    try {
      const { error } = await updateProfile({
        app_monitoraggio: strumenti.app_monitoraggio.trim() || null,
        software_programmazione: strumenti.software_programmazione.trim() || null,
        metodi_misurazione: strumenti.metodi_misurazione.length
          ? strumenti.metodi_misurazione
          : null,
      })
      if (error) throw error
      notify('Strumenti salvati', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setStrumentiSaving(false)
    }
  }

  // --- Media (video, galleria) ---
  const handleSaveMedia = async () => {
    setMediaSaving(true)
    try {
      const { error } = await updateProfile({
        url_video_presentazione: media.url_video_presentazione.trim() || null,
        galleria_urls: media.galleria_urls.length ? media.galleria_urls : null,
      })
      if (error) throw error
      notify('Media salvati', 'success', 'Salvato')
      await refetch()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Errore', 'error', 'Errore')
    } finally {
      setMediaSaving(false)
    }
  }

  useEffect(() => {
    if (trainerProfile) {
      setBioState({
        descrizione_breve: trainerProfile.descrizione_breve ?? '',
        descrizione_estesa: trainerProfile.descrizione_estesa ?? '',
        filosofia: trainerProfile.filosofia ?? '',
        perche_lavoro: trainerProfile.perche_lavoro ?? '',
        target_clienti: (trainerProfile.target_clienti ?? []).join('\n'),
      })
      setMetodoState({
        valutazione_iniziale: trainerProfile.valutazione_iniziale ?? false,
        test_funzionali: trainerProfile.test_funzionali ?? false,
        analisi_postura: trainerProfile.analisi_postura ?? false,
        misurazioni_corporee: trainerProfile.misurazioni_corporee ?? [],
        periodizzazione: trainerProfile.periodizzazione ?? false,
        check_settimanali: trainerProfile.check_settimanali ?? false,
        report_progressi: trainerProfile.report_progressi ?? false,
        uso_app: trainerProfile.uso_app ?? false,
      })
      setRisultatiState({
        clienti_seguiti:
          trainerProfile.clienti_seguiti != null ? String(trainerProfile.clienti_seguiti) : '',
        pct_successo:
          trainerProfile.pct_successo != null ? String(trainerProfile.pct_successo) : '',
        media_kg_persi:
          trainerProfile.media_kg_persi != null ? String(trainerProfile.media_kg_persi) : '',
        media_aumento_forza: trainerProfile.media_aumento_forza ?? '',
      })
      setEticaState({
        no_doping: trainerProfile.no_doping ?? false,
        no_diete_estreme: trainerProfile.no_diete_estreme ?? false,
        no_promesse_irrealistiche: trainerProfile.no_promesse_irrealistiche ?? false,
        focus_salute: trainerProfile.focus_salute ?? false,
        educazione_movimento: trainerProfile.educazione_movimento ?? false,
        privacy_garantita: trainerProfile.privacy_garantita ?? false,
      })
      setLegaleState({
        partita_iva: trainerProfile.partita_iva ?? '',
        assicurazione: trainerProfile.assicurazione ?? false,
        assicurazione_url: trainerProfile.assicurazione_url ?? '',
        registro_professionale: trainerProfile.registro_professionale ?? '',
        consenso_immagini_clienti: trainerProfile.consenso_immagini_clienti ?? false,
        termini_accettati: trainerProfile.termini_accettati ?? false,
      })
      setStrumentiState({
        app_monitoraggio: trainerProfile.app_monitoraggio ?? '',
        software_programmazione: trainerProfile.software_programmazione ?? '',
        metodi_misurazione: trainerProfile.metodi_misurazione ?? [],
      })
      setMediaState({
        url_video_presentazione: trainerProfile.url_video_presentazione ?? '',
        galleria_urls: trainerProfile.galleria_urls ?? [],
      })
    }
  }, [trainerProfile])

  if (profileError) {
    return (
      <Card variant="trainer" className="border-state-error/30">
        <CardContent className="pt-6">
          <p className="text-state-error">{profileError}</p>
        </CardContent>
      </Card>
    )
  }

  if (!profileId && !profileLoading) {
    return (
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary to-background-tertiary border-teal-500/20"
      >
        <CardContent className="pt-6">
          <p className="text-text-secondary text-center py-8">
            Il profilo professionale è disponibile solo per i trainer.
          </p>
        </CardContent>
      </Card>
    )
  }

  const setBio = (field: keyof typeof bio, value: string) => {
    setBioState((prev) => ({ ...prev, [field]: value }))
  }

  if (profileLoading && !trainerProfile) {
    return (
      <Card variant="trainer" className="border-teal-500/20">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-teal-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Blocco 1: Identità professionale (profiles) */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Briefcase className="h-5 w-5 text-teal-400 shrink-0" />
            Identità professionale
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Titolo, anni di esperienza e modalità di lavoro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          {identitaLoading ? (
            <div className="flex justify-center py-6">
              <RefreshCw className="h-6 w-6 animate-spin text-teal-400" />
            </div>
          ) : (
            <>
              <Input
                label="Titolo professionale"
                value={identita.titolo_professionale}
                onChange={(e) =>
                  setIdentita((p) => ({ ...p, titolo_professionale: e.target.value }))
                }
                placeholder="es. Personal Trainer, Preparatore atletico"
                maxLength={60}
                className="w-full"
              />
              <Input
                label="Anni di esperienza"
                type="number"
                min={0}
                max={60}
                value={identita.anni_esperienza === '' ? '' : identita.anni_esperienza}
                onChange={(e) => {
                  const v = e.target.value
                  setIdentita((p) => ({ ...p, anni_esperienza: v === '' ? '' : Number(v) }))
                }}
                placeholder="0–60"
                className="w-full max-w-[120px]"
              />
              <div className="space-y-2">
                <label className="text-text-primary text-sm font-medium">Modalità di lavoro</label>
                <div className="flex flex-wrap gap-4">
                  {MODALITA_OPTS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={identita.modalita_lavoro.includes(opt.value)}
                        onChange={() => toggleModalita(opt.value)}
                      />
                      <span className="text-sm text-text-secondary">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="max-w-[200px]">
                <Select
                  label="Stato profilo"
                  value={identita.stato_profilo}
                  onValueChange={(v) => setIdentita((p) => ({ ...p, stato_profilo: v }))}
                >
                  {STATO_PROFILO_OPTS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex justify-end pt-4 border-t border-teal-500/10">
                <Button
                  onClick={handleSaveIdentita}
                  disabled={identitaSaving}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 min-w-[140px]"
                >
                  {identitaSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salva identità
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </div>

      {/* Blocco 2: Bio e presentazione (trainer_profiles) */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <FileText className="h-5 w-5 text-teal-400 shrink-0" />
            Bio e presentazione
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Descrizione, filosofia e target clienti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <Input
            label="Descrizione breve (max 300 caratteri)"
            value={bio.descrizione_breve}
            onChange={(e) => setBio('descrizione_breve', e.target.value)}
            placeholder="Una frase che ti presenta ai clienti"
            maxLength={300}
            className="w-full"
          />
          <Textarea
            label="Descrizione estesa"
            value={bio.descrizione_estesa}
            onChange={(e) => setBio('descrizione_estesa', e.target.value)}
            placeholder="Racconta il tuo percorso e il tuo approccio..."
            rows={4}
            className="w-full"
          />
          <Textarea
            label="La mia filosofia"
            value={bio.filosofia}
            onChange={(e) => setBio('filosofia', e.target.value)}
            placeholder="Cosa guida il tuo lavoro con i clienti?"
            rows={3}
            className="w-full"
          />
          <Textarea
            label="Perché faccio questo lavoro"
            value={bio.perche_lavoro}
            onChange={(e) => setBio('perche_lavoro', e.target.value)}
            placeholder="Motivazioni e obiettivi"
            rows={2}
            className="w-full"
          />
          <Textarea
            label="Target clienti (uno per riga)"
            value={bio.target_clienti}
            onChange={(e) => setBio('target_clienti', e.target.value)}
            placeholder="Principianti&#10;Sportivi over 40&#10;Post-riabilitazione"
            rows={3}
            className="w-full"
          />
          <div className="flex justify-end pt-4 border-t border-teal-500/10">
            <Button
              onClick={handleSaveBio}
              disabled={bioSaving}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 min-w-[140px]"
            >
              {bioSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salva bio
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </div>

      {/* Blocco 3: Formazione (trainer_education) */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <GraduationCap className="h-5 w-5 text-teal-400 shrink-0" />
            Formazione
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Lauree, diplomi, master e altri titoli
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          {education.length > 0 && (
            <ul className="space-y-2">
              {education.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-teal-500/10 bg-background-secondary/50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-text-primary">{item.titolo}</span>
                    <span className="text-text-tertiary text-sm ml-2">({item.tipo})</span>
                    {(item.istituto || item.anno) && (
                      <p className="text-text-tertiary text-sm mt-0.5">
                        {[item.istituto, item.anno != null ? String(item.anno) : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-text-tertiary hover:text-teal-400"
                      onClick={() => openEducationForm(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-text-tertiary hover:text-state-error"
                      onClick={() => handleDeleteEducation(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showEducationForm ? (
            <div className="rounded-lg border border-teal-500/20 bg-background-tertiary/50 p-4 space-y-3">
              <Input
                label="Tipo"
                value={educationForm.tipo}
                onChange={(e) => setEducationForm((p) => ({ ...p, tipo: e.target.value }))}
                placeholder="laurea, diploma, master..."
                className="w-full"
              />
              <Input
                label="Titolo"
                value={educationForm.titolo}
                onChange={(e) => setEducationForm((p) => ({ ...p, titolo: e.target.value }))}
                placeholder="es. Scienze motorie"
                className="w-full"
              />
              <Input
                label="Istituto"
                value={educationForm.istituto}
                onChange={(e) => setEducationForm((p) => ({ ...p, istituto: e.target.value }))}
                placeholder="Università o ente"
                className="w-full"
              />
              <Input
                label="Anno"
                type="number"
                value={educationForm.anno}
                onChange={(e) => setEducationForm((p) => ({ ...p, anno: e.target.value }))}
                placeholder="es. 2015"
                className="w-full max-w-[100px]"
              />
              <input
                type="file"
                ref={educationFileInputRef}
                accept=".pdf,image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleEducationFileUpload(f)
                  e.target.value = ''
                }}
              />
              <div className="space-y-1">
                <Input
                  label="URL documento (opzionale)"
                  value={educationForm.documento_url}
                  onChange={(e) =>
                    setEducationForm((p) => ({ ...p, documento_url: e.target.value }))
                  }
                  placeholder="https://... o carica file sotto"
                  className="w-full"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={educationUploading}
                    onClick={() => educationFileInputRef.current?.click()}
                  >
                    {educationUploading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <FileText className="h-4 w-4 mr-1" />
                    )}
                    Carica file
                  </Button>
                  {educationUploadError && (
                    <span className="text-state-error text-sm">{educationUploadError}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveEducation}
                  disabled={educationSaving}
                  className="bg-teal-500/90 hover:bg-teal-500 text-white"
                >
                  {educationSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {educationForm.id ? 'Aggiorna' : 'Aggiungi'}
                </Button>
                <Button variant="outline" onClick={closeEducationForm} disabled={educationSaving}>
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-white/10 text-primary hover:border-primary/20 hover:bg-white/[0.04]"
              onClick={() => openEducationForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi formazione
            </Button>
          )}
        </CardContent>
      </div>

      {/* Blocco 4: Certificazioni (trainer_certifications) */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Award className="h-5 w-5 text-teal-400 shrink-0" />
            Certificazioni
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Certificati e attestati professionali
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          {certifications.length > 0 && (
            <ul className="space-y-2">
              {certifications.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-teal-500/10 bg-background-secondary/50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-text-primary">{item.nome}</span>
                    <span className="text-text-tertiary text-sm ml-2 capitalize">
                      ({item.stato})
                    </span>
                    {(item.ente || item.anno) && (
                      <p className="text-text-tertiary text-sm mt-0.5">
                        {[item.ente, item.anno != null ? String(item.anno) : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-text-tertiary hover:text-teal-400"
                      onClick={() => openCertificationsForm(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-text-tertiary hover:text-state-error"
                      onClick={() => handleDeleteCertification(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showCertificationsForm ? (
            <div className="rounded-lg border border-teal-500/20 bg-background-tertiary/50 p-4 space-y-3">
              <Input
                label="Nome certificazione"
                value={certificationsForm.nome}
                onChange={(e) => setCertificationsForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder="es. NASM-CPT"
                className="w-full"
              />
              <Input
                label="Ente rilasciante"
                value={certificationsForm.ente}
                onChange={(e) => setCertificationsForm((p) => ({ ...p, ente: e.target.value }))}
                placeholder="es. NASM"
                className="w-full"
              />
              <Input
                label="Anno"
                type="number"
                value={certificationsForm.anno}
                onChange={(e) => setCertificationsForm((p) => ({ ...p, anno: e.target.value }))}
                placeholder="es. 2020"
                className="w-full max-w-[100px]"
              />
              <Input
                label="Numero certificato"
                value={certificationsForm.numero_certificato}
                onChange={(e) =>
                  setCertificationsForm((p) => ({ ...p, numero_certificato: e.target.value }))
                }
                placeholder="opzionale"
                className="w-full"
              />
              <div className="max-w-[200px]">
                <Select
                  label="Stato"
                  value={certificationsForm.stato}
                  onValueChange={(v) =>
                    setCertificationsForm((p) => ({
                      ...p,
                      stato: v as 'attivo' | 'aggiornamento' | 'scaduto',
                    }))
                  }
                >
                  {CERT_STATO_OPTS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <input
                type="file"
                ref={certFileInputRef}
                accept=".pdf,image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleCertFileUpload(f)
                  e.target.value = ''
                }}
              />
              <div className="space-y-1">
                <Input
                  label="URL documento (opzionale)"
                  value={certificationsForm.file_url}
                  onChange={(e) =>
                    setCertificationsForm((p) => ({ ...p, file_url: e.target.value }))
                  }
                  placeholder="https://... o carica file sotto"
                  className="w-full"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={certUploading}
                    onClick={() => certFileInputRef.current?.click()}
                  >
                    {certUploading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <FileText className="h-4 w-4 mr-1" />
                    )}
                    Carica file
                  </Button>
                  {certUploadError && (
                    <span className="text-state-error text-sm">{certUploadError}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveCertification}
                  disabled={certificationsSaving}
                  className="bg-teal-500/90 hover:bg-teal-500 text-white"
                >
                  {certificationsSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {certificationsForm.id ? 'Aggiorna' : 'Aggiungi'}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeCertificationsForm}
                  disabled={certificationsSaving}
                >
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-white/10 text-primary hover:border-primary/20 hover:bg-white/[0.04]"
              onClick={() => openCertificationsForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi certificazione
            </Button>
          )}
        </CardContent>
      </div>

      {/* Blocco 5: Corsi (trainer_courses) */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <BookOpen className="h-5 w-5 text-teal-400 shrink-0" />
            Corsi
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Corsi di formazione e aggiornamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          {courses.length > 0 && (
            <ul className="space-y-2">
              {courses.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-teal-500/10 bg-background-secondary/50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-text-primary">{item.nome}</span>
                    {(item.durata_valore != null || item.anno) && (
                      <p className="text-text-tertiary text-sm mt-0.5">
                        {[
                          item.durata_valore != null
                            ? `${item.durata_valore} ${item.durata_unita ?? 'ore'}`
                            : null,
                          item.anno != null ? String(item.anno) : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-text-tertiary hover:text-teal-400"
                      onClick={() => openCoursesForm(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-text-tertiary hover:text-state-error"
                      onClick={() => handleDeleteCourse(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showCoursesForm ? (
            <div className="rounded-lg border border-teal-500/20 bg-background-tertiary/50 p-4 space-y-3">
              <Input
                label="Nome corso"
                value={coursesForm.nome}
                onChange={(e) => setCoursesForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder="es. Functional Movement Screen"
                className="w-full"
              />
              <div className="flex flex-wrap gap-3">
                <Input
                  label="Durata (valore)"
                  type="number"
                  value={coursesForm.durata_valore}
                  onChange={(e) => setCoursesForm((p) => ({ ...p, durata_valore: e.target.value }))}
                  placeholder="es. 16"
                  className="w-full max-w-[100px]"
                />
                <div className="max-w-[120px]">
                  <Select
                    label="Unità"
                    value={coursesForm.durata_unita}
                    onValueChange={(v) => setCoursesForm((p) => ({ ...p, durata_unita: v }))}
                  >
                    <option value="ore">ore</option>
                    <option value="mesi">mesi</option>
                  </Select>
                </div>
                <Input
                  label="Anno"
                  type="number"
                  value={coursesForm.anno}
                  onChange={(e) => setCoursesForm((p) => ({ ...p, anno: e.target.value }))}
                  placeholder="es. 2023"
                  className="w-full max-w-[100px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveCourse}
                  disabled={coursesSaving}
                  className="bg-teal-500/90 hover:bg-teal-500 text-white"
                >
                  {coursesSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {coursesForm.id ? 'Aggiorna' : 'Aggiungi'}
                </Button>
                <Button variant="outline" onClick={closeCoursesForm} disabled={coursesSaving}>
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-white/10 text-primary hover:border-primary/20 hover:bg-white/[0.04]"
              onClick={() => openCoursesForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi corso
            </Button>
          )}
        </CardContent>
      </div>

      {/* Blocco 6: Specializzazioni */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Target className="h-5 w-5 text-teal-400 shrink-0" />
            Specializzazioni
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Aree di competenza e livello
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          {specializations.length > 0 && (
            <ul className="space-y-2">
              {specializations.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-teal-500/10 bg-background-secondary/50 px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-text-primary">{item.nome}</span>
                    <span className="text-text-tertiary text-sm ml-2 capitalize">
                      ({item.livello ?? '-'})
                    </span>
                    {item.anni_esperienza != null && (
                      <p className="text-text-tertiary text-sm mt-0.5">
                        {item.anni_esperienza} anni
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openSpecializationsForm(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-state-error hover:text-state-error"
                      onClick={() => handleDeleteSpecialization(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showSpecializationsForm ? (
            <div className="rounded-lg border border-teal-500/20 bg-background-tertiary/50 p-4 space-y-3">
              <Input
                label="Nome"
                value={specializationsForm.nome}
                onChange={(e) => setSpecializationsForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder="es. Functional training"
                className="w-full"
              />
              <div className="max-w-[180px]">
                <Select
                  label="Livello"
                  value={specializationsForm.livello}
                  onValueChange={(v) => setSpecializationsForm((p) => ({ ...p, livello: v }))}
                >
                  {LIVELLO_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Input
                label="Anni esperienza"
                type="number"
                value={specializationsForm.anni_esperienza}
                onChange={(e) =>
                  setSpecializationsForm((p) => ({ ...p, anni_esperienza: e.target.value }))
                }
                placeholder="opzionale"
                className="w-full max-w-[120px]"
              />
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveSpecialization}
                  disabled={specializationsSaving}
                  className="bg-teal-500/90 hover:bg-teal-500 text-white"
                >
                  {specializationsSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {specializationsForm.id ? 'Aggiorna' : 'Aggiungi'}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeSpecializationsForm}
                  disabled={specializationsSaving}
                >
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-white/10 text-primary hover:border-primary/20 hover:bg-white/[0.04]"
              onClick={() => openSpecializationsForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi specializzazione
            </Button>
          )}
        </CardContent>
      </div>

      {/* Blocco 7: Esperienza lavorativa */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Building2 className="h-5 w-5 text-teal-400 shrink-0" />
            Esperienza lavorativa
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Strutture e ruoli
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          {experience.length > 0 && (
            <ul className="space-y-2">
              {experience.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-teal-500/10 bg-background-secondary/50 px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-text-primary">{item.nome_struttura}</span>
                    {(item.ruolo || item.data_inizio) && (
                      <p className="text-text-tertiary text-sm mt-0.5">
                        {[item.ruolo, item.data_inizio, item.data_fine].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openExperienceForm(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-state-error hover:text-state-error"
                      onClick={() => handleDeleteExperience(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showExperienceForm ? (
            <div className="rounded-lg border border-teal-500/20 bg-background-tertiary/50 p-4 space-y-3">
              <Input
                label="Nome struttura"
                value={experienceForm.nome_struttura}
                onChange={(e) =>
                  setExperienceForm((p) => ({ ...p, nome_struttura: e.target.value }))
                }
                placeholder="es. Palestra XYZ"
                className="w-full"
              />
              <Input
                label="Ruolo"
                value={experienceForm.ruolo}
                onChange={(e) => setExperienceForm((p) => ({ ...p, ruolo: e.target.value }))}
                placeholder="es. Personal trainer"
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Data inizio"
                  type="date"
                  value={experienceForm.data_inizio}
                  onChange={(e) =>
                    setExperienceForm((p) => ({ ...p, data_inizio: e.target.value }))
                  }
                  className="w-full"
                />
                <Input
                  label="Data fine"
                  type="date"
                  value={experienceForm.data_fine}
                  onChange={(e) => setExperienceForm((p) => ({ ...p, data_fine: e.target.value }))}
                  className="w-full"
                />
              </div>
              <Textarea
                label="Collaborazioni"
                value={experienceForm.collaborazioni}
                onChange={(e) =>
                  setExperienceForm((p) => ({ ...p, collaborazioni: e.target.value }))
                }
                rows={2}
                className="w-full"
              />
              <Input
                label="Atleti seguiti"
                type="number"
                value={experienceForm.atleti_seguiti}
                onChange={(e) =>
                  setExperienceForm((p) => ({ ...p, atleti_seguiti: e.target.value }))
                }
                placeholder="opzionale"
                className="w-full max-w-[120px]"
              />
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveExperience}
                  disabled={experienceSaving}
                  className="bg-teal-500/90 hover:bg-teal-500 text-white"
                >
                  {experienceSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {experienceForm.id ? 'Aggiorna' : 'Aggiungi'}
                </Button>
                <Button variant="outline" onClick={closeExperienceForm} disabled={experienceSaving}>
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-white/10 text-primary hover:border-primary/20 hover:bg-white/[0.04]"
              onClick={() => openExperienceForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi esperienza
            </Button>
          )}
        </CardContent>
      </div>

      {/* Blocco 8: Metodo di lavoro */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <ClipboardList className="h-5 w-5 text-teal-400 shrink-0" />
            Metodo di lavoro
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Valutazioni, periodizzazione, report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <div className="flex flex-wrap gap-6">
            {[
              { key: 'valutazione_iniziale' as const, label: 'Valutazione iniziale' },
              { key: 'test_funzionali' as const, label: 'Test funzionali' },
              { key: 'analisi_postura' as const, label: 'Analisi postura' },
              { key: 'periodizzazione' as const, label: 'Periodizzazione' },
              { key: 'check_settimanali' as const, label: 'Check settimanali' },
              { key: 'report_progressi' as const, label: 'Report progressi' },
              { key: 'uso_app' as const, label: 'Uso app' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={metodo[key]}
                  onChange={() => setMetodoState((p) => ({ ...p, [key]: !p[key] }))}
                />
                <span className="text-sm text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
          <Input
            label="Misurazioni corporee (separate da virgola)"
            value={(metodo.misurazioni_corporee ?? []).join(', ')}
            onChange={(e) =>
              setMetodoState((p) => ({
                ...p,
                misurazioni_corporee: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="es. plicometria, circonferenze"
            className="w-full"
          />
          <div className="flex justify-end pt-4 border-t border-teal-500/10">
            <Button
              onClick={handleSaveMetodo}
              disabled={metodoSaving}
              className="bg-teal-500/90 hover:bg-teal-500 text-white min-w-[120px]"
            >
              {metodoSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva metodo
            </Button>
          </div>
        </CardContent>
      </div>

      {/* Blocco 9: Risultati e statistiche */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <BarChart3 className="h-5 w-5 text-teal-400 shrink-0" />
            Risultati e statistiche
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Dati aggregati (opzionale)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Clienti seguiti"
              type="number"
              value={risultati.clienti_seguiti}
              onChange={(e) =>
                setRisultatiState((p) => ({ ...p, clienti_seguiti: e.target.value }))
              }
              placeholder="n."
              className="w-full"
            />
            <Input
              label="% successo"
              type="number"
              value={risultati.pct_successo}
              onChange={(e) => setRisultatiState((p) => ({ ...p, pct_successo: e.target.value }))}
              placeholder="es. 85"
              className="w-full"
            />
            <Input
              label="Media kg persi"
              type="number"
              value={risultati.media_kg_persi}
              onChange={(e) => setRisultatiState((p) => ({ ...p, media_kg_persi: e.target.value }))}
              placeholder="es. 5.2"
              className="w-full"
            />
            <Input
              label="Media aumento forza"
              value={risultati.media_aumento_forza}
              onChange={(e) =>
                setRisultatiState((p) => ({ ...p, media_aumento_forza: e.target.value }))
              }
              placeholder="es. +15% 1RM"
              className="w-full"
            />
          </div>
          <div className="flex justify-end pt-4 border-t border-teal-500/10">
            <Button
              onClick={handleSaveRisultati}
              disabled={risultatiSaving}
              className="bg-teal-500/90 hover:bg-teal-500 text-white min-w-[120px]"
            >
              {risultatiSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva risultati
            </Button>
          </div>
        </CardContent>
      </div>

      {/* Blocco 10: Testimonianze */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Quote className="h-5 w-5 text-teal-400 shrink-0" />
            Testimonianze
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Feedback e recensioni clienti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          {testimonials.length > 0 && (
            <ul className="space-y-2">
              {testimonials.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-teal-500/10 bg-background-secondary/50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-text-primary">
                      {item.nome_cliente || 'Anonimo'}
                    </span>
                    {item.valutazione != null && (
                      <span className="text-text-tertiary text-sm ml-2">★ {item.valutazione}</span>
                    )}
                    <p className="text-text-tertiary text-sm mt-0.5 line-clamp-2">
                      {item.feedback}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openTestimonialsForm(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-state-error hover:text-state-error"
                      onClick={() => handleDeleteTestimonial(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showTestimonialsForm ? (
            <div className="rounded-lg border border-teal-500/20 bg-background-tertiary/50 p-4 space-y-3">
              <Input
                label="Nome cliente"
                value={testimonialsForm.nome_cliente}
                onChange={(e) =>
                  setTestimonialsForm((p) => ({ ...p, nome_cliente: e.target.value }))
                }
                placeholder="opzionale"
                className="w-full"
              />
              <Input
                label="Età"
                type="number"
                value={testimonialsForm.eta}
                onChange={(e) => setTestimonialsForm((p) => ({ ...p, eta: e.target.value }))}
                className="w-full max-w-[80px]"
              />
              <Input
                label="Obiettivo"
                value={testimonialsForm.obiettivo}
                onChange={(e) => setTestimonialsForm((p) => ({ ...p, obiettivo: e.target.value }))}
                placeholder="opzionale"
                className="w-full"
              />
              <Input
                label="Durata percorso"
                value={testimonialsForm.durata_percorso}
                onChange={(e) =>
                  setTestimonialsForm((p) => ({ ...p, durata_percorso: e.target.value }))
                }
                placeholder="es. 6 mesi"
                className="w-full"
              />
              <Textarea
                label="Risultato"
                value={testimonialsForm.risultato}
                onChange={(e) => setTestimonialsForm((p) => ({ ...p, risultato: e.target.value }))}
                rows={2}
                className="w-full"
              />
              <Textarea
                label="Feedback *"
                value={testimonialsForm.feedback}
                onChange={(e) => setTestimonialsForm((p) => ({ ...p, feedback: e.target.value }))}
                rows={3}
                className="w-full"
                required
              />
              <Input
                label="Valutazione (1-5)"
                type="number"
                min={1}
                max={5}
                value={testimonialsForm.valutazione}
                onChange={(e) =>
                  setTestimonialsForm((p) => ({ ...p, valutazione: e.target.value }))
                }
                className="w-full max-w-[80px]"
              />
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveTestimonial}
                  disabled={testimonialsSaving}
                  className="bg-teal-500/90 hover:bg-teal-500 text-white"
                >
                  {testimonialsSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {testimonialsForm.id ? 'Aggiorna' : 'Aggiungi'}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeTestimonialsForm}
                  disabled={testimonialsSaving}
                >
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-white/10 text-primary hover:border-primary/20 hover:bg-white/[0.04]"
              onClick={() => openTestimonialsForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi testimonianza
            </Button>
          )}
        </CardContent>
      </div>

      {/* Blocco 11: Trasformazioni */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <ImageIcon className="h-5 w-5 text-teal-400 shrink-0" />
            Trasformazioni
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Prima/dopo (con consenso clienti)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          {transformations.length > 0 && (
            <ul className="space-y-2">
              {transformations.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-teal-500/10 bg-background-secondary/50 px-3 py-2"
                >
                  <div>
                    <span className="text-text-primary">{item.obiettivo || 'Trasformazione'}</span>
                    {item.durata_settimane != null && (
                      <span className="text-text-tertiary text-sm ml-2">
                        {item.durata_settimane} sett.
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openTransformationsForm(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-state-error hover:text-state-error"
                      onClick={() => handleDeleteTransformation(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showTransformationsForm ? (
            <div className="rounded-lg border border-teal-500/20 bg-background-tertiary/50 p-4 space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary">Immagini prima / dopo</p>
                <input
                  type="file"
                  ref={transformazionePrimaInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleTransformazionePrimaUpload(f)
                    e.target.value = ''
                  }}
                />
                <input
                  type="file"
                  ref={transformazioneDopoInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleTransformazioneDopoUpload(f)
                    e.target.value = ''
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-text-tertiary text-xs">Immagine prima</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={transformazionePrimaUploading}
                        onClick={() => transformazionePrimaInputRef.current?.click()}
                      >
                        {transformazionePrimaUploading ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <ImageIcon className="h-4 w-4 mr-1" />
                        )}
                        Carica prima
                      </Button>
                      {parsePrimaDopoUrls(transformationsForm.prima_dopo_urls).prima && (
                        <span className="text-state-valid text-xs">✓ caricata</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-text-tertiary text-xs">Immagine dopo</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={transformazioneDopoUploading}
                        onClick={() => transformazioneDopoInputRef.current?.click()}
                      >
                        {transformazioneDopoUploading ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <ImageIcon className="h-4 w-4 mr-1" />
                        )}
                        Carica dopo
                      </Button>
                      {parsePrimaDopoUrls(transformationsForm.prima_dopo_urls).dopo && (
                        <span className="text-state-valid text-xs">✓ caricata</span>
                      )}
                    </div>
                  </div>
                </div>
                {transformazioneUploadError && (
                  <p className="text-state-error text-sm">{transformazioneUploadError}</p>
                )}
                <Textarea
                  label="URL prima/dopo (modifica manuale, opzionale)"
                  value={transformationsForm.prima_dopo_urls}
                  onChange={(e) =>
                    setTransformationsForm((p) => ({ ...p, prima_dopo_urls: e.target.value }))
                  }
                  rows={2}
                  placeholder='{"prima":"url1","dopo":"url2"}'
                  className="w-full"
                />
              </div>
              <Input
                label="Durata (settimane)"
                type="number"
                value={transformationsForm.durata_settimane}
                onChange={(e) =>
                  setTransformationsForm((p) => ({ ...p, durata_settimane: e.target.value }))
                }
                className="w-full max-w-[120px]"
              />
              <Input
                label="Obiettivo"
                value={transformationsForm.obiettivo}
                onChange={(e) =>
                  setTransformationsForm((p) => ({ ...p, obiettivo: e.target.value }))
                }
                className="w-full"
              />
              <Textarea
                label="Risultato"
                value={transformationsForm.risultato}
                onChange={(e) =>
                  setTransformationsForm((p) => ({ ...p, risultato: e.target.value }))
                }
                rows={2}
                className="w-full"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={transformationsForm.verificato}
                  onChange={() =>
                    setTransformationsForm((p) => ({ ...p, verificato: !p.verificato }))
                  }
                />
                <span className="text-sm">Verificato</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={transformationsForm.consenso}
                  onChange={() => setTransformationsForm((p) => ({ ...p, consenso: !p.consenso }))}
                />
                <span className="text-sm">Consenso cliente</span>
              </label>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveTransformation}
                  disabled={transformationsSaving}
                  className="bg-teal-500/90 hover:bg-teal-500 text-white"
                >
                  {transformationsSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {transformationsForm.id ? 'Aggiorna' : 'Aggiungi'}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeTransformationsForm}
                  disabled={transformationsSaving}
                >
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-white/10 text-primary hover:border-primary/20 hover:bg-white/[0.04]"
              onClick={() => openTransformationsForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi trasformazione
            </Button>
          )}
        </CardContent>
      </div>

      {/* Blocco 12: Etica */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Scale className="h-5 w-5 text-teal-400 shrink-0" />
            Etica e valori
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Principi dichiarati
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <div className="flex flex-col gap-2">
            {[
              { key: 'no_doping' as const, label: 'No doping e sostanze' },
              { key: 'no_diete_estreme' as const, label: 'No diete estreme' },
              { key: 'no_promesse_irrealistiche' as const, label: 'No promesse irrealistiche' },
              { key: 'focus_salute' as const, label: 'Focus sulla salute' },
              { key: 'educazione_movimento' as const, label: 'Educazione al movimento' },
              { key: 'privacy_garantita' as const, label: 'Privacy garantita' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={etica[key]}
                  onChange={() => setEticaState((p) => ({ ...p, [key]: !p[key] }))}
                />
                <span className="text-sm text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-teal-500/10">
            <Button
              onClick={handleSaveEtica}
              disabled={eticaSaving}
              className="bg-teal-500/90 hover:bg-teal-500 text-white min-w-[120px]"
            >
              {eticaSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva etica
            </Button>
          </div>
        </CardContent>
      </div>

      {/* Blocco 13: Dati legali */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <FileCheck className="h-5 w-5 text-teal-400 shrink-0" />
            Dati legali
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            P.IVA, assicurazione, registro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <Input
            label="Partita IVA"
            value={legale.partita_iva}
            onChange={(e) => setLegaleState((p) => ({ ...p, partita_iva: e.target.value }))}
            placeholder="opzionale"
            className="w-full max-w-[200px]"
          />
          <Input
            label="Registro professionale"
            value={legale.registro_professionale}
            onChange={(e) =>
              setLegaleState((p) => ({ ...p, registro_professionale: e.target.value }))
            }
            placeholder="opzionale"
            className="w-full"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={legale.assicurazione}
              onChange={() => setLegaleState((p) => ({ ...p, assicurazione: !p.assicurazione }))}
            />
            <span className="text-sm">Assicurazione RC professionale</span>
          </label>
          {legale.assicurazione && (
            <Input
              label="URL documento assicurazione"
              value={legale.assicurazione_url}
              onChange={(e) => setLegaleState((p) => ({ ...p, assicurazione_url: e.target.value }))}
              placeholder="https://..."
              className="w-full"
            />
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={legale.consenso_immagini_clienti}
              onChange={() =>
                setLegaleState((p) => ({
                  ...p,
                  consenso_immagini_clienti: !p.consenso_immagini_clienti,
                }))
              }
            />
            <span className="text-sm">Consenso uso immagini clienti</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={legale.termini_accettati}
              onChange={() =>
                setLegaleState((p) => ({ ...p, termini_accettati: !p.termini_accettati }))
              }
            />
            <span className="text-sm">Termini e condizioni accettati</span>
          </label>
          <div className="flex justify-end pt-4 border-t border-teal-500/10">
            <Button
              onClick={handleSaveLegale}
              disabled={legaleSaving}
              className="bg-teal-500/90 hover:bg-teal-500 text-white min-w-[120px]"
            >
              {legaleSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva dati legali
            </Button>
          </div>
        </CardContent>
      </div>

      {/* Strumenti (app, software, metodi misurazione) */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Smartphone className="h-5 w-5 text-teal-400 shrink-0" />
            Strumenti
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            App monitoraggio, software programmazione
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <Input
            label="App monitoraggio"
            value={strumenti.app_monitoraggio}
            onChange={(e) => setStrumentiState((p) => ({ ...p, app_monitoraggio: e.target.value }))}
            placeholder="es. Strava, MyFitnessPal"
            className="w-full"
          />
          <Input
            label="Software programmazione"
            value={strumenti.software_programmazione}
            onChange={(e) =>
              setStrumentiState((p) => ({ ...p, software_programmazione: e.target.value }))
            }
            placeholder="es. Trainerize, TrueCoach"
            className="w-full"
          />
          <Input
            label="Metodi misurazione (separati da virgola)"
            value={(strumenti.metodi_misurazione ?? []).join(', ')}
            onChange={(e) =>
              setStrumentiState((p) => ({
                ...p,
                metodi_misurazione: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="es. plicometria, BIA, circonferenze"
            className="w-full"
          />
          <div className="flex justify-end pt-4 border-t border-teal-500/10">
            <Button
              onClick={handleSaveStrumenti}
              disabled={strumentiSaving}
              className="bg-teal-500/90 hover:bg-teal-500 text-white min-w-[120px]"
            >
              {strumentiSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva strumenti
            </Button>
          </div>
        </CardContent>
      </div>

      {/* Media (video presentazione, galleria) */}
      <div
        className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200"
      >
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Video className="h-5 w-5 text-teal-400 shrink-0" />
            Media
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Video presentazione e galleria immagini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <input
            type="file"
            ref={mediaVideoInputRef}
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleMediaVideoUpload(f)
              e.target.value = ''
            }}
          />
          <input
            type="file"
            ref={mediaGalleriaInputRef}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleMediaGalleriaUpload(f)
              e.target.value = ''
            }}
          />
          <div className="space-y-2">
            <Input
              label="URL video presentazione"
              value={media.url_video_presentazione}
              onChange={(e) =>
                setMediaState((p) => ({ ...p, url_video_presentazione: e.target.value }))
              }
              placeholder="https://... o carica video sotto"
              className="w-full"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={mediaVideoUploading}
              onClick={() => mediaVideoInputRef.current?.click()}
            >
              {mediaVideoUploading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Video className="h-4 w-4 mr-1" />
              )}
              Carica video (MP4/WebM, max 100 MB)
            </Button>
          </div>
          <div className="space-y-2">
            <Textarea
              label="URL galleria (uno per riga)"
              value={(media.galleria_urls ?? []).join('\n')}
              onChange={(e) =>
                setMediaState((p) => ({
                  ...p,
                  galleria_urls: e.target.value
                    .split(/\n/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              rows={3}
              placeholder="https://img1... o aggiungi immagini sotto"
              className="w-full"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  mediaGalleriaUploading || (media.galleria_urls ?? []).length >= GALLERIA_MAX
                }
                onClick={() => mediaGalleriaInputRef.current?.click()}
              >
                {mediaGalleriaUploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <ImageIcon className="h-4 w-4 mr-1" />
                )}
                Aggiungi alla galleria (max {GALLERIA_MAX})
              </Button>
              {(media.galleria_urls ?? []).length >= GALLERIA_MAX && (
                <span className="text-text-secondary text-sm">Galleria piena</span>
              )}
              {mediaUploadError && (
                <span className="text-state-error text-sm">{mediaUploadError}</span>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-teal-500/10">
            <Button
              onClick={handleSaveMedia}
              disabled={mediaSaving}
              className="bg-teal-500/90 hover:bg-teal-500 text-white min-w-[120px]"
            >
              {mediaSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva media
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
