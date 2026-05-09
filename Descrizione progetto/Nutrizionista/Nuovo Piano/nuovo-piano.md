# Nuovo Piano Nutrizionista — Analisi Profonda Atleta

==================================================

## 0. Metadati pagina

==================================================

- **Nome pagina:** Wizard nuovo piano nutrizionale (staff)
- **URL analizzato:** `http://localhost:3001/dashboard/nutrizionista/piani/nuovo` e `http://localhost:3001/dashboard/nutrizionista/piani/nuovo?atleta={athleteId}`
- **Data analisi:** 2026-05-09
- **Cartella creata:** `Descrizione progetto/Atleta/Nuovo Piano Nutrizionista`
- **File markdown:** `nuovo-piano-nutrizionista.md`
- **Funzione principale:** Wizard a step (calorie → macro → pasti → durata → struttura → conferma), selezione atleta con ricerca; query `atleta` pre-compila UUID e avanza allo step 1; preset template nutrizionali; salvataggio piano/versione attiva su Supabase.
- **Ruolo principale:** Atleta _(effetto psicologico di ricevere un piano costruito con metodo visibile)_
- **Superficie UI:** Nutrizionista.
- **Tipo workflow:** Costruzione sequenziale dell’impegno prima della promessa pubblica/privata all’atleta.
- **Tipo stress mentale:** Basso se seguito da comunicazione umana; alto se numeri finiscono come sentenza senza contesto.
- **Tipo motivazione:** Chiarezza delle regole del gioco quotidiano — meno negoziazione ossessiva con la fame.
- **Tipo reward psychology:** Sensazione di essere **progettata/o**, non solo misurata/o.
- **Tipo engagement:** Piano internamente coerente (macro/pasti/tempo) aumenta credibilità percepita — base di aderenza.
- **Tipo continuità:** Nuovo capitolo ben formato riduce mismatch tra documento e vita.
- **Stato pagina analizzato:** `src/app/dashboard/nutrizionista/piani/nuovo/page.tsx`.
- **Fonte analisi:** Codice (`atletaFromUrl`, `STEPS`, preset).
- **Nota ID dinamico:** `{athleteId}` — **DINAMICA NON RISOLTA** senza UUID reale in sessione; uso tipico da lista atleti con `?atleta=`.

==================================================

## 1. Sintesi breve

==================================================

Il wizard è il laboratorio dove il nutrizionista **assembla coerenza** prima di chiederla all’atleta. Il parametro URL `atleta` è una micro-gentilezza che dice: “ti sto già guardando mentre costruisco”. Senza voce umana dopo la conferma, il wizard resta una macchina che produce numeri — e i numeri senza cornice emotiva diventano giudici. La motivazione fragile ha bisogno di piani che non si contraddicono da soli tra macro e pasti: questo wizard esiste proprio per abbassare quella contraddizione tecnica che diventa vergogna morale.

==================================================

## Sezioni analisi

==================================================

### 1. Contesto reale atleta

Ha già abbastanza diete da feed; cerca **legittimità** del piano — sensazione che sia stato pensato per lei, non scaricato.

### 2. Workflow reale

Selezione atleta → step → conferma → piano disponibile → comunicazione atleta (PDF/chat/visita). Il `?atleta=` elimina attrito e velocizza il momento in cui l’atleta smette di essere nel limbo “senza piano aggiornato”.

### 3. Motivazione e continuità

Sequenza logica aumenta probabilità che il piano sia credibile giorno 1 — punto critico per continuità.

### 4. Stress e frustrazione

Stress da preset incauti senza contestualizzazione dopo. Frustrazione da macro impossibili da cucinare nella vita reale senza adattamento comunicativo.

### 5. Reward psychology

Reward massimo: messaggio post-conferma che traduce step in **giornata tipo** — trasforma numeri in abitudine mentale possibile.

### 6. Progress perception

Wizard prepara milestone temporale sul piano — utile per cornice “capitolo nuovo” nella testa dell’atleta.

### 7. Fiducia nel nutrizionista

Fiducia quando coerenza tecnica interna si accompagna a voce empatica esterna — wizard solo non basta.

### 8. Cognitive Load & Mental Energy

Staff: carico alto ma canalizzato dagli step — bene per ridurre errori di progettazione. Atleta: deve ricevere sintesi — non tutta la complessità.

### 9. Engagement psychology

URL dedicato aumenta quantità di piani completati senza lasciare vuoti — meno gap “senza piano aggiornato” per l’atleta assegnato.

### 10. Habit & Retention loops

Nuovo piano ben comunicato → aderenza iniziale → dati → revisione — ciclo positivo.

### 11. Premium Perception

Premium: progetto + comunicazione. Scadente: numeri stampati senza adattamento alla persona.

### 12. Emotional reinforcement

Rinforzo positivo nel celebrare il nuovo capitolo senza punire il passato.

### 13. Marketing intelligence

Messaggio esterno: nutrizione come ingegneria dell’aderenza — non punizione estetica.

### 14. Content & creative strategy

Dietro le quinte del wizard — contenuti educativi che umanizzano il metodo senza diet culture tossica.

### 15. Ecosystem athlete analysis

Collegamenti a lista piani, documenti PDF, profilo atleta, chat post-conferma — wizard è premessa materiale.

### 16. Analisi profonda della pagina

Il cuore è **coerenza interna prima della obbedienza esterna**. La motivazione fragile odia piani che si contraddicono — perché poi interpreta la contraddizione come proprio carattere difettoso. Questo flusso riduce errori metodici che diventano ferite emotive.

### 17. Output finale obbligatorio

- **Riassunto operativo:** Wizard 6 step; `?atleta=` salta selezione e parte da step 1; preset disponibili.
- **Riassunto emotivo:** Da numeri sparsi a progetto promesso — se comunicato dopo.
- **Riassunto motivazionale:** Chiarezza che riduce sensi di colpa ingiusti da incoerenze interne al piano.
- **Riassunto cognitivo:** Step sequenziali riducono errori macro/pasti/tempo.
- **Problema reale:** Foglio incoerente → circolo vizioso di vergogna.
- **Stress eliminato:** Ambiguità su cosa seguire dopo decisione professionista.
- **Motivazione creata:** Sensazione di piano costruito metodicamente.
- **Reward psychology principale:** Essere progettata/o nel metodo.
- **Trasformazione percepita:** Da confusione a capitolo nuovo credibile.
- **Continuità supportata:** Struttura completa prima dell’impegno.
- **Valore percepito:** Professionalità metodica.
- **Fiducia generata:** Coerenza numeri-struttura + voce dopo.
- **Effetto retention:** Meno dropout da piano internamente contraddittorio.
- **Effetto engagement:** Avvio forte post-conferma se onboarding verbale match.
- **Messaggio più forte:** Prima costruiamo coerenza, poi chiediamo aderenza.
- **Visual hook più forte:** Metafora ponteggi — costruzione prima dell’abitare.
- **Copy hook più forte:** Nomi step UI (“Macro”, “Pasti”, “Durata”) — promessa di completezza.
- **Concetto ads più forte:** Nutrizione da cantiere ordinato — non da foglio buttato lì.

_(Segue: blocchi da 25 Hooks Meta Ads già inclusi in documenti gemelli — qui lista completa autonoma.)_

**25 Hooks Meta Ads**

1. Prima la coerenza, poi la disciplina — altrimenti la disciplina diventa punizione.
2. Piano costruito ≠ piano scaricato — fiducia diversa.
3. Macro e pasti nella stessa storia — meno vergogna da foglio incoerente.
4. Il wizard che convince la testa prima della bilancia.
5. Nutrizione adulta: sequenza prima della promessa.
6. Template ok come punto di partenza — identità viene dopo la voce umana.
7. URL con `atleta`: ti sto già guardando mentre preparo il capitolo nuovo.
8. Da confusione quotidiana a struttura promessa — sollievo indiretto.
9. Meno richieste emergenziali post-piano se il piano nasce completo — calma per tutti.
10. Continuità nasce quando il piano non si contraddice da solo.
11. Ingegneria dell’aderenza: anche come clicchi gli step conta — metodo visibile.
12. Sensazione di essere progettata/o — reward psicologico massimo.
13. Stop alla narrativa “non hai volontà”: spesso hai solo incoerenze interne al piano.
14. Allenamento periodizzato + piano costruito — meno frattura identitaria.
15. Da esperimento random a sequenza professionale — fiducia diversa.
16. Nutrizione sportiva seria include progettazione — non solo monitoraggio.
17. Più retention quando il piano è credibile giorno uno — verità operativa.
18. Il club che costruisce piani come costruisce risultati — brand adulto.
19. Percezione premium: metodo visibile — non solo PDF estetico.
20. Dropout silenzioso da mismatch tecnico interno — riducibile qui prima ancora che in chat.
21. Fame nervosa combatte anche con chiarezza strutturale — non solo moralismo.
22. Da cliente template a persona nel progetto — empowerment se comunicazione match.
23. Wizard come ponte tra dati e dignità — tenuto solo se dopo arriva voce coerente.
24. Il piano che regge la sera vale più della ramanzina del mattino — cornice adulta.
25. Nutrizione integrata include come nasce il piano — non solo cosa dice il PDF.

**25 Headlines**

1. Costruisci il piano prima di chiedere obbedienza.
2. Coerenza macro-pasti: antibiotico alla vergogna da foglio incoerente.
3. Il wizard che trasforma numeri in progetto credibile.
4. Nuovo capitolo nutrizionale — non nuova punizione.
5. URL dedicato: meno anonimato operativo, più cura percepita.
6. Da foglio arbitrario a piano costruito — fiducia diversa.
7. Meno “non so cosa seguo”, più struttura esplicita.
8. Template come punto di partenza responsabile — non come identità intercambiabile.
9. Fine wizard ≠ fine cura: serve la voce che traduce nella giornata.
10. Ingegneria dell’aderenza quotidiana — mentalità da club serio.
11. Piano che non si pesta i piedi tra macro e pasti — sollievo tecnico che diventa emotivo.
12. Allenamento e nutrizione: progettazione parallela nella testa — meno frattura.
13. Sensazione premium quando il piano nasce da dialogo precedente — wizard è stampo.
14. Da ansia da diet trend a progetto adulto — cornice identitaria più stabile.
15. Continuità misurabile in step completati — sollievo anche per staff saturo.
16. Più piani completati in tempo grazie a `?atleta=` — meno vuoti per l’atleta.
17. Meno chat emergenziali caotiche se il piano nasce completo — effetto domino calmo.
18. Motivazione fragile: bisogno di prove che il metodo non sia arbitrario.
19. Da confronto social tossico a regole chiare tue — cornice interna più forte.
20. Il valore non è rigidità — è coerenza interna promessa.
21. Capitolo nuovo ben introdotto — micro-celebrazione — retention più stabile.
22. Wizard disciplinato + voce empatica dopo — sistema integrato premium.
23. Dropout da piano incoerente internamente — riducibile con flusso di lavoro serio.
24. Il nutrizionista che progetta come progetta una progressione — fiducia diversa.
25. Non è un foglio: è un progetto con fondamenta — se poi cammini con la persona.

**25 Subheadlines**

1. Perché la sequenza degli step cambia la fiducia prima ancora del PDF.
2. Come evitare preset senza contesto umano dopo — errore da servizio scadente frequente.
3. `atleta` nel URL: più piani completati in meno attrito — gap più corti per chi è assegnato.
4. Da sensazione di essere misurata a sensazione di essere progettata — shift premium.
5. Transfer cognitivo: struttura pasti chiara → meno rumore serale decisionale.
6. Continuità emotiva quando il piano non è un ultimatum mal costruito.
7. Wizard come prova di metodo — non come schermata amministrativa vuota.
8. Sensazione da prodotto scadente quando il wizard finisce ma la comunicazione no — deriva da evitare.
9. Micro-frustrazione: salvare piano senza messaggio successivo — flusso di lavoro del club critico.
10. Micro-reward: conferma che traduce step in giornata tipo — indispensabile.
11. Stop mitologia volontà infinita: serve progetto credibile quotidiano realistico.
12. Allenamento e nutrizione convergenti solo se piano realistico — verità operativa.
13. Identità atleta: meno frattura se piano e volume allenamenti dialogano — progettazione coerente.
14. Preset sbagliato senza contesto ferisce — cultura staff che accompagna i preset.
15. Piano che regge la sera — più della ramanzina del mattino — framing adulto.
16. Wizard riduce incoerenze interne — ma non sostituisce la relazione — etica professionale.
17. Da cliente template a persona nel progetto — empowerment narrativo se comunicazione vera.
18. Più retention quando il piano non è promessa contraddittoria — problema reale frequente.
19. Continuità premium misurata in revisioni sensate — non in hashtag motivazionali.
20. Nutrizione integrata include integrazione metodica nella creazione — claim da club serio.
21. Micro-passi wizard → macro fiducia — se la voce completa il cerchio.
22. Sensazione di fallimento quando macro e pasti si contraddicono — spesso evitabile.
23. Capitolo nuovo: linguaggio da squadra sul piano — partnership percepita.
24. Da esperimento internet a progetto supervisionato — dignità ritrovata.
25. Il vero valore è wizard + voce + follow-through — triade premium.

**25 Hooks Instagram**

1. “Macro ok, pasti impossibili.” Il wizard combatte l’incoerenza prima che diventi vergogna.
2. URL con `atleta` nel link — dettaglio operativo — messaggio psicologico: non sei anonima mentre preparo.
3. Piano costruito vs piano scaricato — ti ci rivedi se hai mai mollato per un foglio incoerente.
4. Step sequenziali — prove di serietà metodica — premium non aesthetic vuota.
5. Preset come punto di partenza — non come identità — caption adulta.
6. Fine wizard ≠ fine cura: serve voce che traduce numeri nella tua giornata.
7. Da confusione serale a struttura promessa — sollievo quando dopo arriva guida umana.
8. Nutrizione sportiva è anche ingegneria dell’aderenza — wizard incluso.
9. Stop “non hai volontà”: spesso hai un piano che si contraddice dentro.
10. Weekend caos → lunedì capitolo nuovo — narrativa potente se tono non punitivo.
11. Allenamento intenso + piano chiaro nella testa — meno frattura identitaria.
12. Sensazione da prodotto scadente quando ci sono solo numeri senza dialogo dopo — promessa premium tradita.
13. Da foglio che giudica a progetto che accompagna — cambio cornice emotiva.
14. Continuità premium quando macro/pasti/tempo tornano sensati insieme.
15. Più retention quando il piano non è promessa contraddittoria — verità operativa.
16. Capitolo nuovo: micro-celebrazione sobria — rinforzo non tossico.
17. Wizard come ponte tra dati e dignità — tenuto solo se dopo voce coerente.
18. Da cliente template a persona nel progetto — empowerment se comunicazione tiene fede al wizard.
19. Nutrizione integrata include anche come nasce il piano — non solo PDF finale.
20. Preset sbagliato senza contesto ferisce — serve staff che accompagna con voce.
21. Micro-passi wizard → macro fiducia — partnership percepita se cerchio chiuso.
22. Il piano che regge la sera vale più della ramanzina del mattino — cornice adulta.
23. Sensazione di essere progettata quando la logica interna torna — prima della bilancia.
24. Dropout silenzioso da mismatch tecnico — parliamone senza tabù diet culture.
25. Il nutrizionista che costruisce come una progressione — fiducia diversa dalla dieta influencer.

**25 Hooks TikTok**

1. POV: macro giuste ma pasti impossibili — twist: wizard che rende il piano logicamente coerente prima della promessa.
2. Split screen: piano che si contraddice vs piano completato in sequenza — sollievo realistico se poi arriva anche la voce umana.
3. URL con `atleta` nel link — dettaglio tecnico — messaggio psicologico: ti sto già guardando mentre preparo il capitolo nuovo.
4. Template selezionato frettolosamente — comedy leggera — twist: serve contestualizzazione dopo — etica operativa.
5. Time-lapse degli step — da caos mentale a progetto ordinato — reveal educativo non tossico.
6. “Ho fallito il piano” → reframe: “forse il piano era incoerente dentro” — tono collaborativo adulto.
7. Click finali del wizard — sollievo solo se dopo arriva una frase che traduce la giornata.
8. Allenamento che avanza e piano fermo — tensione identitaria — progetto integrato aiuta la testa se davvero nel servizio.
9. Da screenshot di diete influencer a progetto supervisionato — dignità diversa — contrast educativo rispettoso.
10. Sei step — non magia — metodo visibile — tono professionale calmo senza hype tossico.
11. Preset utile come punto di partenza — rischioso come identità senza voce — lezione rapida e vera.
12. Sera in cucina caos — struttura ha senso solo se qualcuno traduce in mosse piccole dopo il wizard.
13. Pressioni in famiglia sul piatto — piano chiaro aiuta confini gentili — scenario molto comune.
14. Scroll infinito di diete — interruzione “costruiamo prima di scrollare altro” — joke educativo rispettoso.
15. “Il nemico non è il numero — è l’incoerenza dentro il piano” — caption forte sobria.
16. PR in palestra ma piano incoerente — tensione — allineamento progettuale nutre identità se fatto bene davvero.
17. Quasi disinstalli — arriva conferma nuovo piano ben impacchettata — aggancio alla continuità solo se è davvero così.
18. Budget che cambia nel mese — serve strategia realistica dopo wizard — numeri soli non bastano.
19. Turni che distortono fame — struttura aiuta se contestualizzata dalla voce — non solo calorie astratte.
20. Cambio stagione e allenamento — capitolo nutrizionale aggiornato — continuità identitaria se il club è completo.
21. Wizard come livelli di gioco — metafora leggera — metodo senza umiliare chi già si sente sbagliata.
22. Suono del click di conferma — soddisfazione — caption: la vera conferma è come ti parlano dopo — verità operativa.
23. Due consigli contrastanti da trainer e nutrizione — sketch — piano integrato riduce rumore se cultura club è coerente.
24. Progetto completato — respiro di sollievo — capitolo nuovo senza infantilizzare — dignità adulta.
25. Coerenza prima della disciplina — altrimenti disciplina diventa punizione — messaggio secco utile.

**10 Idee Reels**

1. Time-lapse degli step del wizard con voce fuori campo sul perché la sequenza protegge la dignità.
2. Split messaggio punitivo vs messaggio “capitolo nuovo” dopo conferma — stesso totale calorico — impatto emotivo opposto.
3. Nutrizionista spiega perché `?atleta=` cambia il sentimento operativo — trasparenza da club serio.
4. Comedy gentle: preset sbagliato — recupero con contestualizzazione — humor senza derisione.
5. Prima/dopo nella testa: confusione vs chiarezza post-conferma — risultati individuali variano sempre.
6. POV atleta: notifica nuovo piano — attesa del messaggio dopo — tensione reale se il club è coerente.
7. Voce fuori campo nutrizionista: perché sei step riducono il foglio incoerente — educazione rapida.
8. Confronto audio: stesso piano in numeri — tono punitivo vs tono da capitolo nuovo — effetto identitario opposto.
9. Macro-scroll infinito interrotto dal wizard — “costruiamo prima di scrollare altre diete”.
10. Tre respiri prima del click di conferma — suspense sobria — premium non hype.

**10 Idee Carousel**

1. Slide: sei step come sei promesse metodiche — non come matematica fredda.
2. Checklist “piano credibile” — coerenza macro/pasti/tempo — autovalutazione gentile prima della chat col professionista.
3. Preset come punto di partenza — ultima slide: la voce umana è parte del metodo — non optional narrativo.
4. Da foglio che giudica a progetto che accompagna — slide emozionale prima dei numeri.
5. Split allenamento in sala vs piano in testa — perché devono dialogare — identità atleta.
6. Weekend sociale → lunedì capitolo nuovo — slide narrative senza moralismo tossico.
7. Errori staff: step saltati — conseguenze sull’atleta — etica operativa interna.
8. Milestone temporale sul piano — perché riduce ansia da capitolo infinito — cornice adulta.
9. PDF finale vs wizard — devono combaciare — altrimenti sfiducia immediata — slide “coerenza documentale”.
10. Chiusura: “Il wizard non è la cura — è il cantiere — la casa la costruite insieme dopo.”

**10 Idee Stories**

1. Poll: fiducia da numeri o fiducia da sensazione di progetto costruito?
2. Quiz: preset sì/no — dibattito adulto sul ruolo dei template come punto di partenza responsabile.
3. Sticker “incoerenza interna vs progetto collaborativo”.
4. Countdown gentile al momento di premere conferma — ansia normale, non patologizzare.
5. Casella risposte: “cosa ti ha fatto mollare un piano nel passato?” — raccolta di voci riconoscibili.
6. Quote anonima: “non è mancanza di volontà — è spesso un piano che si pestava i piedi”.
7. Tap link: lista piani → wizard — continuità narrativa nel club.
8. Emoji slider: quanto ti senti “numeri astratti” vs “progetto mio” dopo il wizard.
9. Behind the scenes: perché `?atleta=` esiste — micro-cura operativa spiegata senza slogan.
10. Reminder: anche confermare bene è professionalità — celebrazione sobria staff.

**10 Idee Static Ads**

1. Headline: “Non è un foglio: è un progetto con fondamenta.”
2. Visual: sei blocchi step — metafora cantiere ordinato — premium sobrio.
3. Mock telefono: indicator step del wizard sopra — sotto foglio caos barrato — contrast pulito.
4. Copy: “Coerenza macro-pasti prima della bilancia” — claim tecnico-emotivo onesto.
5. Trainer + nutrizionista nello stesso layout — promessa cultura club integrata — se vera.
6. Messaggio continuità: nuovo capitolo ben introdotto — non restart tossico — cornice motivazionale.
7. Focus motivazione fragile — tono mai punitivo — vincolo etico marketing.
8. Premium come metodo visibile — non come glitter estetico su PDF vuoto.
9. Invito esplicito alla voce dopo il wizard — “la conferma vera è dopo” — integrità operativa.
10. Invito all’azione: “Costruisci il capitolo prima di chiedere aderenza.”

**10 Angoli emotivi**

1. Sollievo quando il piano torna logicamente coerente dentro.
2. Ansia da conferma finale senza messaggio successivo umano.
3. Orgoglio da sensazione di progetto costruito metodicamente.
4. Vergogna da preset incauto senza contestualizzazione dopo.
5. Gratitudine quando qualcuno traduce gli step nella giornata reale.
6. Frustrazione da macro impossibili da cucinare senza adattamento comunicato.
7. Speranza nel nuovo capitolo ben introdotto — linguaggio da squadra.
8. Impotenza quando numeri restano astratti dopo il wizard.
9. Tristezza da piano incoerente percepito come proprio difetto caratteriale — ingiusto.
10. Calma da riduzione rumore decisionale grazie a struttura pasti chiara — condizionata alla comunicazione dopo.

**10 Angoli motivazionali**

1. Da confusione quotidiana a struttura promessa — momentum positivo se comunicato dopo.
2. Da punizione implicita a progetto collaborativo — cambio di cornice.
3. Da template freddo a capitolo nuovo con voce calda — empowerment se coerente col servizio.
4. Da sensazione di esperimento random a sequenza professionale — fiducia metodica.
5. Da circolo di vergogna tecnico a mismatch affrontabile con revisione — narrativa più onesta.
6. Da restart tossico a micro-aggiornamenti futuri sensati — continuità più stabile.
7. Da cliente anonima a persona selezionata via URL — dignità operativa percepita.
8. Da confronto social a regole chiare tue — cornice interna più forte.
9. Da odio del foglio a strumento finalmente credibile giorno uno — cambio enorme nella testa.
10. Da motivazione hype a motivazione da metodo visibile — più sostenibile nel tempo.

**10 Angoli cognitivi**

1. Sequenza step riduce errori logici macro/pasti/tempo — meno incoerenze guidate dalla vergogna.
2. Suddivisione in blocchi (chunking): trasformare progetto enorme in unità completabili mentalmente — gestione ansia.
3. Effetto framing: progetto vs punizione — stesso cambio alimentare percepito diversamente.
4. Externalizzazione: struttura pasti sul foglio alleggerisce memoria affaticata la sera.
5. Affidabilità del segnale: quando numeri e pasti convergono, aumenta fiducia nel sistema nutrizionale.
6. Meta-cognizione: distinguere “ho sbagliato io” vs “il piano era incoerente” — competenza emotiva adulta.
7. Trasferimento: chiarezza progettuale aumenta capacità di gestire fame nervosa con micro-regole credibili.
8. Riduzione catastrofizzazione: incoerenze interne non devono diventare colpa identitaria globale.
9. Leggibilità mentale: piano credibile fin dal primo giorno riduce la fatica decisionale serale tossica.
10. Coerenza con volume allenamenti se progettazione dialoga con trainer — meno frattura cognitiva identitaria.

**10 Angoli trasformazione**

1. Da foglio arbitrario a piano costruito con sequenza logica.
2. Da mismatch macro-pasti a coerenza interna progettata — meno vergogna tecnica.
3. Da cliente template a persona nel capitolo nuovo — empowerment narrativo se comunicazione vera.
4. Da dropout tecnico silenzioso a ripresa guidata da progetto credibile + voce dopo.
5. Da sensazione di essere misurata a sensazione di essere progettata nel metodo.
6. Da restart ossessivi a micro-capitoli collaborativi nel tempo — identità più stabile.
7. Da dipendenza da diet trend a progetto supervisionato — dignità ritrovata.
8. Da sensazione di inganno documentale a partnership sul piano — fiducia ricostruibile.
9. Da sensazione di essere numero a URL dedicato che rende visibile la cura operativa — micro-trasformazione sociale percepita.
10. Da motivazione ossessiva puntuale a continuità metodica nel tempo — più sostenibile emotivamente.

**10 Angoli engagement**

1. URL `atleta` aumenta il numero di piani completati senza lasciare vuoti per l’atleta assegnato.
2. Conferma wizard + messaggio ben scritto aumenta risposta atleta e coerenza dei dati registrati dopo — più onestà operativa.
3. Struttura pasti chiara aumenta aderenza perché riduce la fatica decisionale serale — effetto quotidiano sulla continuità.
4. Preset responsabili + contestualizzazione aumentano fiducia nel metodo — meno abbandono da shock preset.
5. Flusso di lavoro del club che include sempre messaggio post-wizard aumenta continuità percepita — cultura operativa premium.
6. Coerenza trainer/nutrizionista sul capitolo nuovo aumenta uso app e meno attrito identitario — engagement globale.
7. Revisioni successive più semplici se piano nasce già coerente — meno drama da correzioni massive emergenziali.
8. PDF/esportazioni che riflettono il wizard aumentano uso documenti lato atleta — strumento vivo percepito.
9. Raccontare il metodo dietro le quinte aumenta fiducia nella cultura del club — solo se coerente con ciò che poi succede davvero.
10. Micro-celebrazione del capitolo nuovo aumenta motivazione sostenibile non tossica — effetto emotivo sulla continuità.

**10 Angoli relatable**

1. Lunedì dopo weekend sociale — bisogno di piano credibile non moralista — capitolo nuovo utile se comunicato bene.
2. Viaggio lavoro — orari strani — progetto deve poter parlare di strategia realistica — voce dopo wizard.
3. Famiglia che commenta il piatto — piano chiaro aiuta confini gentili — scenario universale delicato.
4. Bilancia ok ma testa confusa — incoerenze piano amplificano sensazione di essere “sbagliata” ingiustamente.
5. Due influencer diet opposti in testa — progetto supervisionato ancora — ancora di salvezza cognitiva seria.
6. Turni notturni — fame distorta — struttura utile se contestualizzata — non solo numeri astratti.
7. Cambio obiettivo sportivo improvviso — capitolo nutrizionale deve aggiornarsi — tensione comune.
8. Sensazione di disturbare chiedendo revisione — normalizzazione del bisogno di capitoli nuovi — empowerment comunicativo.
9. Budget che balla — piano deve essere negoziabile nella vita reale — voce dopo numeri.
10. Pressione estetica social — piano credibile riduce confronto tossico — cornice interna più forte.

**10 Micro-frustrations**

1. Wizard completato ma messaggio dopo freddo — sensazione di macchina fine a se stessa.
2. Preset incauto applicato senza contesto — shock identitario nutrizionale evitabile.
3. Macro irrealistiche rispetto alla cucina reale — senso di impossibilità quotidiana — umiliazione tecnica.
4. Incertezza su quale versione sia “quella vera” dopo più bozze — rumore cognitivo.
5. URL `atleta` presente ma comunicazione generica dopo — promessa premium tradita.
6. Step saltati mentalmente dallo staff affaticato — piano incoerente — dannoso per atleta fragile.
7. Conferma senza milestone temporale chiara — ansia da fine capitolo indefinita — deriva motivazionale.
8. Linguaggio da regolamento dopo conferma — umiliazione tecnica — tono sbagliato per motivazione fragile.
9. Piano nuovo senza collegamento allenamento — frattura identitaria — frustrante per chi vive la palestra forte.
10. PDF/esportazioni che non riflettono il wizard — sfiducia immediata nel sistema — deriva documentale tossica.

**10 Micro-rewards**

1. Messaggio dopo conferma che traduce step in “giornata tipo” — sollievo enorme credibile.
2. Celebrazione sobria del capitolo nuovo — rinforzo non tossico — linguaggio da squadra.
3. Invito esplicito a ignorare versioni obsolete — chiarezza mentale immediata — gentilezza tecnica.
4. Normalizzazione di revisioni future come parte del metodo — riduzione ansia da fallimento perfetto.
5. URL dedicato che fa sentire selezionati nel sistema — micro-dignità operativa percepita.
6. Coerenza macro-pasti che si sente già nel wizard — fiducia nel click finale prima ancora del PDF stampato.
7. Preset spiegato come punto di partenza — non identità — libertà psicologica maggiore.
8. Milestone temporale chiara post-conferma — ansia da infinito ridotta — cornice adulta.
9. Piccolo riconoscimento della complessità della tua vita nel messaggio dopo — empatica premium se vera.
10. Piano che include strategia sociale/weekend senza moralismo — sollievo relazionale enorme se progettato bene.

**10 Scene realistiche**

1. Conferma wizard — telefono in mano — arriva messaggio che traduce la giornata — sollievo palpabile possibile.
2. Cucina sera caotica — ricordi struttura pasti perché era sensata — meno panico decisionale se comunicato bene dopo.
3. Lunedì dopo weekend — nuovo capitolo annunciato bene — ripartenza senza umiliazione se tono giusto.
4. Viaggio lavoro — piano che permette strategie realistiche — ansia ridotta se voce dopo wizard è empatica.
5. Famiglia al tavolo — piano chiaro aiuta confini — scenario delicato ma frequente — richiede tono culturale sensibile.
6. Palestra: tra una serie e l’altra pensi al piano — serve dialogo training-nutrizione — meno frattura identitaria.
7. Rientro da weekend sociale — messaggio che non moralizza — capitolo nuovo come squadra se tono giusto.
8. Chat dopo conferma: commento su volume allenamenti — allineamento narrativo tra professionalisti — sollievo se reale.
9. Letti PDF sul telefono in viaggio — leggibilità e coerenza con wizard — altrimenti sfiducia immediata.
10. Notte insonne: ripassi mentalmente i pasti — struttura sensata riduce catastrofizzazione — se il piano regge la testa.

**10 Scene scroll-stopping**

1. Split: foglio incoerente che “urla numeri” vs foglio wizard ordinato — stesso totale — emozione opposta.
2. Primo piano sul click di conferma — caption sobria: conta ciò che succede dopo il click — verità operativa.
3. Montaggio veloce sei step — musica calma — messaggio anti hype tossico da diet instagram — tono adulto rispettoso.
4. POV mano che quasi disinstalla app — notifica nuovo piano ben comunicata — aggancio alla continuità solo se vero operativamente.
5. Testo grande: “COERENZA PRIMA DELLA DISCIPLINA.” — stop scroll educativo sobrio — contesto professionale sempre.
6. Voce fuori campo nutrizionista: “non è la bilancia che giudica — è il piano che deve reggere la sera.”
7. Animazione step che si colorano uno a uno — metafora ponteggi — costruzione prima dell’abitare.
8. Primo piano volto atleta: “finalmente non è un foglio che mi contraddice” — forte effetto riconoscimento se tono non tossico.
9. Loop breve (3s): URL con `atleta` → selezione già piena → sollievo da micro-dignità operativa.
10. Caption corta: sei step = sei prove che il metodo non è arbitrario — fiducia anticipatoria sobria.

**5 emozioni principali**

1. Sollievo da coerenza progettuale.
2. Ansia da conferma senza messaggio umano dopo.
3. Orgoglio da sensazione di capitolo nuovo ben introdotto.
4. Vergogna da preset/template applicati senza contesto empatico dopo.
5. Speranza nel metodo visibile — fiducia ricostruibile.

**5 paure principali**

1. Essere un esperimento di numeri astratti.
2. Piano incoerente dentro — poi interpretato come difetto personale.
3. Dover ricominciare tra poco perché progetto irrealistico.
4. Deludere dopo conferma — pressione performativa.
5. Mismatch tra allenamento e piano nutrizionale — frattura identitaria.

**5 desideri principali**

1. Piano credibile giorno uno nella vita vera.
2. Voce dopo wizard che traduce senza umiliare.
3. URL dedicato che riduce anonimato — sensazione di cura operativa.
4. Milestone temporale chiara sul capitolo nuovo — meno ansia infinita.
5. Coerenza trainer/nutrizionista sul nuovo capitolo — meno confusione.

**5 trigger motivazionali**

1. Messaggio post-conferma che separa progetto da punizione.
2. Milestone temporale chiara — cornice collaborativa adulta.
3. Linguaggio da squadra sul capitolo nuovo — partnership percepita.
4. Preset presentato come punto di partenza — libertà psicologica maggiore.
5. Coerenza macro-pasti che si sente già prima del PDF stampato — fiducia anticipatoria valida se vera.

**Prima vs Dopo**

- **Prima:** Numeri sparsi o incoerenti tra loro; sensazione di foglio arbitrario o template tossico; circolo di vergogna tecnico interpretato come difetto morale.
- **Dopo:** Piano costruito in sequenza logica + comunicazione umana che traduce nella giornata — capitolo nuovo credibile — motivazione fragile protetta da incoerenze interne al piano.

**La frase che vende davvero la pagina**

“Non ti sto dando numeri a caso: sto assemblando un piano che regge la tua settimana — se poi camminiamo insieme.”
