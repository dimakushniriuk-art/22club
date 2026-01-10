# 🧪 Test con RLS Disabilitato

## Quando è utile disabilitare RLS?

1. **Debugging**: Verificare se i dati esistono davvero nel database
2. **Test applicazione**: Testare l'app senza problemi di accesso
3. **Diagnosi**: Capire se il problema è nelle policies o nei dati
4. **Sviluppo**: Sviluppare features senza preoccuparsi di RLS temporaneamente

## ⚠️ ATTENZIONE

**NON disabilitare RLS in produzione!** È solo per test temporanei.

## 📋 Procedura Consigliata

### 1. Disabilita RLS (solo per test)

```sql
-- Esegui: docs/DISABLE_RLS_ALL_TABLES.sql
```

### 2. Testa l'applicazione

```bash
npm run dev
```

Ora dovresti vedere:

- ✅ Tutti i dati accessibili
- ✅ Nessun errore 42501 (permission denied)
- ✅ Profili, esercizi, pagamenti, ecc. tutti visibili

### 3. Verifica i dati

```bash
npm run db:verify-data-deep
```

Dovresti vedere:

- ✅ Tutti i conteggi con anon key = service key
- ✅ Nessuna differenza tra anon e service

### 4. Riabilita RLS

```sql
-- Esegui: docs/ENABLE_RLS_ALL_TABLES.sql
```

### 5. Applica policies corrette

```sql
-- Esegui: docs/FIX_RLS_POLICIES_COMPLETE.sql
```

### 6. Verifica finale

```bash
npm run db:verify-data-deep
```

Dovresti vedere:

- ✅ Dati visibili con anon key (non più 0)
- ✅ Conteggi corretti

## 🎯 Cosa ti aiuta a capire

Se con RLS disabilitato:

- ✅ **Vedi tutti i dati** → Il problema è nelle policies (troppo restrittive)
- ❌ **Non vedi i dati** → Il problema è nei dati o nella connessione

## 📊 Confronto

| Scenario     | RLS Disabilitato     | RLS Attivo (senza policies) | RLS Attivo (con policies corrette) |
| ------------ | -------------------- | --------------------------- | ---------------------------------- |
| Accesso dati | ✅ Tutto accessibile | ❌ Niente accessibile       | ✅ Accessibile secondo regole      |
| Sicurezza    | ❌ Nessuna           | ✅ Nessuna (ma bloccato)    | ✅ Sicuro                          |
| Uso          | Solo test            | Mai                         | Produzione                         |

## 🔄 Workflow Completo

```bash
# 1. Disabilita RLS
# (Esegui DISABLE_RLS_ALL_TABLES.sql)

# 2. Testa
npm run dev
npm run db:verify-data-deep

# 3. Riabilita RLS
# (Esegui ENABLE_RLS_ALL_TABLES.sql)

# 4. Applica policies
# (Esegui FIX_RLS_POLICIES_COMPLETE.sql)

# 5. Verifica finale
npm run db:verify-data-deep
```

## 💡 Suggerimento

Se disabilitando RLS vedi tutti i dati, significa che:

- ✅ I dati ci sono
- ✅ Il problema è nelle policies
- ✅ La soluzione è applicare `FIX_RLS_POLICIES_COMPLETE.sql`
