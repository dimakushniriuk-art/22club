# Indice feature → entrypoint

| Feature | Pagina principale | API principali |
|---------|-------------------|----------------|
| Documenti staff | `dashboard/documenti/page.tsx` | storage + client; preview `api/document-preview` |
| Clienti | `dashboard/clienti/page.tsx` | athletes, sync-pt-atleti |
| Calendario | `dashboard/calendario/page.tsx` | appointments, calendar notify |
| Comunicazioni | `dashboard/comunicazioni/page.tsx` | `api/communications/*` |
| Marketing leads | `dashboard/marketing/leads` | `api/marketing/leads/*` |
| Chat | `dashboard/chat`, `home/chat` | Supabase realtime |
| Workout atleta | `home/allenamenti/oggi` | workout-plans, logs |
| Admin utenti | `dashboard/admin/utenti` | `api/admin/users` |

Stato sintetico: `audit/FEATURE_STATUS.md`.
