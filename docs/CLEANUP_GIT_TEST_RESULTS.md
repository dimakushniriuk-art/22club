# 🧹 Cleanup Git - Test Results e Artefatti Playwright

**Data:** ${new Date().toISOString().split('T')[0]}
**Obiettivo:** Rimuovere file di test Playwright e artefatti temporanei dal tracking Git

---

## ✅ .gitignore Aggiornato

Aggiunte le seguenti regole a `.gitignore`:

```gitignore
# Playwright / E2E tests
test-results/
playwright-report/
.last-run.json
tmp-pw*/
tmp-e2e/
```

---

## 📋 File da Rimuovere dal Tracking Git

Se i file sono già tracciati da Git, devono essere rimossi dal tracking (ma NON cancellati dal filesystem):

```bash
# Rimuovi directory test-results/ dal tracking Git (mantieni file locali)
git rm -r --cached test-results/

# Rimuovi directory playwright-report/ dal tracking Git (mantieni file locali)
git rm -r --cached playwright-report/

# Rimuovi file .last-run.json dal tracking Git (mantieni file locale)
git rm --cached .last-run.json

# Rimuovi cartelle temporanee tmp-pw* e tmp-e2e/ dal tracking Git
git rm -r --cached tmp-pw*/
git rm -r --cached tmp-e2e/
```

**⚠️ IMPORTANTE:** Il flag `--cached` rimuove i file solo dal tracking Git, NON li cancella dal filesystem.

---

## 🔍 Verifica Stato

### Prima del Cleanup

```bash
# Verifica file tracciati
git ls-files test-results/ playwright-report/ .last-run.json tmp-pw*/ tmp-e2e/

# Verifica file in git status
git status --porcelain | grep -E "test-results|playwright-report|tmp-|\.last-run"
```

### Dopo il Cleanup

```bash
# Verifica che non siano più tracciati
git ls-files test-results/ playwright-report/ .last-run.json tmp-pw*/ tmp-e2e/
# Dovrebbe essere vuoto

# Verifica che .gitignore funzioni
git check-ignore -v test-results/ playwright-report/ .last-run.json tmp-pw1/ tmp-e2e/
# Dovrebbe mostrare le regole .gitignore corrispondenti
```

---

## 📝 Commit

Dopo aver rimosso i file dal tracking:

```bash
# Aggiungi .gitignore aggiornato
git add .gitignore

# Commit cleanup
git commit -m "chore: aggiorna .gitignore per escludere test-results e artefatti Playwright"
```

---

## ⚠️ Note

1. **File già tracciati:** Se `test-results/` o `playwright-report/` erano già committati, devono essere rimossi dal tracking con `git rm --cached`.

2. **File locali:** I file rimangono sul filesystem locale, vengono solo rimossi dal tracking Git.

3. **Collaboratori:** I collaboratori che fanno `git pull` vedranno i file rimossi dal loro repository locale (ma possono essere rigenerati eseguendo i test).

4. **CI/CD:** Assicurati che le pipeline CI/CD non committino questi file (verifica `.github/workflows/*.yml`).

---

## ✅ Checklist Post-Cleanup

- [ ] `.gitignore` aggiornato con regole Playwright
- [ ] File rimossi dal tracking Git (`git rm --cached`)
- [ ] Verificato che `git check-ignore` funzioni
- [ ] Verificato che `git status` non mostri più questi file
- [ ] Commit effettuato
- [ ] Push su repository remoto (opzionale)
