# Impostazioni Massaggiatore — Analisi Profonda Atleta

==================================================

## 0. Metadati pagina

==================================================

- **Nome pagina:** Impostazioni massaggiatore (hub identità e preferenze)
- **URL analizzato:** `http://localhost:3001/dashboard/massaggiatore/impostazioni` — varianti `?tab=profilo` (default senza query), `?tab=notifiche`, `?tab=privacy`, `?tab=account` — alias legacy `?tab=servizio` normalizzato in **`tab=account`** con `router.replace`.
- **Data analisi:** 2026-05-09
- **Cartella creata:** `Descrizione progetto/Atleta/Impostazioni Massaggiatore`
- **File markdown:** `impostazioni-massaggiatore.md`
- **Funzione principale:** `StaffContentLayout` tema teal — tabs **Profilo**, **Notifiche**, **Privacy**, **Account** — contenuti lazy-loaded; tab Profilo combina **`PTProfileTab`** (profilo professionale massaggiatore: specializzazione, certificazioni, azioni verso statistiche e account) con **`SettingsProfileTab`** (anagrafica/base `profiles`); tab Notifiche combina **`PTNotificationsTab`** (inbox notifiche API con badge unread sul trigger) con **`SettingsNotificationsTab`** (preferenze canali/categorie); Privacy e Account sono i tab settings standard (`SettingsPrivacyTab`, `SettingsAccountTab` con password e 2FA). Gestione modifiche non salvate con dialog conferma al cambio tab; banner errore salvataggio con retry.
- **Ruolo principale:** Atleta _(effetto indiretto massimo: ciò che il massaggiatore configura qui — notifiche, lingua/fuso, visibilità, dati di contatto, tono delle risposte tempestive — modella affidabilità percepita, continuità della relazione e riduzione attriti su appuntamenti/pagamenti/chat)_
- **Tipo workflow:** Impostazioni multi-layer — identità professionale + dati anagrafici + inbox + preferenze comunicazione.
- **Tipo stress mentale:** Medio — molte decisioni (privacy esposta, password, 2FA); mitigazione UX con conferme e lazy load.
- **Tipo motivazione:** Controllo — senso di padronanza del proprio canale verso il cliente.
- **Tipo reward psychology:** Feedback positivo su salvataggi riusciti — inbox gestibile — badge unread che scende — micro-progress.
- **Tipo engagement:** Alto per chi usa chat/appuntamenti intensamente — regola il “ritmo” delle interruzioni.
- **Tipo continuità:** Unifica redirect da `/dashboard/massaggiatore/profilo` — coerenza narrativa “questo è il centro della tua identità digitale club”.
- **Stato pagina analizzato:** `src/app/dashboard/massaggiatore/impostazioni/page.tsx`.
- **Fonte analisi:** Codice.
- **Nota ID dinamico:** Nessun segment dinamico URL; dati legati a `authUser` / profilo corrente.

==================================================

## 1. Sintesi breve

==================================================

La pagina è il **volto tecnico** del massaggiatore nel gestionale: non è decorazione — orchestra **chi sei professionalmente** (`PTProfileTab`), **come ti contattano** (`SettingsProfileTab`), **quali interruzioni accetti** (doppio layer notifiche), **cosa è visibile** e **come si comporta il tuo account**. Per l’atleta tutto questo è **filtrato**: non vede i tab, ma sente **coerenza**, **tempestività** e **rispetto dei confini** quando i settaggi sono allineati alla cura promessa.

==================================================

## Sezioni analisi (1–17 — sintesi operative)

### 1–4. Contesto, workflow, motivazione, stress

Flusso tipico: guard massaggiatore → caricamento `usePTProfile` → tabs. Stress se modifiche non salvate e cambio tab — mitigato dal dialog. Query `tab=servizio` legacy → `account` — riduce rottura link vecchi.

### 5–8. Reward, progress, fiducia, cognitive load

Salvataggi con toast — progress percepito. Doppio strato profilo (PT + Settings) può aumentare load — controbilanciato da editing mode chiaro su PTProfileTab.

### 9–12. Engagement, habit, premium, emotional

Badge unread sul tab Notifiche — loop habit inbox zero. Premium: tema teal coerente — sensazione prodotto curato.

### 13–15. Marketing, creative, ecosystem

Messaggio: “Identità + infrastruttura comunicativa” nello stesso luogo — narrativa B2B2C verso atleta via comportamento.

### 16. Analisi profonda

**Profilo:** `PTProfileTab` con `roleLabel="Massaggiatore"`, `theme="teal"`, `sessioniMeseLabel="Trattamenti mese"` — ancora più legato al vertical; shortcut a statistiche e account. **Notifiche:** inbox **più** preferenze — staff vede cosa è arrivato e decide cosa deve ancora rompere la concentrazione. **Privacy:** visibilità profilo, email/telefono, analytics — impatto percepito sicurezza boundaries cliente. **Account:** lingua, formato data/ora, password, 2FA — chiarezza coordinamento temporale con atleta.

### 17. Output finale obbligatorio

- **Riassunto operativo:** Hub `/dashboard/massaggiatore/impostazioni` — quattro tab — merge servizio→account — doppio profilo + doppio blocco notifiche — guard staff.
- **Riassunto emotivo:** Padronanza mista a responsabilità — “qui definisco come appaio e come rispondo”.
- **Riassunto motivazionale:** Continuità professionale — meno imprevisti relazionali.
- **Riassunto cognitivo:** Modello mentale a strati — professionista vs anagrafica vs inbox vs preferenze globali.
- **Problema reale:** Disallineamento tra ciò che il cliente crede e ciò che è visibile/contattabile — mitigazione tab privacy + profilo.
- **Stress eliminato:** Cercare impostazioni sparse — tutto sotto stesso tetto teal.
- **Motivazione creata:** Controllo granulare delle interruzioni — sensazione di professionalità autoregolata.
- **Reward psychology principale:** Chiusura loop — salvare — vedere inbox aggiornarsi — badge che cala.
- **Trasformazione percepita:** Da operatore reattivo a professionista che **progetta** ordine anche fuori dalla sala.
- **Continuità supportata:** Redirect profilo — URL stabile impostazioni con query tab — bookmarkabili.
- **Valore percepito:** Piattaforma matura — due livelli notifiche (messaggi vs preferenze).
- **Fiducia generata:** Coerenza dati contatto e tempi risposta — meno attriti.
- **Effetto retention:** Cliente meno frustrato da ritardi o confini violati — relazione più lunga possibile.
- **Effetto engagement:** Staff che cura inbox e preferenze — migliore answering rate — effetto domino su atleta.
- **Messaggio più forte:** “Chi sei” e “come ti disturbano” nello stesso luogo — identità e ritmo comunicativo allineati.
- **Visual hook più forte:** Badge unread sul tab Notifiche — richiamo alla gestione della relazione in tempo reale.
- **Copy hook più forte:** Descrizione layout “Profilo, notifiche, privacy e account.” — chiarezza immediata.
- **Concetto ads più forte:** Impostazioni come **contratto psicologico invisibile** col cliente — tono, tempi, confini.

**25 Hooks Meta Ads**

1. Un solo centro — identità, inbox e confini — tema teal massaggiatore.
2. Due livelli notifiche — cosa è arrivato vs cosa vuoi ancora ricevere — controllo fine.
3. Profilo professionale + anagrafica — meno drift tra “chi sei” e “come ti trovo”.
4. Badge unread — promemoria gentile — zero messaggi dimenticati — cliente ringrazia indirettamente.
5. Merge tab servizio → account — link vecchi ancora sensati — meno panico staff.
6. Dialog modifiche non salvate — rispetto del lavoro dell’utente — meno perdite dati — fiducia UX.
7. Retry errore salvataggio — trasparenza su fallimenti — adultità prodotto.
8. Shortcut statistiche dal profilo PT — motivazione performance senza uscire dall’identità.
9. Privacy esplicita — confini chiari — sicurezza emotiva cliente quando sa cosa è pubblico.
10. Lingua e fuso — sincronizzazione appuntamenti — meno incomprensioni su orari.
11. Password e 2FA — sicurezza — narrativa affidabilità istituzionale club.
12. Lazy load tabs — percezione leggerezza tecnica — caricamenti mirati.
13. Theme teal — continuità sensoriale col vertical massaggiatore — brand embodiment.
14. `PTProfileTab` editing mode — riduzione errori pubblicazione modifiche incomplete.
15. Inbox reale separata dalle preferenze — modello mentale più chiaro.
16. `sessioniMeseLabel` trattamenti — ancoraggio verticale — identità di ruolo rinforzata.

17. Layout max width — sensazione dashboard “seria” — meno caos mobile/desktop.

18. Integrazione `useUserSettings` — coerenza cross-tab salvataggi — meno incoerenze silenziosa.

19. Mark all read — piccolo triplo della giornata — sollievo ossessivo compatibile col benessere professionale.

20. Eliminazione notifica — controllo della memoria digitale — alleggerimento cognitivo staff.

21. Notifiche push/email/sms toggle — autonomia del professionista sul canale — rispetto della sua giornata.

22. Appointments toggle — coerenza col calendario massaggi — meno sorprese per il cliente.

23. Payments toggle — riduzione ansia da denaro — gestione emotiva delle conversazioni economiche.

24. Staff junior: un URL — formazione veloce — meno domande — cliente riceve risposte più rapide.

25. Fine tab hopping — inizio relazione curata — impostazioni come infrastruttura della fiducia.

**25 Headlines**

1. Dove il massaggiatore decide chi è — e come risponde al mondo.
2. Profilo doppio strato — zero contraddizioni tra anagrafe e professione.
3. Notifiche: inbox + preferenze — due leve — un tab.
4. Il badge che ti ricorda di non tradire il cliente.
5. Privacy che protegge anche il rapporto emotivo — non solo i dati.
6. Account che sincronizza lingua e tempo — meno incomprensioni in sala attesa.
7. Teal ovunque — identità verticalmente coerente.
8. Dialog “non salvato” — il software che rispetta il tuo lavoro parziale.
9. Retry errore — trasparenza quando il cloud vacilla.
10. Da qui parte il tono delle chat — scegli consapevolmente.
11. Impostazioni come contratto invisibile col cliente.
12. Statistiche a portata di tap — motivazione senza perdere il filo identitario.
13. Due piani della verità — messaggi arrivati vs cosa vuoi ancora sapere.
14. Meno segreti operativi — più fiducia istituzionale — password e 2FA raccontati bene.
15. Il massaggiatore moderno non improvvisa — configura.
16. Confini chiari — massaggi più tranquilli — relazione più lunga.
17. Un hub — molte leve — una missione: cura professionale.
18. Non sei disperso — sei strutturato — anche digitalmente.
19. Il cliente non vede questa pagina — sente le conseguenze — potenza indiretta.
20. Continuità dal redirect profilo — stesso luogo sacro dell’identità.
21. Preferenze salvate — giornata salvata — storytelling produttività gentile.
22. Elimina notifica — alleggerisci mente — più spazio empatico in sala.
23. Toggle messaggi — scegli quanta voce dare alla chat senza ghostare.
24. Lingua italiana di default — radicamento culturale club locale — micro-appartenenza.
25. Fine delle impostazioni sparse — inizio della presenza costante.

**25 Subheadlines**

1. `BASE_PATH` con replace senza scroll — cambio tab fluido — continuità cognitiva.
2. `tab=servizio` → `account` — compatibilità con il modello mentale legacy “servizio” come preferenze globali.
3. `PTProfileTab` in lazy load — primo paint rapido — skeleton per attesa controllata.
4. `SettingsProfileTab` dopo il blocco PT — ordine implicito: professione prima, contatti base dopo.
5. `useNotifications` e `unreadCount` sul trigger — affordance visiva — ansia da messaggi in sospeso ridotta.
6. Inbox API normalizzata con `mapApiNotificationToTab` — presentazione uniforme — meno attriti in UI.
7. Errori di salvataggio tipizzati (`profile` / `notifiche` / `privacy` / `account`) — messaggi mirati.
8. Titolo e descrizione in `StaffContentLayout` — orientamento immediato per staff nuovo.
9. Dialog di conferma 2FA — scelta consapevole — etica della sicurezza.
10. Validazione password lato client — feedback prima del round-trip — rispetto del tempo.
11. Fuso orario predefinito coerente con contesto operativo locale — meno errori su orari e appuntamenti.
12. Visibilità profilo regolabile — incide su quanto il cliente può trovarti e con quale fiducia.
13. Mostra email/telefono in modo selettivo — confini di contatto allineati a quelli in sala.
14. Preferenze analytics esplicite — trasparenza culturale sui dati di prodotto.
15. `handleViewStats` verso le statistiche verticali — motivazione ancorata a numeri concreti.
16. `handleViewAccountTab` dal profilo PT — percorso naturale verso lingua, fuso e credenziali.
17. Stati di caricamento distinti (guard, `ptProfileLoading`) — attese gestite — meno sensazione di “bug”.
18. Dialog modifiche non salvate — protezione del lavoro in corso dopo giornate lunghe.
19. Etichette fallback localizzate — cura del micro-copy e coerenza linguistica.
20. Tema `teal` passato a `PTProfileTab` — coerenza cromatica con il vertical massaggiatore.
21. `sessioniMeseLabel` sui trattamenti — linguaggio specifico — meno genericità da “PT”.
22. Aggiornamento riga `profiles` via Supabase — identità di base persistente e immediata.
23. `syncAuthContextAfterOwnProfilesRowUpdate` — nome e avatar allineati in tutta l’app dopo il salvataggio.
24. Priorità e categoria notifica mappate quando presenti — inbox più leggibile e gestibile.
25. Configurazione completata — giornata operativa con confini chiari — impatto positivo indiretto sul cliente.

**25 Hooks Instagram**

1. Swipe tra tab — ogni stop regola un pezzo della relazione con l’atleta.
2. Badge sul campanello — promemoria che qualcuno ha bisogno di te.
3. Doppio strato notifiche: cosa è successo vs cosa vuoi ancora sapere — chiarezza mentale.
4. Teal ovunque — il massaggiatore non è ospite — è di casa nel vertical.
5. Profilo PT in modifica — decidi cosa mostrare come professionista — autorevolezza.
6. Anagrafica sotto — contatti veri — coerenza con ciò che scrivi in chat.
7. Privacy: decidi fino a dove arriva la tua ombra digitale — il cliente lo sente.
8. Account: lingua e orologio allineati — appuntamenti senza fraintendimenti.
9. “Modifiche non salvate” — il prodotto che capisce le giornate spezzate.
10. Retry sull’errore — niente errori sepolti — rispetto per lo staff.
11. Inbox: segna letto, segna tutto, elimina — controllo fine sul rumore.
12. Preferenze: email, push, SMS, messaggi, pagamenti, appuntamenti — ritmo su misura.
13. 2FA: confine tra comodità e responsabilità — istituzione che protegge il rapporto dato.
14. Caricamento a chunk — percezione di prodotto leggero nonostante la ricchezza.
15. Stesso URL per redirect profilo — memoria muscolare — meno smarrimento.
16. “Trattamenti mese” al posto di etichette generiche — orgoglio di vertical.
17. Collegamento veloce alle statistiche — motivazione senza uscire dal senso di sé.
18. Profilo e notifiche nello stesso luogo — identità e attenzione intrecciate.
19. Il cliente non vede i tab — vede se rispondi in tempo — qui configuri l’infrastruttura.
20. Slide carosello: “Qui non decori — configuri la fiducia.”
21. Soft CTA: “Allinea confini digitali a confini di sala.”
22. Countdown storie: cinque preferenze che salvano la giornata del cliente in modo indiretto.
23. Poll: “Quante notifiche ti rubano la presenza in trattamento?” — risveglio gentile.
24. Countdown 3… 2… 1… inbox gestita — sticker relax.
25. Outro: “Impostazioni noiose — relazioni più vere.”

**25 Hooks TikTok**

1. POV: apri notifiche — badge — respira — rispondi — altrove qualcuno salva la giornata.
2. “Due livelli nel tab” — spiegazione notifiche stile semplice per colleghi stanchi.
3. Sound: ding del salvataggio — micro-soddisfazione admin — caption “consapevolezza”.
4. Green screen: lista toggle — quanto rumore accetti nella giornata.
5. Satira: ghosting professionale perché notifiche spente — poi riattivi i messaggi con ironia gentile.
6. Checklist: tre cose che il cliente percepisce quando sistemi lingua e fuso.
7. Storytime: incomprensione sugli orari — sistemi tab account — disagio che si dissolve.
8. Unboxing emotivo: trovare tutto in un unico posto teal.
9. Duet: creator produttività × massaggiatore — “non ottimizzare la giornata — proteggi la presenza”.
10. ASMR: click sul tab — suono netto — whisper “confini”.
11. Meme: cervello enorme “salvo preferenze prima dei messaggi” vs cervello esausto “rispondo a caso”.
12. Trend reinterpretato: cosa ferisce la retention — notifiche mal configurate — punchline tab notifiche.
13. FAQ veloce: perché due blocchi profilo? — professione vs anagrafica in dodici secondi.
14. Motion text: `tab=servizio` → account — “non sei obsoleto — sei compatibile”.
15. Stitch: impostazioni caotiche altrove vs questa — sollievo comparato.
16. Ironia gentile: “Non sono impostazioni — sono disciplina gentile”.
17. Educational: 2FA come recinzione del rapporto professionale — metafora etica leggera.
18. Voice reveal: password aggiornata — meno ansia sugli accessi condivisi male.
19. Relatable: giornata lunga — il dialog non salvato ti evita una perdita silenziosa.
20. Tono serio venti secondi: privacy visibilità — confini rispettati — fiducia misurabile in modo indiretto.
21. Domanda ai commenti: “Quale toggle ti ha salvato la reputazione?” — community interna.
22. Transition teal swipe — continuità sensoriale — abitudine visiva.
23. Boomerang: cambio tab — ripensi — salvi — “maturità digitale”.
24. Mini serie: inbox zero come aspirazione etica — non solo produttività fredda.
25. End screen: “Qui non sei performer — sei professionista configurato.”

**10 idee Reels**

1. Split: giornata senza push mirati vs giornata con push scelti — espressione diversa sul volto.
2. Tutorial venti secondi: dove trovare lingua e fuso prima della settimana intensa.
3. Voice-over: “Ho sistemato le notifiche — ho sistemato la coscienza con cui rispondo.”
4. Umorismo: dialog non salvato che ti salva mentre squilla il telefono — sollievo condiviso.
5. B-roll mani in sala + overlay badge notifiche — attenzione divisa metaforica.
6. Close-up sui toggle messaggi — “scelgo io quando essere voce per il cliente”.
7. Transition: statistiche dal profilo — motivazione senza perdere identità.
8. Intervista scriptata: “Mi ha risposto subito” — causa invisibile: tab notifiche curato.
9. Montaggio salvataggi riusciti — suono soddisfacente — rinforzo positivo.
10. CTA morbido: “Non ottimizzare te stesso — ottimizza l’infrastruttura della cura.”

**10 Carousel**

1. Slide: “Quattro tab — una missione: cura professionale.”
2. Slide: Profilo doppio strato — coerenza identità.
3. Slide: Inbox + preferenze — due livelli di verità.
4. Slide: Privacy — confini visibili e invisibili.
5. Slide: Account — tempo e lingua condivisi col cliente.
6. Slide: Badge unread — promemoria etico, non solo performance.
7. Slide: Dialog non salvato — il software rispetta il lavoro interrotto.
8. Slide: Retry errore — trasparenza quando il sistema vacilla.
9. Slide: Teal — continuità col vertical massaggiatore.
10. Slide: “Il cliente sente — anche senza vedere questa schermata.”

**10 Stories**

1. Poll: ti salva di più il pulsante salva o il dialog modifiche non salvate?
2. Quiz: cosa fa `tab=servizio`? — Si normalizza ad account.
3. Countdown: 3… 2… 1… inbox ordinata — sticker relax.
4. Sticker domanda: “Quale toggle salva la tua reputazione?”
5. Link a guida interna su inbox vs preferenze — cultura di team.
6. Boomerang: tap salva — mini celebrazione — gentilezza verso sé stessi.
7. Reminder: aggiorna privacy dopo cambio policy club — responsabilità condivisa.
8. Dietro le quinte: perché due profili in un tab — promessa di spiegazione nella story dopo.
9. Testimonianza script: “Ho smesso di scusarmi per ritardi che dipendevano dai canali spenti.”
10. Outro: “Impostazioni — infrastruttura invisibile della fiducia.”

**10 Static**

1. Quattro tab — una promessa: coerenza.
2. Teal — radicamento nel ruolo.
3. Notifiche — ritmo della relazione.
4. Privacy — confini rispettati.
5. Account — tempo condiviso bene.
6. Salva — chiudi il cerchio.
7. Badge — promemoria gentile.
8. Dialog — empatia digitale.
9. Retry — onestà tecnica.
10. Il cliente beneficia — anche senza vedere.

**10 Angoli**

1. Emotivo: sollievo quando inbox e preferenze raccontano la stessa storia.
2. Motivazionale: configurazione come atto di cura professionale verso sé e altri.
3. Cognitivo: modello a strati — meno overflow mentale rispetto a impostazioni sparse.
4. Trasformazione: da reattivo a progettista della propria comunicazione.
5. Engagement: badge e salvataggi — micro-loop positivi.
6. Relatable: “ho quasi perso tutto” — il dialog non salvato — gratitudine.
7. Etico: confini privacy — rispetto del cliente prima ancora della compliance formale.
8. Organizzativo: un URL per formare il team — meno attrito in onboarding.
9. Premium: lazy load e layout curato — maturità prodotto percepita.
10. Indiretto verso atleta: tempi di risposta e chiarezza — proxy di qualità percepita.

**10 Micro-frustrations**

1. Due blocchi profilo da spiegare ai nuovi — serve una micro-spiegazione in onboarding.
2. Rischio di dimenticare salvataggi tra tab — mitigato dal dialog — resta attenzione richiesta.
3. Molti toggle notifiche — possibile overload — serve disciplina personale.
4. Password e 2FA possono intimidire — attrito iniziale — mitigazione tramite copy e conferme.
5. Mobile: griglia quattro tab — richiesta precisione nei tap.
6. Attesa durante `ptProfileLoading` — mitigata da skeleton — può sembrare vuoto.
7. Distinguere eliminazione notifica da disattivazione categoria — da interiorizzare con la pratica.
8. Lingua o fuso impostati male — effetti su calendario — serve verifica periodica.
9. Privacy troppo restrittiva — il cliente non trova contatto — bilanciamento continuo.
10. Aspettativa di “una sola pagina profilo” portata da altre app — da gestire con chiarezza comunicativa.

**10 Micro-rewards**

1. Toast di salvataggio riuscito — chiusura del loop gratificante.
2. Badge unread che scende — progresso visibile — più ossigeno mentale.
3. Segna tutte come lette — piccolo trionfo della giornata.
4. Modifica al profilo PT completata — identità pubblica aggiornata — orgoglio.
5. Nome e avatar coerenti ovunque dopo l’update — specchio digitale allineato.
6. Dialog che evita perdite — gratitudine verso il prodotto.
7. Retry riuscito dopo errore di rete — fiducia ripristinata.
8. Lingua e fuso corretti — meno stress logistico con i clienti.
9. Toggle messaggi che riflette il proprio stile di cura — valori allineati.
10. Sensazione di “tutto è al suo posto” dopo il giro completo delle impostazioni.

**10 Scene realistiche**

1. Lunedì mattina: inbox — tre notifiche — segna tutto come letto — respiro — prima cliente alle nove.
2. Cambio telefono personale: aggiorni `profiles` — salvi — nome coerente in chat da subito.
3. Cliente insoddisfatto per risposta tardiva — ritrovi un canale disattivato — riallinei toggle e ripari il rapporto.
4. Workshop interno sui confini: slide sul tab privacy — dibattito etico — team allineato.
5. Sera tarda: recupero password — flusso guidato — sollievo sulla sicurezza.
6. Nuovo assunto: collega mostra l’URL impostazioni — cinque minuti — autonomia nella settimana dopo.
7. Revisione brand personale: aggiorni specializzazione nel profilo PT — messaggi successivi più chiari al cliente.
8. Weekend: disattivi SMS, attivi push — equilibrio vita-lavoro migliorato.
9. Due dispositivi: modifichi su desktop — verifichi su mobile — fiducia nell’ecosistema.
10. Supervisione: permessi chiari — meno attriti — clima operativo sereno.

**10 Scene scroll-stopping**

1. Split: molte notifiche non lette vs inbox organizzata dopo regolazione consapevole dei toggle.
2. Testo marcato: “Il cliente non legge i tuoi tab — legge la tua puntualità.”
3. Impulso visivo teal sul tab attivo — thumb-stop da brand.
4. Sondaggio delicato: “Hai mai risposto tardi perché non sapevi dove fossero le notifiche?”
5. Meme: caos di impostazioni sparse in più app vs una pagina con quattro tab chiare.
6. Primo piano mani stanche sulla tastiera — didascalia “meno rumore digitale — più presenza manuale”.
7. Motion: pila di notifiche che si riduce quando premi “segna tutte come lette”.
8. Voce fuori campo drammatica consapevole: “Un toggle può cambiare la fiducia percepita.” Iperbole gentile.
9. Suono del salvataggio — micro-dopamina — loop positivo.
10. CTA finale morbida: “Non sei una lista di toggle — sei qualcuno che cura anche tramite ordine.”

**5 emozioni principali**

1. Padronanza.
2. Responsabilità.
3. Sollievo dopo salvataggio o inbox sistemata.
4. Ansia lieve quando compaiono errori o modifiche non salvate.
5. Orgoglio quando profilo e comportamento coincidono.

**5 paure principali**

1. Esporsi troppo o troppo poco con impostazioni di privacy sbagliate.
2. Perdere modifiche per distrazione — mitigazione tramite dialog.
3. Essere sommersi da notifiche non gestite — mitigazione tramite inbox e preferenze insieme.
4. Errori di fuso orario che deludono il cliente.
5. Sentirsi poco tecnici davanti a password e 2FA — mitigazione tramite UX e micro-copy.

**5 desideri principali**

1. Controllare ritmo e canali delle interruzioni.
2. Far combaciare identità professionale e dati di contatto.
3. Essere tempestivi senza sentirsi schiavi del telefono.
4. Proteggere sé e clienti con confini chiari.
5. Avere un unico posto credibile per aggiornare ciò che definisce la relazione digitale.

**5 trigger motivazionali**

1. Badge unread — richiamo alla cura della relazione.
2. Toast di successo — rinforzo comportamentale immediato.
3. Tema teal — appartenenza al vertical — motivazione identitaria.
4. Collegamento alle statistiche — drive prestazionale lucido.
5. Dialog modifiche non salvate — empatia del sistema — fiducia ripagata.

**Prima vs Dopo**

- **Prima:** identità e preferenze sparse — rischio incoerenze verso il cliente.
- **Dopo:** hub unico con strati chiari — configurazione allineata — effetto indiretto su fiducia e continuità della cura.

**La frase che vende davvero la pagina**

“Non stai smanettando su opzioni — stai firmando invisibilmente il contratto emotivo con chi si affida alle tue mani.”
