# STEP 2: Backup Codice Applicativo

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 Alta  
**Tempo stimato:** 5 minuti

---

## 📋 Obiettivo

Creare un branch Git separato per le modifiche, garantendo la possibilità di tornare indietro se necessario.

---

## 🚀 Istruzioni Esecuzione

### 1. Verifica stato Git corrente

Apri il terminale nella root del progetto e verifica lo stato:

```bash
git status
```

**Risultato atteso:**

- Working directory pulito (nessuna modifica non committata)
- Se ci sono modifiche, committale prima o fai stash

---

### 2. Verifica branch corrente

```bash
git branch
```

**Nota:** Assicurati di essere sul branch principale (`main` o `master`)

---

### 3. Crea nuovo branch per le modifiche

```bash
git checkout -b fix/update-uploaded-by-profile-id
```

**Risultato atteso:**

```
Switched to a new branch 'fix/update-uploaded-by-profile-id'
```

---

### 4. Verifica che il branch sia stato creato

```bash
git branch
```

**Risultato atteso:**

- ✅ Vedi `* fix/update-uploaded-by-profile-id` (con asterisco)
- ✅ Vedi anche `main` o `master` (senza asterisco)

---

## ✅ Checklist

- [ ] Working directory pulito (`git status` mostra "nothing to commit")
- [ ] Branch corrente verificato (main/master)
- [ ] Nuovo branch creato: `fix/update-uploaded-by-profile-id`
- [ ] Branch corrente verificato (`git branch` mostra asterisco sul nuovo branch)

---

## 🔍 Troubleshooting

### Problema A: Working directory non pulito

**Sintomo:**

```
Changes not staged for commit:
  modified:   file1.ts
  modified:   file2.ts
```

**Soluzione:**

**Opzione 1: Commit modifiche esistenti**

```bash
git add .
git commit -m "WIP: modifiche in corso"
git checkout -b fix/update-uploaded-by-profile-id
```

**Opzione 2: Stash modifiche**

```bash
git stash
git checkout -b fix/update-uploaded-by-profile-id
# Dopo le modifiche, se necessario:
# git stash pop
```

---

### Problema B: Branch già esiste

**Sintomo:**

```
fatal: A branch named 'fix/update-uploaded-by-profile-id' already exists.
```

**Soluzione:**

**Opzione 1: Usa branch esistente**

```bash
git checkout fix/update-uploaded-by-profile-id
```

**Opzione 2: Elimina e ricrea**

```bash
git branch -D fix/update-uploaded-by-profile-id
git checkout -b fix/update-uploaded-by-profile-id
```

**⚠️ ATTENZIONE:** Elimina solo se sei sicuro che non ci siano modifiche importanti nel branch esistente.

---

### Problema C: Non sei sul branch principale

**Sintomo:**

```
* feature/altro-branch
  main
```

**Soluzione:**

```bash
git checkout main  # o master
git checkout -b fix/update-uploaded-by-profile-id
```

---

## 📝 Note

- Il branch `fix/update-uploaded-by-profile-id` sarà usato per tutte le modifiche dei prossimi step
- Se qualcosa va storto, puoi sempre tornare al branch principale:
  ```bash
  git checkout main
  git branch -D fix/update-uploaded-by-profile-id  # se necessario
  ```
- Dopo aver completato tutti gli step, faremo merge del branch nel main

---

## 🎯 Prossimo Step

Una volta completato:
👉 **STEP 3:** Aggiornare type definitions (`src/types/document.ts`)

---

## 📚 Comandi Utili

```bash
# Verifica branch corrente
git branch

# Cambia branch
git checkout main

# Elimina branch (solo se sicuro)
git branch -D fix/update-uploaded-by-profile-id

# Vedi differenze tra branch
git diff main..fix/update-uploaded-by-profile-id
```

---

**Data creazione:** 2025-02-01  
**Prerequisito:** STEP 1 completato ✅
