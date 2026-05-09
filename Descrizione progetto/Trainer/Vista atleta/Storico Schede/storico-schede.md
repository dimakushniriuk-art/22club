# Storico — Schede — Analisi Profonda Atleta

## 0. Metadati pagina

- Nome pagina: Schede (hub storico allenamenti)
- URL analizzato: `http://localhost:3001/dashboard/atleti/{id}/progressi/storico/schede`
- Data analisi: 2026-05-09
- Cartella creata: `Descrizione progetto/Trainer/Vista atleta/Storico Schede`
- File markdown: `storico-schede.md`
- Funzione principale: Sezione `AthleteWorkoutsTab` con `hubSection="schede"` — elenco **Schede assegnate** ordinato dalla più recente (data creazione), includendo schede attive, archiviate e bozze, con `SchedaAssignmentList` e indicazione `giorniPerScheda` per contesto temporale.
- Ruolo principale: Atleta — **autobiografia dei programmi** — traccia leggibile del percorso oltre le singole sedute.
- Tipo workflow: Hub storico → tab Schede → lettura elenco programmi → comprensione di quale fase del percorso ogni scheda rappresenta.
- Tipo stress mentale: Medio — confronto con versioni passate del sé; paura di «non essere mai abbastanza avanzato».
- Tipo motivazione: Senso di **progetto cumulativo** — non random walk di allenamenti.
- Tipo reward psychology: Coerenza narrativa — «c’è stato un piano anche quando la giornata era nebbia».
- Tipo engagement: Curiosità genealogica — «da quale testa (scheda) è nata oggi la mia sessione?».
- Tipo continuità: Linea temporale di programmazione — ponte tra passato (archivio) e presente (attive).
- Stato pagina analizzato: Implementata (`storico/schede/page.tsx`, `AthleteWorkoutsTab` sezione `#section-schede`).
- Fonte analisi: Codice `athlete-workouts-tab.tsx` (sezione schede, testi, empty state con link a creazione scheda).
- Nota ID dinamico: `{id}` profilo atleta; **DINAMICA NON RISOLTA** per UUID reale in sessione.  
  Nota di contesto: questa rotta vive nel **dashboard staff** su atleta; la psicologia atleta qui è spesso **mediata** (come vede e commenta il trainer) e in parallelo a cosa l’atleta vive sull’app (Home / oggi).

---

## 1. Sintesi breve

È la pagina che dice: **il tuo allenamento non è stato rumore**, è stata una successione di «programmi» che ti hanno attraversato — anche quando hai saltato giorni. Conta perché la mente fragile tende a cancellare la continuità e ricordare solo i fallimenti isolati. Risolve il problema della sensazione «sto sempre ricominciando da zero». Emozione: sollievo da senso storico o ansia da confronto — dipende dal framing del trainer. Trasformazione: da frammenti mentali a **linea del tempo nominabile**. Continuità: vedere bozze/archivi/attivi insieme riduce la fantasia che «non ho mai avuto un piano».

---

## 2. Contesto reale atleta

Chi si allena vive spesso il presente come urgenza; la lista delle schede restituisce **profondità**: mesocicli, cambi di obiettivo, periodi di prova, pause mediche riflessi in stati di scheda. La parola «bozza» può calmare («non sono obbligato a essere perfetto») o innescare vergogna se letta come incompetenza.

---

## 3. Workflow reale

Hub storico → tab Schede → scroll elenco ordinato per creazione recente → lettura nome/stato/durata percepita (giorni per scheda) → collegamento mentale con sessioni e completati nelle altre tab.

---

## 4. Motivazione e continuità

Motivazione quando la lista mostra **più di una tappa** — prova che il percorso ha avuto capitoli. Continuità quando il trainer usa la cronologia per dire «non sei punto e a capo: sei capitolo successivo».

---

## 5. Stress e frustrazione

Stress da confronto implicito tra scheda «forte» del passato e presente fiacco — rischio narrativa tossica. Frustrazione se elenco vuoto senza messaggio di ingresso gentile (nel codice esiste empty state con invito a creare prima scheda — decisivo il tono umano attorno).

---

## 6. Reward psychology

Reward principale: **coerenza del piano messa in fila** — rinforzo identitario «non sono solo istinto: è esistito un progetto».

---

## 7. Progress perception

Progresso qui è **strutturale** più che numerico: passaggio tra programmi, archiviazioni, riattivazioni — percezione di maturità del percorso.

---

## 8. Fiducia nel trainer

Cresce quando la cronologia schede è letta come cura progettuale; cala se usata per «guarda quante volte ti ho rimesso in riga» — moralismo da catalogo.

---

## 9. Cognitive Load & Mental Energy

Medio-basso se le etichette stati sono chiare; rischio alto se il linguaggio è troppo «backend» (attiva/archiviata/bozza) senza traduzione empatica in seduta.

---

## 10. Engagement psychology

Curiosità da genealogia delle schede — «quale programma mi ha insegnato questo esercizio» — legame narrativo più forte della singola ripetizione.

---

## 11. Habit & Retention loops

Scheda come contenitore psicologico: chiude un capitolo (archivio) → apre obiettivo nuovo (nuova scheda) → rinnova senso di rinnovamento senza negare il passato.

---

## 12. Premium Perception

Premium quando la lista sembra **studio professionale** che conserva cartelle cliniche leggibili; cheap quando sembra magazzino numeretti senza storia.

---

## 13. Marketing intelligence

Messaggio: «Il tuo percorso ha **capitoli** — non sei reset ogni lunedì nella testa.»

---

## 14. Content & creative strategy

Story verticali «capitoli» con nomi di scheda blur — focus su sensazione di romanzo dell’allenamento, non su numeri.

---

## 15. Ecosystem athlete analysis

Collegata alla Panoramica (KPI schede attive), a Sessioni aperte (log legati a `scheda_id`), a Completati (storico chiusure) — la scheda è **spina dorsale narrativa** tra micro-sedute e macro-programma.

---

## 16. Analisi profonda della pagina

Le schede sono **memoria di progetto**: combattono la dissociazione tra «chi vorrei essere» e «cosa ho effettivamente messo in campo nel tempo». L’ordine per creazione recente mette in primo piano l’adattamento più nuovo — utile per futuro, rischioso se letto come cancellazione del valore del passato (serve equilibrio nel coaching). Bozze e archivi sono categorie emotive: bozza può essere libertà o fallimento percepito; archivio può essere closure orgogliosa o tomba di ambizioni — **la voce del trainer decide il trauma o il sollievo**. `giorniPerScheda` (densità) può alimentare ansia da volume o orgoglio da costanza — sempre framing. Empty state con «Crea Prima Scheda» è soglia simbolica: prima volta nel sistema vs senso di ritardo — messaging deve evitare umiliazione da ritardo percepito.

---

## 17. Output finale obbligatorio

### Riassunto operativo

Tab dedicata alle **schede assegnate** — cronologia programmi (recenti prima) — stati attivo/archiviato/bozza — contesto giorni per scheda dove applicabile.

### Riassunto emotivo

«Non sono solo giorni sparsi: sono **programmi** che hanno avuto un nome e una fine — anche quando la fine era un cambio di strada.»

### Riassunto motivazionale

Senso di capitoli — meno sensazione eterna di ricominciare dal fondo.

### Riassunto cognitivo

Modello mentale **ad albero**: scheda → giorni → sessioni — riduce caos nella testa.

### Problema reale

Sensazione di reset continuo e perdita di senso del percorso lungo.

### Stress eliminato

Parzialmente: caos «non so cosa sto seguendo» — se la lista è curata e spiegata.

### Motivazione creata

Prova che esisteva **pianificazione** — anche nei periodi incostanti.

### Reward psychology principale

Coerenza narrativa del piano — identità da progetto, non solo da fatica quotidiana.

### Trasformazione percepita

Da rumore di sedute a **romanzo** di programmi con titoli.

### Continuità supportata

Archivio + attivo + bozze insieme — meno black-and-white morale.

### Valore percepito

Servizio che «ti tiene la storia» — premium da studio organizzato.

### Fiducia generata

Trainer come autore di capitoli — non come giudice del singolo giorno.

### Effetto retention

Più difficile mollare quando il percorso ha **volume storico visibile** — meno «non è mai esistito nulla».

### Effetto engagement

Curiosità genealogica — ritorno alla pagina per contestualizzare dubbi sul presente.

### Messaggio più forte

«Non sei il fallimento dell’ultimo giorno: sei la successione dei programmi che hai accettato — anche quando alcuni erano bozza.»

### Visual hook più forte

Elenco ordinato con nomi di programma — sensazione biblioteca personale dell’allenamento.

### Copy hook più forte

«Capitoli» — metafora editoriale — dignità intellettuale del percorso.

### Concetto ads più forte

Il corpo cambia a capitoli — il gestionale lo ricorda quando la mente no.

### 25 Hooks Meta Ads

1. «Le schede sono capitoli — non spam di giorni.»
2. «Cronologia programmi — anti-sensazione reset infinito.»
3. «Attivo archiviato bozza — tre vite emotive diverse — serve voce umana.»
4. «TrainerDesk — storia dei piani — retention narrativa.»
5. «Da rumore di sedute — a successione di programmi nominabili.»
6. «Lista recente prima — futuro in testa — passato non cancellato.»
7. «Bozza — libertà o vergogna — decide il trainer — responsabilità relazione.»
8. «Archivio — chiusura di capitolo — orgoglio possibile se lettura empatica.»
9. «giorniPerScheda — densità — orgoglio o ansia — framing coaching.»
10. «Genealogia dell’allenamento — curiosità engagement alta.»
11. «Empty state — prima scheda — soglia — non umiliare chi arriva tardi.»
12. «Memoria di progetto — meno dissociazione identitaria.»
13. «Non sei solo sessione oggi — sei erede dei programmi passati.»
14. «Premium quando sembra studio — cheap quando magazzino numeri.»
15. «Capitoli nominabili — narrativa anti-abbandono silenziosa.»
16. «Lista lunga — proof di aver vissuto più fasi — endurance identitaria.»
17. «Lista corta — ingresso — ancora spazio per scrivere il romanzo.»
18. «Hub coerente — tab Schede — fuoco macro senza perdere micro altrove.»
19. «Coerenza pianificata — rinforzo identità progettuale — non solo emotiva del momento.»
20. «Trainer che racconta la cronologia — fiducia più alta dei badge.»
21. «Da «non so cosa sto seguendo» — a elenco leggibile — sollievo cognitivo.»
22. «Schede — spina dorsale — tra sessioni e completati — ecosistema sensato.»
23. «Ordine per creazione — adattamento nuovo visibile — speranza futura.»
24. «Identità: ho avuto piani — anche quando ho saltato giorni — meno menzogna identitaria.»
25. «TrainerDesk — cronologia schede — la memoria del progetto che la mente cancella.»

### 25 Headlines

1. Il percorso ha capitoli — non reset psicologico ogni settimana.
2. Schede: biblioteca personale dei tuoi programmi.
3. Da caos di giorni a successione di piani nominabili.
4. Attivo, archiviato, bozza — tre modi onesti di stare nel percorso.
5. La cronologia delle schede combatte la menzogna del «mai progettato nulla».
6. Il futuro in cima alla lista — il passato non sparisce.
7. Genealogia dell’allenamento — curiosità che aumenta continuità.
8. Memoria di progetto — meno dissociazione tra intenti e azioni.
9. Empty state: prima scheda come soglia — non come sentenza.
10. TrainerDesk: dove i programmi diventano storia leggibile.
11. Densità percepita (giorni) — orgoglio o ansia — coaching decisivo.
12. Archivio: chiudere un capitolo senza negare il valore del libro.
13. Bozza: permesso di imperfezione — se il linguaggio non punisce.
14. Premium perception: studio che conserva le cartelle giuste.
15. Lista lunga: prove di fasi vissute — identità da endurance.
16. Lista corta: ancora tutto da scrivere — invito senza vergogna tossica.
17. Hub storico: Schede come macro-lente sul micro delle sedute.
18. Non sei solo l’ultima sessione — sei erede dei programmi che hai accettato.
19. Coerenza pianificata — fiducia nel metodo oltre alla motivation quote vuota.
20. Continuità fragile — cronologia visibile — meno abbandono narrativo.
21. Capitoli nominabili — narrativa identitaria più stabile.
22. Trainer che spiega la successione — più importante della sola interfaccia.
23. Da sensazione caos — a modello ad albero scheda-giorno-sessione.
24. Schede: prova silenziosa che qualcuno ha pensato a te nel tempo.
25. TrainerDesk — cronologia programmi — dignità del percorso lungo.

### 25 Subheadlines

1. Ordine recente — presente e futuro in primo piano — speranza operativa.
2. Attivo/archiviato/bozza — traduzione umana necessaria — non solo etichette.
3. giorniPerScheda — contesto quantitativo gentile — se spiegato senza gara tossica.
4. Genealogia — engagement intellettivo — meno noia della sola lista sedute.
5. Empty state — invito — mai umiliazione da ritardo percepito.
6. Lista nutrita — film dei capitoli — orgoglio discreto dell’evoluzione.
7. Lista magra — ingresso — ancora bianco utile — non fallimento totale.
8. Hub tab Schede — fuoco macro — micro altrove — meno overload ansioso.
9. Archivio — closure possibile — dolore o sollievo — voce trainer decisiva.
10. Bozza — libertà creativa — o vergogna — dipende dal modo in cui il trainer incornicia il concetto — senza umiliare.
11. Continuità narrativa tra Panoramica KPI e lista — modello mentale stabile.
12. Premium quando nomi e stati sono cura — cheap quando inventario freddo.
13. Capitoli vs giorni isolati — literacy temporale anti catastrofismo.
14. Trainer racconta successione — retention relazionale lunga.
15. Schede legano sessioni aperte e completati — triangolo narrativo completo.
16. Memoria progetto — anti «non sono mai stato serio» — prova strutturale.
17. Identità progettuale — rinforzo etico — non flex Instagram tossico.
18. Curiosità storica — ritorno alla pagina — abitudine riflessiva sana.
19. Coerenza ecosistema — stesso atleta — stessa spina dorsale — fiducia nel sistema.
20. Sensazione studio professionale — tempo rispettato anche nella storia.
21. Cronologia — anti ghosting del piano — «esisteva qualcosa anche nei giorni no».
22. Bozza ben contestualizzata — riduce vergogna da imperfezione — più probabilità di restare all’inizio del percorso.
23. Archivio ben contestualizzato — aumenta orgoglio da capitoli chiusi — morale non tossica.
24. Lista come autobiografia abbreviata — letteratura identitaria dell’allenamento.
25. TrainerDesk — Schede — dove il lungo periodo torna visibile alla mente corta.

### 25 Hooks Instagram

1. «Capitoli blur — privacy — storia comunque sensibile.»
2. «Cronologia programmi — anti-reset narrativo tossico.»
3. «Genealogia allenamento — curiosità engagement — scroll dolce.»
4. «Attivo archiviato bozza — tre emozioni — serve voce calma.»
5. «Lista recente — futuro leggibile — ancora dentro il progetto macro.»
6. «Empty state — prima scheda — soglia dignitosa — mai umiliazione.»
7. «Trainer racconta capitoli — più dei badge — fiducia relazione.»
8. «Da rumore giorni — a piani nominabili — sollievo identitario.»
9. «Memoria progetto — meno dissociazione — più presenza adulta.»
10. «Hub Schede — macro-lente — ansia da micro ridotta strutturalmente.»
11. «Archivio — chiusura capitolo — orgoglio se lettura empatica.»
12. «Bozza — libertà — se linguaggio non punisce — ingresso gentile nel percorso.»
13. «giorniPerScheda — densità — frame coaching — non gara social.»
14. «Lista lunga — film capitoli — endurance identitaria — calma premium.»
15. «Lista corta — bianco utile — ancora spazio — non vergogna infinita.»
16. «TrainerDesk — cronologia schede — storia che la mente cancella.»
17. «Capitoli vs giorno isolato — zoom narrativo — ansia ridotta.»
18. «Premium studio — cheap magazzino — contrasto educativo netto.»
19. «Coerenza triangolo hub — sessioni completati schede — modello stabile.»
20. «Non sei ultimo giorno — sei successione programmi — respira.»
21. «Curiosità genealogica — ritorno pagina — abitudine riflessiva sana.»
22. «Identità progettuale — rinforzo etico — non flex tossico.»
23. «Cronologia — prova pianificazione esistita — meno menzogna identitaria.»
24. «Voce trainer su cronologia — retention relazione lunga — decisiva.»
25. «TrainerDesk — Schede — romanzo dell’allenamento — dignità lunga.»

### 25 Hooks TikTok

1. POV: apri Schede — vedi capitoli — non sei reset.
2. «Plot twist: la bozza non è fallimento — è permesso — se il trainer lo dice bene.»
3. «Archivio — chiusura — orgoglio — o lutto — tono decide tutto.»
4. «Lista recente — futuro in cima — passato non sparisce — speranza.»
5. «Genealogia — da dove viene oggi — curiosità engagement alta.»
6. «Empty state — prima scheda — soglia — respira — ingresso dignitoso.»
7. «giorniPerScheda — densità — incorniciatura da allenamento — non gara sociale tossica.»
8. «Da caos giorni — a piani nominabili — shift cognitivo emotivo.»
9. «Memoria progetto — anti dissociazione intenti-azioni — adultità.»
10. «Hub macro Schede — meno panico micro panico altrove — struttura.»
11. «Capitoli blur — privacy — storia sensibile — etica marketing.»
12. «Voce del trainer sulla cronologia — più dell’interfaccia — fiducia nella relazione — sempre.»
13. «Lista lunga — film capitoli — orgoglio discreto — endurance.»
14. «Lista corta — bianco — ancora tutto da scrivere — invito.»
15. «Attivo archiviato bozza — tre vite emotive — traduzione umana.»
16. «Premium studio vs cheap magazzino — contrasto netto educativo.»
17. «Cronologia — prova pianificazione — meno menzogna identitaria.»
18. «Triangolo schede-sessioni-completati — racconto intero motivazionale.»
19. «Non sei ultimo giorno brutto — sei successione — zoom narrativo.»
20. «Curiosità storica — abitudine riflessiva — retention dolce.»
21. «Identità progettuale — rinforzo etico — anti hype vuoto.»
22. «TrainerDesk — Schede — lungo periodo visibile — mente corta aiutata.»
23. «Cronologia — ghosting del piano ridotto — esisteva qualcosa anche nei giorni no.»
24. «Capitoli — letteratura identitaria — dignità intellettuale percorso.»
25. «Respira — capitoli — non reset — TrainerDesk — storia leggibile.»

### 10 Idee Reels

1. Voce fuori campo calma su elenco blur — metafora biblioteca capitoli — priorità alla privacy.
2. Split «mente reset» vs schermo con più titoli scheda — twist educativo.
3. Trainer spiega bozza senza umiliare — primo ingresso dignitoso — fiducia.
4. Animazione libro che si apre — capitoli = schede — metafora editoriale.
5. Ironia soft tra magazzino freddo e studio curato — risata terapeutica contenuta.
6. Co-view trainer-atleta sulla cronologia — bonding narrativo pianificazione.
7. Montaggio veloce stati attivo/archiviato — didascalie umane sovrapposte.
8. Testimonianza etica consensuale «capitolo chiuso mi ha dato pace» — relatability.
9. Astratto: solo spine/titoli blur — messaggio senza dati sensibili literal.
10. «Prima scheda» — soglia — voce che normalizza ritardi di ingresso — senza far sentire in colpa.

### 10 Idee Carousel

1. Reset narrativo tossico — cronologia oggettiva — confronto educativo.
2. Bozza — tre letture emotive possibili — confini chiari nel modo di parlarne.
3. Archivio — lutto vs orgoglio — linguaggio trainer decisivo.
4. Macro Schede — micro sedute altrove — literacy ecosistema hub.
5. giorniPerScheda — frame gentile vs gara tossica — contrasto netto.
6. Lista lunga vs corta — nessuna delle due è sentenza morale assoluta.
7. Genealogia — curiosità — engagement intellettivo — retention dolce.
8. Empty state — invito prima scheda — dignità ingresso — mai freddo.
9. Triangolo schede-sessioni-completati — racconto intero anti drift ansioso.
10. Premium studio — inventario cheap — decisione di tono nel marketing.

### 10 Idee Stories

1. Sondaggio: ti senti più «capitoli» o più «giorni persi»?
2. Quiz: bozza = fallimento? (provocazione educativa poi twist empatico)
3. Sticker «capitolo» minimal — metafora narrativa identitaria.
4. Countdown soft «prossimo capitolo» — metafora progetto — senza pressione tossica.
5. Prompt DM: «che nome daresti al capitolo attuale?» — literacy gentile.
6. Menzione trainer che spiega successione senza moralismo — fiducia.
7. Reminder: respira prima di confrontarti col capitolo passato — ritualità anti-panico.
8. Mini-verità: archivio non è tomba se il linguaggio è giusto — ripeti finché calma.
9. Link voce guida su lettura cronologia senza pagellarismo.
10. Ponte soft verso Completati — micro vs macro prova — duo narrativo.

### 10 Idee Static Ads

1. Icona libro astratta — headline «capitoli» — minimal premium.
2. Titoli blur verticali — claim «cronologia programmi».
3. Prima reset mentale — dopo elenco leggibile — contrasto astratto.
4. Citazione trainer breve — successione empatica — fiducia.
5. Tre pill attivo/archiviato/bozza — didascalie umane piccole.
6. Diagramma macro Schede — micro altrove — ansia ridotta message.
7. TrainerDesk lockup — cronologia progetto — dignità lungo periodo.
8. Headline «non sei reset» — palette calma astratta.
9. Claim «memoria del piano» — letteratura identitaria allenamento.
10. Sagome astratte — privacy — messaggio capitoli senza dati literal.

### 10 Angoli emotivi

1. Orgoglio da capitoli chiusi bene contestualizzati.
2. Vergogna da bozza se linguaggio punitivo.
3. Sollievo da cronologia che nega reset mentale.
4. Nostalgia da scheda archiviata — lutto o orgoglio — tono trainer.
5. Curiosità genealogica verso origine di oggi.
6. Ansia da densità giorni se letta come gara.
7. Calma da modello ad albero chiaro nella testa.
8. Gratitudine verso trainer che narra successione senza moralismo.
9. Tristezza lista vuota — mitigabile empty state empatico.
10. Fiducia quando studio conserva storia con cura.

### 10 Angoli motivazionali

1. Capitoli nominabili — identità più stabile della singola seduta.
2. Memoria progetto — prova serietà strutturale nel tempo.
3. Genealogia — curiosità che riporta alla pagina — retention dolce.
4. Futuro in cima alla lista — speranza senza cancellare passato.
5. Triangolo hub — senso ecosistema — meno spaesamento digitale.
6. Archivio come closure possibile — morale non tossica con voce giusta.
7. Bozza come permesso — ingresso senza vergogna infinita se mediato dal trainer.
8. Coerenza macro Schede — ansia micro ridotta per literacy strutturale.

### 10 Angoli cognitivi

1. Modello scheda-giorno-sessione — tree mentale anti caos.
2. Ordine per creazione — aggiornamento adattivo visibile — piano vivo.
3. Stati espliciti — meno inferenze ansiogene errate.
4. Continuità KPI Panoramica ↔ lista — drift ridotto tra schermate.
5. Literacy temporale capitoli vs giorni isolati — anti catastrofismo.
6. Empty state chiaro — soglia ingresso — meno ambiguità su «cosa manca».
7. giorniPerScheda — ancoraggio quantitativo — serve contesto verbale umano.
8. Distinzione bozza/archivio/attivo — categorie cognitive utenti non tecnici.
9. Cronologia vs memoria ansiosa distorta — memoria esterna positiva.
10. Hub dedicato — attenzione sul macro — meno dispersione fra schermate.

### 10 Angoli trasformazione

1. Da reset mentale settimanale a successione di capitoli documentata.
2. Da caos nomeless a titoli di programma — dignità narrativa.
3. Da vergogna bozza a permesso di imperfezione — se il trainer fissa confini linguistici chiari.
4. Da lutto implicito archivio a closure orgogliosa — linguaggio trainer.
5. Da dissociazione intenti-azioni a prova progettuale nel tempo.
6. Da lista vuota come sentenza a soglia dignitosa di ingresso.
7. Da micro-fissazione seduta a macro-comprensione percorso — zoom salubre.
8. Da inventario freddo a biblioteca curata — premium perception.
9. Da narrativa «non ho mai progettato» a elenco oggettivo di piani esistiti.
10. Da isolamento digitale a senso ecosistema hub — continuità motivazionale.

### 10 Angoli engagement

1. Curiosità genealogica — ritorno alla pagina — loop riflessivo positivo.
2. Story prompt nome capitolo — micro-commitment creativo leggero.
3. Co-view cronologia — pianificazione insieme — bonding trainer-atleta.
4. Tab Schede — ripetibilità navigazione — abitudine hub storico.
5. Empty state invito — passaggio morbido verso la prima scheda — più probabilità di restare nel percorso.
6. Connessione narrativa verso Completati — micro prove dentro macro capitoli — literacy motivazionale.
7. Connessione verso Sessioni aperte — log con scheda — Zeigarnik dentro capitolo — tensione narrativa utile.
8. Voce del trainer sulla successione — legame più forte della sola interfaccia.
9. Reminder gentile «leggi cronologia prima di giudicarti» — ritualità anti-autosabotaggio.
10. Education bite «cosa significa archiviato» — ansia da jargon ridotta — fiducia prodotto.

### 10 Angoli relatable

1. «Ho paura che la bozza dica che sono un fallimento.»
2. «Mi sembra di ricominciare sempre — vorrei vedere capitoli.»
3. «Odio confrontarmi con versioni passate di me.»
4. «Voglio capire da dove viene quello che faccio oggi.»
5. «Ho bisogno che qualcuno mi racconti la successione senza giudizio.»
6. «Le parole attivo/archiviato mi stressano — sembro un database.»
7. «Voglio sensazione studio — non magazzino freddo.»
8. «Lista vuota mi fa sentire in ritardo — serve contesto umano.»
9. «Voglio orgoglio per un capitolo chiuso — non solo ansia per il prossimo.»
10. «Ho bisogno di memoria del piano — la mia mente la distortisce.»

### 10 Micro-frustrations

1. Linguaggio stato troppo tecnico senza traduzione empatica.
2. Confronto tossico tra capitoli «gloriosi» e presente fiacco — narrativa trainer sbagliata.
3. Lista vuota letta come assenza totale di valore — serve empty state caldo.
4. densità giorni letta come gara social implicita — anxiety spike.
5. Archivio letto come tomba delle ambizioni — picco di vergogna — linguaggio decisivo.
6. Bozza letta come incompetenza — vergogna all’ingresso — meno probabilità di restare.
7. Navigazione hub confusa — Schede vs Panoramica — drift cognitivo ansioso.
8. Errori dati cronologia — sfiducia sistema — cura prerequisito fiducia premium.

### 10 Micro-rewards

1. Titoli scheda chiari — sensazione progetto professionale curato.
2. Ordine recente — futuro leggibile — ancora dentro piano macro.
3. Stati spiegati bene — calma cognitiva — fiducia nel percorso.
4. Cronologia nutrita — film capitoli — orgoglio discreto endurance identitaria.
5. Trainer narra successione — bonding — retention relazionale lunga.

### 10 Scene realistiche

1. Lunedì — scroll Schede — «ecco da dove viene oggi» — sollievo contesto.
2. Seduta video — trainer apre cronologia — racconto capitoli — fiducia.
3. Dopo pausa lunga — lista mostra archivi — coaching «non sei punto zero» — rientro dignitoso.
4. Notte dubbio — ricordi titoli programma — ancora senso lungo periodo — meno mollo definitivo.
5. Atleta neo — empty state — trainer normalizza ingresso — soglia senza vergogna.

### 10 Scene scroll-stopping

1. Split mente «reset» vs schermo con più titoli — twist immediato.
2. Voce fuori campo «bozza» — stop — twist empatico sul permesso — dignità nel primo passo.
3. Libro animato che aggiunge capitoli blur — metafora premium astratta.
4. Contrasto magazzino vs studio — risata educativa contenuta.
5. Poll «capitoli o giorni persi» — engagement riflessivo rapido.

### 5 emozioni principali

1. Curiosità genealogica.
2. Orgoglio da capitoli ben chiusi narrati bene.
3. Vergogna da bozza/archivio mal letti.
4. Sollievo da cronologia anti-reset.
5. Gratitudine per narrazione empatica della successione.

### 5 paure principali

1. Essere giudicati dal tipo di scheda o dallo stato.
2. Restare con lista vuota — sensazione ritardo esistenziale.
3. Confronto tossico col passato glorificato dalla mente.
4. Essere «dati» in inventario — depersonalizzazione fredda.
5. Non capire cosa significano stati — ansia da jargon.

### 5 desideri principali

1. Vedere il percorso come capitoli — non come giorni buttati.
2. Linguaggio umano su bozza/archivio/attivo — meno vergogna gratuita.
3. Sensazione studio professionale — ordine della storia personale.
4. Genealogia «da dove viene oggi» — chiarezza motivazionale.
5. Cronologia come prova che il piano è esistito — anche nei giorni saltati.

### 5 trigger motivazionali

1. Titoli di programma visibili — narrativa identitaria strutturata.
2. Trainer che racconta successione — più dei badge — fiducia relazione.
3. Ordine recente — ancora spazio futuro nel progetto macro — speranza.
4. Triangolo hub — senso intero percorso — meno abbandono digitale.
5. Empty state dignitoso — soglia ingresso — primo passo senza umiliazione.

### Prima vs Dopo

**Prima:** sensazione di reset continuo e caos di giorni senza struttura narrativa propria.

**Dopo:** successione di capitoli nominabili — modello ad albero chiaro — memoria del piano che la mente ansiosa tendeva a negare — fiducia nel metodo e nel tempo lungo quando la voce del trainer resta empatica.

### La frase che vende davvero la pagina

«Non sei una serie infinita di lunedì identici: sei una sequenza di programmi che hanno avuto un nome — e quel nome è la prova che il percorso ha pensato a te anche quando tu non riuscivi a pensare al percorso.»
