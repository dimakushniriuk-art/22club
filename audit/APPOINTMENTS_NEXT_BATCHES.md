# Batch futuri — dominio Appointments (max 3, non applicati)

Solo proposte operative. Nessuna modifica effettuata in questo task.

---

## Batch 1 — Unificare identità e letture staff/atleta

**Obiettivo:** Eliminare ambiguità tra i due `useAppointments` e ridurre query duplicate.

**Azioni tipiche (da pianificare):**
- Rinominare o consolidare: es. `useAthleteAppointmentsQuery` (root) vs `useStaffAppointmentsTable` (dashboard tabella).
- Documentare in README interno quale hook usare per ogni route.
- Opzionale: estrarre `select` appointments staff “full calendar” vs “table” in modulo condiviso (solo definizione query, senza refactor UI massivo).

**Rischio:** regressioni su `/home/appuntamenti` e `/dashboard/appuntamenti`.  
**Test:** E2E / smoke su entrambe le pagine.

---

## Batch 2 — Allineare business: completamento, cancel, overlap

**Obiettivo:** Una sola verità per overlap e per effetti collaterali (ledger, email, `appointment_cancellations`).

**Azioni tipiche:**
- Scegliere **un** meccanismo overlap (RPC **o** query server-side documentata); rimuovere o delegare l’altro.
- Allineare `handleComplete` tra calendario staff e pagina appuntamenti (stesso uso di `addDebitFromAppointment` o stesso trigger DB).
- Decidere se la tabella `appointments` staff semplice deve chiamare le stesse API notify/cancellations del calendario.

**Rischio:** impatto su crediti e notifiche email.  
**Test:** flussi completamento, cancel tardiva/anticipata, doppio allenamento.

---

## Batch 3 — Cache e dashboard widget

**Obiettivo:** Coerenza tra React Query, calendario stateful e `GET /api/dashboard/appointments`.

**Azioni tipiche:**
- Valutare se il widget “oggi” può consumare la stessa sorgente della lista calendario (filtrata client) **oppure** mantenere API ma condividere tipi DTO.
- Dopo Batch 1–2: invalidazione unificata su mutazioni (stesso `queryKey` o event bus / refetch esplicito calendario da azioni tabella).

**Rischio:** performance dashboard se si sposta tutto su client.  
**Test:** modifica appuntamento in calendario → widget aggiornato (o accettato delay documentato).

---

*Fonti incrociate:* `audit/data_access_map_clean.txt`, `audit/SUPABASE_USAGE_MAP.md`.
