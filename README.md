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

## Installazione

1. Clona o scarica questo repository

2. Servi i file tramite un web server. Puoi usare un semplice server HTTP:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (con http-server)
npx http-server -p 8000
```

3. Apri il browser e vai su `http://localhost:8000`

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
├── app.js              # Logica JavaScript
└── README.md           # Documentazione
```

## CORS e Sicurezza

**Nota importante**: Le API OpenStack potrebbero non permettere richieste CORS da browser web. In un ambiente di produzione, è necessario:

1. Configurare OpenStack per permettere richieste CORS
2. Usare un proxy/backend che faccia da intermediario tra il browser e le API OpenStack
3. Configurare correttamente le policy di sicurezza

Per sviluppo/test, puoi:
- Usare un'estensione browser per disabilitare CORS (solo per testing!)
- Configurare CORS in Keystone, Nova e Glance

Esempio di configurazione CORS in `keystone.conf`, `nova.conf` e `glance-api.conf`:

```ini
[cors]
allowed_origin = http://localhost:8000
allow_credentials = true
expose_headers = X-Subject-Token,X-Auth-Token
```

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
