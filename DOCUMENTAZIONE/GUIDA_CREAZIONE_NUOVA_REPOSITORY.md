# 📚 Guida Creazione e Collegamento Nuova Repository GitHub

**Data**: 2025-01-27  
**Progetto**: 22Club Setup V1 Online

---

## 🎯 Scenari Possibili

### Scenario A: Sostituire Repository Esistente con Nuova
Vuoi creare una nuova repository GitHub e sostituire quella attuale (`club_1225`).

### Scenario B: Aggiungere Seconda Repository come Remote
Vuoi mantenere la repository attuale e aggiungere una nuova come remote aggiuntivo.

---

## 📋 Preparazione (Obbligatoria Prima di Qualsiasi Operazione)

### Step 0: Salva i Cambiamenti Attuali

Prima di qualsiasi operazione, committa o salva tutti i cambiamenti:

```powershell
# Vai nella cartella del progetto
cd "c:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online"

# Verifica stato
git status

# Aggiungi tutti i file modificati e nuovi
git add .

# Crea commit
git commit -m "chore: salvataggio stato corrente prima creazione nuova repository"
```

---

## 🔧 Scenario A: Sostituire Repository Esistente

### Step 1: Crea Nuova Repository su GitHub

1. **Vai su GitHub.com** e accedi al tuo account (`dimakushniriuk-art`)
2. **Clicca su "+"** (in alto a destra) → **"New repository"**
3. **Compila i campi**:
   - **Repository name**: `22club-setup-v1` (o il nome che preferisci)
   - **Description**: `22Club Setup V1 Online - Complete Project`
   - **Visibility**: 
     - ✅ **Public** (se vuoi condividerla)
     - ⚠️ **Private** (se vuoi mantenerla privata)
   - ⚠️ **NON inizializzare** con README, .gitignore o license (lasci tutto deselezionato)
4. **Clicca "Create repository"**

### Step 2: Rimuovi Remote Attuale

```powershell
# Verifica remote attuale
git remote -v

# Rimuovi origin attuale
git remote remove origin
```

### Step 3: Collega Nuova Repository

```powershell
# Aggiungi nuovo remote (sostituisci USERNAME e REPO_NAME)
git remote add origin https://github.com/dimakushniriuk-art/22club-setup-v1.git

# Verifica che sia stato aggiunto
git remote -v
```

### Step 4: Push del Codice

```powershell
# Push del branch main (prima volta)
git push -u origin main

# Se hai altre branch (es. master), puoi pusharle dopo:
# git push -u origin master
```

---

## 🔧 Scenario B: Aggiungere Seconda Repository (Multi-Remote)

### Step 1: Crea Nuova Repository su GitHub

Come nello **Scenario A, Step 1**, ma con un nome diverso (es: `22club-backup`)

### Step 2: Aggiungi Remote Aggiuntivo

```powershell
# Mantieni origin attuale, aggiungi un secondo remote
git remote add backup https://github.com/dimakushniriuk-art/22club-backup.git

# Oppure chiamalo diversamente
git remote add secondary https://github.com/dimakushniriuk-art/22club-secondary.git

# Verifica tutti i remote
git remote -v
```

### Step 3: Push su Nuova Repository

```powershell
# Push su nuovo remote
git push -u backup main

# Oppure
git push -u secondary main
```

**Nota**: Con multi-remote, ogni push va fatto esplicitamente:
- `git push origin main` → push su repository principale
- `git push backup main` → push su repository backup

---

## 🔧 Scenario C: Clonare Repository Vuota e Inizializzare

Se preferisci iniziare da zero con una nuova repository:

### Step 1: Crea Repository su GitHub

Come **Scenario A, Step 1**, ma questa volta **INIZIALIZZA** con README.

### Step 2: Clona Repository Locale

```powershell
# Vai nella cartella parent
cd "c:\Users\d.kushniriuk\Desktop\22 Club"

# Clona la nuova repository
git clone https://github.com/dimakushniriuk-art/22club-setup-v1.git 22club-nuova

# Entra nella nuova cartella
cd 22club-nuova
```

### Step 3: Copia File dal Progetto Attuale

```powershell
# Copia tutti i file (escluso .git) dal progetto vecchio
# ATTENZIONE: Questo è un esempio, adatta i percorsi
Copy-Item -Path "..\22club-setup V1 online\*" -Destination "." -Recurse -Exclude ".git"
```

### Step 4: Commit e Push

```powershell
git add .
git commit -m "chore: inizializzazione progetto 22Club"
git push -u origin main
```

---

## ⚙️ Configurazione Opzionale

### Usare SSH invece di HTTPS

Se preferisci SSH (più veloce e sicuro):

```powershell
# Cambia URL da HTTPS a SSH
git remote set-url origin git@github.com:dimakushniriuk-art/22club-setup-v1.git

# Oppure per aggiungere nuovo remote con SSH
git remote add origin git@github.com:dimakushniriuk-art/22club-setup-v1.git
```

**Prerequisito**: Devi avere SSH keys configurate su GitHub.

### Verificare Configurazione SSH

```powershell
# Testa connessione SSH
ssh -T git@github.com

# Se vedi: "Hi dimakushniriuk-art! You've successfully authenticated..."
# Allora SSH è configurato correttamente
```

---

## ✅ Checklist Finale

Prima di considerare completato:

- [ ] Repository creata su GitHub
- [ ] Remote configurato correttamente (`git remote -v`)
- [ ] Tutti i cambiamenti committati
- [ ] Push eseguito con successo (`git push -u origin main`)
- [ ] Codice visibile su GitHub
- [ ] Branch principale corrisponde (`main` o `master`)

---

## 🚨 Risoluzione Problemi Comuni

### Errore: "remote origin already exists"

```powershell
# Rimuovi origin esistente
git remote remove origin

# Oppure cambia URL esistente
git remote set-url origin https://github.com/USERNAME/NEW-REPO.git
```

### Errore: "fatal: refusing to merge unrelated histories"

```powershell
# Usa flag per permettere merge di storie non correlate
git pull origin main --allow-unrelated-histories

# Oppure forza push (se vuoi sovrascrivere)
git push origin main --force
```

### Errore: "authentication failed"

1. **Verifica credenziali GitHub**: GitHub non accetta più password per HTTPS
2. **Usa Personal Access Token (PAT)**:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Genera nuovo token con permessi `repo`
   - Usa token come password quando richiesto
3. **Oppure configura SSH** (consigliato)

---

## 📝 Note Importanti

- **Non eliminare la vecchia repository** finché non hai verificato che la nuova funziona
- **Backup**: Considera di fare backup locale prima di cambiare remote
- **Branch**: Assicurati che la branch principale su GitHub sia `main` (non `master`)
- **File sensibili**: Verifica che `.gitignore` escluda file sensibili (`.env`, `*.log`, ecc.)

---

**Ultimo aggiornamento**: 2025-01-27
