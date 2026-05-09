# Dettaglio campagna — Analisi profonda atleta

==================================================

## 0. Metadati pagina

==================================================

- **Nome pagina:** Dettaglio campagna marketing
- **URL analizzato:** `http://localhost:3001/dashboard/marketing/campaigns/{id}`
- **Data analisi:** 2026-05-09
- **Cartella creata:** `Descrizione progetto/Atleta/Dettaglio Campagna`
- **File markdown:** `dettaglio-campagna.md`
- **Funzione principale:** Lettura singola riga `marketing_campaigns` da Supabase per `id`; scheda con canale, budget, inizio/fine, stato, aggiornato; link modifica; azioni rapide **Attiva**, **Pausa**, **Termina** (aggiornano `status`) salvo campagna già `ended`.
- **Ruolo UI reale:** Marketing o Admin.
- **Ruolo principale (analisi atleta):** L’atleta non apre questa pagina, ma ne subisce le conseguenze quando qualcuno qui **accende, congela o spegne** la megafono della campagna — meno rumore o più rumore, più chiarezza su una promo che finisce davvero.
- **Tipo workflow:** Lista campagne → dettaglio → governanza stato → eventuali modifiche strutturali in edit.
- **Tipo stress mentale:** Per staff: decisione di stato “live”; per atleta: ansia da promo sempre accesa vs sollievo quando una voce viene messa in pausa o chiusa bene fuori.
- **Tipo motivazione:** Tenere coerenza tra promessa temporale (date) e stato reale (draft/active/paused/ended).
- **Tipo reward psychology:** “Termina” e “Pausa” come atti di cura verso la membership se messaggi stavano saturando — reward etico del brand.
- **Tipo engagement:** Pausa e fine ben comunicate a valle ripristinano attenzione sui prossimi messaggi.
- **Tipo continuità:** Stato campagna non è etichetta interna: è **ritmo** percepito fuori.
- **Stato pagina analizzato:** `src/app/dashboard/marketing/campaigns/[id]/page.tsx`.
- **Fonte analisi:** Codice.
- **Nota ID dinamico:** **DINAMICA NON RISOLTA in runtime** — nessun ID reale catturato; analisi basata su contratti UI, etichette stato/canale e flusso `setStatus`.

==================================================

## 1. Sintesi breve

==================================================

È la console dove il club vede **una campagna viva** e decide se la voce pubblica resta accesa, si calma o si chiude. Conta perché il dettaglio con date e budget rende la campagna un **impegno serio**; e i tre comandi (play/pause/stop) sono leve di **frequenza emotiva** per chi riceve email e notifiche. Risolve: “questa iniziativa è ancora lecita/utile o stiamo spingendo oltre?”. Emozione a valle: sollievo quando la pressione finisce, confusione se lo stato interno non corrisponde a cosa promuovi fuori. Trasformazione: da campagna “anonima in lista” a **oggetto di responsabilità** con date e decisioni. Continuità: ogni cambio di stato dovrebbe avere eco umana (copy) — altrimenti la membership vive dissonanza.

==================================================

## Sezioni analisi

==================================================

### 1. Contesto reale atleta

L’atleta vive Dopamine e stanchezza da messaggi. Qui non vede i pulsanti, ma percepisce **l’esito**: meno email, promozioni che finiscono, silenzi educativi dopo saturazione.

### 2. Workflow reale

Campagne → click riga → dettaglio → (opzionale) modifica campi → **Attiva / Pausa / Termina** → ritorno alla lista o ad analytics per misurare eco.

### 3. Motivazione e continuità

Motivazione membership sale se “Termina” coincide con messaggio esterno di chiusura — sensazione di club non manipolatorio. Continuità si rompe se pausa interna non si traduce in meno rumore percepito.

### 4. Stress e frustrazione

Stress: campagna attiva con messaggi troppo frequenti. Frustrazione: stato “paused” lato dashboard ma push ancora schedulate altrove — fiducia crolla.

### 5. Reward psychology

Pausa come micro-reward per membri saturi. Termine come **honest closure** — rinforzo identitario “non siamo solo vendita”.

### 6. Progress perception

Il dettaglio mostra periodo: la membership collega campagna a **fase del percorso** (es. rientro settembre). Se le date sono vere, la progressione narrativa del club sembra ordinata.

### 7. Fiducia nel trainer

Se campagna promette voce trainer ma qui si attiva senza coordinamento, la fiducia si sposta al marketing. Il pulsante **Modifica** è opportunità di riallineare promessa.

### 8. Cognitive Load & Mental Energy

UI essenziale: basso carico staff; il costo cognitivo vero è **decisione morale** di stato, non la lettura card.

### 9. Engagement psychology

Riprendere attenzione dopo pausa: messaggi successivi hanno più peso se non sei stato bombardato fino a ieri.

### 10. Habit & Retention loops

Loop: stato → messaggi → eventi (analytics) → revisione. Critico: **ended** senza comunicazione esterna lascia promo fantasma nella testa delle persone.

### 11. Premium Perception

Premium: transizioni di stato chiare, date rispettate, budget che non urla più forte della dignità. Cheap: attiva/disattiva nervosa senza strategia.

### 12. Emotional reinforcement

Icone Play/Pause/Stop richiamano musica — metafora utile: **regolazione volume** della voce del club.

### 13. Marketing intelligence

Messaggio: “Il dettaglio campagna è dove misuri coraggio a spegnere una voce che stanca.”

### 14. Content & creative strategy

Ogni transizione di stato merita **micro-copy esterno** (anche una story “promo chiusa, grazie per aver partecipato”).

### 15. Ecosystem athlete analysis

Collegata a lista campagne, edit campagna, analytics eventi. Spezzare il loop analytics–dettaglio riduce campagne tossiche persistenti.

### 16. Analisi profonda della pagina

La card **Dettaglio** rende esplicito budget e finestra temporale: è il contratto interno su cui si fondano promesse esterne. Le **Azioni rapide** rendono la governance immediata — bene per agilità, rischio se usate senza brief verso trainer e canali. **Termina** è potenzialmente l’azione più pro-retention se il mercato era saturo: chiude il ciclo cortisolo-promo. La mancanza di testo guidato post-click su “Termina” è il punto dove la psicologia atleta può ancora rompersi: internamente finisce, fuori nessuno lo sa.

### 17. Output finale obbligatorio

- **Riassunto operativo:** Dettaglio Supabase campagna; tre azioni stato + link edit.
- **Riassunto emotivo:** Qui si decide quanto rumore resta nel mondo reale.
- **Riassunto motivazionale:** Pausa e fine come atti di rispetto possibili.
- **Riassunto cognitivo:** Date + stato = cornice temporale e modo della promessa.
- **Problema reale:** Campagna che resta “attiva” nella testa delle persone dopo che internamente è finita.
- **Stress eliminato:** Parziale — se si usa **Termina** con eco comunicativa esterna.
- **Motivazione creata:** Quando chiusura è coerente, la membership torna ad ascoltare il club.
- **Reward psychology principale:** Chiusura onesta > hype perpetuo.
- **Trasformazione percepita:** Da macchina promozionale infinita a **cicli respirabili**.
- **Continuità supportata:** Solo se stato interno ↔ messaggi fuori.
- **Valore percepito:** Club che sa chiudere una voce — maturità.
- **Fiducia generata:** Coerenza tra periodo mostrato e fine percepita.
- **Effetto retention:** Alto se meno spam reale; neutro se solo toggle DB.
- **Effetto engagement:** Pausa intelligente ripristina attenzione futura.
- **Messaggio più forte:** “Non è solo uno stato — è quanta voce resta nella vita delle persone.”
- **Visual hook più forte:** Tre azioni rapide come mixer audio della campagna.
- **Copy hook più forte:** “Fine campagna — fine promessa — fine cortisolo.”
- **Concetto ads più forte:** Il premium è saper mettere in pausa ciò che stanca.

**25 Hooks Meta Ads**

1. Dettaglio campagna: qui si alza o abbassa il volume della voce pubblica.
2. Pausa non è debolezza — è rispetto delle energie altrui.
3. Termina: chiudi il ciclo promozionale prima che chiuda la fiducia.
4. Date vere + stato vero = meno cinismo in sala.
5. Budget visibile: prometti volume — regola il tono.
6. Attiva: accendi con responsabilità, non con ansia.
7. Tre pulsanti, infinite conseguenze emotive fuori.
8. Il megafono ha uno stop — usalo.
9. Marketing adulto sa spegnere la voce che stanca.
10. Coerenza: se è terminata, che non arrivi ancora la push.
11. Modifica prima di attivare: etica del secondo pensiero.
12. Periodo mostrato: contratto con la membership.
13. Stato paused: respiro possibile nella loro inbox.
14. Stato ended: finestra narrativa chiusa bene se lo dici fuori.
15. Trainer allineato: altrimenti la campagna mente due volte.
16. Megafono senza direzione — rumore; megafono con date — musica.
17. Meno spam reale, più premium percepito.
18. Il tasto giusto oggi salva la reputazione domani.
19. Analytics dopo azione: chiudi anche il loop qualitativo.
20. Non è toggle — è cura del rapporto col cliente.
21. Budget + pause = governance emotiva.
22. Il cliente sente la pausa se è vera ovunque.
23. Spegni la promo — accendi la fiducia.
24. Dettaglio campagna: cockpit della dignità comunicativa.
25. TrainerDesk: stati che rispettano persone vere.

**25 Headlines**

1. Dettaglio campagna — volume sotto controllo.
2. Play, pausa, stop: musica per la membership.
3. Termina la campagna — non la persona.
4. Date nel dettaglio — promesse misurabili.
5. Budget in vista — tono che deve reggere.
6. Modifica: riallinea prima che sia troppo tardi.
7. Stato attivo — responsabilità accesa.
8. Stato in pausa — gentilezza possibile.
9. Stato terminato — onestà istituzionale.
10. Dettaglio serio — messaggi seri fuori.
11. Non solo dati — decisioni morali.
12. Meno rumore, più ascolto dopo.
13. Coerenza finestra-realtà.
14. Marketing che spegne — brand che respira.
15. Megafono con interruttore — umano.
16. Il premium chiude i cicli promozionali.
17. Tre azioni, una reputazione.
18. Dashboard interna — vita esterna.
19. Silenzio strategico > promo eterna.
20. Chiudi bene — riapri forte dopo.
21. Stanchezza promo si cura con pause vere.
22. Il cliente non legge il DB — legge la inbox.
23. Governance stato — governance fiducia.
24. TrainerDesk: cicli comunicativi adulto.
25. Il dettaglio che conta è quello che sentono.

**25 Subheadlines**

1. Card dettaglio rende budget e periodo impossibili da ignorare — bene per etica interna.
2. Azioni rapide rendono la governance immediata — rischio se manca coordinamento canali.
3. Link modifica separa “decisione veloce stato” da “revisione contenuti” — workflow utile.
4. Stato ended nasconde azioni — evita toggle stupidi su cicli chiusi — chiarezza.
5. Format date italiano aumenta concretezza temporale per chi decide copy fuori.
6. Channel label tradotta riduce errore semantico cross-team verso messaggi fuori.
7. Aggiornato visibile incoraggia refresh culturale campagna — anti “lasciato lì”.
8. Termina come azione psicologicamente pesante — dovrebbe essere accompagnata da checklist esterna.
9. Pausa utile in overload interno — se comunicato anche ai membri sensibili.
10. Attiva da bozza dovrebbe idealmente richiedere conferma copy — non implementato ma morale rilevante.
11. Budget assente ancora visibile come “–” — invita a riflettere se bastano messaggi gratuiti infiniti.
12. Campagna senza fine data crea ansia infinita fuori — campo fine nel DB è ancora più morale della UI.
13. Tre icone lucide — metafora mixer — aiutano staff junior a pensare in termini di volume.
14. Errore fetch campagna — gate verso lista — protezione navigazione.
15. Redirect ruoli non marketing/admin — protezione dati sensibili budget.
16. Dettaglio singolo incentiva confronto con narrativa trainer prima di attivare.
17. Stato paused culturalmente sottoutilizzato — potrebbe essere leva anti-burnout membership.
18. Stato ended dovrebbe idealmente trigger reminder comunicazione chiusura — oggi solo DB.
19. Coerenza tra analytics e stato campagna misura qualità oltre quantità.
20. Micro-copy assente post-terminazione è gap retention emotiva.
21. Il vero premium è allineare push scheduler con stato campagna.
22. Azioni rapide possono essere premutte sotto stress — serve disciplina team.
23. Link edit vicino al titolo — percorso naturale revisione prima di play.
24. Campagna è nome grande — identità vocale del club in una riga.
25. Questa pagina è il punto dove il marketing diventa **potere con feedback**.

**25 Hooks Instagram**

1. Tre tasti — una inbox.
2. Pausa: gentilezza reale se arriva anche fuori.
3. Stop promozionale ≠ stop club.
4. Date chiare — menti più tranquille.
5. Budget in carta — tono con coscienza.
6. Modifica prima dell’impulso.
7. Spegni la voce che stanca.
8. Megafono con volume umano.
9. Il premium sa chiudere un ciclo.
10. Attiva con testa, non con panico.
11. Coerenza stato-messaggio o nulla.
12. Fine campagna — inizio fiducia.
13. Meno rumore, più ascolto.
14. Marketing che respira — membership che resta.
15. Mixer della voce pubblica.
16. Non è dashboard — è etica.
17. Trainer allineato — messaggio intero.
18. Musica: serve anche il silenzio.
19. Stop button — coraggio visibile.
20. Promessa temporale — mantienila ovunque.
21. Il cliente non vede il DB — sente la promo.
22. Pausa intelligente — retention silenziosa.
23. Dettaglio che decide la pace in inbox.
24. Chiudi la finestra — apri rispetto.
25. TrainerDesk: stati che contano.

**25 Hooks TikTok**

1. POV: premi pausa e la membership finalmente respira.
2. Il tasto “termina” è terapeutico se lo usi bene.
3. Tre bottoni che decidono la pace della chat.
4. Megafono del club — bassi gli alti quando servono.
5. Budget sullo schermo — coscienza sul messaggio.
6. Stop alla promo infinita — start alla fiducia.
7. Date vere o cinismo reale.
8. Marketing che spegne — trend raro — apprezzato.
9. Mixer audio metafora — tre stati campagna.
10. Modifica: ultima chance prima del live emotivo.
11. Il DB non mente — la push sì — allinea tutto.
12. Fine campagna: meno FOMO — più rispetto.
13. Pausa ≠ pigrizia — è emotional intelligence.
14. Play responsabile — brand adulto.
15. Il premium chiude i cicli — non li eterna.
16. Trainer prima del toggle attiva — workflow umano.
17. Dettaglio campagna — thriller interno — drama inbox esterno.
18. Click terminata — sollievo collettivo possibile.
19. Coerenza finestra-promessa — retention basics.
20. Meno spam — più premium — più sale piene dopo.
21. La membership ringrazia quando spegni rumore inutile.
22. Stop button ASMR — metafora silenzio meritato.
23. Dashboard piccola — impatto enorme fuori.
24. Etichetta stato — etichetta rispetto.
25. TrainerDesk: volume giusto, persone vere.

**10 Idee Reels**

1. Split schermo: lista infinita messaggi vs dopo **Termina** ben comunicato.
2. Spiegazione “cosa cambia fuori” quando premi Pausa — diagramma inbox.
3. Facecam founder: il giorno abbiamo spento una promo — orgoglio etico.
4. Animazione mixer collegata ai tre bottoni — audio design.
5. Reaction analitico: budget alto vs engagement basso — stop morale.
6. Mini-corso: checklist prima di **Attiva**.
7. Clip ironica: stato paused nel DB — push ancora attive — incubo ops.
8. Timeline campagna con micro-interruzioni — pause come feature.
9. Intervista membro: “ho notato quando hanno smesso di urlare offerte”.
10. Behind the scenes: riunione 5 min prima di **Termina**.

**10 Idee Carousel**

1. Cosa significano draft/active/paused/ended per chi riceve DM.
2. Checklist prima di spegnere una campagna senza tradire fiducia.
3. Tre azioni rapide spiegate come decisioni morali, non tecniche.
4. Come chiudere narrativamente una promo nel messaggio finale.
5. Errori: terminare nel DB ma non nel calendario push.
6. Budget visibile: cosa cambia nel tono delle parole permesse.
7. Coerenza periodo campagna ↔ vita reale membri (rientri, estate).
8. Pausa intelligente: quando usarla senza sembrare deboli.
9. Modifica vs stato: due cervelli della stessa campagna.
10. Metriche qualitative dopo cambio stato — non solo numeri.

**10 Idee Stories**

1. Poll: “Preferisci una promo breve intensa o lunga soft?”
2. Countdown fine campagna — trasparenza.
3. Sticker “Metti in pausa la promo nella mia testa”.
4. Quiz: cosa dovrebbe succedere fuori quando premi Termina?
5. Domanda aperta: quando uno spam ti ha rotto — cosa avresti voluto?
6. Behind: riunione marketing-trainer prima di Attiva.
7. Ringraziamento staff quando chiudono promo impopolare — brand umano.
8. Mini-FAQ “paused vs ended”.
9. Promemoria: stati DB ≠ stati cuore — allinea comunicazione.
10. Link a principi anti-FOMO palestre.

**10 Idee Static Ads**

1. Visual tre pulsanti grandi — headline “Volume sotto controllo”.
2. Quote “Il premium sa chiudere”.
3. Before/After inbox densità messaggi.
4. Icone Play Pause Stop minimal — brand governance.
5. Headline “Termina la voce — salva la fiducia”.
6. Contrasto: hype eterno vs ciclo chiuso.
7. Static “Budget visibile — coscienza visibile”.
8. Messaggio B2B: brand safety come finestra campagna.
9. Visual calendario — campagna come stagione.
10. Claim “Mixer della megafono — non rumore cieco”.

**10 Angoli emotivi**

1. sollievo quando la promo finisce davvero.
2. Ansia da troppi messaggi ancora mentre pensi sia finita.
3. Orgoglio staff quando si osa spegnere una voce tossica.
4. Impazienza marketing verso **Attiva**.
5. Vergogna post errore promessa fuori tono.
6. Gratitudine membership quando la pausa è reale.
7. Delusione se mismatch AD-sala persiste dopo modifica.
8. Timore di sembrare deboli mettendo pausa — ego leadership.
9. Fastidio cinico verso promo infinite — desiderio di fine onesta.
10. Calma strana dopo finestra campagna ben comunicata.

**10 Angoli motivazionali**

1. Motivazione a rientrare dopo pausa promo — attenzione fresca.
2. Motivazione staff a difendere tono etico con **Termina**.
3. Motivazione trainer ad allineare voce prima di **Attiva**.
4. Cultura “chiudiamo cicli” come identità club matura.
5. Motivazione founder a misurare brand safety oltre ROAS.
6. Piccolo orgoglio quando stato ended coincide con messaggio grazie membri.
7. Motivazione team ops a sincronizzare push e DB — orgoglio sistemico.
8. Meno pressione commerciale interna dopo pausa — motivazione qualità messaggi.
9. Motivazione community quando campagna celebra persone vere — amplify fine ciclo.
10. Drive verso analytics dopo cambio stato — miglioramento continuo.

**10 Angoli cognitivi**

1. Stato campagna come variabile che modifica frequenza messaggi percepita.
2. Date come ancoraggio contro ansia promozionale infinita.
3. Budget come promessa implicita di volume potenziale — serve disciplina copy.
4. Separazione UI tra edit contenuti e toggle stato — due decisioni cognitive distinte.
5. Ruoli marketing/admin — gate cognitivo accesso dati sensibili.
6. ended che rimuove azioni — prevenzione errori toggle su cicli chiusi.
7. Mapping canale → attese lunghezza messaggio fuori.
8. updated_at come segnale governance — campagna viva vs abbandonata.
9. Errore fetch — mental model “non esiste” vs lista stale — reset navigazione.
10. Pressione decisionale su stop vs sunk cost fallacy campagna cara.

**10 Angoli trasformazione**

1. Da promo rumorosa a ciclo chiuso con classe.
2. Da confusione finestra a chiarezza temporale percepita.
3. Da marketing nervoso a governance mixer volume.
4. Da saturazione a ritmo respirabile membership.
5. Da mismatch stato-canali a orchestrazione consapevole.
6. Da spam tossico a silenzio strategico premium.
7. Da ego “sempre acceso” a leadership che spegne quando serve.
8. Da dati freddi a consequenze emotive reali fuori.
9. Da dashboard interna a esperienza inbox umana.
10. Da churn silenzioso a fiducia recuperata dopo pausa sincera.

**10 Angoli engagement**

1. Pausa sincera aumenta click futuri — attenzione ricostruita.
2. Chiusura campagna con messaggio ringraziamento aumenta partecipazione successiva.
3. Coerenza stato push aumenta fiducia canale — engagement qualitativo.
4. Modifica copy dopo feedback sala aumenta event show rate promossi.
5. Meno frequenza durante paused aumenta qualità interazioni residue.
6. Messaggi limited-time coerenti con date aumentano conversion etica.
7. Segmentazione futura più netta dopo ended — engagement mirato dopo.
8. Analytics post stato guidano nuova campagna più empatica — engagement migliore ciclo 2.
9. Trainer coinvolto aumenta commenti positivi social campagna — engagement community.
10. Stop campagna tossica recupera engagement membri fragili — inclusione reale.

**10 Angoli relatable**

1. Odio quando la promo “è finita” ma arriva ancora.
2. Voglio meno messaggi quando pago già pieno.
3. Mi piace quando chiudono una promo con grazie — sembra umano.
4. Mi irrita urgenza finta perpetua.
5. Voglio sentire che il club ha un ritmo stagionale.
6. Mi basta una pausa comunicativa dopo mesi intensi.
7. Voglio coerenza tra quello che click e quello che vivo in sala.
8. Mi imbarazzano promo aggressive quando cerco solo routine salute.
9. Voglio celebrazione piccoli progressi — non solo sconti.
10. Mi fido quando spegnono una voce che stanca — segno di cura.

**10 Micro-frustrations**

1. Push dopo **Termina**.
2. Email dopo **Pausa**.
3. Promo fantasma nella testa ma non nel DB — incoerenza organizzativa.
4. Modifica ignorata — mismatch copy-trainer persiste.
5. Budget alto ancora acceso con trainer sommerso — promesse impossibili.
6. Date assenti — ansia infinita percepita.
7. Troppi click per capire se campagna è live davvero fuori.
8. Canale sbagliato per il messaggio — irritazione medium-specific.
9. Stato ended ma social ads ancora running — incubo brand safety.
10. Nessun messaggio di chiusura verso membri dopo fine ciclo.

**10 Micro-rewards**

1. Silenzio inbox dopo pausa reale — sollievo nervoso autentico.
2. Messaggio “promo chiusa, grazie” — gratitudine improbabile ma forte.
3. Riduzione spam — attenzione ricambiata sul prossimo messaggio utile.
4. Coerenza push-DB — sensazione di club professionale.
5. Trainer citato nel messaggio finale campagna — fiducia rinforzata.
6. Evento dopo campagna educativa — partecipazione più calda.
7. Meno domande arrabbiate in reception — micro pace operativa.
8. Commenti social positivi dopo chiusura elegante — reward staff.
9. Analytics che migliorano dopo stop tossico — orgoglio dati.
10. Membro che dice “finalmente respirate anche voi” — validazione rara.

**10 Scene realistiche**

1. Venerdì sera: marketing mette **Pausa** dopo polemiche WhatsApp — sabato inbox più calma — clima sala migliora.
2. Lunedì: **Termina** dopo promo lunga — newsletter ringraziamento — trust strano recuperato.
3. Coach nota meno lamentele dopo pausa reale — motivazione staff allenatori sale.
4. Bug push legacy dopo ended — gruppo ops maratona — lezione integrazione canali.
5. Riunione 10 min: stato campagna + copy trainer — **Attiva** responsabile.
6. Membro screenshot: ancora ads dopo ended — crisi brand — fix coordinato.
7. Estate: campagna outdoor — ended settimanale pulito — membri apprezzano ritmo.
8. Marketing junior impara peso di **Termina** — maturità accelerata.
9. fondatore felice quando analytics migliora dopo stop rumoroso — cultura dati + empatica.
10. Due campagne sovrapposte risolta pausing una — dedup emotivo membership.

**10 Scene scroll-stopping**

1. Testo gigante: “Spegni la promo — accendi la fiducia”.
2. Split inbox densità prima/dopo **Termina** ben comunicato.
3. Facecam: lacrime leggere membro quando spam finisce — autenticità forte.
4. Animazione Play/Pause come DJ set — metafora mixer club.
5. Countdown finestra campagna con audio che si abbassa — satisfaction ASMR.
6. Zoom su ended — confetti minimal — metafora chiusura rituale.
7. Ironia: budget altissimo — engagement basso — stop coraggioso premiato.
8. VO: “Non ho visto il DB — ho sentito la pace”.
9. Clip 1s nero totale — caption “questa è la tua inbox dopo una pausa vera”.
10. Reaction founder che blocca **Attiva** finché trainer non è ok — leadership.

**5 emozioni principali**

1. sollievo.
2. Ansia (rumore persistente).
3. Responsabilità.
4. Orgoglio (chiusura etica).
5. Frustrazione (incoerenza canali).

**5 paure principali**

1. Promo che non finisce mai fuori.
2. Essere spammati pur pagando.
3. Manipolazione FOMO infinita.
4. Promesse da campagna che la sala non regge.
5. Essere trattati come metrica non persona.

**5 desideri principali**

1. Chiarezza su inizio e fine promo.
2. Meno messaggi quando già fedele.
3. Voce club coerente con trainer.
4. Chiusura elegante delle iniziative.
5. Comunicazione stagionale comprensibile.

**5 trigger motivazionali**

1. Senso di comunità reale — non audience.
2. Identità “persona che migliora” vs “persona scontata”.
3. Obiettivi salute concreti celebrati.
4. Supporto umano visibile — non solo automation.
5. Trasparenza temporale — promessa rispettata.

**Prima vs Dopo**

- **Prima:** stato interno opaco — confusione inbox — cinismo.
- **Dopo:** stato governato — pause e fine reali — fiducia ricostruibile.

**La frase che vende davvero la pagina**
“Qui non guardi una campagna — regoli quanta voce del club arriva ancora alla loro giornata.”
