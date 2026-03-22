# Checklist: Conversione Lead → Atleta Trial

## Prerequisiti

- Migration `20260228236000_marketing_link_lead_to_profile_rpc.sql` applicata (RPC `marketing_link_lead_to_profile`).
- Utente con ruolo `admin` o `marketing` per testare.

## Test manuali

### 1. Lead non convertito – Converti in Atleta (Trial)

- [ ] Login come marketing o admin.
- [ ] Vai a **Marketing → Leads**.
- [ ] Crea un lead (nome, cognome, email unica, telefono) se non esiste.
- [ ] Apri il dettaglio del lead (Dettaglio).
- [ ] Verifica che sia visibile il pulsante **"Converti in Atleta (Trial)"**.
- [ ] Clicca **"Converti in Atleta (Trial)"** (invio invito attivo).
- [ ] Verifica toast di successo e che lo stato diventi **Convertito**.
- [ ] Verifica che compaia il link **"Vai al profilo atleta"** che porta a `/dashboard/atleti/[profile_id]`.

### 2. Verifica dati atleta e DB

- [ ] In Supabase (SQL o Table Editor):
  - `SELECT id, email, role, stato, first_login, org_id FROM profiles WHERE email = '<email_lead>';`
  - Atteso: `role = 'atleta'`, `stato = 'trial'`, `first_login = true`, `org_id` uguale al lead.
- [ ] `SELECT id, status, converted_athlete_profile_id, converted_at FROM marketing_leads WHERE id = '<lead_id>';`
  - Atteso: `status = 'converted'`, `converted_athlete_profile_id` valorizzato, `converted_at` valorizzato.

### 3. Idempotenza (lead già convertito)

- [ ] Riapri il dettaglio dello stesso lead convertito.
- [ ] Verifica che **non** sia più presente il blocco "Converti in atleta" con pulsante Trial (o sia disabilitato / "Già convertito").
- [ ] Chiamata diretta a `POST /api/marketing/leads/convert` con `{ "leadId": "<id_lead_convertito>" }`:
  - Atteso: `200`, body con `alreadyConverted: true` e `profileId` uguale a quello già salvato.

### 4. Conflitto email (profilo esistente stesso org)

- [ ] Crea un lead con email uguale a un atleta **già esistente** nello stesso org.
- [ ] Converti in Trial: atteso uso del profilo esistente, aggiornamento a `stato = 'trial'` e link lead → profilo senza creare un secondo profilo.

### 5. Conflitto email (altro org / altro ruolo)

- [ ] Se possibile: lead con email di un utente di **altro org** → atteso errore chiaro (409 "email già usata da un'altra organizzazione").
- [ ] Lead con email di un utente con **ruolo non atleta** (es. trainer) → atteso errore (409 "ruolo diverso da atleta").

### 6. Lista lead e “Vai al profilo”

- [ ] In **Marketing → Leads**, per un lead con stato **Convertito** verifica che in tabella ci sia l’azione **"Vai al profilo"** che apre `/dashboard/atleti/[id]`.

### 7. Atleta in trial – banner e onboarding

- [ ] Login come atleta creato da conversione (stato `trial`).
- [ ] In **Home** (app atleta) verifica che sia visibile il banner **"Periodo di prova — Completa il profilo"** con link a `/home/profilo`.

### 8. Invito email (se sendInvite = true)

- [ ] Converti un lead con email reale e `sendInvite: true`.
- [ ] Verifica che l’email di invito sia ricevuta (e che il link di redirect punti a `/post-login` o alla config del progetto).

## E2E Playwright

- Eseguire (con utente admin/marketing configurato):  
  `npx playwright test tests/e2e/marketing-lead-convert.spec.ts`
- Vedere `tests/e2e/marketing-lead-convert.spec.ts` per gli scenari automatizzati.
