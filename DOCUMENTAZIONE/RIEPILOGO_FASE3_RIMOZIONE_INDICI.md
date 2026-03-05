# 📊 Riepilogo FASE 3: Rimozione Indici Ridondanti (user_id e citta)

**Data**: 2025-01-31  
**Migration**: `supabase/migrations/20250131_remove_idx_user_id_and_citta.sql`

---

## 🎯 Indici Rimossi (FASE 3)

### 1. `idx_profiles_user_id` (16 kB)

**Motivo**: Coperto da `profiles_user_id_key` (UNIQUE constraint)

- PostgreSQL usa automaticamente l'indice UNIQUE per lookup su `user_id`
- Indice standard ridondante e non necessario
- **Sicurezza**: Alta ✅

### 2. `idx_profiles_citta` (16 kB)

**Motivo**: Coperto da `idx_profiles_citta_provincia` (indice composito)

- PostgreSQL può usare la prima colonna di un indice composito per query che filtrano solo su quella colonna
- Indice singolo ridondante
- **Sicurezza**: Alta ✅

---

## 📈 Risultati Attesi

| Metrica               | Prima FASE 3 | Dopo FASE 3 | Miglioramento    |
| --------------------- | ------------ | ----------- | ---------------- |
| **Numero Indici**     | 12           | 10          | **-2 indici**    |
| **Dimensione Indici** | 192 kB       | 160 kB      | **-32 kB (17%)** |

---

## 📋 Stato Progressivo Ottimizzazione

| Fase         | Indici Rimossi     | Risparmio | Indici Finali | Dimensione Finale |
| ------------ | ------------------ | --------- | ------------- | ----------------- |
| **Iniziale** | -                  | -         | 15            | 240 kB            |
| **FASE 1**   | 2 (stato, email)   | 32 kB     | 13            | 208 kB            |
| **FASE 2**   | 1 (role)           | 16 kB     | 12            | 192 kB            |
| **FASE 3**   | 2 (user_id, citta) | 32 kB     | **10**        | **160 kB**        |

**Totale Ottimizzazione**:

- **5 indici rimossi** (33% di riduzione)
- **80 kB risparmiati** (33% di riduzione dimensioni)

---

## ⏳ Indici da Valutare (FASE 4 - Opzionale)

Basati su Query 3 (utilizzo scansioni), questi indici potrebbero essere rimossi se poco usati:

1. `idx_profiles_data_nascita` (16 kB)
   - **Decisione**: Rimuovi se `idx_scan < 5`
2. `idx_profiles_created_at` (16 kB)
   - **Decisione**: Rimuovi se `idx_scan < 5`
3. `idx_profiles_org_id` (16 kB)
   - **Decisione**: Rimuovi se `idx_scan < 5`

**Risparmio potenziale FASE 4**: 48 kB (3 indici)

---

## ✅ Indici da MANTENERE

1. **CONSTRAINT (necessari)**:
   - `profiles_pkey` (PRIMARY KEY)
   - `profiles_email_unique` (UNIQUE)
   - `profiles_user_id_key` (UNIQUE)
   - `idx_profiles_codice_fiscale_unique` (UNIQUE)

2. **Indici parziali ottimizzati**:
   - `idx_profiles_role_stato` (parziale WHERE role = 'atleta')
   - `idx_profiles_data_iscrizione` (parziale WHERE role IN ('atleta', 'athlete'))

3. **Indici compositi utili**:
   - `idx_profiles_citta_provincia` (composito, copre anche citta)

---

## 🔍 Verifica Post-FASE 3

Dopo esecuzione migration, eseguire:

```sql
-- Verifica numero indici finali
SELECT
  COUNT(*) as numero_indici_finali,
  pg_size_pretty(SUM(pg_relation_size(indexname::regclass))) as dimensione_finale
FROM pg_indexes
WHERE tablename = 'profiles';

-- Dovrebbe essere: 10 indici, ~160 kB
```

---

## 📝 Note

- Tutti gli indici rimossi sono sicuri (ridondanze accertate)
- Nessun impatto negativo atteso sulle performance
- Query planner semplificato ulteriormente
- Database più efficiente e pulito

---

**Prossimo Step**:

1. Eseguire migration FASE 3
2. Verificare risultati
3. Analizzare Query 3 per decidere FASE 4 (opzionale)
