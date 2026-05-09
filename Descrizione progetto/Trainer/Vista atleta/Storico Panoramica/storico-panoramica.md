# Storico — Panoramica — Analisi Profonda Atleta

## 0. Metadati pagina

- Nome pagina: Allenamenti e storico — panoramica hub
- URL analizzato: `http://localhost:3001/dashboard/atleti/{id}/progressi/storico`
- Data analisi: 2026-05-09
- Cartella creata: `Descrizione progetto/Trainer/Vista atleta/Storico Panoramica`
- File markdown: `storico-panoramica.md`
- Funzione principale: Layout comune con header «Allenamenti e storico» e provider contesto (`StoricoAtletaProvider`); la route index monta `AthleteWorkoutsTab` con `hubSection="overview"` — panoramica con KPI (schede totali/attive, sessioni ultimi 30 giorni, sessioni da rivedere, prossimi appuntamenti), navigazione verso `/storico/schede`, `/sessioni-aperte`, `/appuntamenti`, `/completati`.
- Ruolo principale: Atleta (effetto tramite trainer che usa il hub per regia del percorso)
- Tipo workflow: Lettura macro → scelta area verticale → focus su dettaglio (schede, sessioni aperte, calendario, storico completati).
- Tipo stress mentale: Medio-alto — molte linee di lavoro visibili (aperti, futuro, archivio).
- Tipo motivazione: Senso di progetto — «non sono disordinato: ho una mappa».
- Tipo reward psychology: Indicatori cumulativi — presenza nel tempo, struttura delle schede, futuro ancora prenotabile.
- Tipo engagement: Invito a chiudere ciò che resta aperto e a onorare ciò che è programmato.
- Tipo continuità: Stesso spazio per passato registrato, presente operativo e futuro calendarizzato.
- Stato pagina analizzato: Implementata (`storico/layout.tsx`, `storico/page.tsx`, `athlete-workouts-tab.tsx`).
- Fonte analisi: Codice hub e componente tab allenamenti.
- Nota ID dinamico: `{id}` profilo atleta; **DINAMICA NON RISOLTA** per UUID in sessione locale.

---

## 1. Sintesi breve

È il **quadro di regia** dell’allenamento: prima ancora dei dettagli, dice se il percorso è ancora un progetto o solo una lista di giorni persi. Conta perché la motivazione fragile muore nel caos percepito — qui il caos può diventare sequenza di capitoli (overview → schede → sessioni aperte → appuntamenti → completati). Risolve il problema «non so più dove sono». Emozione: misto sollievo / pressione — dipende dal tono del trainer sui KPI. Trasformazione: da sensazione di ritardo permanente a posizione su una mappa aggiornabile. Continuità: un solo ingresso mentale per tutto il ciclo operativo dell’allenamento gestito.

---

## 2. Contesto reale atleta

Nella vita l’atleta somma stanchezza e impegni: questo hub è dove il trainer ricompone la storia — effetto indiretto enorme su fiducia e senso di essere ancora «nel progetto».

---

## 3. Workflow reale

Scheda atleta → «Storico» → header layout → panoramica overview → navigazione tab hub → drill verticale alle sotto-pagine.

---

## 4. Motivazione e continuità

Motivazione quando i numeri diventano linguaggio di piano («facciamo così questa settimana»). Continuità quando futuro e passato stanno nello stesso schema — meno sensazione di vuoto narrativo.

---

## 5. Stress e frustrazione

Stress se molte sessioni «da rivedere» — rischio vergogna se etichettate moralisticamente. Frustrazione se la panoramica sembra backlog infinito senza priorità.

---

## 6. Reward psychology

Reward da **indicatori di presenza** (sessioni ultimi 30 giorni) e da **futuro ancora prenotabile** (appuntamenti futuri).

---

## 7. Progress perception

Migliore quando KPI sono cornici temporali e ritmo; peggiore se letti come confronto con una versione ideale di sé.

---

## 8. Fiducia nel trainer

Sale quando la panoramica diventa briefing empatico; scende quando KPI sono randellate emotive.

---

## 9. Cognitive Load & Mental Energy

Alto nella prima lettura — molte informazioni; alleggerito dalla navigazione verso pagine dedicate.

---

## 10. Engagement psychology

Engagement misto: curiosità verso completati e tensione gentile su sessioni aperte — utile se trasformato in piano.

---

## 11. Habit & Retention loops

Chiudere loop tra sessioni aperte e completati rinforza identità «persona che porta a termine».

---

## 12. Premium Perception

Premium quando sembra studio professionale ordinato; cheap quando sembra lista infinita senza guida.

---

## 13. Marketing intelligence

Messaggio: «Il tuo percorso ha una regia — non è rumore».

---

## 14. Content & creative strategy

Spiegare la panoramica come briefing settimanale implicito — video trainer corto «come leggere questa pagina senza farti male».

---

## 15. Ecosystem athlete analysis

Collegamenti espliciti alle sotto-route dello storico; affinità con tab Progressi della scheda atleta e con statistiche `/progressi/allenamenti` come zoom quantitativo complementare.

---

## 16. Analisi profonda della pagina

La panoramica è **ancora psicologica**: KPI mini raccontano ritmo (30 giorni), stato progetto (schede), debito operativo gentile (non completate / in corso), futuro (appuntamenti). Il contesto React condivide id e nome — effetto continuità quando si passa tra tab del router: la stessa storia, più zoom. Il codice gestisce anche redirect da hash verso completati in alcuni casi — segno di cura per bookmark (simile alla filosofia della route `/progressi`). La retention migliora quando la vista non umilia ma orchestra; peggiora quando diventa muro di «cosa non hai fatto».

---

## 17. Output finale obbligatorio

### Riassunto operativo

Hub overview con KPI e navigazione verso aree verticali del flusso allenamenti.

### Riassunto emotivo

«Non sono più nel vuoto: vedo capitoli e possibilità future.»

### Riassunto motivazionale

Struttura visibile combatte abbandono da caos percepito.

### Riassunto cognitivo

Macro prima, micro dopo — coerente con memoria di lavoro limitata sotto stress.

### Problema reale

Sensazione di smarrimento nel percorso tra sedute, schede e calendario.

### Stress eliminato

Parzialmente: incertezza su cosa resta aperto e cosa è già stato raccontato dal sistema.

### Motivazione creata

Percezione di progetto ancora vivo — non solo giorni isolati.

### Reward psychology principale

Prove cumulative (presenza, struttura schede, futuro prenotabile).

### Trasformazione percepita

Da caos a regia condivisa.

### Continuità supportata

Stesso ingresso per passato, presente operativo e futuro.

### Valore percepito

Professionalità del trainer e del sistema che «ti tiene il filo».

### Fiducia generata

Numeri collegati a piano — non a giudizio statico.

### Effetto retention

Meno abbandoni silenziosi quando il percorso è leggibile come progetto.

### Effetto engagement

Invito ripetuto a chiudere loop e rispettare appuntamenti — abitudine positiva.

### Messaggio più forte

«Non sei sommerso: sei su una mappa — si definisce il prossimo passo onesto.»

### Visual hook più forte

Mini KPI e navigazione a segmenti — sensazione control room professionale.

### Copy hook più forte

«Panoramica, schede, sessioni, appuntamenti e storico completati» — copertura del ciclo intero.

### Concetto ads più forte

La regia del percorso batte la lista senza senso.

### 25 Hooks Meta Ads

1. «Da caos a regia — il tuo allenamento ha una mappa.»
2. «KPI che raccontano ritmo — non punizione morale.»
3. «Sessioni aperte — promemoria gentili — chiudi quando puoi.»
4. «Appuntamenti futuri — il tempo ti aspetta ancora — retention emotiva.»
5. «Schede nel tempo — la storia delle tue programmazioni.»
6. «Panoramica prima — dettaglio dopo — mente più lucida.»
7. «Il trainer che orchestra da qui ti fa sentire professionista del tuo corpo.»
8. «Non sei indietro per sempre — sei in un punto della mappa — aggiorni la rotta.»
9. «Indicatori che diventano piano — non randellate emotive.»
10. «Hub storico — meno sensazione di nuotare nel vuoto.»
11. «Sessioni ultimi 30 giorni — presenza misurabile — non giudizio finale.»
12. «Da backlog mentale a sequenza di next step — mindset progetto.»
13. «Continuità tra passato e futuro — meno solitudine nel mezzo.»
14. «Professionalità percepita quando il sistema tiene il filo — retention alta.»
15. «Motivazione fragile — struttura visibile — meno mollo silenzioso.»
16. «Panoramica — briefing implicito della settimana — chiarezza operativa.»
17. «Non sei lista infinita — sei capitoli — priorità concordate.»
18. «TrainerDesk — storico che organizza — disciplina condivisa.»
19. «Quadro chiaro — messaggi più mirati — relazione più vera.»
20. «Da sensazione di ritardo — a posizione aggiornabile — dignità narrativa.»
21. «Il percorso raccontabile — meno ghosting verso il trainer — più dialogo.»
22. «KPI — inviti — non sentenze — se la voce è giusta.»
23. «Allenamenti e storico — nome onesto — vita e palestra insieme.»
24. «La continuità è regia — non caso — nemmeno nei giorni bassi.»
25. «TrainerDesk: dove il tempo ha ancora una forma — non solo rumore.»

### 25 Headlines

1. Il tuo allenamento ha una regia — non solo una cronologia.
2. Panoramica: dove sei nel progetto oggi.
3. KPI che raccontano presenza — non colpa identitaria.
4. Sessioni aperte: inviti a chiudere il cerchio con dignità.
5. Appuntamenti futuri: ancora spazio nel calendario della fiducia.
6. Schede nel tempo: capitoli del piano che stai vivendo.
7. Hub storico: ordine nel percorso — ordine nella testa.
8. Indicatori che diventano linguaggio di piano con il trainer.
9. Da sensazione di smarrimento a posizione su una mappa.
10. La panoramica che protegge la motivazione nei giorni pieni.
11. Sessioni ultimi 30 giorni: ritmo — non verdetto morale.
12. «Da rivedere»: micro-prompt operativo — non etichetta vergogna.
13. Navigazione chiara: schede, sessioni aperte, appuntamenti, completati.
14. Continuità tra ciò che è stato e ciò che verrà.
15. Professionalità percepita quando il progetto è visibile come tale.
16. Meno abbandono quando non sei più solo con il caos in testa.
17. Il trainer che ti parla da questa base è più credibile — più umano nel piano.
18. Struttura visibile — disciplina condivisa — meno solitudine operativa.
19. Hub come centro gravitazionale dell’allenamento gestito nel tempo.
20. Coerenza narrativa tra le pagine figlie — stessa storia, più zoom.
21. Il quadro d’insieme fa da ancora nei giorni dubbi.
22. Allenamenti e storico — titolo onesto — senza nascondere la vita intorno.
23. Map mentale chiara: overview → dettaglio — ansia che scende.
24. TrainerDesk: storico come regia — non come archivio polveroso.
25. Il percorso ha forma — smetti di sentirti solo una lista di giorni persi.

### 25 Subheadlines

1. Prima la regia — poi il primo piano — così regge la mente stanca.
2. KPI mini — linguaggio di squadra — non di tribunale.
3. Sessioni aperte — tensione utile se diventa piano — tossica se diventa vergogna.
4. Appuntamenti futuri — prova che il tempo non è finito — ancora dentro il progetto.
5. Schede — storia lunga — meno ansia del singolo giorno isolato.
6. Panoramica — antidoto al «non so più dove sto».
7. Link verticali — fuoco per area — meno overload simultaneo.
8. Sensazione studio — premium perception — cura professionale.
9. Numeri con priorità concordata — altrimenti restano numeri spaventosi.
10. Contesto unico nel provider — continuità emotiva tra le pagine figlie.
11. Indicatori come inviti — priorità — non come verdetto finale implicito.
12. Hub che dialoga con il tab Progressi — coerenza sistema — meno drift mentale.
13. Da backlog infinito a sequenza di passi — ansia più gestibile.
14. Motivazione fragile — struttura visibile — meno mollo silenzioso.
15. Trainer meno improvvisazione — più fiducia percepita dall’atleta.
16. Allenamenti come progetto — non solo cronaca — identità da regia.
17. Continuità motivazionale quando il futuro è ancora prenotabile.
18. Engagement positivo — chiudere loop — identità affidabile nel tempo.
19. Premium quando ordine — cheap quando lista senza guida umana.
20. Storytelling trainer facilitato dalla vista d’insieme — messaggi mirati.
21. Percorso raccontabile — retention lunga — dialogo vivo col trainer.
22. Panoramica come briefing implicito — anche quando non c’è call programmata.
23. Quadro chiaro — meno interpretazioni catastrofiche da soli.
24. TrainerDesk — hub — cuore operativo del flusso allenamenti.
25. La disciplina condivisa scalda la relazione — non solo i numeri.

### 25 Hooks Instagram

1. «Il foglio di regia che la tua testa ti chiede quando è stanca.»
2. «KPI mini — drama mini — se qualcuno traduce bene.»
3. «Sessioni aperte — loop da chiudere — pace quando chiudi anche una sola.»
4. «Appuntamenti futuri — ancora dentro il progetto — retention emotiva.»
5. «Panoramica prima — zoom dopo — ansia più bassa.»
6. «Non sei sommerso — sei su una mappa — cambia rotta con aiuto.»
7. «Il trainer che orchestra da qui ti fa sentire meno solo nel caos.»
8. «Da lista infinita a capitoli — mindset progetto — mindset salvezza.»
9. «Indicatori che diventano piano — fiducia — non paura.»
10. «Sessioni ultimi 30 giorni — ritmo — non giudizio finale.»
11. «Schede nel tempo — narrazione lunga — meno panico del giorno isolato.»
12. «Hub storico — vibe studio — premium calmo.»
13. «Continuità tra passato e futuro — meno vuoti nella testa.»
14. «Chiudi cerchi — piccola dopamina etica — identità affidabile.»
15. «Motivation Monday dalla panoramica — numeri con contesto — meno flex tossico.»
16. «TrainerDesk — storico che tiene il filo — meno silenzio verso il trainer.»
17. «Indicatori — priorità — coaching translation — tutto cambia.»
18. «Panoramica — briefing implicito — chiarezza settimanale possibile.»
19. «Da sensazione ritardo — a posizione sulla mappa — dignità.»
20. «Quadro chiaro — messaggi mirati — relazione più vera.»
21. «Allenamenti e storico — nome onesto — vita vera inclusa.»
22. «Retention quando la regia è visibile — altrimenti è solo rumore.»
23. «Sessioni aperte — Zeigarnik gentile — chiudi quando puoi — respira.»
24. «Appuntamenti — futuro — ancora possibile — ancora dentro.»
25. «TrainerDesk hub — cuore operativo — cuore relazione.»

### 25 Hooks TikTok

1. POV: apri la panoramica e capisci dove sei senza aggiungerti drama.
2. «Plot twist: non sei indietro per sempre — sei su una mappa — aggiorni rotta.»
3. «KPI mini — voce giusta — drama mini — fiducia grande.»
4. «Sessioni aperte — chiudi una — pace — identità affidabile.»
5. «Appuntamenti futuri — ancora dentro il gioco — retention emotiva.»
6. «Panoramica prima — dettaglio dopo — testa ringrazia.»
7. «Da backlog mentale — a tre passi chiari — sollievo operativo.»
8. «Indicatori — piano — non punizione — ripeti finché non entra.»
9. «Hub storico — sensazione studio — premium silenziosa.»
10. «Schede nel tempo — film del progetto — episodi ancora aperti.»
11. «Sessioni 30 giorni — ritmo — non sentenza — respira.»
12. «Trainer che briefa dalla panoramica — fiducia — piano — tutto cambia.»
13. «Continuità passato/futuro — meno vuoti — più presenza.»
14. «Chiudi loop — dopamina etica — meno Zeigarnik tossico.»
15. «Hack noioso ma potentissimo — mappa chiara — retention vera.»
16. «Non sei lista infinita — sei capitoli — scegli priorità onesta.»
17. «TrainerDesk hub — cuore operativo — meno silenzio nel rapporto.»
18. «Da sommerso — a diretto progetto — shift enorme — dignità.»
19. «Numeri che diventano next step — coaching traduce — sempre.»
20. «Premium quando ordine — cheap quando backlog senza guida — scegli vibe.»
21. «Panoramica — regia — anche nei giorni no — ancora regia.»
22. «Sessioni aperte — promemoria gentili — chiudi quando puoi.»
23. «Appuntamenti — futuro — ancora possibile — ancora dentro.»
24. «Schede — storia lunga — meno ansia giornaliera tossica.»
25. «TrainerDesk storico — struttura visibile — disciplina condivisa.»

### 10 Idee Reels

1. Trainer «brief» 60 secondi dalla panoramica — priorità settimanali empatiche.
2. Animazione mappa astratta — KPI si accendono in sequenza — regia visiva.
3. Split caos mentale vs hub ordinato — twist motivazionale immediato.
4. Voce calma su «da rivedere» — linguaggio sicuro — meno vergogna.
5. Countdown appuntamenti futuri — speranza operativa — meno abbandono.
6. Intervista atleta — «cosa ti fa sentire in ritardo?» — reframing con la mappa.
7. Ironia leggera lista infinita vs tre passi chiari — risata terapeutica contenuta.
8. Schermo condiviso trainer-atleta sul hub — fiducia — piano condiviso.
9. Montaggio veloce schede nel tempo — film del progetto — payoff emotivo.
10. «Evita il silenzio verso il trainer» — hub come presenza strutturata — cura relazione.

### 10 Idee Carousel

1. Slide problema caos — slide soluzione panoramica — slide tre next step onesti.
2. Slide KPI spiegati come linguaggio di squadra — non di tribunale.
3. Slide sessioni aperte — come chiudere senza vergogna — piano micro-step.
4. Slide appuntamenti futuri — ancora dentro il percorso — ancoraggio emotivo.
5. Slide schede nel tempo — progetto lungo — identità da endurance.
6. Slide errori trainer — numeri come randellate — vs pianificazione empatica.
7. Slide premium perception hub ordinato — cheap backlog senza guida.
8. Slide navigazione verticale — alleggerire la mente — fuoco per area.
9. Slide continuità contesto provider — coerenza nome — cura sistema.
10. Slide TrainerDesk — storico come regia — non archivio polvere.

### 10 Idee Stories

1. Sondaggio: ti senti più sommerso dal caos o dai numeri isolati?
2. Quiz: backlog senza guida è motivante? (domanda provocatoria educativa)
3. Sticker «prima la mappa — poi il dramma».
4. Conto alla rovescia verso il prossimo appuntamento — ancora dentro il progetto.
5. Raccolta «next step gentile dopo aver visto la panoramica».
6. Prompt nei DM: «cosa ti fa sentire in ritardo anche quando non lo sei?»
7. Menzione al trainer che pianifica dalla panoramica senza umiliare.
8. Promemoria vocale: respira prima di leggere «da rivedere».
9. Mini-verità: KPI sono inviti — non sentenze — ripeti finché calma.
10. Link a voce guida «brief settimanale empatico».

### 10 Idee Static Ads

1. Mappa astratta KPI — headline «regia del percorso».
2. Icone segmentate hub — claim «capitoli chiari».
3. Prima caos — dopo panoramica — split minimale.
4. Citazione breve trainer — tono empatico — fiducia.
5. Claim «sessioni aperte» — linguaggio invito — non vergogna.
6. Claim «appuntamenti futuri» — ancora tempo — ancoraggio emotivo.
7. Diagramma overview→detail — riduzione ansia cognitiva.
8. Palette calma astratta — non corpi — dignità.
9. TrainerDesk lockup hub storico — professionalità operativa.
10. Headline «non sei sommerso — sei su una mappa».

### 10 Angoli emotivi

1. Sollievo da quadro leggibile.
2. Ansia da molti arretrati percepiti.
3. Speranza da appuntamenti futuri.
4. Orgoglio da ritmo sessioni visibile.
5. Vergogna se linguaggio trainer punitivo sui KPI.
6. Gratitudine per struttura condivisa.
7. Frustrazione se hub sembra backlog infinito.
8. Calma da priorità chiare concordate.
9. Solitudine ridotta quando il progetto è visibile.
10. Motivazione da regia condivisa.

### 10 Angoli motivazionali

1. Struttura visibile combatte abbandono da caos percepito.
2. Loop chiusi rinforzano identità affidabile.
3. Futuro prenotabile — ancora dentro il gioco motivazionale.
4. Ritmo sessioni — presenza misurabile senza moralismo.
5. Progetto lungo sulle schede — identità da endurance.
6. Quadro chiaro — messaggi trainer mirati — fiducia.
7. Indicatori come inviti — non verdetti — se voce giusta.
8. Continuità narrativa hub — meno sensazione di abbandono digitale.
9. Premium perception da studio professionale — disciplina che respira.
10. Governance personale — ripristino dell’agenzia sul next step.

### 10 Angoli cognitivi

1. Macro prima — micro dopo — working memory salvata.
2. Segmentazione per area — riduzione overwhelm da scanning simultaneo.
3. KPI come priorità solo se tradotti — altrimenti rumore ansiogeno.
4. Contesto provider unico — modello mentale stabile tra pagine figlie.
5. Collazione passato/futuro — timeline mentale integrata.
6. Linguaggio «da rivedere» — rischio etichetta vergogna — coaching decisivo.
7. Schede attive nel contesto — continuità verso pagine dedicate.
8. Sessioni ultimi 30 giorni — metrica di ritmo — non di valore morale.
9. Navigazione hub — affordance chiara — meno errore umano nella ricerca di informazioni.
10. Coerenza con tab Progressi — meno drift fra «progressi quantitativi» e «storico operativo».

### 10 Angoli trasformazione

1. Da caos a progetto con capitoli operativi.
2. Da sensazione di ritardo permanente a posizione aggiornabile sulla mappa.
3. Da backlog infinito a sequenza di next step onesti.
4. Da solitudine operativa a regia condivisa con il trainer.
5. Da lista senza senso a hub con priorità concordabili.
6. Da dropout silenzioso a continuità leggibile.
7. Da messaggi generici del trainer a pianificazione mirata dai KPI.
8. Da tensione Zeigarnik tossica a piano di chiusura gentile delle sessioni aperte.
9. Da tempo vissuto come limbo a tempo con appuntamenti futuri — ancora possibile.
10. Da premium indefinito a premium percepito — ordine — cura — sensazione studio.

### 10 Angoli engagement

1. Ritorno settimanale al hub — abitudine briefing implicito.
2. KPI come trigger di conversazioni mirate col trainer.
3. Sessioni aperte — engagement risolutivo — micro-orgoglio alla chiusura.
4. Appuntamenti — engagement temporale futuro — ancora dentro il progetto.
5. Schede — engagement narrativo lungo — curiosità sul piano d’insieme.
6. Schermo condiviso sul hub — pianificazione visibile — fiducia relazionale.
7. Sfida gentile — «una sessione aperta in meno questa settimana» — momentum realistico.
8. Continuità tra overview e drill-down — curiosità motivazionale senza perdita di filo.
9. Integrazione con messaggi push coerenti col contenuto hub — meno spaesamento digitale.
10. Premium hub usage trasparente — fiducia nel sistema gestionale nel lungo periodo.

### 10 Angoli relatable

1. «Mi sento sommerso anche quando mi alleno — è la testa.»
2. «Ho paura dei numeri «da rivedere».»
3. «Ho bisogno che qualcuno mi dica il prossimo passo sensato.»
4. «Mi sembra di essere sempre indietro anche quando faccio fatica.»
5. «Gli appuntamenti futuri mi calmiano — significa che non ho mollato tutto.»
6. «Odio le liste infinite — voglio capitoli.»
7. «Voglio sentirmi in un progetto — non in un debito.»
8. «Ho paura del giudizio quando vedo i KPI.»
9. «Voglio chiarezza più della motivazione hype.»
10. «Mi salva sapere che c’è una regia anche nei giorni brutti.»

### 10 Micro-frustrations

1. KPI letti come giudizio identitario.
2. Troppi arretrati senza priorità concordata — paralisi operativa.
3. Linguaggio implicito «ritardo» senza voce empatica — picchi di vergogna.
4. Hub incomprensibile se mai spiegato — overhead cognitivo — abbandono navigazione.
5. Assenza di appuntamenti futuri — vuoto temporale — senso di fine progetto — va gestito col trainer.
6. Accumulo sessioni aperte — overwhelm — serve piano micro-step.
7. Molte schede senza storytelling — rumore — serve guida narrativa.
8. Sensazione di backlog infinito senza «fine settimana» concordata — stanchezza motivazionale.
9. Confronto implicito con altri atleti immaginari — linguaggio tossico del trainer sui KPI.
10. Dati incoerenti — sensazione cheap — fiducia nel sistema che cala.

### 10 Micro-rewards

1. KPI positivi — sollievo da sensazione di progetto ancora vivo.
2. Next step chiaro dopo la panoramica — ansia ridotta — momentum gentile.
3. Chiusura di una sessione aperta — piccolo orgoglio di affidabilità personale.
4. Appuntamento futuro visibile — ancora dentro — ancoraggio emotivo forte.
5. Brief empatico del trainer dalla panoramica — fiducia nella relazione che sale.
6. Vista ordinata — calm premium — respiro cognitivo.
7. Pianificazione condivisa in videochiamata sul hub — legame forte.
8. Storia delle schede nel tempo — curiosità narrativa motivante.
9. Sessioni ultimi 30 giorni dignitose — prova sociale verso sé della presenza.
10. Contesto coerente tra pagine — sensazione cura del prodotto — fiducia nel gestionale.

### 10 Scene realistiche

1. Lunedì — trainer apre hub — definisce tre priorità — settimana più calma per l’atleta.
2. Atleta ansioso — panoramica mostra ancora appuntamenti futuri — speranza concreta.
3. Sera tardi — troppe sessioni aperte — si chiude una piccola — pace della mente.
4. Videochiamata — schermo condiviso sul hub — pianificazione condivisa — fiducia.
5. Dopo una pausa — KPI bassi — narrative di rientro senza umiliazione strutturata.
6. Momento «ho fallito» — la mappa mostra capitoli precedenti — contesto umano possibile.
7. Obiettivo evento — panoramica orienta mesociclo — chiarezza operativa.
8. Genitore-atleta — trainer mostra regia — minor vergogna educativa tossica — etica del linguaggio.
9. Staff in studio — hub proiettato — premium perception organizzativa — fiducia economica relazionale.
10. Notte di dubbio — ricordo di un appuntamento futuro nel sistema — ancora dentro il progetto — decisione di non mollare più morbida.

### 10 Scene scroll-stopping

1. Animazione KPI che si accendono in sequenza — VO «non sei lista infinita».
2. Split backlog caos vs tre passi chiari — twist motivazionale immediato.
3. Trainer copre parte dello schermo — «prima solo futuro appuntamenti» — calm reveal empatico.
4. Sondaggio Instagram sopra KPI sfocati — poi caption che riquadra la panoramica come ancora psicologica.
5. Montaggio veloce segmenti hub — suono leggero — sensazione control room professionale non ossessiva.
6. VO catastrofismo KPI — stop — ridefinizione priorità — twist empatico con tono sicuro.
7. Icone calendario animate — «il futuro del progetto esiste ancora».
8. Freccia animata overview→detail — metafora dell’ansia che scende quando segui l’ordine giusto di lettura.
9. Sagome astratte che puntano la stessa mappa — cooperazione senza esporre corpi.
10. Testo grande «capitoli» sopra lista verticale sfocata — hook narrativo premium calmo.

### 5 emozioni principali

1. Sollievo strutturale.
2. Ansia da arretrati percepiti.
3. Speranza da futuro prenotato.
4. Orgoglio da ritmo sessioni visibile.
5. Gratitudine per regia condivisa.

### 5 paure principali

1. Essere «indietro» senza possibilità di recupero narrativo.
2. Essere giudicati dai KPI.
3. Essere sommersi dal backlog.
4. Perdere il senso del progetto nel tempo.
5. Essere lasciati senza piano dopo numeri negativi.

### 5 desideri principali

1. Chiarezza del next step con dignità.
2. Sensazione di progetto ancora vivo.
3. Priorità invece di lista infinita.
4. Linguaggio empatico sui ritardi reali della vita.
5. Continuità tra allenamento e giorni difficili senza vergogna.

### 5 trigger motivazionali

1. Appuntamenti futuri visibili — ancora dentro il percorso.
2. KPI tradotti in piano — agenzia ripristinata.
3. Chiusura di una sessione aperta — piccolo orgoglio di affidabilità.
4. Sessioni ultimi 30 giorni dignitose — prova di presenza.
5. Hub compreso — più dialogo col trainer — meno silenzio — relazione più calda.

### Prima vs Dopo

**Prima:** sensazione di caos e ritardo permanente senza mappa né regia.

**Dopo:** sensazione di posizione progettuale aggiornabile — next step condivisi — meno abbandono silenzioso.

### La frase che vende davvero la pagina

«Non sei una lista infinita di debiti: sei un progetto con una regia — e la panoramica è il momento in cui torni a vedere il quadro intero prima di farti male con il dettaglio sbagliato.»

_Check qualità:_ hub overview + KPI + navigazione + contesto; rischio vergogna su «da rivedere» e mitigazione tramite coaching; italiano uniforme; niente note di bozza.\_
