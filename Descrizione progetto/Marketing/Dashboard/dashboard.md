# KPI Marketing (Hub) — Analisi Profonda Atleta

==================================================

## 0. Metadati pagina

==================================================

- **Nome pagina:** KPI Marketing (hub dashboard marketing)
- **URL analizzato:** `http://localhost:3001/dashboard/marketing`
- **Data analisi:** 2026-05-09
- **Cartella creata:** `Descrizione progetto/Atleta/Hub Marketing`
- **File markdown:** `hub-marketing.md`
- **Funzione principale:** Carica `GET /api/marketing/kpi` e mostra aggregati allenamenti (totale, solo, con trainer, percentuale coached), data ultimo allenamento registrato nel sistema, tabella “Riepilogo per atleta” ordinata per ultimo allenamento (nome, email, conteggi, ultima data). Header esplicita: dati da vista KPI, nessun accesso a dettaglio workout.
- **Ruolo UI reale:** Marketing o Admin (`role === 'marketing' | 'admin'`); redirect se altro ruolo.
- **Ruolo principale (analisi atleta):** Prospettiva **a valle** — l’atleta non entra qui; percepisce se il club **misura la continuità** senza invadere il contenuto degli allenamenti.
- **Tipo workflow:** Lettura KPI → lettura tabella atleti → (implicito) decisioni comunicazione/retention altrove.
- **Tipo stress mentale:** Basso per operatori con dati puliti; per atleta: ansia da **metrica** se il club usa questi numeri come giudizio invece che come cura.
- **Tipo motivazione:** Motivazione staff a intervenire su chi si ferma; opportunità per atleta: sentirsi **riconosciuto nel ritmo** (ultimo workout) se il messaggio che arriva è umano.
- **Tipo reward psychology:** Reward indiretto: “non sono invisibile nel sistema” quando follow-up è tempestivo e non punivo.
- **Tipo engagement:** Engagement creato fuori dalla pagina (messaggi, richiami); qui è **telemetria** del rapporto solo/coach.
- **Tipo continuità:** Misura continuità **comportamentale** (sessioni) non identità; rischio se il club confonde numeri con valore della persona.
- **Stato pagina analizzato:** Implementazione `src/app/dashboard/marketing/page.tsx`.
- **Fonte analisi:** Codice pagina + contratto API KPI.
- **Nota ID dinamico:** Nessun `{id}` nell’URL.

==================================================

## 1. Sintesi breve

==================================================

È il cruscotto che dice al club **quanto l’allenamento vive in autonomia vs accompagnamento**. Conta perché la percentuale “con trainer” è un proxy emotivo di **presenza** e **guida**; troppo solo può significare abbandono silenzioso, troppo coached può significare dipendenza o costo tempo. Risolve al marketing il problema: “chi sta calando prima che lo dica in faccia?”. Emozione atleta (indiretta): sollievo se i numeri servono a **riaccendere** contatto senza umiliare; tensione se diventano ranking interno. Trasformazione supportata: da sensazione di vuoto a sensazione di **inseguimento gentile**. Continuità: quando il club agisce su chi ha fermato la catena, l’atleta riprova a crederci.

==================================================

## Sezioni analisi

==================================================

### 1. Contesto reale atleta

L’atleta vive palestra, chat, notifiche — non questa tabella. Ma se qualcuno dal club lo richiama “perché da tempo non si allena”, la conversazione nasce da una riga come questa. Il contesto emotivo è: **vergogna da calo**, paura di essere giudicato come “pigro”, desiderio di sentirsi capito non monitorato.

### 2. Workflow reale

Staff marketing/admin autenticato apre hub → fetch KPI → legge card aggregate → scorre tabella ordinata per ultimo workout → identifica nomi “freddi” → (fuori pagina) trigger: messaggio trainer, campagna riattivazione, invito a sessione. Loop ideale: numero → umano → azione → allenamento ripreso.

### 3. Motivazione e continuità

Motivazione atleta si nutre di **coerenza**: se il richiamo arriva come cura (“ti sei perso, ci sei?”) aumenta continuità; se arriva come statistica (“sei inattivo”) spezza fiducia. La pagina è neutra: etica d’uso decide.

### 4. Stress e frustrazione

Stress atleta: sensazione **Big Brother** se scopre che il club conta sessioni senza contesto emotivo. Frustrazione staff: tabella con email visibile — responsabilità privacy e tono. Stress ridotto quando il testo ricorda “nessun dettaglio workout”: è confine tecnico che diventa confine psicologico.

### 5. Reward psychology

Micro-reward indiretto: chi riprende vede il “ultimo” aggiornarsi — conferma identità “sto tornando”. Reward tossico: usare percentuali per competizione implicita tra atleti.

### 6. Progress perception

Non misura forza o skill: misura **frequenza** e **modalità** (solo vs trainer). Percepito progresso migliora se il club traduce numeri in **passi successivi** (“facciamo una presenza in sala”), non in giudizio finale.

### 7. Fiducia nel trainer

La percentuale coached/solo racconta quanto la relazione trainer-atleta è **canale abituale**. Se coached è basso, l’atleta può sentirsi smarrito senza guida; se è alto, può sentirsi supportato — o dipendente. La fiducia regge quando il trainer è messaggero, non guardiano.

### 8. Cognitive Load & Mental Energy

Per operatori: basso — pochi KPI, tabella leggibile. Non richiede analytics complessi. Energia mentale: più emotiva (chi contattare per primo) che cognitiva.

### 9. Engagement psychology

La pagina non inganna: non crea engagement atleta diretto. Crea **condizioni** per messaggi mirati che ripristinano engagement reale (app, allenamenti).

### 10. Habit & Retention loops

Trigger: calo frequenza o stop coached → intervento → ripresa sessioni → reward (tabella che si riallinea). Punto di rottura: intervento robotico o spam.

### 11. Premium Perception

Premium: governance silenziosa, messaggi pertinenti, confini chiari su cosa si vede. Cheap: sensazione call-center o stalking; anche solo il timore basta a erodere retention.

### 12. Emotional reinforcement

Emozioni a valle: sollievo (“mi avete notato”), rabbia (“mi contate”), speranza (“non sono solo”). La pagina è un amplificatore morale: amplifica ciò che il club decide dopo.

### 13. Marketing intelligence

Story utile: “Prima di vendere, sapete chi sta già camminando con voi?”. Angolo: **co-presenza** (trainer) come promessa reale, non slogan.

### 14. Content & creative strategy

Narrative: “numeri che salvano persone, non che giudicano”. Evitare UGC atleta su schermata staff; usare testimonianze su **ritorno** dopo un momento morto.

### 15. Ecosystem athlete analysis

Collegamento: Analytics (`/dashboard/marketing/analytics`) arricchisce il quadro su lead/funnel; Atleti (`/marketing/athletes`) approfondisce vista `marketing_athletes`; Campagne/Automazioni possono agire su segmenti derivati da questi segnali. Effetto: hub è **sintomo**, non terapia completa.

### 16. Analisi profonda della pagina

Il valore distintivo è la coppia **aggregazione + limite privacy** (“nessun dettaglio workout”). Psicologicamente, questo riduce la fantasia peggiorativa dell’atleta (“sanno tutto di me”) e impone al club disciplina narrativa. La percentuale coached è il cuore relazionale: misura quanto il percorso è ancora **relazione** vs **task solista**. Il rischio più alto non è tecnico: è morale — usare la tabella come lista delle “anime da recuperare” senza dignità conversativa.

### 17. Output finale obbligatorio

- **Riassunto operativo:** Hub KPI allenamenti aggregati + tabella per atleta con ultimo allenamento, senza drill-down workout.
- **Riassunto emotivo:** Da “non so se conto” a “qualcuno ha visto il mio silenzio” — se l’uso è cura.
- **Riassunto motivazionale:** Riprende senso riprendere frequenza quando il contatto successivo è umano.
- **Riassunto cognitivo:** Poche metriche, confronto solo/coach immediato.
- **Problema reale:** Calo silenzioso + sensazione di abbandono prima ancora del check-out formale.
- **Stress eliminato:** Incertezza staff su chi è fermo (ridotta).
- **Motivazione creata:** Possibilità di recupero percepito come possibile senza umiliazione.
- **Reward psychology principale:** Riconoscimento del ritmo (ultimo allenamento) come ancoraggio identitario.
- **Trasformazione percepita:** Da numero anonimo a persona richiamata con intenzione giusta.
- **Continuità supportata:** Telemetria per riaccendere abitudine senza snaturarla.
- **Valore percepito:** Club che sa chi è presente — senza confondere presenza digitale con affetto reale.
- **Fiducia generata:** Fiducia se il passo successivo è trainer/coaching, non punizione.
- **Effetto retention:** Alto potenziale se collegato a messaggi di valore; basso o negativo se usato per pressare.
- **Effetto engagement:** Indiretto; dipende intervento umano post-lettura.
- **Messaggio più forte:** Misuri continuità per salvarla, non per classificarla.
- **Visual hook più forte:** Percentuale “con trainer” — promessa relazionale misurata.
- **Copy hook più forte:** “Nessun accesso a dettagli workout” — confine = rispetto.
- **Concetto ads più forte:** Il club che accompagna prima che tu smetta del tutto.

**25 Hooks Meta Ads**

1. Lo sai chi sta smettendo prima che te lo dica in faccia?
2. Non serve spiare la scheda: serve capire se sei ancora nel ritmo.
3. Allenarsi da soli non è libertà: a volte è solitudine.
4. Il trainer non è un optional: è presenza quando la motivazione crolla.
5. Prima di vendere abbonamenti, guarda chi sta già camminando con voi.
6. Il premium non è il logo: è che qualcuno noti quando ti fermi.
7. Numeri che salvano persone, non che giudicano persone.
8. Il retention non è una chat arrabbiata: è un richiamo giusto al momento giusto.
9. Sensazione di essere seguiti anche quando non sei “performante”.
10. Meno ghosting, più continuità: inizia dai numeri giusti.
11. Da solo vs con trainer: il rapporto che definisce quanto ti senti accompagnato.
12. La motivazione fragile ha bisogno di una presenza misurabile — non di slogan.
13. Se il club conta solo vendite, conta male il sentiment.
14. Tabella che dice “ultimo allenamento”: una data può essere un campanello umano.
15. Non è sorveglianza: è telemetria con confini (niente dettaglio workout).
16. Chi si ferma piano piano spesso non chiede aiuto: appare nei dati prima che in chat.
17. Meno pressione, più accompagnamento: etica di uso.
18. Il cliente non vede questa pagina: sente cosa fate dopo.
19. Percentuali che raccontano quanto la relazione trainer-atleta regge.
20. Da KPI a messaggio: la parte difficile è non essere freddi.
21. Continuità è ripetizione gentile, non ossessione metrica.
22. Il club serio sa chi sta spegnendo la frequenza.
23. Prima curi il ritmo, poi vendi la trasformazione.
24. Numeri piccoli, decisioni grandi: chi richiamare oggi?
25. TrainerDesk non è solo app: è anche chi decide di non lasciarti nel vuoto.

**25 Headlines**

1. KPI che misurano presenza, non pettegolezzo.
2. Ultimo allenamento: il campanello silenzioso.
3. Solo vs trainer: il rapporto che conta davvero.
4. Nessun dettaglio workout: solo rispetto e chiarezza.
5. Prima capisci chi si ferma, poi lo aiuti.
6. Il retention nasce anche da una tabella letta bene.
7. Metriche aggregate: meno ansia, più azione umana.
8. Allenamenti totali: frequenza come identità.
9. Il club che accompagna misura anche l’assenza.
10. Da numeri a voce umana: il vero salto.
11. Percentuale coached: quanto siete ancora “insieme”.
12. Continuità si misura prima nei giorni, poi nei chili.
13. Dashboard marketing: dove si vede chi sta calando.
14. Meno giudizio, più recupero.
15. Telemetria utile, non punizione silenziosa.
16. Il cliente fragile non chiede aiuto: compare nei KPI.
17. Ordine interno, calma esterna.
18. KPI marketing che proteggono la dignità dell’atleta.
19. Frequenza ≠ valore — ma frequenza è la porta dell’abitudine.
20. Allenatori presenti, atleti meno persi.
21. Misura ciò che riaccende la routine.
22. Il sistema dice “chi”: voi decidete “come”.
23. Dashboard che non invade, orienta.
24. Più coaching percepito, meno solitudine in allenamento.
25. Il miglioramento è anche tornare — non solo spingere.

**25 Subheadlines**

1. Aggregati chiari, zero drill-down workout.
2. Ordine per ultimo allenamento: priorità emotiva naturale.
3. Percentuale con trainer come proxy di accompagnamento.
4. Per marketing/admin: lettura rapida, decisione successiva umana.
5. Riduci drammi: sapete chi è fermo prima della crisi.
6. Tabella atleti: nomi — responsabilità di tono nel follow-up.
7. Stress basso se i numeri guidano cura, alto se guidano vergogna.
8. Continuità digitale come supporto alla continuità fisica.
9. Confine privacy esplicito: meno paranoia atleta.
10. KPI compatibili con motivazione fragile se etica è alta.
11. Il richiamo giusto parte da dati puliti.
12. Più coached, più presenza percepita — fino a equilibrio sano.
13. Più solo, più bisogno di messaggi non umilianti.
14. Data ultimo workout: micro-segnale identitario.
15. Hub sintetico: non sostituisce Analytics, lo complementa.
16. Migliora retention indiretta con outreach mirato.
17. Governance del club visibile nei numeri — non nei commenti Instagram.
18. Meno attriti: sapete chi necessita attenzione — senza gossip.
19. Anti-abbandono silenzioso: intervento prima della rottura totale.
20. Numeri come bussola, persone come destinazione.
21. Più chiarezza interna, meno frustrazione esterna.
22. Percentuali che insegnano a distribuire tempo trainer.
23. Tabella come promemoria morale: non come classifica tossica.
24. KPI marketing che rispettano limite tecnico = limite psicologico.
25. Da insight a messaggio: il punto fragile è sempre la voce.

**25 Hooks Instagram**

1. Il tuo club sa quando ti sei fermato — prima di te?
2. Percentuale “con trainer”: quanto ti senti accompagnato davvero.
3. Numeri che dovrebbero salvarti, non giudicarti.
4. Da soli in sala: libertà o solitudineallenativa?
5. Il retention non è una notifica rabbiosa.
6. Una data di ultimo allenamento può essere una mano tesa — se la cultura è giusta.
7. KPI: telemetria del percorso, non del pettegolezzo.
8. Motivazione fragile: protezione = presenza, non pressione.
9. Il premium è anche “ci pensano prima che mollo”.
10. Tabella atleti: dietro ogni riga c’è una stanchezza possibile.
11. Coach vs solo: il rapporto che misura quanto sei ancora nel gruppo.
12. Se i numeri diventano vergogna, il club perde prima dell’atleta.
13. Chi accompagna vince più di chi spinge.
14. Continuità misurabile, dignità intatta.
15. Meno ranking, più recupero.
16. Il messaggio giusto > il numero alto.
17. Frequenza: la scala più onesta del progresso immediato.
18. Marketing che guarda dati per curare relazioni.
19. Non è stalking se poi parli come essere umano.
20. Il cliente non vede questa schermata — sente la conseguenza.
21. Percentuali che insegnano umiltà operativa al club.
22. Allenamento non è solo performance: è anche ritorno.
23. Il ghosting in palestra inizia quando sparisce la presenza.
24. KPI puliti, outreach pulito.
25. TrainerDesk: continuità anche quando la testa molla.

**25 Hooks TikTok**

1. POV: il club vede che ti sei fermato — e cosa fa dopo decide tutto.
2. “Solo vs trainer” non è flex: è quanto ti senti seguito.
3. KPI che dovrebbero darti una mano, non darti ansia.
4. Percentuale coached bassa? Forse è solitudine, non pigrizia.
5. Il retention vero non urla: sistema chi deve essere richiamato.
6. Tabella atleti: ogni riga è una storia di vita stanca.
7. Non è il peso: è la frequenza che ti tiene nel percorso.
8. Club che misura bene — poi parla male: peggio di non misurare.
9. Motivazione fragile: la salvi con presenza, non con statistiche in faccia.
10. “Ultimo allenamento”: una data può essere dolce o crudele.
11. Dashboard marketing: dove si decide chi salvare dalla pausa infinita.
12. Più coached = più sensazione di squadra.
13. Numeri piccoli, responsabilità enormi nel tono.
14. Il premium è sentirsi notati senza sentirsi spiati.
15. Allenarsi da soli è ok; sentirsi abbandonati no.
16. Etica: KPI senza dettaglio workout = confine giusto.
17. Il vero problema è sempre emotivo — i numeri solo lo anticipano.
18. Da solo in app: ok. Solo nella testa: no.
19. Continuità è ripetizione gentile.
20. Il trainer esiste anche nei dati — se ci sono, esiste davvero.
21. Meno pressione social, più presenza vera.
22. Se il club usa questi numeri per umiliare, perdi prima tu — poi loro.
23. Salvare una routine è più forte di vendere un miraggio.
24. KPI marketing: bussola per chi deve mandare un messaggio umano.
25. La metrica finale è tornare — non impressionare.

**10 Idee Reels**

1. Split: messaggio freddo da club vs richiamo umano dopo KPI “ultimo workout”.
2. Spiegazione 20s: cosa significa % coached senza shaming.
3. Mini-intervista atleta: “cosa ti ha fatto tornare?” — collegamento implicito a telemetria usata bene.
4. POV trainer: come scegli chi scrivere prima — etica.
5. Before/After tono messaggi (cold vs caring).
6. FAQ: “È spiazione?” — no: limiti tecnici e uso morale.
7. Animazione ultra breve: solo vs coached come emozione, non competizione.
8. Trend audio ironico: “il club mi ha scritto perché…” — twist positivo.
9. Lista “3 errori da non fare dopo aver letto i KPI”.
10. Reazione founder: leggere tabella senza giudizio — mindset.

**10 Idee Carousel**

1. 5 segni che stai perdendo continuità prima di arrenderti del tutto.
2. Cosa significa “nessun dettaglio workout” per la tua privacy emotiva.
3. Solo vs trainer: qual è il tuo mix sano?
4. Come interpretare ultimo allenamento senza catastrofismo.
5. KPI marketing spiegati a una persona non tecnica.
6. Come il club dovrebbe usarvi i dati (etica).
7. Percentuali che aiutano il trainer a distribuire attenzione.
8. Micro-guida: dal numero al messaggio giusto.
9. Errori: trasformare KPI in classifica tossica.
10. Retention: frequenza prima, estetica dopo.

**10 Idee Stories**

1. Sondaggio: “Ti piace sentirti richiamato se ti fermi?” — opzioni sensibili.
2. Sticker: “Ultimo allenamento questa settimana sì/no”.
3. Quiz veloce: coached vs solo — cosa preferisci e perché.
4. Domanda aperta: “cosa ti fa sentire seguito oltre la scheda?”.
5. Promemoria: continuità è gentilezza ripetuta.
6. Behind the scenes: “cosa guardiamo prima di scrivervi” (trasparenza).
7. Mini poll su tono dei messaggi (caldi vs freddi).
8. Countdown “riparto allenamento” — empowerment.
9. Ringraziamento staff quando outreach recupera qualcuno.
10. Link etica dati: limiti e promesse.

**10 Idee Static Ads**

1. Headline “Continuità misurabile, dignità intatta”.
2. Visual astratto: due linee (solo/coach) che si incontrano — metafora equilibrio.
3. Before/After testuale: pressione vs cura.
4. Quote breve su confini privacy KPI.
5. Icone minimal: frequenza, presenza, rispetto.
6. Annuncio B2B: “rivedete chi si ferma prima della crisi”.
7. Messaggio premium: accompagnamento misurabile.
8. Static “ultimo allenamento: campanello umano”.
9. Contrasto: ranking vs recupero.
10. Brand promise: dati per tornare, non per punire.

**10 Angoli emotivi**

1. Vergogna da calo frequenza.
2. Sollievo quando il richiamo è umano.
3. Paranoia da sorveglianza se mal spiegato.
4. Gratitudine per essere stati “visti” senza giudizio.
5. Solitudine mascherata da allenamento in autonomia.
6. Nostalgia della continuità passata.
7. Ansia da confronto implicito con altri atleti (se cultura tossica).
8. Orgoglio quando si rompe il digiuno di allenamenti.
9. Rabbia se il messaggio è freddo.
10. Speranza quando il trainer riappare nei fatti.

**10 Angoli motivazionali**

1. Tornare è già progresso.
2. Frequenza come prova di cura verso sé.
3. Presenza trainer come ancora nei giorni brutti.
4. Autonomia sì, abbandono no.
5. Piccolo passo > grande discorso.
6. Continuità come identità (“io sono uno che torna”).
7. Giocate sul “riparto lunedì” con supporto reale.
8. Motivazione come relazione, non come grafico.
9. Celebrare il ritorno, non solo il PB.
10. Disciplina gentile vs disciplina punitiva.

**10 Angoli cognitivi**

1. Differenza tra metrica e valore personale.
2. KPI come sintomo, non diagnosi morale.
3. Confini informativi: cosa è lecito sapere.
4. Ordinamento per ultimo workout = priorità naturale.
5. Percentuali coached come indicatori di servizio.
6. Come leggere tabella senza bias.
7. Etica del follow-up: template mentali.
8. Riduzione ansia: “non sanno i dettagli”.
9. Traduzione numeri → azioni umane.
10. Anti-classifica: uso dei dati per cura.

**10 Angoli trasformazione**

1. Da pausa a ripartenza misurabile.
2. Da solitudine in sala a presenza percepita.
3. Da ghosting a messaggio giusto.
4. Da vergogna a ripresa orgogliosa.
5. Da numeri freddi a voce calda.
6. Da incertezza club a servizio tempestivo.
7. Da frequenza casuale a ritmo scelto.
8. Da “ho fallito” a “sto ricominciando”.
9. Da metrica a cammino.
10. Da monitoring a mentoring.

**10 Angoli engagement**

1. Riaccensione loop allenamenti.
2. Messaggi contestuali al ritmo reale.
3. Follow-up trainer dopo soglia inattività.
4. Micro-obiettivi settimanali legati a frequenza.
5. Celebrare sessioni di ritorno.
6. Evitare spam: frequenza messaggi vs frequenza allenamenti.
7. Promesse coerenti con capacità coaching.
8. Community che include chi sta tornando.
9. Reminder gentili > reminder tossici.
10. Engagement come cura della relazione.

**10 Angoli relatable**

1. Settimana impossibile: la frequenza crolla.
2. Ansia da palestra dopo pausa lunga.
3. Vergogna a rispondere al trainer.
4. Sensazione di deludere chi credeva in te.
5. Voler ricominciare ma aver paura del giudizio.
6. Sentirsi “fuori forma mentale” più che fisica.
7. Notifiche che stressano invece di aiutare.
8. Essere stanchi senza saper dire perché.
9. Sentirsi soli anche in palestra affollata.
10. Il giorno in cui torni e ti senti di nuovo tuo.

**10 Micro-frustrations**

1. Email esposta in tabella senza necessità operativa.
2. Sentirsi “numeretto” senza contesto umano.
3. Messaggi automatici dopo KPI letti male.
4. Pressione a coached quando si preferisce solo per tempo.
5. Classifiche implicite tra atleti.
6. KPI letti da chi non ha tono empatico.
7. Ripetizione follow-up senza ascolto.
8. Confondere calo frequenza con calo valore.
9. Linguaggio corporate nei messaggi successivi.
10. Far sentire osservati nei giorni fragili.

**10 Micro-rewards**

1. Essere richiamati con tono giusto dopo una pausa.
2. Sentire che il trainer “ti aspettava” senza giudizio.
3. Vedere che riprendere aggiorna il mondo digitale (ultimo workout).
4. Percepire che il club agisce prima della rottura totale.
5. Essere inclusi in un gruppo che non abbandona chi tentenna.
6. Messaggio corto che conta più di mille metriche.
7. Essere celebrati al ritorno, non solo al PB.
8. Coerenza tra dati e voce umana.
9. Chiarezza: non sanno i dettagli — meno scenari peggiorativi.
10. Sensazione di ordine nel club — meno caos emotivo.

**10 Scene realistiche**

1. Giovedì sera: ultimo workout 20 giorni fa — arriva messaggio trainer empatico.
2. Atleta evita chat perché si vergogna: KPI suggeriscono outreach gentile.
3. Founder guarda % coached e capisce che serve più presenza in sala.
4. Marketing nota nome “fermo” e coordina appuntamento di persona.
5. Atleta torna dopo pausa: tabella si aggiorna — sollievo digitale minimo.
6. Trainer usa KPI solo per priorità contatti, non per umiliare.
7. Due atleti simili numeri, vite diverse: staff non uniforma messaggi freddi.
8. Sabato mattina: reminder non invasivo dopo soglia inattività.
9. Parentesi vita lavoro: calo frequenza — club risponde con flessibilità.
10. Piccolo gruppo: coached alto — sensazione squadra reale.

**10 Scene scroll-stopping**

1. Primo piano telefono: messaggio “ti sei fermato” vs “ci sei?”.
2. Grafico immaginario solo/coach che si muove con voce over empatica.
3. Split screen: ranking tossico vs lista cura.
4. Testo grande: “NON sei un numero” mentre si parla di KPI.
5. Clip 3s: ultimo workout che si aggiorna — emozione sollievo.
6. Trainer che dice “ho visto il calo, come stai?” — zero dietrologia.
7. Ironia: “la palestra ti osserva” → twist “solo per aiutarti — se vuoi”.
8. Zoom su percentuale coached con spiegazione non tecnica.
9. VO atleta: “temevo il giudizio, ho trovato ascolto”.
10. Stop motion: giorni che passano senza allenamento — poi un passo.

**5 emozioni principali**

1. Vergogna.
2. Sollievo.
3. Paranoia (se uso è sbagliato).
4. Gratitudine (se uso è giusto).
5. Speranza di ripartenza.

**5 paure principali**

1. Essere giudicati come pigri.
2. Essere confrontati con altri.
3. Perdere privacy del percorso.
4. Ricevere messaggi freddi automatizzati.
5. Non meritare più attenzione del trainer.

**5 desideri principali**

1. Sentirsi visti senza essere umiliati.
2. Avere una mano quando la frequenza crolla.
3. Mantenere autonomia senza solitudine.
4. Essere guidati nei giorni confusi.
5. Sentire che il club è dalla loro parte.

**5 trigger motivazionali**

1. Paura di perdere progressi già fatti.
2. Desiderio di coerenza con sé stessi.
3. Appartenenza al gruppo/trainer.
4. Obiettivi legati a salute concreta.
5. Orgoglio nel rompere la spirale della pausa.

**Prima vs Dopo**

- **Prima:** frequenza che cala senza narrativa; silenzio che diventa abbandono percepito.
- **Dopo:** KPI che attivano presenza umana tempestiva; continuità ripresa senza drama.

**La frase che vende davvero la pagina**
“Misura quanto siete ancora nel ritmo insieme — senza entrare nella privacy dell’allenamento.”
