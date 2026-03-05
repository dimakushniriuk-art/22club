# STEP 10: Commit e Merge

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 Alta  
**Tempo stimato:** 5 minuti  
**Stato:** ⏳ Da eseguire dopo STEP 9

---

## 📋 Obiettivo

Committare tutte le modifiche e fare merge nel branch principale.

---

## 🚀 Istruzioni Esecuzione

### 1. Verifica Modifiche

**Azione:** Verificare tutte le modifiche prima del commit

**Comando:**

```bash
git status
```

**Risultato atteso:**

- Vedi tutti i file modificati
- Nessuna modifica non voluta

---

### 2. Aggiungi File al Staging

**Azione:** Aggiungere tutti i file modificati

**Comando:**

```bash
git add .
```

**Oppure aggiungere file specifici:**

```bash
git add src/types/document.ts
git add src/hooks/use-documents.ts
git add src/lib/documents.ts
git add src/components/documents/document-uploader-modal.tsx
git add src/app/home/documenti/page.tsx
git add src/data/mock-documents-data.ts
```

---

### 3. Verifica Staging

**Azione:** Verificare che tutti i file corretti siano in staging

**Comando:**

```bash
git status
```

**Risultato atteso:**

- Tutti i file modificati sono in "Changes to be committed"

---

### 4. Commit Modifiche

**Azione:** Creare commit con messaggio descrittivo

**Comando:**

```bash
git commit -m "fix: aggiorna uploaded_by_user_id a uploaded_by_profile_id (FIX_23)

- Aggiornato tipo Document per usare uploaded_by_profile_id
- Aggiornato hook use-documents per nuova colonna
- Aggiornato lib documents.ts per tutte le funzioni
- Aggiornato componente document-uploader-modal
- Aggiornato pagina documenti con commento corretto
- Aggiornato mock data per test
- Riferimenti FK aggiornati da profiles.user_id a profiles.id"
```

**Risultato atteso:**

```
[fix/update-uploaded-by-profile-id abc1234] fix: aggiorna uploaded_by_user_id a uploaded_by_profile_id (FIX_23)
 6 files changed, X insertions(+), X deletions(-)
```

---

### 5. Verifica Commit

**Azione:** Verificare che il commit sia stato creato correttamente

**Comando:**

```bash
git log --oneline -1
```

**Risultato atteso:**

- Vedi il commit appena creato con il messaggio corretto

---

### 6. Switch al Branch Principale

**Azione:** Tornare al branch principale

**Comando:**

```bash
git checkout master
```

**Oppure:**

```bash
git checkout main
```

**Risultato atteso:**

```
Switched to branch 'master'
```

---

### 7. Verifica Branch Principale

**Azione:** Verificare che il branch principale sia aggiornato

**Comando:**

```bash
git status
```

**Risultato atteso:**

- Working directory pulito
- Nessuna modifica non committata

---

### 8. Merge Branch

**Azione:** Fare merge del branch di fix nel branch principale

**Comando:**

```bash
git merge fix/update-uploaded-by-profile-id
```

**Risultato atteso:**

```
Updating abc1234..def5678
Fast-forward
 src/types/document.ts                    | 1 +
 src/hooks/use-documents.ts                | 2 +-
 src/lib/documents.ts                      | 5 +-
 src/components/documents/document-uploader-modal.tsx | 2 +-
 src/app/home/documenti/page.tsx           | 1 +-
 src/data/mock-documents-data.ts          | 5 +-
 6 files changed, X insertions(+), X deletions(-)
```

---

### 9. Verifica Merge

**Azione:** Verificare che il merge sia stato completato

**Comando:**

```bash
git log --oneline -3
```

**Risultato atteso:**

- Vedi il commit di fix nel log del branch principale

---

### 10. (Opzionale) Push al Remote

**Azione:** Se lavori con un repository remoto, pushare le modifiche

**⚠️ ATTENZIONE:** Solo se sei sicuro e hai testato tutto!

**Comando:**

```bash
git push origin master
```

**Oppure:**

```bash
git push origin main
```

---

### 11. (Opzionale) Eliminare Branch Locale

**Azione:** Eliminare il branch di fix dopo il merge (opzionale)

**Comando:**

```bash
git branch -d fix/update-uploaded-by-profile-id
```

**Risultato atteso:**

```
Deleted branch fix/update-uploaded-by-profile-id (was abc1234).
```

---

## ✅ Checklist

- [ ] Modifiche verificate (`git status`)
- [ ] File aggiunti al staging (`git add`)
- [ ] Commit creato con messaggio descrittivo
- [ ] Switch al branch principale
- [ ] Merge eseguito con successo
- [ ] Merge verificato (`git log`)
- [ ] (Opzionale) Push al remote
- [ ] (Opzionale) Branch locale eliminato

---

## 🔍 Verifica Finale

### Verifica File Modificati

```bash
git diff HEAD~1 --stat
```

**Risultato atteso:**

- Vedi tutti i 6 file modificati

### Verifica Contenuto Modifiche

```bash
git diff HEAD~1 src/types/document.ts
```

**Risultato atteso:**

- Vedi la modifica da `uploaded_by_user_id` a `uploaded_by_profile_id`

---

## 📝 Note Importanti

1. **Non pushare se non sei sicuro:** Verifica sempre prima di pushare
2. **Backup:** Se lavori in team, assicurati di avere un backup
3. **Test:** Assicurati che tutti i test siano passati prima del merge
4. **Documentazione:** Aggiorna la documentazione se necessario

---

## 🎯 Prossimo Step

Dopo il merge:

- ✅ **FASE A completata!**
- ⏳ **FASE B:** Migrazione Storage Legacy (opzionale, STEP 11-23)

---

## 📚 Riepilogo Modifiche

**File modificati (6):**

1. `src/types/document.ts`
2. `src/hooks/use-documents.ts`
3. `src/lib/documents.ts`
4. `src/components/documents/document-uploader-modal.tsx`
5. `src/app/home/documenti/page.tsx`
6. `src/data/mock-documents-data.ts`

**Modifiche principali:**

- `uploaded_by_user_id` → `uploaded_by_profile_id`
- FK aggiornata da `profiles.user_id` a `profiles.id`
- Query Supabase aggiornate
- Mock data aggiornati

---

**Data creazione:** 2025-02-01  
**Prerequisito:** STEP 9 completato con successo ✅
