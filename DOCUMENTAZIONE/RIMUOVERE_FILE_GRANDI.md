# 🔧 Rimozione File Grandi dalla Storia Git

**Problema**: File ZIP nella storia Git superano il limite di 100 MB di GitHub:
- `22club-setup V1 online.zip` (326.35 MB)
- `22club-setup Design OK .zip` (306.75 MB)
- `22club-setup 1.zip` (277.16 MB)
- `22ClubV1.zip` (231.33 MB)

## ✅ Soluzione: Rimuovere dalla Storia Git

### Opzione 1: Usare BFG Repo-Cleaner (Consigliato - Più Veloce)

```powershell
# 1. Installa BFG (se non ce l'hai)
# Scarica da: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Crea backup
git clone --mirror "c:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\.git" backup.git

# 3. Rimuovi file ZIP
java -jar bfg.jar --delete-files "*.zip" "c:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\.git"

# 4. Pulisci repository
cd "c:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online"
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Push forzato
git push origin main --force
```

### Opzione 2: Usare git filter-branch (Nativo Git)

```powershell
# 1. Rimuovi tutti i file ZIP dalla storia
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch *.zip" --prune-empty --tag-name-filter cat -- --all

# 2. Pulisci repository
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. Push forzato
git push origin main --force
```

### Opzione 3: Rimuovere File Specifici

Se vuoi rimuovere solo file specifici:

```powershell
# Rimuovi file specifici dalla storia
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch '22club-setup V1 online.zip' '22club-setup Design OK .zip' '22club-setup 1.zip' '22ClubV1.zip'" --prune-empty --tag-name-filter cat -- --all

# Pulisci
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push
git push origin main --force
```

---

## ⚠️ ATTENZIONE

- Queste operazioni modificano la storia Git
- Tutti i collaboratori dovranno rifare il clone o fare rebase
- Assicurati di avere un backup prima di procedere

---

**Nota**: Se i file ZIP non servono più nel repository, questa è la soluzione corretta.
Se invece i file sono importanti, considera di usare **Git LFS** (Large File Storage).
