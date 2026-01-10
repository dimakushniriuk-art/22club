# 📊 Analisi Risultati Indici - RPC Timeout

**Data**: 2025-01-31  
**Query**: Query 4 - Riepilogo Indicazioni

---

## 📈 Riepilogo Risultati

| Categoria                | Numero Indici | Dimensione | Azione                                  |
| ------------------------ | ------------- | ---------- | --------------------------------------- |
| **MANTIENI (UNIQUE)**    | 4             | 64 kB      | ✅ Mantieni (PK e UNIQUE constraints)   |
| **MANTIENI (composito)** | 1             | 16 kB      | ✅ Mantieni (`idx_profiles_role_stato`) |
| **VALUTA CASO PER CASO** | 6             | 96 kB      | 🔍 Analizzare caso per caso             |
| **VALUTA RIMOZIONE**     | 4             | 64 kB      | ⚠️ Potenzialmente rimovibili            |

**Totale**: 15 indici, ~240 kB

---

## 🎯 Indici da Rimuovere (Priorità Alta)

### 1. `idx_profiles_stato` (16 kB)

- **Motivo**: Coperto da `idx_profiles_role_stato`
- **Sicurezza**: Alta - L'indice composito può essere usato per query su `stato` quando combinato con `role`
- **Nota**: PostgreSQL può usare un indice composito per la prima colonna o per entrambe

### 2. `idx_profiles_role` (se esiste)

- **Motivo**: Coperto da `idx_profiles_role_stato`
- **Sicurezza**: Media - Dipende se ci sono query che filtrano solo per `role`
- **Nota**: L'indice composito può essere usato anche solo per `role`

### 3. `idx_profiles_data_iscrizione` (se esiste)

- **Motivo**: Potrebbe essere coperto da un indice composito
- **Sicurezza**: Bassa - Serve verificare se esiste un composito che include `data_iscrizione`
- **Nota**: Potrebbe essere necessario se ci sono query solo su `data_iscrizione`

### 4. `idx_profiles_citta_provincia`

- **Motivo**: Coperto da altri indici (?)
- **Sicurezza**: Bassa - Serve analizzare l'uso
- **Nota**: Potrebbe essere un indice composito già utile

---

## 🔍 Indici "VALUTA CASO PER CASO"

Questi 6 indici (96 kB) potrebbero essere utili o meno:

1. `idx_profiles_data_nascita` - Probabilmente utile per query demografiche
2. `idx_profiles_citta` - Probabilmente utile per ricerche geografiche
3. `idx_profiles_user_id` - Potrebbe essere duplicato se esiste `profiles_user_id_key` (UNIQUE)
4. `idx_profiles_created_at` - Potrebbe essere utile per ordinamenti
5. `idx_profiles_email` - Potrebbe essere duplicato se esiste `profiles_email_unique` (UNIQUE)
6. `idx_profiles_org_id` - Probabilmente utile per multi-tenancy

---

## ✅ Piano di Azione

### FASE 1: Rimozione Sicura (Immediata)

Rimuovere indici chiaramente ridondanti:

1. `idx_profiles_stato` (16 kB) - Coperto da `idx_profiles_role_stato`

**Risparmio Potenziale**: 16 kB

---

### FASE 2: Verifica e Rimozione Cauta

Prima di rimuovere, verificare:

1. **Controllare duplicati tra STANDARD e UNIQUE**:
   - Se `idx_profiles_user_id` esiste E `profiles_user_id_key` (UNIQUE) esiste → rimuovere `idx_profiles_user_id`
   - Se `idx_profiles_email` esiste E `profiles_email_unique` (UNIQUE) esiste → rimuovere `idx_profiles_email`

2. **Verificare uso indici**:
   - Query che usano solo `role` → se rara, rimuovere `idx_profiles_role`
   - Query che usano solo `data_iscrizione` → se rara, rimuovere `idx_profiles_data_iscrizione`

**Risparmio Potenziale**: 32-48 kB (se rimossi)

---

## 📋 SQL Migration Proposta

Vedi file: `supabase/migrations/20250131_remove_redundant_indexes_profiles.sql`

---

## ⚠️ Note Importanti

1. **Backup**: Assicurati di avere un backup prima di rimuovere indici
2. **Test**: Rimuovere indici in ambiente di sviluppo/test prima di produzione
3. **Monitoraggio**: Monitorare performance dopo rimozione
4. **Reversibilità**: Gli indici possono essere ricreati se necessario

---

## 🎯 Obiettivo

- Ridurre dimensioni indici da ~240 kB a ~180-200 kB
- Semplificare query planner (meno scelte = decisioni migliori)
- Migliorare performance mantenendo indici necessari

---

**Prossimo Step**: Creare migration SQL per rimozione indici ridondanti.
