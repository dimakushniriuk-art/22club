# 🔧 Troubleshooting Login Completo - 22Club

## ✅ Problemi Risolti

### 1. Ricorsione Infinita nelle RLS Policies ✅ RISOLTO

**Problema**: Errore "infinite recursion detected in policy for relation 'profiles'"

**Causa**: Le RLS policies su `profiles` cercavano di leggere da `profiles` stesso per verificare i permessi, creando un loop infinito.

**Soluzione**: Applicato `docs/FIX_RLS_PROFILES_NO_RECURSION.sql` che:

- Rimuove tutte le policies ricorsive
- Crea policies semplici senza ricorsione
- Usa solo `auth.uid()` senza query su `profiles`

**Verifica**:

```bash
npm run admin:test-login
```

✅ Test passato - login e lettura profilo funzionano correttamente.

### 2. Profilo Admin Mancante ✅ RISOLTO

**Problema**: Profilo non trovato dopo il login

**Soluzione**: Creato script `scripts/create-admin-profile.ts` per creare/verificare il profilo admin.

**Esecuzione**:

```bash
npm run admin:create-profile
```

## 🔍 Problema Attuale

### Login Restituisce 400 Bad Request

**Sintomi**:

- La richiesta POST a `/auth/v1/token?grant_type=password` restituisce 400
- Il profilo viene caricato correttamente (200) prima del login
- La pagina rimane su `/login` senza errori visibili

**Possibili Cause**:

1. **Password non corretta**: La password potrebbe non essere stata resettata correttamente
2. **Email non confermata**: L'utente potrebbe non avere `email_confirmed_at` impostato
3. **Formato richiesta errato**: La richiesta potrebbe non essere formattata correttamente
4. **Cache del browser**: Il browser potrebbe avere dati vecchi in cache

## 🛠️ Soluzioni da Provare

### 1. Verifica Password Admin

```bash
npm run admin:reset-password
```

### 2. Verifica Email Confermata

Esegui nel SQL Editor di Supabase:

```sql
SELECT
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@22club.it';
```

Se `email_confirmed_at` è NULL, aggiorna:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@22club.it';
```

### 3. Pulisci Cache del Browser

1. Apri DevTools (F12)
2. Vai su Application > Storage
3. Clicca "Clear site data"
4. Ricarica la pagina

### 4. Test Login da Script

```bash
npm run admin:test-login
```

Se questo funziona ma il browser no, il problema è nel browser/cache.

## 📋 Checklist Finale

- [x] RLS policies corrette (no ricorsione)
- [x] Profilo admin creato e verificato
- [x] Test script login funziona
- [ ] Login nel browser funziona
- [ ] Email confermata
- [ ] Password resettata correttamente
- [ ] Cache browser pulita

## 🔗 Script Utili

- `npm run admin:reset-password` - Reset password admin
- `npm run admin:create-profile` - Crea/verifica profilo admin
- `npm run admin:test-login` - Test login completo

## 📝 Note

Il test script (`npm run admin:test-login`) funziona correttamente, quindi il problema è specifico del browser. Potrebbe essere:

- Cache del browser
- Cookie di sessione non salvati correttamente
- Problema con il client Supabase nel browser
- Email non confermata
