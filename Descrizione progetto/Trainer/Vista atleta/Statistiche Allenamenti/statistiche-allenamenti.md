# Statistiche Allenamenti — Analisi Profonda Atleta

## 0. Metadati pagina

- Nome pagina: Statistiche allenamenti (grafici per esercizio + sessioni)
- URL analizzato: `http://localhost:3001/dashboard/atleti/{id}/progressi/allenamenti`
- Data analisi: 2026-05-09
- Cartella creata: `Descrizione progetto/Trainer/Vista atleta/Statistiche Allenamenti`
- File markdown: `statistiche-allenamenti.md`
- Funzione principale: Visualizzare sessioni da log atleta (`workout_logs`) e trend per esercizio da serie (`workout_sets`), con export PDF tabellare e drill-down verso storico singolo esercizio.
- Ruolo principale: Atleta (effetto psicologico tramite trainer/data storytelling)
- Tipo workflow: Lettura «macro» (tabella sessioni) → lettura «meso» (grafici per esercizio) → drill-down `/allenamenti/{exerciseId}`.
- Tipo stress mentale: Medio — confronto implicito con sé nel tempo; rischio ansia se lettura competitiva sbagliata.
- Tipo motivazione: Competenza e padronanza — «vedo che sto registrando qualcosa di vero».
- Tipo reward psychology: Prova oggettiva di volume, ripetizioni, continuità nel tempo.
- Tipo engagement: Ritorno alla pagina per verificare micro-progressi dopo sessioni.
- Tipo continuità: Timeline allenamenti come collante settimanale.
- Stato pagina analizzato: Implementata (`allenamenti/page.tsx`, hook `useWorkoutExerciseStats`).
- Fonte analisi: Codice React citato + commenti su workout_logs / workout_sets.
- Nota ID dinamico: `{id}` atleta; **DINAMICA NON RISOLTA** per seduta live su localhost — URL esempio costruibile da codice.

---

## 1. Sintesi breve

È il luogo dove il sudore diventa **grafico**: non estetica, ma prova. Per l’atleta (indirettamente) riduce la guerra contro lo specchio e Instagram — qui il confronto è con la propria serie storica. Conta perché molti mollano quando «non vedono progressi»: questa pagina può mostrare micro-trend nascosti nel rumore giornaliero. Risolve ansia da oblio («ho allenato o no?») con tabella sessioni e stati. Crea emozione di competenza quando i dati ci sono; vuoto motivazionale quando mancano serie che alimentano grafici. Trasformazione: da sensazione vaga a narrativa numerica. Continuità: seduta dopo seduta depositata nel sistema.

---

## 2. Contesto reale atleta

L’atleta vive intensità, fatica, sonno, ciclo. La pagina staff riflette ciò che è stato registrato digitalmente: se l’atleta non logga serie, la curva non mente — ma può ferire se interpretata come «non hai fatto nulla» invece che «manca traccia».

---

## 3. Workflow reale

Header «Torna ai progressi» → card «Sessioni registrate» (se ci sono log) → card «Grafici per esercizio» con export PDF → click verso dettaglio esercizio tramite `WorkoutExerciseCharts` e `detailBasePath`.

---

## 4. Motivazione e continuità

Motivazione aumenta quando il grafico mostra risalita anche piccola; continità aumenta quando sessioni ultimi 30 giorni sono visibili nella hub storico collegata mentalmente. Messaggi trainer che citano «sessioni ultimi 30» creano ancoraggio realistico.

---

## 5. Stress e frustrazione

Stress se colonne «Serie» sono 0 ma volume presente (warning amber nel codice): bisogno di spiegazione umana («registrato ma non traccia grafici»). Frustrazione da stato sessione ambiguo per chi odia le etichette.

---

## 6. Reward psychology

Reward principale: **evidenza** — tabella come lista di prove; grafico come morfologia della costanza.

---

## 7. Progress perception

Percezione corretta se letta come trend nel tempo; distorta se letta come confronto assoluto giornaliero con influencer.

---

## 8. Fiducia nel trainer

Sale quando il trainer usa questi dati per regolare carichi senza umiliare nei giorni bassi; scende se punisce dati mancanti ignorando contesto vita.

---

## 9. Cognitive Load & Mental Energy

Alto se si espone tutta la tabella senza guida; medio se si usa drill-down progressivo (sessioni → esercizio).

---

## 10. Engagement psychology

Engagement come curiosità scientifica sulla propria performance — «cosa è salito nel squat questa settimana?».

---

## 11. Habit & Retention loops

Loop: sessione → log serie → curva si aggiorna → rinforzo immediato settimana successiva.

---

## 12. Premium Perception

Premium quando PDF e grafici sono puliti e parlano «da professionisti»; cheap quando numeri sembrano blame grid.

---

## 13. Marketing intelligence

Angolo: «Il progresso che non fa rumore sui social ma si vede nei tuoi set».

---

## 14. Content & creative strategy

Video breve trainer che spiega differenza tra volume log e serie che nutrono grafici — trasparenza anti-frustrazione.

---

## 15. Ecosystem athlete analysis

Upstream: mobile/home logging serie. Lateral: `/progressi` KPI sintesi. Downstream: `/allenamenti/{exerciseId}` storico massimo/giorno. Parallel: hub storico allenamenti completati.

---

## 16. Analisi profonda della pagina

Questa pagina è **forensic fitness**: trasforma eventi sparsi (sessioni, stati) in una deposizione ordinata. La tabella sessioni normalizza ansia da «non ricordo quanto ho fatto»: data, stato, volume, durata, esercizi, serie. Il verde/amber delle serie vs grafici è un punto delicato: ottimo per onestà tecnica, rischio emotivo se il trainer non traduce. Il PDF export è anch’esso psicologia — stampabile come oggetto «ti ho preparato il riepilogo». Drill-down esercizio chiude il cerchio narrativo dal macroscopic trend al singolo movimento che più conta emotivamente (spesso squat/bench/panca sentimentale).

---

## 17. Output finale obbligatorio

### Riassunto operativo

Tab sessioni + grafici esercizio + PDF + link dettaglio esercizio.

### Riassunto emotivo

«Ho prove, non solo sensazioni.»

### Riassunto motivazionale

Curve piccole ma vere battono hype grande e falso.

### Riassunto cognitivo

Macro→meso→micro riduce overwhelm.

### Problema reale

«Non miglioro» quando miglioramento è sotto soglia percettiva giornaliera.

### Stress eliminato

Incertezza su cosa è stato registrato nel tempo.

### Motivazione creata

Evidenza cumulativa della costanza.

### Reward psychology principale

Prova documentata e ripetibile.

### Trasformazione percepita

Da narrativa emotiva instabile a trend verificabile.

### Continuità supportata

Serie storiche che richiamano alla prossima sessione.

### Valore percepito

Serietà metodica del percorso.

### Fiducia generata

Dati condivisi tra trainer e atleta senza gaslighting.

### Effetto retention

Più difficile mollare quando il grafico mostra capitoli già scritti.

### Effetto engagement

Curiosità sul prossimo punto nel grafico.

### Messaggio più forte

«Il progresso è una sequenza, non un lampo.»

### Visual hook più forte

Curva che risale anche di poco dopo plateau — simbolo anti-abbandono.

### Copy hook più forte

«Tutti gli stati sessione: pesi, tempi e serie anche in corso o senza metriche (come in app Home)» — continuità mental model cross-app.

### Concetto ads più forte

La memoria delle serie batte la memoria delle scuse.

### 25 Hooks Meta Ads

1. «Il grafico non ti giudica: ti ricorda.»
2. «Quante sessioni hai messo nel tempo?»
3. «Il volume non mente — spiega solo come leggere.»
4. «Micro-trend > opinioni del giorno.»
5. «La curva bassa non è fine: è capitolo.»
6. «Serie registrate = futuro più chiaro.»
7. «Il PDF che convince te stesso.»
8. «Allenarsi senza traccia è rumore bianco.»
9. «Il trainer vede il trend prima della lamentela.»
10. «Progressi che non servono like.»
11. «Tabella sessioni: lista di prove oneste.»
12. «Se mancano serie, manca la curva — parliamone senza vergogna.»
13. «Volume salvato ma grafico vuoto: tecnica, non pigrizia.»
14. «Costanza misurabile batte perfezione Instagram.»
15. «Il drill-down esercizio è terapia della precisione.»
16. «Non sei fermo: sei nel punto sbagliato della scala temporale.»
17. «Più dati, meno dramma emotivo.»
18. «Il sudore meritava una tabella.»
19. «Il trend gentle che ti riprende dopo pausa.»
20. «Numeri che costruiscono fiducia bidirezionale.»
21. «La retention è anche grafico che torna su.»
22. «Serie dopo serie: identità da costruzione.»
23. «Il massimo per giorno: micro-orgoglio ripetibile.»
24. «Statistiche allenamenti: dove la disciplina diventa linea.»
25. «TrainerDesk: progresso come sequenza, non come evento.»

### 25 Headlines

1. Vedi la tua costanza anche quando lo specchio tace.
2. Sessioni registrate: la tua deposizione sportiva.
3. Grafici per esercizio: micro-progressi grandiosi nel tempo.
4. Dal volume alle serie: chiarezza tecnica, cuore umano.
5. Il PDF che chiude la giornata con senso.
6. Drill-down: esercizio per esercizio, giorno per giorno.
7. Il trend gentile che ti riprende dopo una pausa.
8. Allenamenti: lista di giorni in cui sei comparso.
9. Meno confronto social, più confronto storico.
10. Serie che salgono: dopamina da dati veri.
11. Evidenza > impressione.
12. La tabella che ti difende dai dubbi notturni.
13. Il grafico racconta capitoli, non fotografie.
14. Sessioni ultimi 30: ritmo, non punizione.
15. Allenamento senza log: opportunità persa, non fallimento morale.
16. Costanza misurabile, motivazione rinnovabile.
17. Il dettaglio esercizio è dove torna orgoglio tecnico.
18. Numeri che fanno da coach silenzioso.
19. Da sensazione vaporosa a trend verificabile.
20. Il Sudoku dei carichi finalmente risolto.
21. Progressi veri sono ripetizioni nel tempo.
22. Più serie vere, più futuro leggibile.
23. Metriche che non umiliano nei giorni bassi se il linguaggio è giusto.
24. TrainerDesk: dove la performance diventa storia.
25. Il tuo allenamento merita una curva.

### 25 Subheadlines

1. Tabella sessioni come verità condivisa.
2. Grafici che richiedono serie: coaching opportunity.
3. Export PDF per chi vuole tenere la prova.
4. Drill-down per nome esercizio — focus emotivo tipico.
5. Stati sessione tradotti in parole umane.
6. Volume totale come big picture senza moralismo.
7. Durata come proxy presenza, non vanità.
8. Serie zero → spiegazione > giudizio.
9. Trend che richiedono logging costante — invito alla routine.
10. Grafico come invito alla prossima ripetizione registrata.
11. Costanza nel log = costanza nel risultato percepito.
12. Il trainer usa questa pagina per dirti la verità gentile.
13. Più granularità, meno ansia da paragone social.
14. Il tempo è l’asse giusto del confronto.
15. Curva che sale piano ma sicuro.
16. Tabella che smonta drammi immaginari.
17. PDF stampabile come oggetto closure giornaliera.
18. Sessioni come catena — anello dopo anello.
19. Serie come atomi del progresso.
20. Messaggio trainer basato su dati > opinioni.
21. Grafico vuoto come invito al tracking, non come insulto.
22. Costanza digitale che supporta costanza fisica.
23. Più evidenza, meno litigi con sé stessi.
24. Focus esercizio amato — engagement alto.
25. Progressi come narrazione tecnica amabile.

### 25 Hooks Instagram

1. «Il grafico ti dice dove sei nella storia, non chi sei.»
2. «Serie basse oggi, trend alto nel mese — zoom out.»
3. «Il PDF che ti fai firmare da te stesso.»
4. «Sessioni: lista di giorni in cui hai scelto di comparire.»
5. «Il volume racconta la fatica cumulata.»
6. «Drill-down esercizio — zoom sulla parte che ti emoziona.»
7. «Zero serie nel giorno ma volume presente: non è magia oscura, è log.»
8. «Costanza > intensità una tantum.»
9. «Il trainer che ti parla coi tuoi numeri — fiducia sale.»
10. «Non sei la foto post-workout: sei la somma delle sessioni.»
11. «Curve piccole, orgoglio grande.»
12. «Il confronto giusto è con te del mese scorso.»
13. «Statistiche che educano lo sguardo.»
14. «Più logging onesto, più grafico vero.»
15. «Il trend è una promessa silenziosa del futuro.»
16. «Allenamenti: dove il tempo diventa alleato.»
17. «Serie dopo serie costruisci identità da atleta.»
18. «La retention è curiosità sulla prossima quotazione nel grafico.»
19. «Il rumore dei social vs silenzio dei dati — scegli il coach giusto.»
20. «Messaggio mirato dopo aver visto tabella — cambia tutto.»
21. «Il grafico che ti riprende dopo pausa senza giudizio.»
22. «Performance identity vs vibe identity.»
23. «Numeri che non flexano: documentano.»
24. «Statistiche allenamenti: disciplina visibile.»
25. «TrainerDesk: performance come narrazione onesta.»

### 25 Hooks TikTok

1. POV: finalmente vedi il trend che Instagram ti nega.
2. «Il grafico basso di martedì vs trend alto del mese — plot twist.»
3. «Serie a zero ma volume presente: storytime tecnico.»
4. «Coach reaction ai tuoi log veri.»
5. «Export PDF perché la motivazione a volte vuole carta.»
6. «Tabella sessioni = playlist della disciplina.»
7. «Non sei stagnante: sei nel punto sbagliato del timeline.»
8. «Volume ≠ vanità: è somma di giorni.»
9. «Drill-down esercizio — dove piangi meno e capisci più.»
10. «Il confronto giusto non è col bench della palestra online.»
11. «Curva che risale dopo piattaforma — dopamina slow release.»
12. «Trainer leggere tabella prima del DM — cambia tono.»
13. «Statistiche che smontano ansia da performance singola.»
14. «Il tuo allenamento ha bisogno di memoria nel tempo.»
15. «Logging che fa bene anche alla testa.»
16. «Serie vere > caption motivazionali.»
17. «Il rumore della vita vs silenzio della tabella — chi vince?»
18. «Micro-win: una serie in più sul grafico.»
19. «Il PDF che chiude la settimana con senso adulto.»
20. «Statistiche allenamenti: dove il meme incontra il metodo.»
21. «Non sei rotto: sei incompleto nel log — sistemabile.»
22. «Il trainer che ti fa zoom sulla curva giusta.»
23. «Performance identity check con una tabella.»
24. «Allenamenti: lista prove per quando dubiti.»
25. «TrainerDesk: grafico gentile, disciplina reale.»

### 10 Idee Reels

1. Trainer spiega lettura tabella sessioni in 40 secondi.
2. Split screen «post Instagram» vs «tabella sessioni» — verità diversa.
3. Animazione trend dopo 4 settimane logging costante.
4. Storytime «ho pensato di non migliorare» → zoom out curva.
5. Export PDF ASMR leggero — carta come closure.
6. Drill-down esercizio — reaction ai massimi nel tempo.
7. «Cosa fare quando serie = 0 ma volume c’è» — educational.
8. Intervista atleta: numero più emotivo nel grafico.
9. «Motivation Monday» basato su sessioni mese, non su slogan.
10. Coach reads your chart — roleplay empatico.

### 10 Idee Carousel

1. Slide macro tabella → slide meso grafico → slide micro drill-down.
2. Come leggere plateau senza panico.
3. Serie vs volume — spiegazione tecnica umana.
4. Errori di lettura della curva (giorno vs mese).
5. Checklist logging post-sessione (2 minuti salva grafico).
6. Come il trainer usa PDF in call.
7. Micro-orgogli quotidiani dalla tabella.
8. Confronto sbagliato vs confronto giusto.
9. Identità da performance vs identità da costanza.
10. «Cosa dire all’atleta» quando curva piatta ma vita difficile.

### 10 Idee Stories

1. Poll: ti fidi più dello specchio o della tabella?
2. Quiz: plateau o zoom sbagliato?
3. Sticker «serie loggate oggi».
4. Countdown «prossimo punto sul grafico».
5. Raccolta «micro-win numerici della settimana».
6. DM prompt: «che esercizio guardi sempre nel grafico?»
7. «Tagga il trainer che ti spiega i numeri senza dirti inadeguatezza».
8. Reminder gentle logging serie.
9. «Dimmi un giorno in cui la tabella ti ha salvato dall’ansia».
10. Link audio «come leggere il grafico nei giorni brutti».

### 10 Idee Static Ads

1. Curva astratta + headline «non sei solo un giorno».
2. Tabella blur + claim «prove non opinioni».
3. Icona PDF + «chiudi la settimana con senso».
4. Before vague feelings / after plotted trend.
5. Claim «zoom out» per ansia da plateau.
6. Drill-down icon + «focus sul movimento che conta».
7. Trainer quote su uso dati empatico.
8. Map mental macro→micro.
9. Numeri grandi temperati da micro-copy «trend nel tempo».
10. TrainerDesk lockup + «statistiche allenamenti».

### 10 Angoli emotivi

1. Orgoglio tecnico sul massimo storico.
2. Ansia da plateau interpretato male.
3. Sollievo nel vedere sessioni accumulate.
4. Frustrazione se grafico vuoto per mancanza log.
5. Gratitudine per trainer che spiega gap tecnico serie/volume.
6. Vergogna da confronto sbagliato — mitigabile con zoom temporale.
7. Curiosità scientifica sul trend.
8. Paura di non essere «abbastanza» — dati possono sia aiutare sia ferire.
9. Appartenenza quando si parla stesso linguaggio numerico.
10. Calma quando trend conferma sforzo percepito basso.

### 10 Angoli motivazionali

1. Costanza come identità.
2. Serie come atomi di fiducia.
3. Trend come narrativa anti-impulsività.
4. Volume come somma di giorni scelti.
5. Drill-down come focus anti-overwhelm.
6. PDF come closing ritual settimanale.
7. Proof accumulata contro abbandono silenzioso.
8. Miglioramento microscopico comunque valido.
9. Logging come atto di rispetto verso sé.
10. Grafico come promessa che il futuro può piegarsi.

### 10 Angoli cognitivi

1. Zoom temporale corretto.
2. Distinzione stato sessione vs sensazione giornaliera.
3. Serie che alimentano grafici — mapping causa-effetto.
4. Volume vs metriche grafico — evitare conclusioni affrettate.
5. Drill-down riduce rumore del globale.
6. Tabella prima, grafico dopo — pedagogia implicita.
7. Export PDF come snapshot di working memory esterna.
8. Costruzione narrativa dai dati grezzi.
9. Meno bias recall — più truth tabellare.
10. Traduzione tecnica→linguaggio emotivo sicuro.

### 10 Angoli trasformazione

1. Da vibe-based a evidence-based self story.
2. Da ansia giornaliera a visione mensile.
3. Da confronto social a confronto storico.
4. Da sensazione stagnazione a lettura plateau normale.
5. Da caos sessioni a lista ordinata.
6. Da vergogna logging mancante a piano sistemabile.
7. Da narrativa tossica a trend gentile.
8. Da pressione performativa a performance cumulativa.
9. Da isolamento digitale a oggetto condiviso col trainer.
10. Da impulsività a ripetizione misurata.

### 10 Angoli engagement

1. Curiosità sul prossimo punto dati.
2. Ritual PDF settimanale.
3. Drill-down verso esercizio preferito.
4. Competizione solo con sé passato.
5. Messaggi trainer triggerati da tabella.
6. Challenge logging serie — micro-gamification etica.
7. Commento curva insieme in call — bonding.
8. Export da mostrare a terzi (medico, nutrizionista).
9. Sensazione videogioco statistico salubre.
10. Motivazione extrinseca dati → intrinsic pride tecnico.

### 10 Angoli relatable

1. «Ho fatto fatica ma il grafico è piatto — aiuto.»
2. «Non ho loggato perché vergogna.»
3. «Ho paura dei numeri dopo pausa.»
4. «Il trainer giudica dalla tabella?»
5. «Voglio vedere risultati ora, non trend.»
6. «Instagram dice che sono indietro.»
7. «Ho saltato una settimana — ho rovinato tutto?»
8. «Non capisco perché volume ma no serie.»
9. «Mi confronto coi bench degli altri online.»
10. «Voglio che qualcuno mi dica che sto migliorando davvero.»

### 10 Micro-frustrations

1. Serie a zero ma fatica alta — incomprensione.
2. Grafico vuoto per assenza log — sensazione fallimento.
3. Stati sessione poco chiari linguaggio natural non trainer.
4. PDF che sembra «report scolastico» se tono sbagliato.
5. Drill-down che mostra giornata brutta — interpretazione sbagliata.
6. Volume alto ma trend peso flat — mismatch attese.
7. Troppi numeri senza guida — overload.
8. Curva influenzata da giorni malati — senza contesto.
9. Confusione workout_logs vs workout_sets linguaggio tecnico.
10. Trainer che usa dati come arma invece che specchio.

### 10 Micro-rewards

1. Nuovo massimo sul grafico — dopamina etica.
2. Tabella che mostra catena di sessioni — orgoglio sequenza.
3. PDF generato — oggetto tangibile progresso.
4. Serie che salgono lentamente ma sicuro.
5. Drill-down che racconta giorno migliore recente.
6. Trainer che celebra logging onesto più del numero altissimo.
7. Trend positivo dopo settimana «media» percepita male.
8. Commento mirato su singolo esercizio — sentirsi visti nel dettaglio.
9. Volume cumulativo come prova fatica totale.
10. Sensazione controllo quando si capisce il grafico.

### 10 Scene realistiche

1. Mercoledì sera: dubbio miglioramento → apertura pagina → zoom trend mensile.
2. Call con trainer: condivisione schermo tabella sessioni.
3. Dopo pausa ferie: paura grafico → trainer normalizza con periodo.
4. Pre-gara: focus drill-down esercizio chiave.
5. Dopo litigio con bilancia: tabella offre altra verità (performance).
6. Sabato mattina: export PDF archiviato come diary adulto.
7. Trainer prepara deload spiegando trend — fiducia.
8. Atleta smitten da plateau — trainer mostra volume 90 giorni.
9. Sessione brutta salvata nel log — gratitudine futura per averla registrata.
10. Notte insonne: scroll tabella — conferma «ci sono stato».

### 10 Scene scroll-stopping

1. Plot twist: «il giorno brutto era rumore; il mese è bello».
2. Split IG flex vs tabella umile.
3. Mano che evidenzia massimo storico — zoom emotivo.
4. PDF stampato sul frigo — simbolo adulto.
5. Grafico che sale di un pixel — hero shot minimal.
6. Trainer che mette pause il video sulla tabella — tensione narrativa.
7. Before after narrativo solo voice + numeri.
8. «Serie 0» explain like I’m human — educational drama ridotto.
9. Animazione trend che accelera nel tempo — payoff.
10. Poll sopra video full vertical tabella blur.

### 5 emozioni principali

1. Orgoglio tecnico.
2. Ansia da lettura errata.
3. Curiosità.
4. Sollievo per evidenza cumulativa.
5. Frustrazione se dati assenti o mal spiegati.

### 5 paure principali

1. Essere giudicati dalla tabella.
2. Non migliorare mai.
3. Essere ingannati dai numeri.
4. Verità oggettiva su pigrizia percepita.
5. Confronto impossibile con altri.

### 5 desideri principali

1. Vedere qualcosa che salva nei giorni dubbi.
2. Essere guidati su come leggere.
3. Sentirsi intelligenti nel proprio percorso.
4. Trasformare fatica in linea che sale.
5. Condividere prove con trainer senza vergogna.

### 5 trigger motivazionali

1. Punto nuovo sul grafico.
2. Sessione che compare finalmente in tabella dopo settimana no.
3. Export PDF come ritual closing.
4. Trainer che commenta trend senza giudizio.
5. Drill-down che mostra recupero dopo stallo.

### Prima vs Dopo

**Prima:** narrativa emotiva instabile, sensazione «non conto nulla».

**Dopo:** narrazione supportata da sequenza sessioni e trend — ancora fatica, meno caos mentale.

### La frase che vende davvero la pagina

«Non stai guardando numeri: stai guardando la somma dei giorni in cui sei tornato.»

_Check qualità:_ ancorato a `allenamenti/page.tsx`, tabella sessioni, grafici, PDF, path drill-down; distinzione logs/sets; niente elenco componenti fine a sé.
