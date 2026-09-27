const pages={
  "/assessment-it":{
    title:"Assessment IT Aziendale | Bulltech",
    description:"Analisi di server, rete, backup e infrastruttura per definire priorità IT concrete.",
    eyebrow:"Assessment IT aziendale",
    h1:"Il tuo IT è sotto controllo?",
    intro:"Prima di cambiare tecnologia, capiamo cosa serve davvero.",
    cta:"Parla con un consulente",
    secondary:"Scopri cosa analizziamo",
    art:"Prima il contesto, poi la tecnologia.",
    tags:["Server e rete","Backup e continuità","Priorità chiare"],
    sectionTitle:"Una fotografia utile per decidere cosa fare prima.",
    sectionLead:"L'obiettivo non è produrre un elenco di prodotti. È capire quali interventi hanno senso, in quale ordine e con quali dipendenze.",
    cards:[["Server e infrastruttura","Capacità, stato dell'hardware, virtualizzazione, storage e dipendenze principali."],["Rete e connettività","Topologia, apparati, copertura e criticità che possono influire sull'operatività."],["Backup e continuità","Come sono protetti i dati e quali dipendenze vanno considerate nel piano di miglioramento."]],
    checks:["Partiamo dall'infrastruttura esistente, non da un catalogo.","Separiamo priorità operative, miglioramenti e investimenti futuri.","Se serve un progetto successivo, il perimetro nasce dai dati raccolti."],
    steps:[["Confronto iniziale","Raccogliamo obiettivi, problemi percepiti e vincoli."],["Analisi","Verifichiamo le aree pertinenti al caso."],["Priorità","Condividiamo un percorso ragionato per i passi successivi."]],
    campaign:"assessment_it",
    formTitle:"Richiedi un confronto",
    formIntro:"Indicaci dimensione dell'azienda e problema principale.",
    extra:'<div class="field"><label>Numero indicativo postazioni</label><input name="postazioni"></div><div class="field"><label>Area principale</label><select name="area"><option>Server / infrastruttura</option><option>Rete / Wi-Fi</option><option>Backup / continuità</option><option>Altro</option></select></div>'
  },
  "/server-infrastruttura":{
    title:"Server e Infrastruttura IT Aziendale | Bulltech",
    description:"Progettazione server, virtualizzazione, storage e backup dimensionata sul carico reale.",
    eyebrow:"Server e infrastruttura",
    h1:"È ora di rivedere il server?",
    intro:"Server, virtualizzazione, storage e backup dimensionati sulle esigenze reali dell'azienda.",
    cta:"Parla del tuo progetto",
    secondary:"Come dimensioniamo",
    art:"Dimensionare prima di acquistare.",
    tags:["Server fisici","Virtualizzazione","Storage e backup"],
    sectionTitle:"Dimensionare prima di acquistare.",
    sectionLead:"Un server non si sceglie da una scheda tecnica isolata. Serve capire carichi, VM, storage, backup e crescita prevista.",
    cards:[["Server fisici","Valutiamo capacità, ridondanza, crescita e ruolo dell'hardware nel progetto."],["Virtualizzazione","Consolidamento, migrazione e gestione dei workload in funzione dell'ambiente esistente."],["Storage e backup","Prestazioni, capacità, protezione dati e continuità devono essere progettati insieme."]],
    checks:["Analisi dell'ambiente e dei workload attuali.","Valutazione delle dipendenze tra server, storage, backup e rete.","Proposta tecnica coerente con continuità, capacità e budget disponibile."],
    steps:[["Rilievo","Raccogliamo dati sull'infrastruttura esistente."],["Progetto","Dimensioniamo la soluzione e le dipendenze."],["Migrazione","Definiamo attività, sequenza e criteri di messa in servizio."]],
    campaign:"server_infrastruttura",
    formTitle:"Raccontaci l'infrastruttura",
    formIntro:"Bastano poche informazioni per capire da dove partire.",
    extra:'<div class="field"><label>Server attuali</label><input name="server_attuali"></div><div class="field"><label>Esigenza</label><select name="esigenza"><option>Sostituzione server</option><option>Virtualizzazione</option><option>Storage</option><option>Backup / continuità</option><option>Nuovo progetto</option></select></div>'
  },
  "/noleggio-it":{
    title:"Noleggio Operativo IT per Aziende | Bulltech",
    description:"Notebook, desktop e infrastruttura disponibili anche in noleggio operativo, con progetto costruito sulle esigenze aziendali.",
    eyebrow:"Noleggio operativo IT",
    h1:"Rinnova l'IT senza immobilizzare capitale",
    intro:"Notebook, desktop e infrastruttura possono essere valutati anche in noleggio operativo.",
    cta:"Richiedi una proposta",
    secondary:"Acquisto o noleggio?",
    art:"Hardware e servizi in un progetto leggibile.",
    tags:["Notebook e desktop","Infrastruttura","Alternativa di noleggio"],
    sectionTitle:"Acquisto e noleggio vanno confrontati sul progetto reale.",
    sectionLead:"La forma di acquisto viene dopo la configurazione tecnica. Prima definiamo cosa serve, poi confrontiamo le alternative sensate.",
    cards:[["Postazioni di lavoro","Notebook e desktop business dimensionati sull'utilizzo reale."],["Infrastruttura","Server e componenti di progetto possono rientrare nella valutazione quando pertinente."],["Servizi collegati","Consegna, installazione e servizi possono essere valutati insieme alla fornitura."]],
    checks:["Definiamo quantità, profili d'uso e configurazioni.","Confrontiamo investimento iniziale e alternativa di noleggio quando pertinente.","Manteniamo separati hardware, servizi e condizioni economiche per rendere la proposta leggibile."],
    steps:[["Esigenza","Postazioni, ruoli, software e tempistiche."],["Configurazione","Definiamo hardware e servizi necessari."],["Alternativa economica","Prepariamo la proposta di acquisto e, quando utile, quella di noleggio."]],
    campaign:"noleggio_it",
    formTitle:"Richiedi una proposta",
    formIntro:"Indicaci quantità e tipo di postazioni da rinnovare.",
    extra:'<div class="field"><label>Numero postazioni</label><input name="postazioni"></div><div class="field"><label>Tipologia</label><select name="tipologia"><option>Notebook</option><option>Desktop</option><option>Notebook + Desktop</option><option>Server / infrastruttura</option><option>Altro</option></select></div>'
  },
  "/rete-wifi-aziendale":{
    title:"Rete e Wi-Fi Aziendale | Bulltech",
    description:"Progettazione networking, Wi-Fi, switching e installazioni per ambienti di lavoro reali.",
    eyebrow:"Networking e Wi-Fi",
    h1:"Rete aziendale senza improvvisare",
    intro:"Networking, Wi-Fi e installazioni progettati sulla disposizione reale degli ambienti e sui dispositivi da collegare.",
    cta:"Parliamo della tua rete",
    secondary:"Cosa consideriamo",
    art:"Una rete efficace parte dal contesto fisico.",
    tags:["Copertura Wi-Fi","LAN e switching","Installazione ordinata"],
    sectionTitle:"Una rete efficace parte dal contesto fisico e operativo.",
    sectionLead:"Uffici, magazzini, produzione e sedi multi-piano hanno esigenze diverse. Il progetto deve considerare ambienti, utenti, apparati e applicazioni.",
    cards:[["Wi-Fi aziendale","Copertura, capacità, densità dei dispositivi e caratteristiche degli ambienti."],["LAN e switching","Apparati, segmentazione, uplink e collegamenti tra le aree della rete."],["Installazione","Posizionamento, configurazione, etichettatura e documentazione del progetto."]],
    checks:["Verifichiamo ambienti, planimetrie e punti critici.","Definiamo topologia, apparati e posizione degli access point.","Consegniamo un progetto installabile e documentabile, non una somma di componenti."],
    steps:[["Raccolta dati","Sedi, superfici, utenti, dispositivi e criticità."],["Progettazione","Copertura, rete, switching e dipendenze."],["Installazione","Configurazione, collaudo e documentazione tecnica."]],
    campaign:"rete_wifi_aziendale",
    formTitle:"Raccontaci la sede",
    formIntro:"Indicaci dimensione e problema che vuoi risolvere.",
    extra:'<div class="field"><label>Numero sedi</label><input name="sedi"></div><div class="field"><label>Esigenza</label><select name="esigenza"><option>Wi-Fi</option><option>LAN / switching</option><option>Cablaggio</option><option>Nuova sede</option><option>Rete esistente da rivedere</option></select></div>'
  }
};

function setMeta(p){document.title=p.title;const m=document.querySelector('meta[name="description"]');if(m)m.setAttribute("content",p.description)}
function leadForm(p){return '<form class="formbox" id="lead-form"><h3>'+p.formTitle+'</h3><p>'+p.formIntro+'</p><input type="hidden" name="source" value="Bulltech Ads"><input type="hidden" name="campaign" value="'+p.campaign+'"><div class="formgrid"><div class="field"><label>Azienda</label><input name="azienda" required></div><div class="field"><label>Nome e cognome</label><input name="nome" required></div><div class="field"><label>Email</label><input type="email" name="email" required></div><div class="field"><label>Telefono</label><input name="telefono"></div>'+p.extra+'<div class="field full"><label>Descrivi brevemente l\'esigenza</label><textarea name="note"></textarea></div><div class="field full privacy"><label><input type="checkbox" name="privacy" required> Acconsento al trattamento dei dati per essere ricontattato. <a href="https://bulltech.it/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a>.</label></div><div class="field full"><button class="btn" type="submit">Invia richiesta</button></div></div><div class="formnote">L\'invio apre il client email predefinito con i dati compilati. Non vengono memorizzati dati su questa landing.</div></form>'}
function cards(items){return items.map(x=>'<div class="card"><h3>'+x[0]+'</h3><p>'+x[1]+'</p></div>').join('')}
function steps(items){return items.map((x,i)=>'<div class="step"><div class="num">0'+(i+1)+'</div><h3>'+x[0]+'</h3><p>'+x[1]+'</p></div>').join('')}
function renderLanding(p){setMeta(p);document.getElementById("app").innerHTML='<header class="hero"><div class="wrap grid"><div><div class="eyebrow">'+p.eyebrow+'</div><h1>'+p.h1+'</h1><p>'+p.intro+'</p><div class="actions"><a class="btn" href="#contatto">'+p.cta+'</a><a class="ghost" href="#come-lavoriamo">'+p.secondary+'</a></div><div class="trust"><span>Per aziende e PMI</span><span>Concorezzo (MB)</span><span>Progetti su esigenze reali</span></div></div><div class="hero-art"><div class="orb one"></div><div class="orb two"></div><div class="orb three"></div><div class="art-card"><strong>'+p.art+'</strong><div class="art-list">'+p.tags.map(t=>'<span>'+t+'</span>').join('')+'</div></div></div></div></header><section class="section"><div class="wrap"><div class="eyebrow">Cosa valutiamo</div><h2>'+p.sectionTitle+'</h2><p class="lead">'+p.sectionLead+'</p><div class="cards">'+cards(p.cards)+'</div></div></section><section class="section" id="come-lavoriamo"><div class="wrap split"><div><div class="eyebrow">Approccio Bulltech</div><h2>Prima il contesto, poi la tecnologia.</h2><p class="lead">Partiamo dall\'ambiente esistente, dagli obiettivi e dai vincoli operativi. La soluzione viene dopo.</p><div class="check">'+p.checks.map(x=>'<div>'+x+'</div>').join('')+'</div></div><div><div class="eyebrow">Come lavoriamo</div><div class="steps">'+steps(p.steps)+'</div></div></div></section><section class="section" id="contatto"><div class="wrap split"><div><div class="eyebrow">Parliamone</div><h2>Raccontaci cosa devi risolvere.</h2><p class="lead">Lascia i dati essenziali. Manteniamo anche i parametri UTM della campagna per ricostruire correttamente la provenienza del contatto.</p><div class="quick"><a href="tel:+390395787212">Chiama +39 039 5787 212</a><a href="mailto:commerciale@bulltech.it">commerciale@bulltech.it</a></div></div>'+leadForm(p)+'</div></section><section class="band"><div class="wrap bandin"><div><div class="eyebrow">Bulltech Informatica Srl</div><h2>Un progetto IT deve partire da un\'esigenza concreta.</h2></div><a class="btn" href="#contatto">Parla con Bulltech</a></div></section>';bindForm()}
function bindForm(){const f=document.getElementById("lead-form");if(!f)return;f.addEventListener("submit",e=>{e.preventDefault();if(!f.reportValidity())return;const d=new FormData(f),q=new URLSearchParams(location.search),campaign=d.get("campaign")||"bulltech_ads",lines=["Nuova richiesta da ads.bulltech.it","", "Campagna: "+campaign,"Azienda: "+(d.get("azienda")||""),"Nome: "+(d.get("nome")||""),"Email: "+(d.get("email")||""),"Telefono: "+(d.get("telefono")||"")];d.forEach((v,k)=>{if(["campaign","source","azienda","nome","email","telefono","privacy"].includes(k)||!String(v).trim())return;lines.push(k+": "+v)});lines.push("","Sorgente: "+(d.get("source")||"Bulltech Ads"));["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(k=>{if(q.get(k))lines.push(k+": "+q.get(k))});lines.push("Landing: "+location.href);if(window.dataLayer&&Array.isArray(window.dataLayer))window.dataLayer.push({event:"lead_intent",campaign});location.href="mailto:commerciale@bulltech.it?subject="+encodeURIComponent("Richiesta Bulltech ADS - "+campaign)+"&body="+encodeURIComponent(lines.join("\n"))})}
function renderHub(){document.getElementById("app").innerHTML='<section class="hub"><div class="wrap"><div class="eyebrow">Bulltech Informatica Srl</div><h1>Soluzioni IT costruite sulle esigenze reali dell\'azienda.</h1><p class="lead">Scegli l\'area che vuoi approfondire.</p><div class="cards"><div class="card"><h3>Assessment IT</h3><p>Per capire priorità e criticità prima di investire.</p><a class="btn" href="/assessment-it">Apri</a></div><div class="card"><h3>Server e infrastruttura</h3><p>Per rinnovi, virtualizzazione, storage e backup.</p><a class="btn" href="/server-infrastruttura">Apri</a></div><div class="card"><h3>Noleggio operativo IT</h3><p>Per rinnovare postazioni e infrastruttura valutando anche il noleggio.</p><a class="btn" href="/noleggio-it">Apri</a></div><div class="card"><h3>Rete e Wi-Fi</h3><p>Per nuove sedi, copertura Wi-Fi, switching e reti da riprogettare.</p><a class="btn" href="/rete-wifi-aziendale">Apri</a></div></div></div></section>'}
const path=location.pathname.replace(/\/$/,"")||"/";if(pages[path])renderLanding(pages[path]);else renderHub();