# OpenStack GUI HTML5

Una GUI web moderna e semplice per gestire OpenStack, costruita interamente con HTML5, CSS3 e JavaScript vanilla.

## Caratteristiche

### Autenticazione
- Login tramite Keystone v3
- Supporto per domini e progetti
- Gestione automatica dei token
- Persistenza della sessione tramite localStorage

### Compute (Nova)
- Visualizzazione di tutte le istanze
- Creazione di nuove istanze
- Gestione dello stato delle istanze:
  - Start
  - Stop
  - Reboot
  - Delete
- Visualizzazione informazioni istanze (nome, ID, stato, immagine)

### Immagini (Glance)
- Visualizzazione di tutte le immagini
- Upload di nuove immagini da URL
- Visualizzazione dettagli immagini:
  - Nome
  - Formato (QCOW2, RAW, VMDK, VDI)
  - Dimensione
  - Visibilità (pubblica/privata)
  - Stato
- Eliminazione immagini

## Requisiti

- Un'installazione OpenStack funzionante con:
  - Keystone (Identity service)
  - Nova (Compute service)
  - Glance (Image service)
- Un web server per servire i file HTML (o semplicemente aprire index.html in un browser moderno)
- Browser moderno con supporto per ES6+ e Fetch API
- Node.js (opzionale, solo se usi il proxy server per certificati SSL autofirmati)

## Installazione

1. Clona o scarica questo repository

2. **Configura l'applicazione** modificando il file `config.js`:

```javascript
const CONFIG = {
    // Endpoint di Keystone (pre-compilato nel form di login)
    KEYSTONE_ENDPOINT: 'https://controller:5000/v3',

    // Dominio e progetto di default
    DEFAULT_DOMAIN: 'default',
    DEFAULT_PROJECT: 'admin',

    // Pre-compila il form di login
    PREFILL_LOGIN_FORM: true,

    // Usa proxy per certificati SSL autofirmati (vedi sotto)
    USE_PROXY: false,
    PROXY_URL: 'http://localhost:3000/proxy',

    // Debug mode
    DEBUG_MODE: false,

    // Altri parametri...
};
```

3. Servi i file tramite un web server. Puoi usare un semplice server HTTP:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (con http-server)
npx http-server -p 8000

# Oppure usa il comando npm
npm run serve
```

4. Apri il browser e vai su `http://localhost:8000`

## Utilizzo

### Login

1. Inserisci l'URL del tuo servizio Keystone (es. `http://controller:5000/v3`)
2. Inserisci il dominio (default: `default`)
3. Inserisci il tuo username
4. Inserisci la tua password
5. Inserisci il nome del progetto (default: `admin`)
6. Clicca su "Login"

### Gestione Compute (Nova)

- Dopo il login, vedrai automaticamente la lista delle tue istanze
- Per creare una nuova istanza:
  1. Clicca su "Crea Nuova Istanza"
  2. Scegli un nome
  3. Seleziona un'immagine
  4. Seleziona un flavor
  5. Clicca su "Crea Istanza"

- Per gestire un'istanza esistente, usa i pulsanti:
  - **Start**: Avvia un'istanza ferma
  - **Stop**: Ferma un'istanza in esecuzione
  - **Reboot**: Riavvia un'istanza
  - **Delete**: Elimina un'istanza (richiede conferma)

### Gestione Immagini (Glance)

- Clicca su "Immagini (Glance)" nella barra di navigazione
- Per caricare una nuova immagine:
  1. Clicca su "Carica Immagine"
  2. Inserisci il nome dell'immagine
  3. Seleziona il formato (QCOW2, RAW, VMDK, VDI)
  4. Inserisci l'URL dell'immagine
  5. Opzionalmente, contrassegna come pubblica
  6. Clicca su "Carica Immagine"

- Per eliminare un'immagine:
  - Clicca sul pulsante "Delete" sulla card dell'immagine (richiede conferma)

## Configurazione

Il file `config.js` permette di personalizzare vari aspetti dell'applicazione:

```javascript
const CONFIG = {
    // Endpoint di Keystone pre-configurato
    // Lascia vuoto ('') per inserirlo manualmente al login
    KEYSTONE_ENDPOINT: '',

    // Dominio di default (pre-compila il campo nel form di login)
    DEFAULT_DOMAIN: 'default',

    // Progetto di default (pre-compila il campo nel form di login)
    DEFAULT_PROJECT: 'admin',

    // Pre-compila automaticamente il form di login con i valori sopra
    PREFILL_LOGIN_FORM: true,

    // Abilita il proxy per gestire certificati SSL autofirmati e CORS
    USE_PROXY: false,

    // URL del proxy locale (se USE_PROXY è true)
    PROXY_URL: 'http://localhost:3000/proxy',

    // Abilita logging dettagliato nella console del browser
    DEBUG_MODE: false,

    // Timeout per le richieste API (in millisecondi)
    REQUEST_TIMEOUT: 30000,

    // Auto-refresh automatico delle liste (in secondi, 0 = disabilitato)
    AUTO_REFRESH_INTERVAL: 0
};
```

### Esempi di Configurazione

**Configurazione Minima (inserimento manuale)**:
```javascript
const CONFIG = {
    KEYSTONE_ENDPOINT: '',
    PREFILL_LOGIN_FORM: false,
    USE_PROXY: false
};
```

**Configurazione con Proxy (certificati SSL autofirmati)**:
```javascript
const CONFIG = {
    KEYSTONE_ENDPOINT: 'https://192.168.1.100:5000/v3',
    DEFAULT_DOMAIN: 'default',
    DEFAULT_PROJECT: 'admin',
    PREFILL_LOGIN_FORM: true,
    USE_PROXY: true,
    PROXY_URL: 'http://localhost:3000/proxy',
    DEBUG_MODE: true
};
```

## Architettura

L'applicazione è costruita con:

- **HTML5**: Struttura semantica e accessibile
- **CSS3**: Styling moderno con variabili CSS, flexbox e grid
- **JavaScript ES6+**: Logica applicativa orientata agli oggetti
  - Classe `OpenStackApp` per gestire l'intera applicazione
  - Fetch API per le chiamate REST alle API OpenStack
  - localStorage per la persistenza della sessione

### Struttura dei file

```
openstack-gui-html5/
├── index.html          # Struttura HTML principale
├── styles.css          # Stili CSS
├── app.js              # Logica JavaScript dell'applicazione
├── config.js           # File di configurazione
├── proxy-server.js     # Proxy server per certificati SSL (opzionale)
├── package.json        # Dipendenze e script npm
└── README.md           # Documentazione
```

## Certificati SSL Autofirmati

Se il tuo ambiente OpenStack usa **certificati SSL autofirmati**, i browser moderni bloccheranno le richieste per motivi di sicurezza. Hai due opzioni:

### Opzione 1: Usa il Proxy Server (Raccomandato per Development)

Il progetto include un proxy server Node.js che gestisce automaticamente i certificati autofirmati e i problemi CORS.

1. **Avvia il proxy server**:

```bash
node proxy-server.js

# Oppure usa npm
npm start
# O
npm run proxy
```

Il proxy partirà su `http://localhost:3000`

2. **Configura l'applicazione** per usare il proxy modificando `config.js`:

```javascript
const CONFIG = {
    KEYSTONE_ENDPOINT: 'https://controller:5000/v3',
    USE_PROXY: true,
    PROXY_URL: 'http://localhost:3000/proxy',
    // ... altre configurazioni
};
```

3. **Ricarica la pagina** nel browser

Il proxy inoltrerà tutte le richieste alle API OpenStack, gestendo automaticamente:
- Certificati SSL autofirmati
- Problemi CORS
- Header di autenticazione

**ATTENZIONE**: Il proxy disabilita la verifica SSL. Usalo SOLO in ambienti di sviluppo/test!

### Opzione 2: Configura CORS in OpenStack

Configura CORS nei servizi OpenStack in `keystone.conf`, `nova.conf` e `glance-api.conf`:

```ini
[cors]
allowed_origin = http://localhost:8000
allow_credentials = true
expose_headers = X-Subject-Token,X-Auth-Token
```

Poi riavvia i servizi OpenStack.

**Nota**: Questa opzione non risolve i problemi con certificati SSL autofirmati. Dovrai comunque accettare manualmente il certificato nel browser visitando gli endpoint HTTPS.

### Opzione 3: Usa un Certificato Valido

In produzione, usa sempre certificati SSL validi firmati da una CA riconosciuta (es. Let's Encrypt).

## Limitazioni

- Nessuna gestione avanzata del networking
- Nessuna gestione dei volumi (Cinder)
- Upload immagini solo da URL (non da file locali)
- Interfaccia base senza funzionalità avanzate

## Possibili Estensioni Future

- Supporto per Cinder (volumi)
- Supporto per Neutron (networking)
- Dashboard con statistiche e grafici
- Gestione avanzata delle security groups
- Console VNC/SPICE per le istanze
- Upload di immagini da file locali
- Gestione delle keypair SSH
- Gestione dei floating IP

## Licenza

MIT

## Contributi

I contributi sono benvenuti! Sentiti libero di aprire issue o pull request.
