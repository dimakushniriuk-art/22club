# Albero pagine App Router — 22Club

- **Fonte:** file `page.tsx` sotto `src/app/`
- **Ultimo aggiornamento:** 2026-04-03 (nota navigazione: `StaffLazyChunkFallback` + skeleton segmento dashboard)
- **Totale pagine:** 127

**Base URL (dev locale):** `http://localhost:3001` — allineato a `npm run dev` (`cross-env PORT=3001` in `package.json`). In produzione sostituire il dominio.

Le voci sono **path** dell’app. Segmenti dinamici nei link usano **segnaposti** da sostituire (`ATLETA_ID`, `PIANO_ID`, `GIORNO_ID`, `ESERCIZIO_ID`, `CAMPO_MISURA`, `PROFILO_ATLETA_ID`, …).

**Navigazione:** sui segmenti principali è definito un `loading.tsx` con skeleton (condivisi in `src/components/layout/route-loading-skeletons.tsx`, incluso `StaffLazyChunkFallback` per fallback `Suspense` su chunk lazy nelle pagine staff del blocco sezione 3). Tutto ciò che sta sotto `/dashboard/*` usa il segmento `dashboard`; sotto `/home/*` il segmento `home` (include le sottosezioni dell’albero).

---

## 1. Root, pubbliche e utilità

- [`/`](http://localhost:3001/) — `src/app/page.tsx`
- [`/privacy`](http://localhost:3001/privacy)
- [`/termini`](http://localhost:3001/termini)
- [`/design-system`](http://localhost:3001/design-system)
- [`/sentry-example-page`](http://localhost:3001/sentry-example-page) (esempio / debug)

---

## 2. Autenticazione e onboarding

- [`/login`](http://localhost:3001/login)
- [`/registrati`](http://localhost:3001/registrati)
- [`/forgot-password`](http://localhost:3001/forgot-password)
- [`/reset-password`](http://localhost:3001/reset-password)
- [`/post-login`](http://localhost:3001/post-login)
- [`/welcome`](http://localhost:3001/welcome)

---

## 3. Dashboard — staff / trainer (nucleo)

- [`/dashboard`](http://localhost:3001/dashboard)
- [`/dashboard/prenotazioni`](http://localhost:3001/dashboard/prenotazioni)
- [`/dashboard/prenotazioni/atleti/[id]`](http://localhost:3001/dashboard/prenotazioni/atleti/ATLETA_ID)
- [`/dashboard/workouts`](http://localhost:3001/dashboard/workouts)
- [`/dashboard/chat`](http://localhost:3001/dashboard/chat)
- [`/dashboard/schede`](http://localhost:3001/dashboard/schede)
- [`/dashboard/schede/nuova`](http://localhost:3001/dashboard/schede/nuova)
- [`/dashboard/schede/[id]/modifica`](http://localhost:3001/dashboard/schede/SCHEDA_ID/modifica)
- [`/dashboard/abbonamenti`](http://localhost:3001/dashboard/abbonamenti)
- [`/dashboard/comunicazioni`](http://localhost:3001/dashboard/comunicazioni)
- [`/dashboard/comunicazioni/template`](http://localhost:3001/dashboard/comunicazioni/template)
- [`/dashboard/database`](http://localhost:3001/dashboard/database)
- [`/dashboard/impostazioni`](http://localhost:3001/dashboard/impostazioni)
- [`/dashboard/calendario`](http://localhost:3001/dashboard/calendario)
- [`/dashboard/calendario/impostazioni`](http://localhost:3001/dashboard/calendario/impostazioni)
- [`/dashboard/clienti`](http://localhost:3001/dashboard/clienti)
- [`/dashboard/allenamenti`](http://localhost:3001/dashboard/allenamenti)
- [`/dashboard/esercizi`](http://localhost:3001/dashboard/esercizi)
- [`/dashboard/documenti`](http://localhost:3001/dashboard/documenti)
- [`/dashboard/appuntamenti`](http://localhost:3001/dashboard/appuntamenti)
- [`/dashboard/statistiche`](http://localhost:3001/dashboard/statistiche)
- [`/dashboard/pagamenti`](http://localhost:3001/dashboard/pagamenti)
- [`/dashboard/pagamenti/atleta/[athleteId]`](http://localhost:3001/dashboard/pagamenti/atleta/ATLETA_ID)
- [`/dashboard/invita-atleta`](http://localhost:3001/dashboard/invita-atleta)
- [`/dashboard/profilo`](http://localhost:3001/dashboard/profilo)

**Layout parallelo** (file `@slot1` / `@slot2`): URL utente = [`/dashboard/workouts`](http://localhost:3001/dashboard/workouts) (gli slot non cambiano il path).

---

## 4. Dashboard — atleta (vista staff)

- [`/dashboard/atleti/[id]`](http://localhost:3001/dashboard/atleti/ATLETA_ID)
- [`/dashboard/atleti/[id]/progressi`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi)
- [`/dashboard/atleti/[id]/progressi/allenamenti`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/allenamenti)
- [`/dashboard/atleti/[id]/progressi/allenamenti/[exerciseId]`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/allenamenti/ESERCIZIO_ID)
- [`/dashboard/atleti/[id]/progressi/misurazioni`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/misurazioni)
- [`/dashboard/atleti/[id]/progressi/misurazioni/[field]`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/misurazioni/CAMPO_MISURA)
- [`/dashboard/atleti/[id]/progressi/foto`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/foto)
- [`/dashboard/atleti/[id]/progressi/storico`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/storico)
- [`/dashboard/atleti/[id]/progressi/storico/schede`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/storico/schede)
- [`/dashboard/atleti/[id]/progressi/storico/appuntamenti`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/storico/appuntamenti)
- [`/dashboard/atleti/[id]/progressi/storico/sessioni-aperte`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/storico/sessioni-aperte)
- [`/dashboard/atleti/[id]/progressi/storico/completati`](http://localhost:3001/dashboard/atleti/ATLETA_ID/progressi/storico/completati)

---

## 5. Dashboard — nutrizionista

- [`/dashboard/nutrizionista`](http://localhost:3001/dashboard/nutrizionista)
- [`/dashboard/nutrizionista/atleti`](http://localhost:3001/dashboard/nutrizionista/atleti)
- [`/dashboard/nutrizionista/atleti/[id]`](http://localhost:3001/dashboard/nutrizionista/atleti/ATLETA_ID)
- [`/dashboard/nutrizionista/piani`](http://localhost:3001/dashboard/nutrizionista/piani)
- [`/dashboard/nutrizionista/piani/nuovo`](http://localhost:3001/dashboard/nutrizionista/piani/nuovo)
- [`/dashboard/nutrizionista/progressi`](http://localhost:3001/dashboard/nutrizionista/progressi)
- [`/dashboard/nutrizionista/analisi`](http://localhost:3001/dashboard/nutrizionista/analisi)
- [`/dashboard/nutrizionista/calendario`](http://localhost:3001/dashboard/nutrizionista/calendario)
- [`/dashboard/nutrizionista/chat`](http://localhost:3001/dashboard/nutrizionista/chat)
- [`/dashboard/nutrizionista/documenti`](http://localhost:3001/dashboard/nutrizionista/documenti)
- [`/dashboard/nutrizionista/abbonamenti`](http://localhost:3001/dashboard/nutrizionista/abbonamenti)
- [`/dashboard/nutrizionista/impostazioni`](http://localhost:3001/dashboard/nutrizionista/impostazioni)
- [`/dashboard/nutrizionista/checkin`](http://localhost:3001/dashboard/nutrizionista/checkin)
- [`/dashboard/nutrizionista/checkin/[id]`](http://localhost:3001/dashboard/nutrizionista/checkin/CHECKIN_ID)

---

## 6. Dashboard — massaggiatore

- [`/dashboard/massaggiatore`](http://localhost:3001/dashboard/massaggiatore)
- [`/dashboard/massaggiatore/appuntamenti`](http://localhost:3001/dashboard/massaggiatore/appuntamenti)
- [`/dashboard/massaggiatore/calendario`](http://localhost:3001/dashboard/massaggiatore/calendario)
- [`/dashboard/massaggiatore/chat`](http://localhost:3001/dashboard/massaggiatore/chat)
- [`/dashboard/massaggiatore/statistiche`](http://localhost:3001/dashboard/massaggiatore/statistiche)
- [`/dashboard/massaggiatore/profilo`](http://localhost:3001/dashboard/massaggiatore/profilo)
- [`/dashboard/massaggiatore/abbonamenti`](http://localhost:3001/dashboard/massaggiatore/abbonamenti)
- [`/dashboard/massaggiatore/impostazioni`](http://localhost:3001/dashboard/massaggiatore/impostazioni)

---

## 7. Dashboard — marketing

- [`/dashboard/marketing`](http://localhost:3001/dashboard/marketing)
- [`/dashboard/marketing/athletes`](http://localhost:3001/dashboard/marketing/athletes)
- [`/dashboard/marketing/segments`](http://localhost:3001/dashboard/marketing/segments)
- [`/dashboard/marketing/segments/new`](http://localhost:3001/dashboard/marketing/segments/new)
- [`/dashboard/marketing/segments/[id]`](http://localhost:3001/dashboard/marketing/segments/SEGMENTO_ID)
- [`/dashboard/marketing/segments/[id]/edit`](http://localhost:3001/dashboard/marketing/segments/SEGMENTO_ID/edit)
- [`/dashboard/marketing/automations`](http://localhost:3001/dashboard/marketing/automations)
- [`/dashboard/marketing/automations/new`](http://localhost:3001/dashboard/marketing/automations/new)
- [`/dashboard/marketing/automations/[id]`](http://localhost:3001/dashboard/marketing/automations/AUTOMAZIONE_ID)
- [`/dashboard/marketing/leads`](http://localhost:3001/dashboard/marketing/leads)
- [`/dashboard/marketing/leads/[id]`](http://localhost:3001/dashboard/marketing/leads/LEAD_ID)
- [`/dashboard/marketing/campaigns`](http://localhost:3001/dashboard/marketing/campaigns)
- [`/dashboard/marketing/campaigns/new`](http://localhost:3001/dashboard/marketing/campaigns/new)
- [`/dashboard/marketing/campaigns/[id]`](http://localhost:3001/dashboard/marketing/campaigns/CAMPAGNA_ID)
- [`/dashboard/marketing/campaigns/[id]/edit`](http://localhost:3001/dashboard/marketing/campaigns/CAMPAGNA_ID/edit)
- [`/dashboard/marketing/analytics`](http://localhost:3001/dashboard/marketing/analytics)
- [`/dashboard/marketing/report`](http://localhost:3001/dashboard/marketing/report)
- [`/dashboard/marketing/impostazioni`](http://localhost:3001/dashboard/marketing/impostazioni)

---

## 8. Dashboard — admin

- [`/dashboard/admin`](http://localhost:3001/dashboard/admin)
- [`/dashboard/admin/organizzazioni`](http://localhost:3001/dashboard/admin/organizzazioni)
- [`/dashboard/admin/ruoli`](http://localhost:3001/dashboard/admin/ruoli)
- [`/dashboard/admin/statistiche`](http://localhost:3001/dashboard/admin/statistiche)
- [`/dashboard/admin/utenti`](http://localhost:3001/dashboard/admin/utenti)
- [`/dashboard/admin/utenti/marketing`](http://localhost:3001/dashboard/admin/utenti/marketing)

---

## 9. Home — area atleta (`/home`)

- [`/home`](http://localhost:3001/home)
- [`/home/profilo`](http://localhost:3001/home/profilo)
- [`/home/chat`](http://localhost:3001/home/chat)
- [`/home/appuntamenti`](http://localhost:3001/home/appuntamenti)
- [`/home/documenti`](http://localhost:3001/home/documenti)
- [`/home/pagamenti`](http://localhost:3001/home/pagamenti)
- [`/home/trainer`](http://localhost:3001/home/trainer)
- [`/home/nutrizionista`](http://localhost:3001/home/nutrizionista)
- [`/home/massaggiatore`](http://localhost:3001/home/massaggiatore)
- [`/home/foto-risultati`](http://localhost:3001/home/foto-risultati)
- [`/home/foto-risultati/aggiungi`](http://localhost:3001/home/foto-risultati/aggiungi)
- [`/home/allenamenti`](http://localhost:3001/home/allenamenti)
- [`/home/allenamenti/oggi`](http://localhost:3001/home/allenamenti/oggi)
- [`/home/allenamenti/riepilogo`](http://localhost:3001/home/allenamenti/riepilogo)
- [`/home/allenamenti/[id]`](http://localhost:3001/home/allenamenti/PIANO_ID)
- [`/home/allenamenti/[id]/giorno/[dayId]`](http://localhost:3001/home/allenamenti/PIANO_ID/giorno/GIORNO_ID)
- [`/home/allenamenti/esercizio/[exerciseId]`](http://localhost:3001/home/allenamenti/esercizio/ESERCIZIO_ID)
- [`/home/progressi`](http://localhost:3001/home/progressi)
- [`/home/progressi/nuovo`](http://localhost:3001/home/progressi/nuovo)
- [`/home/progressi/foto`](http://localhost:3001/home/progressi/foto)
- [`/home/progressi/storico`](http://localhost:3001/home/progressi/storico)
- [`/home/progressi/allenamenti`](http://localhost:3001/home/progressi/allenamenti)
- [`/home/progressi/allenamenti/[exerciseId]`](http://localhost:3001/home/progressi/allenamenti/ESERCIZIO_ID)
- [`/home/progressi/misurazioni`](http://localhost:3001/home/progressi/misurazioni)
- [`/home/progressi/misurazioni/[field]`](http://localhost:3001/home/progressi/misurazioni/CAMPO_MISURA)

---

## 10. Embed (vista allenamenti atleta per contesto embed)

- [`/embed/athlete-allenamenti/[athleteProfileId]`](http://localhost:3001/embed/athlete-allenamenti/PROFILO_ATLETA_ID)
- [`/embed/athlete-allenamenti/[athleteProfileId]/oggi`](http://localhost:3001/embed/athlete-allenamenti/PROFILO_ATLETA_ID/oggi)
- [`/embed/athlete-allenamenti/[athleteProfileId]/riepilogo`](http://localhost:3001/embed/athlete-allenamenti/PROFILO_ATLETA_ID/riepilogo)
- [`/embed/athlete-allenamenti/[athleteProfileId]/[id]`](http://localhost:3001/embed/athlete-allenamenti/PROFILO_ATLETA_ID/PIANO_ID)
- [`/embed/athlete-allenamenti/[athleteProfileId]/[id]/giorno/[dayId]`](http://localhost:3001/embed/athlete-allenamenti/PROFILO_ATLETA_ID/PIANO_ID/giorno/GIORNO_ID)
- [`/embed/athlete-allenamenti/[athleteProfileId]/esercizio/[exerciseId]`](http://localhost:3001/embed/athlete-allenamenti/PROFILO_ATLETA_ID/esercizio/ESERCIZIO_ID)

---

## Rigenerazione (PowerShell, dalla root repo)

```powershell
Get-ChildItem -Path ".\src\app" -Recurse -Filter "page.tsx" | ForEach-Object {
  $r = $_.FullName -replace [regex]::Escape((Resolve-Path ".\src\app").Path), "" -replace "\\page.tsx$","" -replace "\\","/"
  if ($r -eq "") { "/" } else { "/$r" }
} | Sort-Object
```

Allineare data, gruppi e link in questo file dopo aggiunte/rimozioni di `page.tsx`.
