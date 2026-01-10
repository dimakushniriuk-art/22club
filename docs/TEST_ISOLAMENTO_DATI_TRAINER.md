# 🧪 Test Isolamento Dati Trainer

**Data**: 2026-01-08  
**Feature**: Isolamento Dati Trainer - RLS Policies  
**Status**: ✅ Implementato - Da Testare

---

## 📋 Checklist Test

### ✅ Test 1: Isolamento Profiles (Atleti)

**Obiettivo**: Verificare che ogni trainer veda solo i propri atleti.

**Passi**:
1. Login come **Trainer A**
2. Vai su `/dashboard/atleti`
3. **Verifica**: Vedi solo atleti assegnati a Trainer A
4. Login come **Trainer B**
5. Vai su `/dashboard/atleti`
6. **Verifica**: Vedi solo atleti assegnati a Trainer B (diversi da Trainer A)

**Query SQL di Verifica**:
```sql
-- Verifica atleti visibili a Trainer A
SELECT p.id, p.nome, p.cognome, p.email
FROM profiles p
WHERE p.role IN ('atleta', 'athlete')
  AND EXISTS (
    SELECT 1 FROM pt_atleti pa
    WHERE pa.atleta_id = p.id
      AND pa.pt_id = '<TRAINER_A_PROFILE_ID>'
  );

-- Verifica atleti visibili a Trainer B
SELECT p.id, p.nome, p.cognome, p.email
FROM profiles p
WHERE p.role IN ('atleta', 'athlete')
  AND EXISTS (
    SELECT 1 FROM pt_atleti pa
    WHERE pa.atleta_id = p.id
      AND pa.pt_id = '<TRAINER_B_PROFILE_ID>'
  );
```

---

### ✅ Test 2: Isolamento Appuntamenti

**Obiettivo**: Verificare che ogni trainer veda solo gli appuntamenti dei propri atleti.

**Passi**:
1. Login come **Trainer A**
2. Vai su `/dashboard/appuntamenti` o `/dashboard/calendario`
3. **Verifica**: Vedi solo appuntamenti di atleti assegnati a Trainer A
4. Login come **Trainer B**
5. Vai su `/dashboard/appuntamenti` o `/dashboard/calendario`
6. **Verifica**: Vedi solo appuntamenti di atleti assegnati a Trainer B

**Query SQL di Verifica**:
```sql
-- Verifica appuntamenti visibili a Trainer A
SELECT a.id, a.athlete_id, a.starts_at, a.ends_at
FROM appointments a
WHERE EXISTS (
  SELECT 1 FROM pt_atleti pa
  WHERE pa.atleta_id = a.athlete_id
    AND pa.pt_id = '<TRAINER_A_PROFILE_ID>'
);
```

---

### ✅ Test 3: Isolamento Schede (Workouts)

**Obiettivo**: Verificare che ogni trainer veda solo le schede dei propri atleti.

**Passi**:
1. Login come **Trainer A**
2. Vai su `/dashboard/allenamenti` o sezione schede
3. **Verifica**: Vedi solo schede di atleti assegnati a Trainer A
4. Login come **Trainer B**
5. Vai su `/dashboard/allenamenti` o sezione schede
6. **Verifica**: Vedi solo schede di atleti assegnati a Trainer B

---

### ✅ Test 4: Isolamento Pagamenti (Abbonamenti)

**Obiettivo**: Verificare che ogni trainer veda solo i pagamenti dei propri atleti.

**Passi**:
1. Login come **Trainer A**
2. Vai su `/dashboard/abbonamenti`
3. **Verifica**: Vedi solo pagamenti di atleti assegnati a Trainer A
4. Login come **Trainer B**
5. Vai su `/dashboard/abbonamenti`
6. **Verifica**: Vedi solo pagamenti di atleti assegnati a Trainer B

---

### ✅ Test 5: Isolamento Chat

**Obiettivo**: Verificare che ogni trainer possa chattare solo con i propri atleti.

**Passi**:
1. Login come **Trainer A**
2. Vai su `/dashboard/chat` o `/home/chat`
3. **Verifica**: Vedi solo conversazioni con atleti assegnati a Trainer A
4. Prova a inviare un messaggio a un atleta di Trainer B
5. **Verifica**: Il messaggio non viene inviato o non è visibile

---

### ✅ Test 6: Admin Access Completo

**Obiettivo**: Verificare che gli admin vedano tutti i dati.

**Passi**:
1. Login come **Admin**
2. Vai su `/dashboard/atleti`
3. **Verifica**: Vedi tutti gli atleti di tutti i trainer
4. Vai su `/dashboard/appuntamenti`
5. **Verifica**: Vedi tutti gli appuntamenti
6. Vai su `/dashboard/abbonamenti`
7. **Verifica**: Vedi tutti i pagamenti

---

### ✅ Test 7: Esercizi Condivisi

**Obiettivo**: Verificare che gli esercizi siano visibili a tutti i trainer.

**Passi**:
1. Login come **Trainer A**
2. Vai su sezione esercizi
3. **Verifica**: Vedi tutti gli esercizi (non filtrati)
4. Login come **Trainer B**
5. Vai su sezione esercizi
6. **Verifica**: Vedi gli stessi esercizi (condivisi)

---

### ✅ Test 8: Creazione Atleta

**Obiettivo**: Verificare che un nuovo atleta creato da un trainer sia automaticamente assegnato a quel trainer.

**Passi**:
1. Login come **Trainer A**
2. Crea un nuovo atleta tramite `/dashboard/atleti` o API
3. **Verifica**: L'atleta è visibile solo a Trainer A
4. Login come **Trainer B**
5. **Verifica**: L'atleta NON è visibile a Trainer B

**Query SQL di Verifica**:
```sql
-- Verifica assegnazione automatica
SELECT pa.pt_id, pa.atleta_id, p.nome, p.cognome
FROM pt_atleti pa
JOIN profiles p ON p.id = pa.atleta_id
WHERE pa.atleta_id = '<NUOVO_ATLETA_ID>';
```

---

## 🔍 Query di Diagnostica

### Verifica RLS Policies Attive

```sql
-- Verifica tutte le policies RLS per una tabella
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

### Verifica Funzioni Helper

```sql
-- Verifica funzioni helper
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_current_trainer_profile_id',
    'is_admin',
    'is_athlete_assigned_to_trainer',
    'get_profile_id_from_user_id'
  );
```

### Verifica Relazioni Trainer-Atleta

```sql
-- Verifica tutte le relazioni trainer-atleta
SELECT 
  pa.pt_id,
  pt.nome || ' ' || pt.cognome as trainer_nome,
  pa.atleta_id,
  at.nome || ' ' || at.cognome as atleta_nome
FROM pt_atleti pa
JOIN profiles pt ON pt.id = pa.pt_id
JOIN profiles at ON at.id = pa.atleta_id
ORDER BY pt.nome, at.nome;
```

---

## ⚠️ Problemi Comuni

### Problema: Trainer vede tutti gli atleti

**Causa Possibile**: RLS policies non applicate correttamente.

**Soluzione**:
1. Verifica che i blocchi SQL 01-11 siano stati eseguiti
2. Controlla che le policies esistano: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`
3. Verifica che RLS sia abilitato: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';`

### Problema: Admin non vede tutti i dati

**Causa Possibile**: Funzione `is_admin()` non funziona correttamente.

**Soluzione**:
1. Verifica che la funzione esista: `SELECT * FROM information_schema.routines WHERE routine_name = 'is_admin';`
2. Testa la funzione: `SELECT is_admin();` (deve restituire `true` se sei admin)

### Problema: Atleta non vede i propri dati

**Causa Possibile**: Policies troppo restrittive.

**Soluzione**:
1. Verifica che le policies permettano `user_id = auth.uid()`
2. Controlla che l'atleta sia autenticato correttamente

---

## 📊 Report Test

Dopo aver eseguito tutti i test, compila questo report:

| Test | Status | Note |
|------|--------|------|
| Test 1: Isolamento Profiles | ⬜ | |
| Test 2: Isolamento Appuntamenti | ⬜ | |
| Test 3: Isolamento Schede | ⬜ | |
| Test 4: Isolamento Pagamenti | ⬜ | |
| Test 5: Isolamento Chat | ⬜ | |
| Test 6: Admin Access | ⬜ | |
| Test 7: Esercizi Condivisi | ⬜ | |
| Test 8: Creazione Atleta | ⬜ | |

**Status Generale**: ⬜ ✅ Pass / ⬜ ❌ Fail / ⬜ ⚠️ Parziale

---

## 🎯 Prossimi Passi

Dopo aver completato i test:

1. ✅ Se tutti i test passano → Isolamento funzionante correttamente
2. ⚠️ Se alcuni test falliscono → Verificare policies RLS specifiche
3. 📝 Documentare eventuali problemi trovati
4. 🔄 Aggiornare `ai_memory/sviluppo.md` con risultati test
