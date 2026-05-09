# Marketing Analytics — Analisi Profonda Atleta

==================================================

## 0. Metadati pagina

==================================================

- **Nome pagina:** Analytics Marketing
- **URL analizzato:** `http://localhost:3001/dashboard/marketing/analytics`
- **Data analisi:** 2026-05-09
- **Cartella creata:** `Descrizione progetto/Atleta/Marketing Analytics`
- **File markdown:** `marketing-analytics.md`
- **Funzione principale:** `GET /api/marketing/analytics` — KPI lead (totali, nuovi 7d, conversion 30d), campagne attive, budget attivo, funnel lead 30d (nuovi/contattati/trial/convertiti/persi), trend lead 7d per giorno e 30d per settimana, blocco “Atleti activity” (coached/solo 7d e 30d, atleti inattivi >30d), elenco campagne attive con eventi 7d.
- **Ruolo UI reale:** Marketing o Admin.
- **Ruolo principale (analisi atleta):** Prospettiva **ecosistema**: l’atleta subisce **timing** e **pertinenza** delle iniziative che nascono da qui.
- **Tipo workflow:** Lettura panoramica funnel + trend + inattività → pianificazione campagne/azioni.
- **Tipo stress mentale:** Medio per operatori (molte variabili); per atleta: stress da **sovra-comunicazione** o da **silenzio** se analytics non diventa azione.
- **Tipo motivazione:** Motivazione staff a colmare buchi funnel; per atleta: motivazione se messaggi diventano **utili** e non rumorosi.
- **Tipo reward psychology:** Reward indiretto: meno “messaggi a caso”, più “capito dove sono nel percorso”.
- **Tipo engagement:** Aumenta se campagne e follow-up sono calibrati su trend reali; cala se funnel è letto come gioco numerico fine a sé.
- **Tipo continuità:** Continuità **commerciale-formativa** (lead→trial→convertito) incrocia continuità **allenamento** (coached/solo, inattivi).
- **Stato pagina analizzato:** `src/app/dashboard/marketing/analytics/page.tsx`.
- **Fonte analisi:** Codice + payload `AnalyticsPayload`.
- **Nota ID dinamico:** Nessun `{id}`.

==================================================

## 1. Sintesi breve

==================================================

È la pagina che unisce **vendita** e **presenza in allenamento**: funnel lead e attività atleti negli stessi occhiali temporali (7/30 giorni). Conta perché evita il tunnel vision: non puoi celebrare conversioni ignorando inattività. Risolve il problema del marketing: “stiamo riempiendo l’imbuto o stiamo perdendo chi è già dentro?”. Emozione atleta (indiretta): rassicurazione se il club usa i dati per **ridurre rumore** e aumentare supporto; irritazione se usa trend solo per spingere promo. Trasformazione supportata: da marketing rumoroso a marketing **ritmato**. Continuità: quando l’inattività >30d viene vista come segnale di salute del servizio, non come colpa individuale.

==================================================

## Sezioni analisi

==================================================

### 1. Contesto reale atleta

L’atleta non vede funnel e trend. Percepisce email, DM, promemoria, inviti. Il contesto psicologico è continuità fragile tra **“sto provando”** e **“mi impegno”**: il funnel lead racconta dove una persona è nel dubbio; gli indicatori coached/solo raccontano se sta camminando sola o accompagnata.

### 2. Workflow reale

Caricamento analytics → lettura KPI superiori → interpretazione funnel 30d → lettura trend (settimanale/giornaliero) → confronto con attività atleti e inattivi → decisione su campagne attive/eventi 7d → aggiustamenti fuori pagina (copy, frequenza, coaching). Loop: misura → taglia rumore → misura di nuovo.

### 3. Motivazione e continuità

Motivazione atleta sale quando comunicazioni rispecchiano stato reale (trial vs già cliente “calato”). Continuità si rompe quando chi è in prova riceve messaggi da “già convertito” o viceversa — analytics serve proprio a evitare quella dissonanza.

### 4. Stress e frustrazione

Stress atleta: overload di touchpoint coordinati male. Frustrazione staff: funnel che non chiude — rischio di trasferire pressione su toni aggressivi. La card inattivi >30d è emotivamente potente: può generare **cura** o **ansia da performance** se letta senza empatia.

### 5. Reward psychology

Reward etico: messaggi giusti al momento giusto (micro-congruenza). Reward tossico: ottimizzare solo conversion rate senza qualità dell’esperienza post-acquisto.

### 6. Progress perception

Progress non è solo funnel commerciale: coached/solo 7d e 30d sono **progresso comportamentale**. Percepito migliora quando il club parla di presenza e abitudine, non solo di acquisto.

### 7. Fiducia nel trainer

Se analytics porta a campagne che rubano voce al trainer, fiducia si sposta. Se porta a **handoff** trainer su inattività, fiducia si compone: dati supportano relazione, non la sostituiscono.

### 8. Cognitive Load & Mental Energy

Medio: più blocchi di informazioni rispetto all’hub KPI. Richiede sintesi mentale (collegare trend lead e inattività). Energia: sostenibile se la pagina è usata con routine (es. review settimanale), tossica se ossessiva giornaliera.

### 9. Engagement psychology

Engagement positivo quando eventi campagna e segmentazione rendono contenuti pertinenti. Negativo quando aumentano merely touches senza valore.

### 10. Habit & Retention loops

Loop lead: nuovo → contatto → trial → convertito/perduto — ogni passaggio è emotions-heavy. Loop atleta: attivo ↔ inattivo — analytics rende visibile il **punto di rottura** temporale.

### 11. Premium Perception

Premium: intelletto operativo — “ci pensiamo prima che tu debba chiedere”. Cheap: sensazione retargeting aggressivo alimentato da funnel.

### 12. Emotional reinforcement

Rinforzo positivo: messaggi che sembrano **capirti**. Negativo: sensazione di essere un lead nel mirino.

### 13. Marketing intelligence

Messaggio: “Crescita sana = funnel + persone che restano presenti”. Ads possono enfatizzare **coerenza** più di sconti.

### 14. Content & creative strategy

Storytelling: founder che collega nuovi lead settimanali con qualità dell’onboarding. Carousel: “cosa significa inattivo >30 giorni emozionalmente”.

### 15. Ecosystem athlete analysis

Collegamenti: Campagne (budget/eventi), Automazioni/segmenti (a valle), Leads (dettaglio stato), Hub KPI (granularità workout diversa). Analytics è **ponte** tra acquisizione e retention operativa.

### 16. Analisi profonda della pagina

La forza è il **doppio binario** lead + attività atleti nello stesso screen: impedisce marketing myopia. La fragilità è morale: l’inattivo può essere trattato come “problema da bonificare”; la lettura umana lo trasforma in **persona da riaccompagnare**. I trend aiutano a spegnere panico reattivo: si vede se è un buco temporaneo o un pattern.

### 17. Output finale obbligatorio

- **Riassunto operativo:** Dashboard analytics marketing con KPI lead, funnel 30d, trend 7/30d, attività atleti, campagne attive ed eventi.
- **Riassunto emotivo:** Da “numeri freddi” a “quadro della relazione” se lettura è empatica.
- **Riassunto motivazionale:** Più azioni giuste, meno spam — più spazio per allenarsi davvero.
- **Riassunto cognitivo:** Alto livello, richiede sintesi cross-metrica.
- **Problema reale:** Disallineamento tra promesse commerciali e continuità reale in palestra/app.
- **Stress eliminato:** Incertezza su dove sta perdendo il club persone (funnel + inattività).
- **Motivazione creata:** Opportunità di messaggi pertinenti che rispettano la fase mentale.
- **Reward psychology principale:** Congruenza comunicativa (sentirsi capiti nel proprio step).
- **Trasformazione percepita:** Da marketing rumoroso a marketing che accompagna.
- **Continuità supportata:** Allinea outreach temporale con comportamento reale.
- **Valore percepito:** Club intelligente, non solo rumoroso.
- **Fiducia generata:** Se lead/inattivi portano a trainer umani, non solo ads.
- **Effetto retention:** Alto se agisce su cause (guida, scheduling), basso se solo offerte.
- **Effetto engagement:** Dipende qualità delle azioni successiva alla lettura.
- **Messaggio più forte:** Non inseguire click: insegui presenza.
- **Visual hook più forte:** Blocco inattivi — rischio/realtà immediata.
- **Copy hook più forte:** “Ultimi 7 / 30 giorni” — tempo come bussola emotiva.
- **Concetto ads più forte:** Il funnel dice chi sei oggi; l’allenamento dice se resterai.

**25 Hooks Meta Ads**

1. Lead che entrano e atleti che spariscono: la dashboard che ti impedisce di fingere.
2. Funnel + inattività: due verità che devono parlarsi.
3. Trend settimanali: meno panico, più strategia.
4. Conversion rate senza continuità allenamento è solo ego.
5. Marketing che guarda anche chi già ti ha detto sì.
6. Il retention non è un retarget: è presenza.
7. Nuovi lead 7d: entusiasmo misurabile — ma a chi stai già perdendo?
8. Eventi campagna: rumore utile o rumore inutile?
9. Coached vs solo: dove sono le persone nella vita reale.
10. Inattivi >30d: campanello di salute del servizio.
11. Analytics che dice “quando” prima di “quanto”.
12. Meno messaggi random, più messaggi giusti.
13. Il premium è coerenza tra promessa e disciplina quotidiana.
14. Il funnel racconta il dubbio — il trainer può risolverlo.
15. Budget attivo: soldi ben spesi solo se non tradici voce umana.
16. Da KPI a empatia: il passaggio fragile.
17. La crescita sana non è solo inbox piena.
18. Persi nel funnel: dolore reale — non solo perdita revenue.
19. Trial non è gioco: è soglia emotiva.
20. Analytics come termometro, non frusta.
21. Più dati, meno supposizioni tossiche sugli atleti.
22. Chi è contattato ma non converte: ascolto prima di pressione.
23. Campagne attive: si sentono nella vita delle persone.
24. Marketing intelligente = silenzio dove serve e voce dove conta.
25. Il vero KPI finale è chi torna ad allenarsi — non chi clicca.

**25 Headlines**

1. Funnel e frequenza: la mappa completa.
2. Analytics che non tradisce chi è già dentro.
3. Inattività visibile, vergogna evitabile.
4. Trend lead: meno improvvisazione, più rispetto.
5. Marketing analytics con occhio umano.
6. Da nuovi lead a vecchi assenti: leggi entrambi.
7. Budget che deve suonare come investimento sulle persone.
8. Co-presenza misurata (coached/solo).
9. Settimana per settimana: ritmo del dubbio e della fedeltà.
10. Il funnel è emotivo — anche se è business.
11. Analytics marketing: ponte acquisizione-retention.
12. Meno funnel tossico, più accompagnamento.
13. Eventi 7d: cosa succede davvero dopo il click.
14. Conversion 30d: numero che chiede contesto.
15. Più chiarezza interna, meno confusione esterna.
16. Lead persi: impara senza demonizzare.
17. Trial: la fase più fragile — merita tono giusto.
18. Dashboard che impedisce marketing egoista.
19. Numeri che raccontano ritardi relazionali.
20. Marketing da club serio: misura anche chi già paga.
21. Più segmentazione mentale, meno messaggi sbagliati.
22. Analytics come responsabilità morale.
23. La metrica che conta: chi resta presente.
24. Trend giornaliero: micro-emozioni accumulate.
25. Il club che capisce tempo e fase vince la fiducia.

**25 Subheadlines**

1. KPI lead e KPI attività nello stesso spazio decisionale.
2. Funnel 30d come narrazione stati mentali.
3. Trend 7d per giorno: ritmo reale degli ingressi.
4. Trend 30d per settimana: meno rumore, più direzione.
5. Atleti inattivi: segnale — non sentenza.
6. Eventi campagna 7d: misura eco reale delle iniziative.
7. Budget attivo: promessa finanziaria da onorare con UX umana.
8. Campagne attive elenco: collegamento diretto a percezione ricezione.
9. Conversion rate: utile se interpretato con empatia.
10. Nuovi lead 7d: non solo festa — anche capacità di onboarding.
11. Analytics come weekly review emotiva del club.
12. Riduci spam: allinea funnel e coaching.
13. Più congruenza, meno frizione motivazionale.
14. Marketing analytics per leader che non vogliono “fare numeri” a vuoto.
15. Più coached 7d: più presenza — fino a equilibrio.
16. Più solo 7d: più bisogno di messaggi non giudicanti.
17. Due timeline che devono convergere: prospect e member.
18. Meno storytelling falso sui risultati.
19. Più trasparenza interna, più fiducia esterna.
20. Non leggere funnel come football manager delle persone.
21. Il tempo è parte della psicologia: 7/30 giorni scelti bene.
22. Meno ansia da leadership con trend visibili.
23. Da insight a voce trainer: pipeline ideale.
24. Analytics che richiede umiltà interpretativa.
25. Il premium è quando i dati aumentano cura, non fretta.

**25 Hooks Instagram**

1. Il funnel dice dove sei nel dubbio — rispettalo nel messaggio.
2. Inattivi >30 giorni: non sono pigri — sono persone.
3. Trend lead: il ritmo delle persone che si avvicinano.
4. Analytics marketing: meno supposizioni, più ascolto.
5. Trial è vulnerabilità — non solo pipeline.
6. Lead persi: impara senza insultare.
7. Budget attivo: soldi che si sentono nella vita reale.
8. Eventi campagna: cosa succede dopo lo scroll.
9. Coached vs solo: emozione di presenza.
10. Marketing che misura anche chi già crede in voi.
11. Stop funnel ossessivo: start human timing.
12. Il retention è presenza — non coupon.
13. Analytics che ti impedisce di essere rumoroso.
14. Numeri che raccontano pausa, non colpa.
15. Due grafici nella testa: vendita e disciplina.
16. Il club serio guarda anche chi sparisce.
17. Trend settimanale: meno panico quotidiano.
18. Messaggi giusti > messaggi frequenti.
19. Conversion rate spiegato a voce calma.
20. Lead nuovi: energia — gestiscila senza bruciare i vecchi.
21. Marketing analytics = etica operativa.
22. Guida i prospect senza dimenticare i membri.
23. Più coerenza, meno vergogna percepita.
24. Il funnel è vita reale — non Excel.
25. Dashboard che ricorda: tempo e dignità.

**25 Hooks TikTok**

1. POV: funnel pieno ma palestra vuota — analytics ti sveglia.
2. “Ho molti lead” vs “ho persone presenti”: differenza enorme.
3. Inattivi >30d: il numero che fa smettere di fingersi bravi.
4. Trial: fase fragile — se sbagli tono, perdi fiducia per sempre.
5. Trend lead giorno per giorno: ansia o chiarezza — scegli come leggerli.
6. Budget attivo: cash che deve tornare come rispetto.
7. Lead persi non sono “cretini”: sono timing sbagliato.
8. Coached basso? Forse solitudine — non pigrizia.
9. Marketing analytics: meno ego founder, più cura clienti.
10. Il funnel non è FIFA: sono vite.
11. Eventi campagna: se sono vuoti, il problema non è il tool.
12. Conversion rate alto con retention basso = bubble.
13. Analytics che dice “hai promesso troppo al bot”.
14. Più rumore ≠ più risultati umani.
15. Due KPI nella stessa testa: vendita e allenamento.
16. Il DM giusto nasce da fase giusta — funnel te lo dice.
17. Stop pressioni: start messaggi che rispettano lo stato.
18. Il retention è allenamento — non marketing spammoso.
19. Trend settimanale: respira prima di reagire.
20. Il premium è quando analytics rende gentili — non furbi.
21. Lead nuovi: adrenalina — non distrarti dai presenti.
22. Il club che guarda solo funnel sembra cheap dentro.
23. Meno “chiudi chiudi chiudi”, più accompagna.
24. Numeri che dovrebbero farti fare una domanda umana: “come stai?”.
25. Analytics vero: chi torna in sala — non solo chi paga.

**10 Idee Reels**

1. Spiegazione non tecnica funnel in 25s con esempi emotivi per stato.
2. Split: messaggio sbagliato per fase vs messaggio giusto.
3. Animazione “inattivi >30d” con VO empatico — zero shame.
4. Founder racconta weekly review analytics senza ossessione.
5. Role-play trial: tono che converte senza manipolare.
6. FAQ: “conversion rate basso” — cause umane non solo ads.
7. Clip ironica: lead infiniti, trainer insufficiente — verità scomoda.
8. Reaction a dashboard: cosa guardare per primo (human-first).
9. Mini-corso: coached/solo come bisogni emotivi.
10. Before/After cultura messaggi post-analytics.

**10 Idee Carousel**

1. Stati funnel tradotti in emozioni (nuovo→perso).
2. Cosa significa inattivo >30 giorni nella vita vera.
3. Come leggere trend senza farsi prendere dal panico.
4. Coached vs solo: bisogni diversi, messaggi diversi.
5. Checklist etica: cosa non fare dopo aver visto analytics.
6. Errori: trasformare insight in pressione su staff e clienti.
7. Collegamento analytics → voce trainer (workflow ideale).
8. Budget attivo: promesse da mantenere nella comunicazione.
9. Settimana tipo di review analytics “sana”.
10. Premium perception: coerenza funnel ↔ esperienza sala.

**10 Idee Stories**

1. Poll: “Preferisci messaggi frequenti o rari ma giusti?”.
2. Quiz: indovina lo stato funnel da una frase ricevuta (educational).
3. Sticker Sì/No: “Mi hai scritto nel momento giusto”.
4. Countdown “trial day 3” — reminder gentile (non paura).
5. Domanda: “Cosa ti ha fatto tornare dopo una pausa?”.
6. Behind the scenes: come decidete tono post-analytics.
7. Mini-survey su spam percepito.
8. Promemoria: trend settimanale > ossessione giornaliera.
9. Ringraziamento a chi risponde con umanità nei DM commerciali.
10. Link a principi etici comunicazione club.

**10 Idee Static Ads**

1. Headline “Funnel + frequenza: due cuori della retention”.
2. Visual astratto: due onde (lead e allenamenti) che si sincronizzano.
3. Quote su inattività come segnale di servizio.
4. Before/After: promo rumorosa vs onboarding curato.
5. Icone minimal: trial, presenza, rispetto.
6. Annuncio B2B: analytics che rende meno tossico il marketing.
7. Messaggio premium: coerenza temporale comunicazioni.
8. Static “inattivi >30d” con copy empatico (non allarmistico).
9. Contrasto: CPA basso, retention basso — problema.
10. Brand: dati per cura, non per fretta.

**10 Angoli emotivi**

1. Euforia da nuovi lead vs tristezza per chi sparisce.
2. Ansia da conversion rate.
3. Vergogna da inattività percepita come colpa.
4. Solitudine nel trial senza guida.
5. Rabbia da messaggi fuori fase.
6. Sollievo quando messaggi matchano stato mentale.
7. Confusione tra marketing e coaching (“chi mi parla?”).
8. Speranza quando analytics porta a trainer vero.
9. Delusione da promesse commerciali non sostenute in sala.
10. Gratitudine per follow-up tempestivo non pressante.

**10 Angoli motivazionali**

1. Congruenza interna/esterna aumenta autodisciplina.
2. Trial come soglia — piccoli passi contano.
3. Tornare dopo pausa come atto di coraggio.
4. Presenza trainer come ancora nella fase fragile.
5. Meno confronto con altri, più confronto con sé ieri.
6. Messaggi giusti aumentano autoefficacia.
7. Continuità come identità (“io mi presento”).
8. Marketing che rispetta il tempo dell’altro — motivazione etica.
9. Supporto silenzioso (analytics → azione umana).
10. Orgoglio di club che non abbandona chi tentenna.

**10 Angoli cognitivi**

1. Funnel come stati mentali, non solo stati CRM.
2. Trend: rumore vs segnale.
3. Conversion rate condizionato da qualità onboarding.
4. Eventi campagna come proxy di ricezione reale.
5. Inattività come multi-causa — evitare monocausalità.
6. Budget come promessa operativa.
7. coached/solo come bisogni di guida.
8. Temporalità 7/30 giorni come ritmo psicologico.
9. Anti-overfitting: non ottimizzare click a scapito retained users.
10. Interpretazione umile dei numeri.

**10 Angoli trasformazione**

1. Da rumorosi a pertinenti.
2. Da acquisition-only a member-centric.
3. Da pressione a accompagnamento.
4. Da funnel freddo a narrazione calda.
5. Da KPI anxiety a KPI stewardship.
6. Da spam a timing.
7. Da vanity metrics a salute reale club.
8. Da promo a preparazione emotiva al cambiamento.
9. Da ghosting a presenza.
10. Da metriche separate a quadro unico.

**10 Angoli engagement**

1. Touchpoint coordinati con stato mentale.
2. Automazioni che non rubano voce al trainer.
3. Trial onboarding experience che crea abitudine.
4. Messaggi brevi e utili post-analytics.
5. Inviti a sessioni umane, non solo funnel moves.
6. Segmentazione che riduce irritazione.
7. Feedback loop settimanale migliora copy.
8. Meno frequency, più relevance aumenta risposta.
9. Co-create contenuti con trainer per coerenza.
10. Engagement misurato anche come presenza in sala.

**10 Angoli relatable**

1. Essere in trial e sentirsi pressati.
2. Ricevere promo da “nuovo iscritto” quando sei già cliente.
3. Sentirsi “lead” invece che persona.
4. Sparire dalla sala per settimane — vergogna silenziosa.
5. Non rispondere alle chat perché imbarazzo.
6. Essere sommersi da notifiche fuori momento.
7. Dubitare se sei ancora benvenuto dopo una pausa.
8. Confrontarsi mentalmente con funnel degli altri (tossico).
9. Voler ricominciare ma temere vendita aggressiva.
10. Sentirsi incompreso dal messaggio automatico.

**10 Micro-frustrations**

1. Messaggi fuori fase trial/cliente.
2. Frequenza alta senza valore.
3. Linguaggio “salesy” quando serve supporto.
4. Essere trattati come conversion stat.
5. Incoerenza tra promessa ads e esperienza trainer.
6. Solleciti quando già si è tornati attivi.
7. Analytics usato per punire staff vendita.
8. Ignorare inattività fino a escalation dramma.
9. Budget che aumenta rumore senza qualità.
10. Trasferire ansia KPI ai trainer senza risorse.

**10 Micro-rewards**

1. Messaggio giusto nel giorno giusto.
2. Riduzione spam dopo tuning analytics.
3. Trainer che entra perché dati lo avvisano — con tact.
4. Trial accolto senza fretta.
5. Essere richiamati con domanda umana.
6. Percepire che il club sa chi sei nella timeline.
7. Offerte pertinenti al bisogno reale.
8. Meno attriti tra marketing e coaching.
9. Celebrazione piccoli ritorni attivi.
10. Coerenza tra funnel e voce istituzionale.

**10 Scene realistiche**

1. Lunedì: review analytics → lista di 5 nomi da contattare con tono cura.
2. Trial giorno 4: messaggio utile vs messaggio che spinge pagamento.
3. Atleta inattivo >30d riceve invito a sessione tecnica — non sconto.
4. Trend lead calante: club migliora onboarding invece di aumentare ads spend.
5. Staff capisce che coached 7d basso richiede più presenza in sala.
6. Conversion alta ma Google reviews parlano di ghosting — mismatch analytics/emotion.
7. Sabato: DM corto perché funnel dice “contattato ma fermo”.
8. Coach usa lista inattivi per messaggi vocali brevi — engagement umano.
9. Trial converte perché trainer era sincronizzato — non perché sconto grande.
10. Due segmenti: nuovi lead festeggiano — membri ignorati — errore corretto.

**10 Scene scroll-stopping**

1. Testo enorme: “Il funnel è emotivo”.
2. Clip 2s: inbox piena vs una messaggio perfetto.
3. Grafico animato lead + linea inattivi che si incrociano — caption empatica.
4. VO: “Il numero brutto è un invito alla cura”.
5. Reaction founder leggendo inattivi senza giudizio.
6. Split: CPA vs presenza in sala — quale conta davvero?
7. Ironia: “lead infiniti” mentre trainer collassa.
8. Facecam: “Ho smesso di inseguire click”.
9. Zoom su trial: fragilità messo al centro.
10. Stop motion funnel cards con emoji emotive.

**5 emozioni principali**

1. Euforia (nuovi lead).
2. Ansia (conversion/inattivi).
3. Vergogna (essere inattivo).
4. Sollievo (messaggio giusto).
5. Rabbia (spam).

**5 paure principali**

1. Essere ridotti a stat nel funnel.
2. Essere dimenticati dopo il pagamento.
3. Pressione nel trial.
4. Essere paragonati.
5. Essere “risolti” con sconti.

**5 desideri principali**

1. Essere capiti nella fase giusta.
2. Supporto umano nel trial.
3. Continuità senza stalking.
4. Chiarezza su cosa succede dopo il sì.
5. Sentire trainer presente — non solo ads.

**5 trigger motivazionali**

1. Paura di perdere opportunità (trial limitato).
2. Desiderio di appartenenza al gruppo.
3. Obiettivi salute concreti.
4. Orgoglio nel non mollare dopo una pausa.
5. Correttezza morale (“non voglio tradire me stesso”).

**Prima vs Dopo**

- **Prima:** marketing che ottimizza ingressi ignorando presenza in sala.
- **Dopo:** decisioni che bilanciano funnel e continuità comportamentale.

**La frase che vende davvero la pagina**
“Vedi chi sta entrando e chi sta già uscendo dalla porta — nello stesso tempo.”
