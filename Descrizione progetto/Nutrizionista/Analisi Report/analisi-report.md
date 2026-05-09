# TRAINERDESK — Report analisi area Nutrizionista (staff + effetto atleta)

**Data report:** 2026-05-09  
**Scope:** URL menu/dashboard nutrizionista (`/dashboard/nutrizionista/...`) e hub atleta ` /home/nutrizionista` dove indicato.  
**Gold standard strutturale:** `Descrizione progetto/Atleta/Home/home.md`

## Conteggi

| Categoria                                                                         | N.                                                                                                        |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **GIÀ FATTA** (file esistente, non sovrascritto)                                  | 1                                                                                                         |
| **COMPLETATA** (documento allineato al template in questa / precedenti passate)   | 10                                                                                                        |
| **APERTA / MANCANTE** (documento da creare o completare al template pieno)        | 5                                                                                                         |
| **DINAMICA NON RISOLTA** (serve UUID reale o dati in sessione per analisi “live”) | 2                                                                                                         |
| **ERRORE / CORREZIONE**                                                           | 1 (file `nuovo-piano-nutrizionista.md` — sezione TikTok e tail corrotti; **ripulito in questa sessione**) |

### GIÀ FATTA

- `http://localhost:3001/home/nutrizionista` → `Descrizione progetto/Atleta/Nutrizionista/nutrizionista.md` (per policy anti-duplicati non sovrascritto).

### COMPLETATA (file presenti sotto `Descrizione progetto/Atleta/...`)

| #   | Pagina                  | URL (esempio)                                  | File                                                               | Note qualità                                                                                              |
| --- | ----------------------- | ---------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 1   | Dashboard nutrizionista | `/dashboard/nutrizionista`                     | `Dashboard Nutrizionista/dashboard-nutrizionista.md`               | Analisi staff + impatto a valle                                                                           |
| 2   | Calendario              | `.../nutrizionista/calendario`                 | `Calendario Nutrizionista/calendario-nutrizionista.md`             | —                                                                                                         |
| 3   | Atleti                  | `.../nutrizionista/atleti`                     | `Atleti Nutrizionista/atleti-nutrizionista.md`                     | —                                                                                                         |
| 4   | Dettaglio atleta        | `.../nutrizionista/atleti/{id}`                | `Dettaglio Atleta Nutrizionista/dettaglio-atleta-nutrizionista.md` | **DINAMICA NON RISOLTA** `{id}`                                                                           |
| 5   | Chat                    | `.../nutrizionista/chat`                       | `Chat Nutrizionista/chat-nutrizionista.md`                         | —                                                                                                         |
| 6   | Analisi                 | `.../nutrizionista/analisi`                    | `Analisi Nutrizionista/analisi-nutrizionista.md`                   | —                                                                                                         |
| 7   | Piani                   | `.../nutrizionista/piani`                      | `Piani Nutrizionista/piani-nutrizionista.md`                       | —                                                                                                         |
| 8   | Nuovo piano             | `.../nutrizionista/piani/nuovo` (+ `?atleta=`) | `Nuovo Piano Nutrizionista/nuovo-piano-nutrizionista.md`           | **Corretto** (TikTok 1–25 in italiano, sezioni Idee/Scene a 10 voci, micro pulizia termini)               |
| 9   | Abbonamenti (redirect)  | `.../nutrizionista/abbonamenti`                | `Abbonamenti Nutrizionista/abbonamenti-nutrizionista.md`           | **Nuovo**; UX reale su `/dashboard/abbonamenti?service=nutrition`; pass italiano di pulizia meta/simplify |

### APERTA / MANCANTE (cartelle/file non ancora in repo)

| #   | Pagina             | URL (esempio)                    | Stato        | Entrypoint codice                                                                                                 |
| --- | ------------------ | -------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Impostazioni       | `.../nutrizionista/impostazioni` | **MANCANTE** | `src/app/dashboard/nutrizionista/impostazioni/page.tsx` (auto config, adattive, duplicazione piano, cookie)       |
| 2   | Progressi          | `.../nutrizionista/progressi`    | **MANCANTE** | `src/app/dashboard/nutrizionista/progressi/page.tsx` (timeline, overview, sort, export PDF)                       |
| 3   | Documenti          | `.../nutrizionista/documenti`    | **MANCANTE** | `src/app/dashboard/nutrizionista/documenti/page.tsx` (tab categorie: dossier, referti, certificati, piani, altro) |
| 4   | Check-in (lista)   | `.../nutrizionista/checkin`      | **MANCANTE** | `src/app/dashboard/nutrizionista/checkin/page.tsx` (`nutrition_check_ins`, dialog creazione)                      |
| 5   | Dettaglio check-in | `.../nutrizionista/checkin/{id}` | **MANCANTE** | `src/app/dashboard/nutrizionista/checkin/[id]/page.tsx`                                                           |

### DINAMICA NON RISOLTA (dettaglio)

- Dettaglio atleta: `{athleteId}` / `{id}` senza UUID sessione reale — già annotato nel doc dedicato.
- Dettaglio check-in: `{id}` deve essere UUID valido (`isUuid` in pagina) — stesso vincolo.

## Qualità globale

- **Nuovo piano:** ripristino completo dalla corruzione (meta/simplify in TikTok); allineamento conteggi a `home.md` per blocchi Idee (10×4), Scene (10+10), ecc.; residual English sistemato dove individuato (es. _workflow_, _shame loop_, _throughput_ → italiano).
- **Abbonamenti:** documento nuovo con redirect documentato; è stata necessaria una **sanificazione automatica** delle righe meta/simplify e ripristino newline; restano termini anglofoni minori in alcuni hook social (es. POV, Split screen, TikTok) dove sono uso corrente in brief creativi — opzionale ulteriore pass solo italiano.

## Prossimi passi consigliati

1. Generare i **5 file mancanti** allo stesso livello di completezza di `nuovo-piano-nutrizionista.md` / `home.md`, usando i path sopra.
2. Opzionale: secondo pass solo italiano su `abbonamenti-nutrizionista.md` per rimuovere anglicismi rimasti nei blocchi hook.

---

_Report generato nell’ambito del sistema di analisi athlete-centric staff-facing._
