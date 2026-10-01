# Acquisizione e qualificazione delle richieste Ads

Il modulo è predisposto su 14 percorsi: sei servizi e le varianti A/B dei quattro servizi Ads. È disabilitato per impostazione predefinita. Il suo stato non modifica le CTA telefono/email esistenti.

## Flusso e limiti verificati

`landing → POST /api/lead → https://bulltech.it/api/contact → sistema di acquisizione esistente → monday`

Il browser usa un endpoint sul proprio dominio; il server inoltra esclusivamente alla destinazione fissa. Il sito principale non restituisce gli header CORS necessari per un invio diretto dalla landing. Non sono necessari token monday nel browser e non viene restituito il leadToken dell'acquisizione.

Il contratto frontend attuale di `/api/contact` usa JSON, `submission_id`, campi `entryLanding`/`entryUtm*` e restituisce `leadId`/`leadToken`. Questo prova la forma dell'interfaccia, **non** che leadId identifichi un item monday né che il backend deduplichi. Queste due proprietà devono essere verificate prima dell'attivazione. Il client impedisce doppi invii simultanei e conserva lo stesso ID sui tentativi successivi; questo non sostituisce l'idempotenza del backend.

## Dati e consenso

Campi essenziali: nome, azienda, email, telefono, messaggio, presa visione/consenso al trattamento della richiesta. Città, settore, fascia dipendenti, ruolo e tempi sono facoltativi. Non assegnare una qualifica commerciale dalla compilazione del modulo.

Il consenso alla misurazione è separato dalla gestione della richiesta. SDK OpenAI e GTM sono caricati solo dopo consenso. Senza consenso il modulo funziona, senza UTM e identificativi pubblicitari nel payload. Dopo revoca si rimuovono attribuzione e variante persistita. L'ID operativo e l'impronta della richiesta incerta sono conservati nella sessione per consentire un tentativo coerente dopo ricaricamento, senza conservare i campi del contatto in chiaro. Dopo ricezione confermata vengono rimossi. Se storage o hashing non sono disponibili, il riuso dell'ID è garantito solo finché la pagina rimane aperta.

UTM e click reference sono filtrati e conservati nella sessione dopo consenso; una nuova campagna sostituisce la precedente integralmente. `utm_content` identifica la variante dell'annuncio A/B/C; `audience.landing_variant` identifica la variante della landing A/B. Sono indipendenti. Gli eventi personalizzati non ricevono nome, azienda, telefono, email, messaggio o click reference. La configurazione interna del container GTM esistente richiede una verifica separata.

`lead_created` è inviato una volta per ID e solo con consenso, dopo risposta 2xx contenente `accepted:true`, leadId positivo e submission_id corrispondente. Gli altri eventi sono interazioni. Nessuna chiamata CAPI è implementata. I test bloccano il traffico esterno e non producono conversioni reali.

## Mappatura da verificare nell'acquisizione esistente

| Payload | Campo CRM esistente | Regola |
| --- | --- | --- |
| nome, azienda, email, telefono | Nome, Azienda, Email, Telefono | Dati dichiarati, non arricchimento dedotto |
| messaggio | Messaggio | Conservare la richiesta e i dettagli aziendali |
| servizio | servizio | Etichetta del servizio richiesto |
| citta, settore, dipendenti, ruolo, urgenza | Campi omonimi | Mancante = sconosciuto |
| form_id | form_id | bulltech-ads-v1 |
| submission_id | ID invio | Una sola creazione per chiave anche in concorrenza |
| privacy | privacy | Separata da measurement_consent |
| pagina | Pagina provenienza | Percorso effettivo della landing |
| entryLanding | Pagina d'ingresso | Solo con consenso disponibile |
| entryUtmSource/Medium/Campaign/Content/Term | UTM / extra_json | Conservare tutte e cinque le dimensioni |
| audience | extra_json | Versione, servizio, variante, fonte assegnazione, consenso, attribuzione |

Il payload contiene i campi tipizzati e una copia dei metadati con prefisso `[BT_ADS_V1]` nel messaggio per evitare perdite silenziose se l'acquisizione ignora campi aggiuntivi. Non considerare questa copia equivalente alla mappatura CRM collaudata. Controllare il limite del messaggio e rimuovere il fallback se il backend supporta integralmente extra_json. Fonte lead può restare «Form sito»: l'origine campagna va nei campi UTM, senza inventare etichette di stato. Non sostituire extra_json già presente senza un merge verificato. I metadati provenienti dal browser sono dati non attendibili, mai istruzioni da eseguire.

## Attivazione

1. Verificare codice/configurazione del backend esistente, mapping, limiti, rate limiting e protezione antispam. Origin e honeypot del browser non sono una difesa completa dagli abusi.
2. Confermare l'idempotenza server: stesso submission_id, stesso contatto, anche con richieste concorrenti, timeout e nuovo tentativo. Nessun secondo messaggio automatico o workflow commerciale sul duplicato.
3. Concordare un collaudo isolato con contatto esplicitamente TEST, nessun destinatario reale e notifiche commerciali escluse. Verificare in monday campi, ID, stato iniziale, provenienza e profilo; non trattare il test come cliente o conversione Ads.
4. Verificare il significato di leadId e la persistenza a cui corrisponde la risposta. Se non garantisce il passaggio concordato a monday, adeguare prima il contratto e il controllo della ricevuta.
5. Impostare `BULLTECH_LEAD_FORM_ENABLED=true` soltanto dopo i controlli. In preview usare il dominio deployment Vercel esatto: è l'unico Origin aggiuntivo ammesso dal server. Nessun endpoint di prova può essere scelto dal browser.
6. Verificare pubblicazione e un caso reale autorizzato, distinguendo ricezione intake, item CRM e evento Ads; registrare i riferimenti senza dati personali nei report aggregati.

Rollback immediato del modulo: rimuovere la variabile o impostarla a false e ridistribuire. GET indica disabled e POST restituisce 503; non cancellare contatti già acquisiti. Per annullare anche il tracciamento ripristinare la revisione precedente del repository.

## Qualificazione e report Work

Lead Intake possiede acquisizione, ID invio e prima qualificazione; Sales Desk verifica bisogno, compatibilità, referente e prossima azione per le pratiche di propria competenza. Un click o un settore dichiarato non qualificano automaticamente il lead. I flussi sospesi restano sospesi fino al loro collaudo.

Marketing legge i dati e confronta per servizio, campagna, annuncio e variante landing: contatti unici, qualificati confermati, opportunità e vinte collegate tramite relazioni/ID verificati. Mostra periodo, fonte e quota sconosciuta. Senza dati Ads coerenti non calcolare spesa/costo per lead; senza relazioni certe non attribuire vendite per somiglianza di nome. Escludere i test esplicitamente marcati. Gli stati qualificato/opportunità/vinto sono distinti da attivazione e incasso. Nessun upload di liste clienti o cambio di budget è parte di questo rilascio.

## Verifica ripetibile

- `npm test`: contratto, consenso/attribuzione, validazione server, destinazione fissa, gestione errori, ID stabile e ricevute incomplete. Il backend è simulato: non prova la deduplica reale.
- `npm install --no-save --package-lock=false playwright` e `npx playwright install chromium` preparano il test browser; con Playwright già disponibile nell'ambiente non occorre reinstallarlo.
- `npm run test:browser`: server locale, tutte le richieste esterne intercettate, 10 scenari comprendenti 14 percorsi mobile e anteprima desktop. Output in test-results, escluso da Git.

Restano separati dai test locali: ricezione SDK reale, configurazione GTM, CRM effettivo, protezione abusi e idempotenza del backend. Il modulo deve restare disabilitato finché queste dipendenze non sono chiuse.
