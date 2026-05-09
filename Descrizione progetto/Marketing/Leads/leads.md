# Marketing Leads — Analisi Profonda Atleta

==================================================

## 0. Metadati pagina

==================================================

- **Nome pagina:** Leads (lista + pipeline)
- **URL analizzato:** `http://localhost:3001/dashboard/marketing/leads`
- **Data analisi:** 2026-05-09
- **Cartella creata:** `Descrizione progetto/Atleta/Marketing Leads`
- **File markdown:** `marketing-leads.md`
- **Funzione principale:** `GET /api/marketing/leads`; KPI MetricCard per stato pipeline (`new`, `contacted`, `trial`, `converted`, `lost`), tabs Lista vs Pipeline Kanban con ricerca; lista tabellare con fonte, stato badge, data creazione, link Dettaglio e link profilo se convertito; pipeline per colonne con MetricCard compatte; PATCH stato da Select salvo regole: convertiti bloccano cambio lista; conversione a convertito solo dal dettaglio; toast guida comportamenti.
- **Ruolo UI reale:** Marketing o Admin; messaggio access negato esplicito per altri ruoli.
- **Ruolo principale (analisi atleta):** Per prospects è il cuore **pre-atleta**: dove dubbio, timore e speranza sono nominalizzati in stati — effetto psicologico enorme se transizioni rispettano tempi umani.
- **Tipo workflow:** Triaging lead → spostamento fase (con vincoli) → dettaglio per conversione → (futuro) atleta in app.
- **Tipo stress mentale:** Alto per prospect in trial; medio per staff se pipeline letta come pressione vendita continua.
- **Tipo motivazione:** Passaggio di fase come micro-goal; per atleta futuro: sentirsi guidato invece spinto.
- **Tipo reward psychology:** Progression states come “livelli” psicologici del sì crescente.
- **Tipo engagement:** Cresce con follow-up coerente con fase; crolla con messaggi fuori stato.
- **Tipo continuità:** Continuità del **percorso di entrata** — fratture qui diventano diffidenza duratura.
- **Stato pagina analizzato:** `src/app/dashboard/marketing/leads/page.tsx`.
- **Fonte analisi:** Codice + testi toast/label.
- **Nota ID dinamico:** Nessun `{id}` in questa URL (lista); ID lead nelle righe per dettaglio.

==================================================

## 1. Sintesi breve

==================================================

È la mappa del “quasi atleta”: non è ancora pienamente nel percorso, ma la sua storia è già scritta in stati. Conta perché ogni fase corrisponde a un’emozione (curiosità → contatto → prova → sì/ no). Risolve al club il problema: “dove si inceppa la fiducia prima dell’iscrizione piena?”. Emozione prospect: misto di eccitazione e paura di essere **lead** nel senso freddo del termine. Trasformazione supportata: da anonimo a persona accompagnata lungo il funnel — se cultura interna lo permette. Continuità: quando il passaggio di stato è narrato al prospect come progresso, non come tracciamento.

==================================================

## Sezioni analisi

==================================================

### 1. Contesto reale atleta

Il prospect non vede questa UI. Percepisce DM/email/chiamate. Il contesto mentale è oscillazione tra **desiderio di cambiamento** e **paura di essere venduto**. Trial è zona vulnerabile: micro-impegno che può sembrare grande.

### 2. Workflow reale

Fetch leads → KPI → tab lista/pipeline → ricerca → cambio stato con guardrail → dettaglio per conversione complessa → profilo atleta se già convertito. Loop: stato aggiornato → comunicazione coerente → avanzamento → converted.

### 3. Motivazione e continuità

Motivazione prospect aumenta se messaggi rispecchiano stato (nuovo vs trial). Continuità si rompe se riceve ancora “capture” quando è già caldo o ancora pressione trial quando è solo curioso.

### 4. Stress e frustrazione

Stress: spam cross-fase. Frustrazione staff: stati che non avanzano — rischio linguaggio aggressivo verso prospect.

### 5. Reward psychology

Micro-reward per prospect: sensazione di progresso (“mi avete seguito bene”). Reward tossico: ottimizzare solo conversion senza qualità prova.

### 6. Progress perception

Progress è **fiducia incrementale** nel club. Pipeline visual rende esplicito che esiste un cammino — fuori deve essere raccontato così.

### 7. Fiducia nel trainer

Se pipeline è solo marketing, trainer entra tardi — fiducia fragile. Handoff tempestivo al trial verso trainer reale aumenta permanenza.

### 8. Cognitive Load & Mental Energy

Medio — due viste, KPI multipli. Energia staff: gestibile con routine; rischio overload se lista enorme senza priorità.

### 9. Engagement psychology

Kanban rende gioco positivo per operatori; per prospect engagement dipende da tono messaggi coerenti.

### 10. Habit & Retention loops

Loop lungo: lead → trial → convertito → retention member. Punto critico: trial→converted — emotivamente decisivo.

### 11. Premium Perception

Premium: onboarding trial curato. Cheap: pipeline ok ma esperienza prova banale.

### 12. Emotional reinforcement

Stati colorati/icone rinforzano emozioni staff; prospect riceve rinforzo emotivo solo tramite copy/tempo del follow-up.

### 13. Marketing intelligence

Angolo: “non sei un lead — sei una persona in una fase”. Ads verso prospect devono rispecchiare linguaggio calmo trial.

### 14. Content & creative strategy

Carousel: stati funnel tradotti in messaggi ideali. Reels: role-play trial humanizzato.

### 15. Ecosystem athlete analysis

Dettaglio lead (`/leads/{id}`) per conversione; analytics aggrega funnel; hub KPI misura già membri — tre piani temporali diversi che devono parlarsi.

### 16. Analisi profonda della pagina

La logica “convertito solo dal dettaglio” è psicologicamente saggia: conversione è **atto istituzionale** che merita spazio, note, collegamenti — non swipe veloce. I toast che impediscono conversion dalla lista riduono errori emotivi e operativi: meno conversioni fatte male → meno buyer remorse. Pipeline mobile snap-scroll suggerisce urgenza operativa — utile se non diventa frenesia verso prospect.

### 17. Output finale obbligatorio

- **Riassunto operativo:** Lista/pipeline lead con KPI per stato, PATCH stato con regole, link dettaglio e profilo convertiti.
- **Riassunto emotivo:** Stati come viaggio emotivo — strumento potente se esterno è empatico.
- **Riassunto motivazionale:** Progressione chiara aumenta sicurezza nel passo successivo.
- **Riassunto cognitivo:** Due viste aumentano comprensione situazionale — richiede disciplina uso.
- **Problema reale:** Prospect perso tra messaggi incoerenti con la sua fase mentale.
- **Stress eliminato:** Opacità su dove si blocca il funnel (per staff).
- **Motivazione creata:** Senso di avanzamento reale nel percorso di ingresso.
- **Reward psychology principale:** Progressione percepita + conversione consapevole dal dettaglio.
- **Trasformazione percepita:** Da curiosità a iscrizione senza sensazione truffa.
- **Continuità supportata:** Coerenza comunicazioni lungo stati.
- **Valore percepito:** Club organizzato che non improvvisa primo giorno.
- **Fiducia generata:** Se trial è curato e conversione è dialogo, non scatto.
- **Effetto retention:** Alto potenziale pre-retention: primo giorno membership positivo.
- **Effetto engagement:** Dipende qualità trial + messaggi.
- **Messaggio più forte:** La fase mentale del prospect è sacra — rispettala nei messaggi più che nel CRM.
- **Visual hook più forte:** Pipeline Kanban — metafora viaggio visibile agli operatori.
- **Copy hook più forte:** “Converti in atleta dal dettaglio” — rituale > fretta.
- **Concetto ads più forte:** Non inseguire il sì: accompagna le fasi del dubbio.

**25 Hooks Meta Ads**

1. Non sei un lead: sei una fase del tuo dubbio.
2. Trial: la porta stretta — aprila con rispetto.
3. Pipeline interna visibile, emozione esterna coerente.
4. Convertire dal dettaglio: meno errori, più dignità.
5. Nuovo vs trial: due universi emotivi — non mischiarli.
6. Perso nel funnel: spesso è linguaggio sbagliato, non prodotto sbagliato.
7. KPI colorati per operatori — tono umano per prospect.
8. Il premium è onboarding trial che sembra cura, non trappola.
9. Messaggi che seguono lo stato mentale > frequency.
10. Da curioso a membro: ogni passaggio merita tempo.
11. Marketing che non tratta persone come numeretti CRM.
12. La fiducia pre-iscrizione definisce la retention post-iscrizione.
13. Pipeline Kanban: gioco per staff, serietà per prospect.
14. Toast che salvano conversioni frettolose tossiche.
15. Link profilo convertito: continuità narrativa dell’identità.
16. Fonte lead: contesto reale — usa quel contesto nel primo messaggio.
17. Contattato ≠ convinto: ascolto lungo.
18. Trial non è sconto: è vulnerabilità.
19. Convertito: decisione grande — merita schermata dedicata.
20. Perso: dolore reale — impara senza insultare.
21. Ricerca lead: trova vite, non record.
22. Pipeline mobile: operatività senza fretta verso umani.
23. Meno “chiudi”, più “capisci”.
24. Il retention inizia quando ancora stai vendendo.
25. TrainerDesk: stati interni che devono suonare come cura esterna.

**25 Headlines**

1. Lead funnel: emozioni in sequenza.
2. Trial: zona fragile — trattala bene.
3. Converti dal dettaglio: più coscienza, meno rimpianti.
4. Pipeline visibile, cuore umano invisibile finché non parli bene.
5. Stati lead: mappa del dubbio.
6. Nuovo, contattato, prova: tre battiti diversi.
7. Perso: impara — non colpire.
8. KPI lead: ritmo del mercato interno.
9. Lista e Kanban: stessi dati, due intelligenze.
10. Coerenza stato-messaggio: regola d’oro.
11. Marketing leads: pre-retention.
12. Da prospect a persona nel percorso.
13. Il funnel è una scala emotiva.
14. Toast salva-conversione: etica operativa.
15. Meno spam cross-fase, più fiducia.
16. Fonte lead racconta dove hai trovato la persona — rispetta quel contesto.
17. Convertito con profilo: storia continua.
18. Pipeline non è FIFA manager delle persone.
19. Messaggi giusti al stato giusto.
20. Il premium è prova che sembra allenamento vero.
21. Trial come assaggio di cultura club.
22. Marketing che misura stati senza snaturare anime.
23. La conversione è dialogo — non click.
24. Lead perso: analisi, non disprezzo.
25. TrainerDesk: funnel caldo dentro, tono caldo fuori.

**25 Subheadlines**

1. Tabs Lista/Pipeline per coprire due stili decisionali staff.
2. MetricCard KPI aiuta priorità senza perdere umanità (se disciplina).
3. PATCH con guardrail: convertiti bloccati — evita caos e rispetta gravità.
4. Conversione verso convertito solo da dettaglio: ritualità positiva.
5. Toast guida: riduce errori di processo e di tono.
6. Link profilo atleta post conversione: continuità record.
7. Pipeline colonne per stato: visual reminder che persone si muovono nel tempo.
8. Ricerca nome/email: precisione umana.
9. Badge stato: traduzione necessaria in linguaggio esterno non tecnico.
10. Fonte visibile: contestualizza primo contatto.
11. Lista vuota: occasione per migliorare acquisizione senza disperare.
12. Mobile snap columns: operatività veloce ma rischio fretta — attenzione.
13. Contattato ≠ client: ancora bisogno di ascolto.
14. Trial: follow-up trainer dovrebbe essere nel piano.
15. Persi: win-back possibile con tact — non con aggressività.
16. KPI totali: respira prima di reagire ai numeri.
17. Coerenza interna/esterna aumenta trust prospect.
18. Meno pressione vendita, più accompagnamento stato-per-stato.
19. Kanban come empathy trainer per staff (vedi colonne vuote piene di significato).
20. Errori: trattare prospect come numeri in churn stats.
21. Lead marketing è cuore commerciale — batte anche se silenzioso.
22. Migliora copy esterni usando labels stati come checklist emozionale.
23. Collegamento analytics funnel: stessa storia da due angolazioni.
24. Premium perception quando trial è indistinguibile da servizio reale.
25. Il funnel finisce in persona — non in pagamento.

**25 Hooks Instagram**

1. Trial non è prova prodotto — è prova di fiducia.
2. Lead perso: qualcuno ha bisogno di un messaggio diverso, non di più pressione.
3. Pipeline: per operatori; cura: per persone.
4. Converti dal dettaglio — perché il sì grande merita spazio.
5. Stato “nuovo”: curiosità fragile.
6. Stato “contattato”: attenzione — non stalking.
7. Stato “trial”: vulnerabilità massima.
8. Convertito: inizio nuovo mondo — trattalo bene.
9. Perso: dolore — impara.
10. KPI colorati: emozioni staff — non dimenticare destinatario esterno.
11. Marketing leads: dove nasce la retention.
12. Non mischiare messaggi di fasi diverse: dissonanza cognitiva = no.
13. Fonte lead importa: Instagram ≠ referral amico.
14. Kanban visibile: ricorda che sono persone in movimento.
15. Toast salva errori: piccolo testo, grande etica.
16. Il premium è coerenza lungo il funnel.
17. Messaggi che seguono stati: miracolo silenzioso.
18. Da prospect a membro: continuità identitaria.
19. Pipeline non è gioco se fuori c’è ansia reale.
20. Trial curato > sconto grande.
21. Il funnel è una scala di fiducia.
22. Marketing che rispetta tempi umani vince silenziosamente.
23. Convertito: apri profilo — storia intera.
24. Riduci buyer remorse con onboarding serio.
25. TrainerDesk: stati interni, anime esterne.

**25 Hooks TikTok**

1. POV: sei in trial e ti scrivono come se fossi ancora “nuovo” — cringe totale.
2. Lead ≠ numero: sei una fase del dubbio.
3. Converti dal dettaglio: il sì impulsivo crema buyer remorse.
4. Pipeline Kanban per operatori — ma fuori serve voce umana.
5. Trial: zona fragile — se sbagli tono, perdi fiducia per sempre.
6. Stati funnel tradotti in emozioni — impara a parlare.
7. Toast anti-conversione frettolosa: micro-etica.
8. Perso nel funnel: spesso è copy sbagliato, non prezzo.
9. KPI lead alti: non festeggiare se trial fa schifo.
10. Fonte lead importa: contesto importa.
11. Marketing leads: pre-retention che nessuno vede ma tutti sentono.
12. Kanban: columns filled with lives — not stats.
13. Contattato ≠ convinto: smetti di inseguire come shark.
14. Convertito: nuova vita — onboarding vero.
15. Pipeline mobile: veloce dentro, calmo fuori — regola.
16. Messaggi coerenti col stato: skill rare.
17. Il premium è prova che sembra allenamento vero.
18. Trial curato batte sconto tossico.
19. Lead perso: non insultare — capisci.
20. Stati CRM come stati mentali — rispetta.
21. Non chiudere come Wolf of Wall Street — chiudi come coach.
22. Il funnel è emotivo — anche se sembra tech.
23. Trainer handshake nel trial: retention rocket.
24. Converti con dialogo — non con trick.
25. TrainerDesk: funnel interno, cura esterna.

**10 Idee Reels**

1. Role-play tre messaggi per tre stati — differenza tono.
2. Spiegazione trial vulnerabile in 30s.
3. Behind the scenes: perché conversione solo da dettaglio (etica).
4. Reaction a DM incoerenti con stato — examples.
5. Split: pressione vs accompagnamento nella pipeline.
6. FAQ: “lead perso” come imparare senza toxic positivity.
7. Clip ironica: CRM dice trial, DM dice “offerta lampo” — fix.
8. Mini-corso: leggere colonna “persi” senza cinismo.
9. Founder: come leggere KPI senza transferred anxiety al team.
10. Facecam: “non inseguire stati — accompagna persone”.

**10 Idee Carousel**

1. 5 messaggi giusti per ogni stato lead.
2. Cosa significa trial emotivamente (non commerciale).
3. Errori comuni cross-fase messaging.
4. Checklist prima di spostare stato (qualità conversazione).
5. Fonti lead: come cambia il primo contatto.
6. Convertito: onboarding ideal day 1.
7. Persi: strategie win-back empatiche.
8. KPI pipeline: come non ossessionarsi.
9. Kanban per operatori: come evitare frenesia verso prospect.
10. Dal dettaglio converti: ritualità che riduce rimpianti.

**10 Idee Stories**

1. Poll: “Ti ha mai infastidito un messaggio fuori fase?”
2. Quiz: indovina stato da messaggio ricevuto.
3. Sticker Sì/No: “Mi piace trial come prova reale”.
4. Domanda: “Cosa ti ha fatto dire sì?”
5. Countdown trial day-by-day — gentile.
6. Behind the scenes: toast internal rules — trasparenza cultura.
7. Mini-survey: tono preferito durante trial.
8. Ringraziamento prospect convertiti — umano.
9. Promemoria: stati ≠ persone — ma guidano tono.
10. Link a principi funnel empatici.

**10 Idee Static Ads**

1. Headline “Il funnel è una scala di fiducia”.
2. Visual: colonne Kanban astratte + cuori piccoli metaforici.
3. Quote su trial curato.
4. Before/After: DM stato sbagliato vs giusto.
5. Icone stati come emoji emotive.
6. Annuncio B2B: onboarding trial come retention weapon.
7. Messaggio premium: coerenza stato-messaggio.
8. Static “converti dal dettaglio” — copy sereno.
9. Contrasto: pressione vendita vs accompagnamento.
10. Brand: funnel caldo.

**10 Angoli emotivi**

1. Eccitazione da nuovo lead.
2. Ansia in trial.
3. Sollevamento alla conversione consapevole.
4. Delusione lead perso.
5. Fastidio da messaggi incoerenti.
6. Fiducia quando trial è reale.
7. Vergogna post-acquisto se trial ingannevole.
8. Speranza quando prospect sente ascolto.
9. Rabbia se pressure sales.
10. Gratitudine per onboarding umano.

**10 Angoli motivazionali**

1. Progressione stato-per-stato aumenta sicurezza.
2. Trial come micro-impegno verso identità nuova.
3. Convertito come scelta consapevole — meno rimpianti.
4. Motivazione da messaggi coerenti col dubbio attuale.
5. Orgoglio quando club rispetta tempi.
6. Volontà di restare se trial somiglia a vita reale member.
7. Piccoli sì intermedi verso grande sì finale.
8. Disciplina gentile nel follow-up.
9. Non forzare conversione — facilitare chiarezza.
10. Identità “faccio sul serio” già nel trial.

**10 Angoli cognitivi**

1. Stati come riduzione complessità decisionale staff.
2. Guardrail conversione: prevenzione errori sistemici.
3. Dissonanza se messaggio ≠ stato.
4. Fonte lead come priors conversazionali.
5. Kanban come spatial memory per priorità.
6. Lista vs pipeline: due cognitive styles operatori.
7. KPI per stato: evitare misinterpretazioni aggregate.
8. Ricerca riduce rumore cognitivo su liste lunghe.
9. Effetto “converted lock”: gravità decisionale giusta.
10. Prospect mental model vs CRM states — allinea.

**10 Angoli trasformazione**

1. Da dubbio a prova reale.
2. Da lead freddo a membro caldo.
3. Da incertezza a onboarding chiaro.
4. Da pressione a percorso.
5. Da funnel tossico a funnel empatico.
6. Da conversione impulsiva a conversione consapevole.
7. Da spam a sequencing intelligente.
8. Da CRM freddo a voce calda.
9. Da stati astratti a messaggi concreti.
10. Da paura vendita a fiducia servizio.

**10 Angoli engagement**

1. Messaggi coerenti aumentano risposta.
2. Trial qualità aumenta completion.
3. Handoff trainer aumenta trust e usage app.
4. Riduzione messaggi fuori fase riduce irritazione.
5. Onboarding day 1 definisce abitudine app.
6. Follow-up trial come coaching micro-session.
7. Win-back gentile su persi può riaprire porta.
8. Link profilo convertito mantiene narrativa unica.
9. MetricCard KPI aiuta staff a non improvvisare tono.
10. Engagement prospect correlato a empatia operatoria.

**10 Angoli relatable**

1. Essere in trial e sentirsi pressati dal prezzo.
2. Ricevere tre messaggi uguali da stati diversi.
3. Dire sì e pentirsi perché trial era finto.
4. Curiosità iniziale spenta da spam.
5. Voler provare ma temere impegno ridicolizzato.
6. DM che ignorano la tua vita (lavoro turni).
7. Sentirsi “lead” in una chat fredda.
8. Avere bisogno di tempo ma ricevere urgenza artificiale.
9. Prova in palestra imbarazzante — trial mal progettato.
10. Entrare e sentirsi già giudicato.

**10 Micro-frustrations**

1. Messaggi fuori stato.
2. Urgenza artificiale.
3. Trial che non assomiglia a membership.
4. Tre persone che scrivono senza coordinamento.
5. Tone deaf dopo “perso”.
6. Conversione frettolosa che crea rimpianti.
7. Coupon al posto della comprensione.
8. Ignorare fonte lead nel primo contatto.
9. KPI che spingono staff a pressare prospect.
10. CRM language spill into WhatsApp.

**10 Micro-rewards**

1. Messaggio che rispecchia stato attuale.
2. Trial che sembra allenamento vero.
3. Conversione dal dettaglio con spazio per domande.
4. Toast che salvano errori di processo.
5. Passaggio stato celebrato internamente come cura esterna.
6. Handoff trainer liscio nel trial.
7. Link profilo convertito — continuità.
8. Ricerca rapida per rispondere bene.
9. Kanban che rende visibile progresso reale.
10. Copy checklist basata su labels stati.

**10 Scene realistiche**

1. Lunedì: colonna “nuovi” piena — primo contatto empatico batch.
2. Martedì: trial — trainer entra per sessione prova seria.
3. Mercoledì: converted — onboarding email che matcha promessa trial.
4. Giovedì: persi — analisi senza crap talking del prospect.
5. Venerdì: ricerca nome — follow-up contestuale referral amico.
6. Mobile: pipeline scroll mentre si cammina in sala — decisioni rapide ma tono calmo dopo.
7. Due operatori: uno lista uno Kanban — stessa humanità richiesta.
8. Lead perso per prezzo — win-back dopo settimane con nuova offerta umana (non solo sconto).
9. Convertito: click profilo — coach legge storia completa prima del day 1.
10. Stati bloccati per converted — evita casino amministrativo — calma psicologica.

**10 Scene scroll-stopping**

1. Testo enorme: “Il trial è vulnerabilità”.
2. Split DM: stato sbagliato vs giusto — stesso prospect.
3. Clip 2s: Kanban columns — VO “ogni colonna è una emozione”.
4. Reaction founder: leggere colonna persi senza cinismo.
5. Animazione stato che cambia — suono soft success (non slot machine).
6. Zoom su toast “conversione dal dettaglio” — etica.
7. Ironia: “lead” termine CRM — overlay “persona”.
8. Facecam operator: “non chiudo lead — accompagno”.
9. Stop motion stati: new→converted come gradini fisici.
10. VO prospect: “mi avete capito nella mia fase”.

**5 emozioni principali**

1. Curiosità.
2. Ansia (trial).
3. Eccitazione (conversione positiva).
4. Delusione (perso).
5. Rabbia (pressure).

**5 paure principali**

1. Essere venduti.
2. Impegno sbagliato.
3. Trial imbarazzante.
4. Prezzo nascosto.
5. Essere inseguiti.

**5 desideri principali**

1. Capire se il club è davvero “suo”.
2. Prova onesta prima del grande impegno.
3. Tempo per decidere senza vergogna.
4. Sentire trainer vero nel trial.
5. Chiarezza economica e di servizio.

**5 trigger motivazionali**

1. Desiderio di cambiamento corporeo/sociale.
2. Offerta trial limitata nel tempo (usare senza tossicità).
3. Prova sociale (amici nel club).
4. Obiettivi salute concreti.
5. Paura di restare fermi.

**Prima vs Dopo**

- **Prima:** funnel frammentato e messaggi incoerenti — diffidenza.
- **Dopo:** stati rispettati nella comunicazione — fiducia che anticipa retention.

**La frase che vende davvero la pagina**
“Ogni stato è una emozione diversa — parla come se lo sapessi.”
