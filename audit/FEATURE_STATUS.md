# Stato feature (sintetico, da audit 2026-03)

| Feature | Stato | Nota |
|---------|-------|------|
| Login / ruoli | Attivo | Multi-ruolo; verificare allineamento con `profiles.role` |
| Dashboard staff | Attivo | Ampia superficie |
| Home atleta / workout oggi | Attivo | TODO metriche in riepilogo; file molto grande |
| Calendario / appuntamenti | Attivo | Email reminder/notifiche via API dedicate |
| Clienti / atleti | Attivo | RLS + assign trainer |
| Schede / esercizi | Attivo | |
| Pagamenti / abbonamenti | Attivo | Doc audit abbonamenti |
| Documenti staff | **Build rotta** | TS shadowing `document` |
| Comunicazioni bulk | Attivo | |
| Chat | Attivo | Realtime + E2E |
| Marketing (leads, campagne, segmenti) | Attivo | KPI refresh cron |
| Admin utenti/ruoli | Attivo | Alto impatto |
| Impersonation | Attivo | Solo admin |
| Nutrizionista vertical | Attivo | Piani, check-in, PDF |
| Massaggiatore vertical | Attivo | |
| Onboarding welcome | Attivo | |
| Push | Attivo | API `api/push/*` |
| Debug API trainer visibility | Esposto | Valutare rimozione/protezione |
| Design system | Attivo | |

*Stato “attivo” = presente in route/API/hook da indici clean; non implica assenza di bug.*
