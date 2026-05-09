# Statistiche — Analisi Profonda

## 0. Metadati pagina

- Nome pagina: Statistiche
- URL analizzato: http://localhost:3001/dashboard/statistiche
- Data analisi: 2026-05-09
- Cartella: C:\Users\d.kushniriuk\Desktop\Gestionale_22club\Descrizione progetto\Statistiche\
- File markdown: C:\Users\d.kushniriuk\Desktop\Gestionale_22club\Descrizione progetto\Statistiche\statistiche.md
- Fonte analisi: codice reale (`src/app/dashboard/statistiche/page.tsx`, componenti dashboard statistiche, `src/lib/trainer-analytics.ts`)
- Funzione principale: vista KPI/andamento per trainer (e, per admin, anche vista legacy organizzazione) con periodo selezionabile.
- Stato pagina analizzato: analisi da codice, non da sessione browser guidata.
- Periodi disponibili da costanti `STATS_PERIODS`: Settimana (7), Mese (30), 6 mesi (183), Anno (365).
- Focus tecnico richiesto: `StatistichePageContent`, `fetchTrainerAnalyticsReport`, concetti query `workout_logs`, helper crescita.

---

## 1. Sintesi breve

Questa pagina non serve a “fare grafici belli”: serve a trasformare lavoro operativo in segnali leggibili.
Il cuore della pagina è doppio:

- lato trainer/admin: analytics trainer con dashboard dedicata;
- lato legacy: trend organizzazione (workout, documenti, ore, distribuzioni, performance).

La trasformazione concreta:

- da sensazioni (“sto andando bene?”) a indicatori periodali;
- da memoria frammentata a metrica ripetibile;
- da revisione casuale a routine decisionale.

---

## 2. Contesto reale di utilizzo

1. Quando viene usata?
   - Inizio giornata per capire “come siamo messi” prima delle sessioni.
2. Quando viene riaperta?
   - Fine giornata o fine settimana per rileggere andamento e anomalia.
3. In che stato mentale?
   - Mente piena, interruzioni alte, tempo corto.
4. Quale domanda deve chiudere subito?
   - “Questo periodo sta migliorando o peggiorando?”
5. Quale dubbio economico tocca?
   - “Incassi e ore si muovono insieme o no?”
6. Quale dubbio operativo tocca?
   - “Il calendario viene rispettato o stiamo perdendo aderenza?”
7. Quale dubbio roster tocca?
   - “Entrano più clienti di quanti ne escono?”
8. Perché il filtro periodo è centrale?
   - Perché cambia subito la lettura dei trend e il perimetro decisionale.
9. Cosa evita?
   - Discussioni guidate solo da impressioni dell’ultima settimana.
10. Cosa abilita?

- Confronti interni coerenti nello stesso intervallo temporale.

---

## 3. Workflow reale

11. Sequenza base trainer/admin:

- Seleziono periodo → verifico KPI → leggo trend → individuo anomalia → decido azione.

12. Sequenza base admin con tab:

- Trainer tab (analytics trainer) ↔ Organizzazione tab (legacy) per confronto rapido.

13. Azione più frequente:

- Cambio periodo (`week/month/6months/year`).

14. Azione critica:

- Trovare se c’è divergenza tra aderenza, churn e incasso/ora.

15. Azione secondaria:

- Consultare la heatmap oraria/giornaliera delle prenotazioni.

16. Azione economica:

- Leggere mix pagamenti e incasso cumulativo.

17. Azione roster:

- Vedere nuovi clienti/uscite nel tempo.

18. Azione qualità:

- Leggere no-show e rispetto calendario.

19. Azione atleta:

- Entrare dal pannello atleti su profilo/incassi/agenda.

20. Output atteso in 30 secondi:

- Una priorità concreta e non un “forse”.

21. Output atteso in 3 minuti:

- Una mini-review del periodo con scelta prossima mossa.

22. Attrito che elimina:

- Saltare tra schermate senza un quadro unico.

23. Standard che crea:

- Revisione periodica a blocchi (giorno/settimana) invece di analisi spot.

24. Beneficio immediato:

- Riduzione del rumore decisionale.

25. Beneficio cumulativo:

- Migliore disciplina operativa nel tempo.

---

## 4. Stress, caos e frustrazione

26. Stress ridotto:

- “Lavoro tanto ma non so se sto migliorando.”

27. Frustrazione ridotta:

- KPI senza contesto temporale.

28. Frustrazione ridotta:

- Difficoltà nel capire se il calo è evento isolato o trend.

29. Frustrazione ridotta:

- Non sapere dove intervenire prima.

30. Frustrazione ridotta:

- No-show percepiti “a sentimento”.

31. Frustrazione ridotta:

- Agenda piena ma aderenza bassa.

32. Frustrazione ridotta:

- Incassi presenti ma ore sottostimate o sovrastimate.

33. Frustrazione ridotta:

- Mix pagamenti non visibile.

34. Frustrazione ridotta:

- Uscite clienti notate in ritardo.

35. Frustrazione ridotta:

- Progressi atleti non aggregati.

36. Rischio evitato:

- Decisione strategica presa su dato incompleto.

37. Rischio evitato:

- Sovra-reazione al dato giornaliero isolato.

38. Rischio evitato:

- Sottovalutazione di segnali deboli ma ripetuti.

39. Rischio evitato:

- Confondere attività alta con rendimento alto.

40. Sollievo mentale:

- Routine di lettura sempre uguale anche nei giorni caotici.

---

## 5. Controllo operativo

41. Cosa mostra subito:

- KPI principali del periodo selezionato.

42. Cosa rende comparabile:

- Giorni o settimane con la stessa logica di aggregazione.

43. Cosa rende azionabile:

- Alert a semaforo su churn/adherence/rph.

44. Cosa rende leggibile:

- Trend incassi+ore e trend aderenza.

45. Cosa rende diagnosticabile:

- Funnel appuntamenti: prenotati/eseguiti/annullati/cancellati.

46. Cosa rende verificabile:

- No-show nel tempo.

47. Cosa rende pianificabile:

- Heatmap prenotazioni per ora e giorno.

48. Cosa rende discutibile in team:

- Mix pagamenti e incasso cumulativo.

49. Cosa rende focalizzabile:

- Top atleti per revenue/workout/progressi.

50. Cosa rende concreto:

- Split allenamenti con trainer vs autonomia.

51. Cosa rende sostenibile:

- Bilancio lezioni usate/prenotate/disponibili.

52. Cosa rende tracciabile:

- Nuovi ingressi/uscite roster nel periodo.

53. Cosa rende esportabile:

- Header con `ExportReportButton`.

54. Cosa rende consistente:

- Stessa pagina, stesso schema mentale, periodi diversi.

55. Cosa rende professionale:

- Decisione esplicita con base numerica.

---

## 6. Percezione professionale

56. Cosa comunica al trainer:

- “Sto gestendo un sistema, non solo giornate.”

57. Cosa comunica al team:

- KPI condivisibili con definizioni coerenti.

58. Cosa comunica al cliente (indiretto):

- Organizzazione misurata, non improvvisata.

59. Cosa comunica su leadership:

- Priorità fondate sui numeri.

60. Cosa comunica su qualità:

- Focus su aderenza e no-show.

61. Cosa comunica su business:

- Focus su ricavi, ore, churn.

62. Cosa comunica su crescita:

- Tracciamento progressivo, non one-shot.

63. Cosa comunica su trasparenza:

- Metriche leggibili con hint descrittivi.

64. Cosa comunica su disciplina:

- Revisione periodica strutturata.

65. Cosa comunica su affidabilità:

- Dati aggregati da sorgenti operative reali.

66. Cosa comunica su maturità:

- Distinzione tra vista trainer e vista legacy.

67. Cosa comunica su metodo:

- Dato → insight → azione.

68. Cosa comunica su priorità:

- Ridurre perdita clienti e migliorare aderenza.

69. Cosa comunica su efficienza:

- Meno tempo per capire, più tempo per agire.

70. Cosa comunica su posizionamento:

- Gestione trainer orientata a performance reale.

---

## 7. Impatto economico

71. Metrica economica base:

- `revenueTotal`.

72. Metrica economica oraria:

- `revenuePerHour`.

73. Metrica economica cliente:

- `revenuePerActiveClient`.

74. Metrica stabilità:

- `churnRatePct`.

75. Metrica traffico:

- `scheduledWorkoutAppointments`.

76. Metrica qualità agenda:

- `adherencePct`.

77. Metrica rischio:

- `noShowCount`.

78. Metrica tendenza:

- `revenueGrowthHalfPct`.

79. Metrica mix:

- `paymentMix` per tipo pagamento.

80. Metrica cumulativa:

- curva incasso progressivo.

81. Lettura utile:

- ricavi alti con aderenza bassa = fragilità futura.

82. Lettura utile:

- aderenza alta con churn alto = onboarding/fit da rivedere.

83. Lettura utile:

- ore alte con rph basso = pricing o pacchetti da ripensare.

84. Lettura utile:

- no-show in crescita = comunicazione pre-sessione da correggere.

85. Lettura utile:

- mix troppo concentrato = dipendenza da un solo metodo.

---

## 8. Psicologia del trainer

86. Emozione positiva:

- controllo.

87. Emozione negativa ridotta:

- confusione.

88. Sollievo:

- sapere cosa guardare prima.

89. Paura ridotta:

- non capire perché i numeri cambiano.

90. Pressione ridotta:

- giustificare decisioni senza base.

91. Calma ottenuta:

- schema fisso di lettura.

92. Energia restituita:

- meno analisi dispersiva.

93. Sicurezza aumentata:

- insight basati su segnali multipli.

94. Autostima professionale:

- capacità di spiegare i numeri.

95. Differenza mentale:

- reagire meno, guidare di più.

96. Identità:

- trainer-manager orientato a evidenze.

97. Frase simbolo:

- “Vedo prima, correggo prima.”

98. Frase simbolo:

- “Il dato mi aiuta, non mi blocca.”

99. Frase simbolo:

- “Ogni periodo racconta una storia operativa.”

100. Frase simbolo:

- “Le decisioni non partono più da rumore.”

---

## 9. Cognitive Load & Mental Energy

101. Riduzione memory pressure:

- KPI e trend esternalizzati.

102. Riduzione decision fatigue:

- priorità guidata da alert.

103. Riduzione context switching:

- più blocchi informativi nella stessa pagina.

104. Riduzione incertezza:

- periodi standardizzati.

105. Riduzione ambiguità:

- definizioni KPI esplicitate.

106. Riduzione sovraccarico:

- tab trainer/legacy separa contesti.

107. Riduzione dispersione:

- lettura top-down (KPI → trend → dettaglio).

108. Riduzione ansia:

- metriche previste già nella UI.

109. Riduzione errore:

- aggregazioni ripetibili.

110. Riduzione rumore:

- stesso linguaggio ogni review.

111. Abitudine utile:

- check rapido giornaliero.

112. Abitudine utile:

- review settimanale consolidata.

113. Abitudine utile:

- confronto metà periodo.

114. Abitudine utile:

- monitor no-show e aderenza insieme.

115. Abitudine utile:

- verificare mix pagamenti.

116. Abitudine utile:

- monitor ingressi/uscite roster.

117. Abitudine utile:

- usare heatmap per distribuzione agenda.

118. Abitudine utile:

- distinguere trend da picchi.

119. Abitudine utile:

- validare intuizioni col dato.

120. Abitudine utile:

- trasformare insight in azione concreta.

---

## 10. Scanning Speed & Visual Priority

121. Ordine naturale lettura trainer:

- KPI principali → semafori/insight → trend.

122. Ordine naturale lettura economia:

- rph/churn → crescita metà periodo → cumulato → mix.

123. Ordine naturale lettura atleti:

- leaderboard → split coach/solo → bilancio lezioni.

124. Ordine naturale lettura agenda:

- funnel → no-show → heatmap.

125. Priorità visiva forte:

- card KPI in alto.

126. Priorità visiva forte:

- colore semafori.

127. Priorità visiva forte:

- linee trend.

128. Priorità visiva forte:

- barre stacked funnel.

129. Priorità visiva forte:

- intensità heatmap.

130. Priorità visiva forte:

- progress bar distribuzioni.

131. Velocità decisione:

- 1.  anomalia 2) area impatto 3) azione.

132. Velocità orientamento:

- CTA periodo sempre in header.

133. Velocità orientamento:

- tab admin trainer/organizzazione.

134. Velocità orientamento:

- skeleton durante loading.

135. Velocità orientamento:

- hint no_org/no_trainers/none_selected.

136. Riduzione errori lettura:

- soglie e spiegazioni nei detail hint.

137. Riduzione errori lettura:

- metrica distinta per scope (trainer vs legacy).

138. Riduzione errori lettura:

- granularità giorno/settimana esplicita.

139. Riduzione errori lettura:

- timezone heatmap selezionabile.

140. Riduzione errori lettura:

- filtri trainer visibili e contati.

---

## 11. Interruption Recovery

141. Dopo interruzione breve:

- ritrovi subito KPI e periodo attivo.

142. Dopo interruzione lunga:

- riparti da semafori e trend, non da zero.

143. Dopo chiamata:

- check no-show e funnel in pochi secondi.

144. Dopo confronto team:

- apri sezione economica per decisione pricing.

145. Dopo dubbio roster:

- leggi nuovi/usciti nel grafico dedicato.

146. Dopo dubbio qualità:

- leggi aderenza + no-show insieme.

147. Dopo dubbio capacità:

- usa heatmap e carico orario.

148. Dopo dubbio cliente:

- apri link rapido su profilo/incassi/agenda atleta.

149. Dopo refresh pagina:

- skeleton evita flash incoerente durante bootstrap auth.

150. Dopo errore fetch:

- fallback coerente (`null` report o empty legacy), senza blocco totale.

---

## 12. Premium Subconscious Perception

151. Sensazione di qualità:

- dashboard segmentata per domini decisionali.

152. Sensazione di controllo:

- KPI + trend + dettaglio nello stesso flusso.

153. Sensazione di affidabilità:

- metriche spiegate in linguaggio operativo.

154. Sensazione di modernità:

- granularità e switch dinamici (giorno/settimana, timezone).

155. Sensazione di precisione:

- arrotondamenti coerenti (1 decimale o 2 dove serve).

156. Sensazione di sostanza:

- dati cross-tabella, non vanity metrics isolate.

157. Sensazione di trasparenza:

- hint testuali sul significato KPI.

158. Sensazione di concretezza:

- link diretti da insight a azione atleta.

159. Sensazione di robustezza:

- fallback gestiti lato fetch.

160. Sensazione di continuità:

- periodi standard sempre disponibili.

161. Sensazione di leggibilità:

- sezione per sezione, scopo chiaro.

162. Sensazione di riduzione rischio:

- alert in primo piano.

163. Sensazione di ordine:

- nomenclatura coerente (adherence, churn, rph, no-show).

164. Sensazione di scalabilità:

- dashboard utile anche con roster ampio.

165. Sensazione di fluidità:

- passaggio rapido trainer ↔ legacy (admin).

166. Sensazione di consistenza:

- stessa logica su periodi diversi.

167. Sensazione di autonomia:

- insight automatici come punto di partenza.

168. Sensazione di metodo:

- trend sempre accompagnato da KPI.

169. Sensazione di riduzione caos:

- ogni sezione risponde a una domanda precisa.

170. Sensazione finale:

- “so dove intervenire adesso”.

---

## 13. Energy Management

171. Energia risparmiata:

- meno tempo per trovare il problema.

172. Energia risparmiata:

- meno tempo per spiegare il problema.

173. Energia risparmiata:

- meno revisioni duplicate su dati discordanti.

174. Energia risparmiata:

- meno debugging mentale del calendario.

175. Energia risparmiata:

- meno interpretazioni intuitive non verificate.

176. Energia risparmiata:

- meno rientri caotici dopo interruzioni.

177. Energia risparmiata:

- meno “navigazione cieca” in dashboard.

178. Energia risparmiata:

- meno discussioni su definizioni metriche.

179. Energia risparmiata:

- meno allarmi falsi su picchi isolati.

180. Energia risparmiata:

- meno rincorsa manuale di insight.

181. Effetto giornaliero:

- più focus su coaching e comunicazione.

182. Effetto settimanale:

- review più ordinata e breve.

183. Effetto mensile:

- decisioni tattiche meno reattive.

184. Effetto operativo:

- meno attrito tra dato e azione.

185. Effetto psicologico:

- fatica mentale più gestibile.

---

## 14. Marketing Intelligence

186. Problema operativo risolto:

- leggere performance trainer su più assi in modo coerente.

187. Problema emotivo risolto:

- sensazione di “sto lavorando al buio”.

188. Desiderio nascosto soddisfatto:

- guidare, non rincorrere.

189. Trasformazione comunicabile:

- da intuizione a evidenza periodale.

190. Formula prima/dopo:

- Prima: tanto movimento, poca visione.
- Dopo: meno rumore, più priorità.

191. Parole forti:

- chiarezza, controllo, aderenza, churn, focus.

192. Concetti forti:

- segnali precoci, stabilità, qualità agenda.

193. Frase relatable:

- “Sono pieno ma non so se sto migliorando.”

194. Frase relatable:

- “I numeri cambiano ma non capisco perché.”

195. Frase relatable:

- “Ragioniamo sempre sull’ultima settimana.”

196. Hook realistico:

- “In 60 secondi capisci dove stai perdendo margine.”

197. Hook realistico:

- “Se aderenza scende e no-show sale, cosa fai domani?”

198. Hook realistico:

- “Incassi alti, ma ore fuori controllo: sei davvero in crescita?”

199. Promise credibile:

- “Una review periodale chiara e ripetibile.”

200. Valore differenziante:

- dati allenamento, agenda, pagamenti e roster nello stesso frame.

201. Posizionamento:

- analytics utile per decisioni pratiche, non solo reporting.

202. Angolo vendita:

- riduzione caos decisionale.

203. Angolo vendita:

- stabilità operativa.

204. Angolo vendita:

- performance misurabile.

205. Angolo vendita:

- qualità percepita più alta.

---

## 15. Content & Creative Strategy

206. Formato migliore:

- demo “prima/dopo” su periodo e KPI.

207. Visual hook:

- semaforo rosso su aderenza + linea no-show in salita.

208. Copy hook:

- “Se non misuri questa triade, stai guidando al buio.”

209. Triade consigliata:

- aderenza + churn + incasso/ora.

210. Mini-story:

- anomalia rilevata, causa ipotizzata, azione, risultato.

211. Angolo operativo:

- come usare i periodi per evitare bias settimanale.

212. Angolo economico:

- leggere rph insieme a ore registrate.

213. Angolo qualità servizio:

- ridurre no-show con azioni pre-sessione.

214. Angolo gestione team:

- dashboard come lingua comune.

215. Angolo retention:

- segnali anticipatori di abbandono.

216. Angolo agenda:

- heatmap per ripianificare slot.

217. Angolo pacchetti:

- lezioni usate/prenotate/disponibili.

218. Angolo progressi:

- distribuzione variazione peso.

219. Angolo accountability:

- decisioni motivate da metriche.

220. Angolo identitario:

- trainer che gestisce per evidenze.

---

## 16. Analisi tecnica profonda (solo fatti da codice)

221. Entrypoint pagina:

- `src/app/dashboard/statistiche/page.tsx`.

222. Layout usato:

- `StaffContentLayout`.

223. Azioni header:

- `StatisticheHeaderActions`.

224. Contenuto pagina:

- `StatistichePageContent`.

225. Tema layout:

- `theme="teal"`.

226. Tab visibile admin:

- `trainer` e `legacy`.

227. Tab visibile trainer:

- solo `trainer`.

228. Period default:

- `month`.

229. Range days:

- da `daysForPeriod(period)`.

230. Costanti periodi:

- `week=7`, `month=30`, `6months=183`, `year=365`.

231. Clamp range:

- min 1, max `366 * 2`.

232. Boundary inizio:

- ore `00:00:00.000`.

233. Boundary fine:

- ore `23:59:59.999`.

234. Helper crescita pagina:

- `calculateGrowthMetrics(trend)`.

235. Logica helper crescita:

- divide trend in prima/seconda metà.

236. Growth workouts:

- `(second-first)/first*100`, altrimenti 0.

237. Growth documents:

- stessa logica.

238. Growth hours:

- stessa logica.

239. Arrotondamento growth:

- un decimale.

240. Legacy fetch funzione:

- `getAnalyticsDataClient`.

241. Query legacy `workout_logs`:

- select `data, durata_minuti, stato`.

242. Filtro data legacy logs:

- `gte(data,startDayKey)`, `lte(data,endDayKey)`.

243. Stati legacy logs inclusi:

- `completato`, `completed`, `in_corso`, `in_progress`.

244. Query legacy `documents`:

- select `created_at` nel range.

245. Filtro org documents:

- `.eq('org_id', orgId)` se org presente.

246. Query legacy `appointments`:

- select `starts_at,status,cancelled_at,athlete_id,type`.

247. Filtro org appointments:

- `.eq('org_id', orgId)` se org presente.

248. Classificazione appointment trend:

- `classifyWorkoutAppointmentForTrend`.

249. Buckets appointment trend:

- `prenotati`, `eseguiti`, `annullati`, `cancellati`.

250. Trend legacy output:

- array giornaliero ordinato per day.

251. Summary legacy:

- total_workouts, total_documents, total_hours, active_athletes.

252. Distribution legacy:

- conteggio stati su `workout_logs`.

253. Performance legacy:

- aggrega per athlete_id workouts/durata/completion.

254. Naming fallback legacy atleta:

- `Atleta ${id.slice(0,8)}`.

255. Fail-safe legacy:

- ritorna `EMPTY_LEGACY` in catch.

256. Trainer mode:

- `role === 'trainer' || role === 'admin'`.

257. Legacy mode attivo:

- non trainer oppure admin su tab legacy.

258. Protezione flash ruolo:

- commento esplicito su `shouldLoadLegacy`.

259. Trainer options trainer role:

- opzione unica utente corrente.

260. Trainer options admin role:

- via `fetchOrgTrainerOptions`.

261. Fetch lista trainer org:

- `profiles` con role `trainer`, `is_deleted=false`.

262. Ordinamento trainer options:

- per `cognome` asc.

263. Fallback trainer options error:

- array vuoto.

264. Selected trainer default admin:

- tutti gli option IDs.

265. Toggle trainer:

- impedisce de-selezione totale dell’ultimo trainer.

266. Report trainer fetch:

- `fetchTrainerAnalyticsReport`.

267. Parametri report trainer:

- orgId, trainerIds, startBoundary, endBoundary.

268. Fallback report trainer:

- report aggregato vuoto se errore.

269. Hint pannello trainer:

- `no_org`, `no_trainers`, `none_selected`.

270. Loader header:

- `authLoading || trainerTabWaiting || legacyTabWaiting`.

271. Export panel trainer:

- mostrato solo in tab trainer attiva.

272. Descrizione pagina trainer mode:

- “Metriche trainer: atleti, attività ed economia”.

273. Descrizione pagina non trainer:

- “Performance e trend dell’organizzazione”.

274. Content auth skeleton:

- mostrato finché `authReady` false.

275. Content trainer panel:

- `TrainerStatisticheDashboard` se `trainerReport` presente.

276. Content legacy panel:

- KPI + chart trend + distribution + performance.

277. Component dashboard trainer:

- `trainer-statistiche-dashboard.tsx`.

278. Sezioni dashboard trainer:

- Attività atleti, Attività trainer, Economia e incassi.

279. KPI attività atleti:

- aderenza, no-show, variazione peso media, indice complessivo.

280. KPI attività trainer:

- alert semaforo + insight automatici.

281. KPI economia:

- incasso/ora, churn, crescita metà periodo.

282. Grafici trainer:

- trend incassi/ore o aderenza.

283. Granularità trend trainer:

- giorno o settimana (`buildWeeklyRollupFromDaily`).

284. Heatmap trainer:

- UTC o Europe/Rome, opzione lun-ven.

285. Funnel appuntamenti trainer:

- stacked prenotati/eseguiti/annullati/cancellati.

286. Grafico no-show trainer:

- linea no-show per tempo.

287. Grafico roster trainer:

- nuovi vs usciti.

288. Grafico cumulativo incassi:

- area chart su revenue cumulativo.

289. Grafico mix pagamento:

- pie chart + lista ordinata.

290. Lista atleti:

- link a profilo/incassi/agenda.

291. Split workout atleta:

- con trainer vs autonomi.

292. Bilancio lezioni atleta:

- usate/prenotate future/disponibili/acquistate.

293. Query trainer aggregate loader:

- `loadTrainerAnalyticsAggregateInput`.

294. Tabelle usate trainer analytics:

- `athlete_trainer_assignments`, `pt_atleti`, `payments`, `workout_logs`, `appointments`, `profiles`, `progress_logs`, `appointment_cancellations`.

295. Query payments trainer:

- service_type `training`, `deleted_at is null`, creator in trainerIds.

296. Query coached logs trainer:

- `workout_logs` con `coached_by_profile_id in trainerIds`.

297. Query roster logs trainer:

- `workout_logs` con `atleta_id in roster`.

298. Merge logs trainer:

- map per id (coached + roster).

299. Query appointments trainer:

- org_id + range starts_at + or su staff_id/trainer_id.

300. Query future appointments:

- su roster, starts_at >= now.

301. Conteggio future booked:

- solo bucket `prenotati`.

302. Query cancellations:

- `appointment_cancellations` filtrate per appointment_id e periodo.

303. Roster merge:

- assignments active + pt_atleti.

304. Active clients:

- cardinalità roster.

305. New/Lost clients:

- da activated_at/deactivated_at nel periodo.

306. Active at start:

- assegnazioni attive all’inizio periodo.

307. Churn formula:

- lostClients / max(1, activeAtStart) \* 100.

308. Ore lavorate trainer:

- somma `durata_minuti/60` su logs validi.

309. Logs validi KPI ore:

- stati completato/completed/in_corso/in_progress.

310. Adherence formula:

- eseguiti / (prenotati+eseguiti+annullati+cancellati).

311. No-show detection:

- status `no_show|assente` o cancellation_type no_show.

312. Progress weight average:

- media variazione % prima/ultima pesata per atleta (>=2 misure).

313. Distribution progress:

- bucket `< -5`, `-5..0`, `0..+5`, `+5..+10`, `>=+10`.

314. Composite score:

- combinazione progress/adherence/churnFactor.

315. Revenue growth half:

- confronto metà periodo sui ricavi.

316. Payment mix:

- importi e percentuale per `payment_type` (fallback `altro`).

317. Athlete adherence leaderboard:

- top con almeno 2 appuntamenti.

318. Athlete insights sort:

- ordinati per revenue desc.

319. Alert churn soglie default:

- rosso >=10, giallo >=5.

320. Alert adherence soglie default:

- rosso <65, giallo <80.

321. Alert rph:

- rosso se rph<=0 con revenue>0; giallo se 0<rph<25.

322. Heatmap locale:

- bucket Europe/Rome via `Intl.DateTimeFormat`.

323. Heatmap UTC:

- bucket via `getUTCDay/getUTCHours`.

324. Utilization note:

- esplicita limite assenza dati capacità slot agenda.

325. Period comparison:

- supportato opzionalmente (`includePeriodComparison`), default non attivo.

326. Previous period bounds:

- stesso numero giorni inclusivi.

327. Error handling report:

- logger + report vuoto aggregato.

328. Error handling query parziali:

- warning per singola tabella, pipeline continua.

329. Chunk IN queries:

- `chunkForSupabaseIn` su roster/ids.

330. Lesson usage:

- `lessonUsageByAthleteIds(..., 'training')`.

331. Cross-link pagina statistiche:

- export report usa dati legacy o trainer report in base tab.

332. Fedeltà dichiarata:

- tutte le affermazioni sopra derivano dai file letti.

333. Limite dichiarato:

- senza run browser non si confermano numeri runtime.

334. Limite dichiarato:

- metriche dipendono da integrità dati sorgente.

335. Limite dichiarato:

- UI reale può variare con feature flag/tema ma logica resta quella.

---

## 17. Output finale obbligatorio

1. **RIASSUNTO OPERATIVO**
   - La pagina `Statistiche` unisce KPI, trend e dettaglio per decisioni trainer veloci e periodali.
2. **RIASSUNTO EMOTIVO**
   - Riduce il senso di “lavoro tanto ma non capisco se sto migliorando”.
3. **RIASSUNTO ECONOMICO**
   - Rende leggibili incassi, rendimento orario, churn e mix pagamenti nello stesso intervallo.
4. **RIASSUNTO COGNITIVO**
   - Trasforma revisioni dispersive in un percorso fisso: periodo → KPI → trend → azione.
5. **IL VERO PROBLEMA RISOLTO**
   - Mancanza di una lettura unica e coerente della performance trainer.
6. **IL VERO STRESS ELIMINATO**
   - Decisioni prese “a sensazione” sotto interruzioni continue.
7. **IL VERO SOLLIEVO CREATO**
   - Avere priorità operative visibili in pochi secondi.
8. **LA VERA TRASFORMAZIONE**
   - Da reazione emotiva a correzione guidata da segnali.
9. **LA VERA PROMESSA**
   - “Capisci dove intervenire prima che il problema diventi strutturale.”
10. **IL VERO VALORE NASCOSTO**

- Stabilità decisionale anche quando aumentano complessità e volume.

11. **IL VERO IMPATTO SUL BUSINESS**

- Migliore allineamento tra erogazione, agenda e risultati economici.

12. **IL VERO IMPATTO SULLA RETENTION**

- Maggiore capacità di leggere segnali precoci di perdita.

13. **IL VERO IMPATTO SULLA PERCEZIONE PREMIUM**

- Processo numerico chiaro, replicabile, spiegabile.

14. **IL VERO IMPATTO SULL’ENERGIA MENTALE**

- Meno rumore, meno indecisione, più focus.

15. **IL MESSAGGIO PIÙ FORTE**

- “Se non misuri il periodo, stai guidando nel buio.”

16. **IL VISUAL HOOK PIÙ FORTE**

- Semaforo KPI + trend aderenza/no-show nello stesso frame.

17. **IL COPY HOOK PIÙ FORTE**

- “Attività piena non significa performance alta.”

18. **IL CONCETTO META ADS PIÙ FORTE**

- “Analytics operativo per trainer: meno caos, più decisioni corrette.”

19. **25 HOOKS META ADS**

- 1.  “Lavori tanto, ma stai davvero migliorando?”
- 2.  “Se aderenza scende, lo scopri troppo tardi?”
- 3.  “Incassi alti ma margine mentale a zero?”
- 4.  “No-show in aumento: lo vedi prima o dopo?”
- 5.  “Una pagina, tre domande chiave: qualità, ricavi, stabilità.”
- 6.  “Trainer mode: KPI reali, non vanity metrics.”
- 7.  “Settimana, mese, 6 mesi, anno: stessa logica, meno bias.”
- 8.  “Dove stai perdendo: calendario o roster?”
- 9.  “Se non separi trend da picco, sbagli decisione.”
- 10. “Heatmap agenda: quando ti prenotano davvero.”
- 11. “Incasso/ora: il numero che evita autoinganni.”
- 12. “Churn non è sfortuna: è un segnale misurabile.”
- 13. “Smetti di discutere su percezioni.”
- 14. “Dashboard trainer per azioni, non per ego.”
- 15. “Vedi prima, correggi prima.”
- 16. “Quanto pesa un no-show sul tuo periodo?”
- 17. “Se il mix pagamenti cambia, tu lo noti?”
- 18. “Dal caos delle interruzioni alla priorità chiara.”
- 19. “Più clienti senza perdere controllo operativo.”
- 20. “Rivedi il periodo in 3 minuti, non in 30 tab.”
- 21. “Stesso metodo anche nei giorni peggiori.”
- 22. “Dati allenamento + agenda + incassi nello stesso punto.”
- 23. “Azione prima, rumore dopo.”
- 24. “Non indovinare la performance: misurala.”
- 25. “Il tuo lavoro merita una lettura professionale.”

20. **25 HEADLINES**

- 1.  “Statistiche trainer sotto controllo.”
- 2.  “Dalla sensazione al segnale.”
- 3.  “Meno caos, più decisione.”
- 4.  “Performance leggibile, subito.”
- 5.  “Misura ciò che conta davvero.”
- 6.  “Aderenza, churn, incassi: stessa vista.”
- 7.  “Periodi chiari, scelte migliori.”
- 8.  “Trend reale, non rumore.”
- 9.  “Dashboard per trainer operativi.”
- 10. “La review che non salti più.”
- 11. “No-show, ma con contesto.”
- 12. “Il calendario racconta la verità.”
- 13. “Incassi e ore, fianco a fianco.”
- 14. “La metrica giusta al momento giusto.”
- 15. “Leggi prima, reagisci meglio.”
- 16. “Economia e qualità nella stessa pagina.”
- 17. “Quando il dato diventa guida.”
- 18. “Meno interruzioni mentali.”
- 19. “Scelte tattiche più stabili.”
- 20. “Controllo operativo periodale.”
- 21. “Non lavorare al buio.”
- 22. “Ogni periodo ha una storia.”
- 23. “Fai parlare i numeri.”
- 24. “Una dashboard che decide con te.”
- 25. “Statistiche che portano azione.”

24. **10 IDEE REELS**

- 1.  “Da KPI a azione: esempio reale in 45 secondi.”
- 2.  “Aderenza in calo: cosa fare domani mattina.”
- 3.  “No-show timeline e correzione immediata.”
- 4.  “Incasso/ora: come leggerlo senza autoinganni.”
- 5.  “Heatmap agenda: ripianifica con logica.”
- 6.  “Trend giorno vs settimana: differenza pratica.”
- 7.  “Semafori KPI: rosso, giallo, verde in pratica.”
- 8.  “Churn e roster: mini-audit periodale.”
- 9.  “Mix pagamenti: quando è un rischio.”
- 10. “Routine review completa in 3 minuti.”

25. **10 IDEE CAROUSEL**

- 1.  “5 errori nella lettura delle statistiche trainer.”
- 2.  “Agenza piena non basta: cosa guardare.”
- 3.  “Guida rapida: periodo giusto, decisione giusta.”
- 4.  “KPI triade: aderenza, churn, rph.”
- 5.  “No-show: come monitorarli bene.”
- 6.  “Trend pulito: evitare il bias dell’ultima settimana.”
- 7.  “Heatmap: trasformare orari in scelte.”
- 8.  “Mix pagamenti: leggere concentrazione rischio.”
- 9.  “Review trainer: checklist mensile.”
- 10. “Da caos decisionale a metodo.”

26. **10 IDEE STORIES**

- 1.  Poll: “Controlli aderenza ogni settimana?”
- 2.  Poll: “Sai il tuo incasso/ora attuale?”
- 3.  Quiz: “Picco o trend? indovina.”
- 4.  Mini-demo semaforo KPI.
- 5.  Mini-demo heatmap.
- 6.  Mini-demo funnel appuntamenti.
- 7.  Q&A su churn e retention.
- 8.  Prima/dopo su no-show.
- 9.  Reminder review settimanale.
- 10. CTA: “vuoi la checklist completa?”

27. **10 IDEE STATIC ADS**

- 1.  “Statistiche trainer, non sensazioni.”
- 2.  “Vedi il problema prima.”
- 3.  “Aderenza, churn, incasso/ora.”
- 4.  “Review periodale in 3 minuti.”
- 5.  “Meno caos, più controllo.”
- 6.  “KPI utili per decidere.”
- 7.  “No-show sotto controllo.”
- 8.  “Heatmap agenda chiara.”
- 9.  “Trend che portano azione.”
- 10. “Dalla fatica ai segnali.”

28. **10 ANGOLI EMOTIVI**

- controllo, sollievo, chiarezza, fiducia, calma, lucidità, sicurezza, stabilità, focus, padronanza.

29. **10 ANGOLI OPERATIVI**

- periodi, KPI triade, funnel agenda, no-show, heatmap, churn, rph, trend cumulativo, mix pagamenti, roster.

30. **10 ANGOLI ECONOMICI**

- ricavi reali, rendimento ora, concentrazione pagamento, costi no-show, perdita clienti, efficienza agenda, continuità, previsione, margine, sostenibilità.

31. **10 ANGOLI IDENTITARI**

- trainer professionale, guida numerica, metodo stabile, gestione matura, leadership, affidabilità, precisione, disciplina, visione, responsabilità.

32. **10 ANGOLI COGNITIVI**

- riduzione bias, memory offload, decision routine, meno switching, meno fatica, più orientamento, priorità netta, lettura sequenziale, errore ridotto, chiarezza.

33. **10 ANGOLI RELATABLE**

- “sono pieno ma confuso”, “decido sull’ultima settimana”, “non so dove intervenire”, “troppi numeri”, “poco tempo”, “troppe interruzioni”, “review rimandata”, “nessuna priorità”, “sensazioni discordanti”, “stanchezza mentale”.

34. **10 MICRO-FRUSTRATIONS**

- KPI senza contesto, trend ambiguo, no-show invisibile, churn tardivo, mix sconosciuto, periodi incoerenti, confronto difficile, tab multiple, review lunga, azione bloccata.

35. **10 MICRO-SOLLIEVI**

- periodo chiaro, semaforo chiaro, trend pulito, funnel leggibile, no-show tracciato, heatmap utile, mix visibile, roster dinamico, KPI spiegati, prossima azione evidente.

36. **10 SCENE REALISTICHE**

- prima sessione del giorno, pausa breve, fine settimana, review mensile, call team, post no-show, dubbio churn, cambio slot, analisi ricavi, preparazione mese successivo.

37. **10 SCENE SCROLL-STOPPING**

- semaforo rosso + domanda “cosa fai ora?”, linea aderenza che scende, no-show che cresce, heatmap sbilanciata, split coach/solo inatteso, mix pagamenti concentrato, churn improvviso, incasso/ora basso, trend metà periodo divergente, checklist azione immediata.

38. **5 EMOZIONI PRINCIPALI**

- chiarezza, controllo, calma, focus, sicurezza.

39. **5 PAURE PRINCIPALI**

- perdere clienti, leggere male i numeri, reagire tardi, confondere attività con risultato, stancarsi senza migliorare.

40. **5 DESIDERI PRINCIPALI**

- metodo, visione, priorità, stabilità, crescita sana.

41. **5 FRASI ULTRA-RELATABLE**

- “Sembra tutto pieno ma non capisco il perché.”
- “Ogni settimana mi sembra diversa.”
- “Non so quale numero guardare prima.”
- “Mi accorgo tardi quando qualcosa va storto.”
- “Ho bisogno di un flusso semplice e stabile.”

42. **PRIMA vs DOPO**

- Prima: review casuale, priorità confusa, azione tardiva.
- Dopo: review periodale, priorità chiara, azione rapida.

43. **LA FRASE CHE VENDE DAVVERO LA PAGINA**

- “Ti mostra in pochi minuti dove intervenire per mantenere qualità, stabilità e risultato economico.”
