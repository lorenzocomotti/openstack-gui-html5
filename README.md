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
- Un web server per servire i file HTML
- Browser moderno con supporto per ES6+ e Fetch API

## Installazione

1. Clona o scarica questo repository

2. **Configura l'applicazione** modificando il file `config.js`:

```javascript
const CONFIG = {
    // Endpoint di Keystone (pre-compilato nel form di login)
    KEYSTONE_ENDPOINT: 'https://192.168.1.100:5000/v3',

    // Dominio e progetto di default
    DEFAULT_DOMAIN: 'default',
    DEFAULT_PROJECT: 'admin',

    // Pre-compila il form di login
    PREFILL_LOGIN_FORM: true,

    // Tipo di endpoint: 'public', 'internal', o 'admin'
    ENDPOINT_TYPE: 'internal',  // Usa 'internal' per rete interna

    // Override manuale degli endpoint (opzionale)
    NOVA_ENDPOINT_OVERRIDE: '',    // Es: 'http://192.168.1.10:8774/v2.1'
    GLANCE_ENDPOINT_OVERRIDE: '',  // Es: 'http://192.168.1.10:9292'

    // Path certificato CA (solo per documentazione)
    CA_CERT_PATH: '/etc/ssl/certs/openstack-ca.crt',

    // Debug mode
    DEBUG_MODE: false
};
```

3. Servi i file tramite un web server:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (con http-server)
npx http-server -p 8000
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

### Opzioni di Configurazione Principali

| Opzione | Descrizione | Esempio |
|---------|-------------|---------|
| `KEYSTONE_ENDPOINT` | URL di Keystone (lascia vuoto per inserirlo manualmente al login) | `'https://192.168.1.100:5000/v3'` |
| `DEFAULT_DOMAIN` | Dominio di default | `'default'` |
| `DEFAULT_PROJECT` | Progetto di default | `'admin'` |
| `PREFILL_LOGIN_FORM` | Pre-compila il form di login | `true` / `false` |
| `ENDPOINT_TYPE` | Tipo di endpoint da usare | `'public'` / `'internal'` / `'admin'` |
| `NOVA_ENDPOINT_OVERRIDE` | Endpoint Nova personalizzato (opzionale) | `'http://192.168.1.10:8774/v2.1'` |
| `GLANCE_ENDPOINT_OVERRIDE` | Endpoint Glance personalizzato (opzionale) | `'http://192.168.1.10:9292'` |
| `CA_CERT_PATH` | Path del certificato CA (solo documentazione) | `'/etc/ssl/certs/ca.crt'` |
| `DEBUG_MODE` | Abilita logging dettagliato | `true` / `false` |
| `REQUEST_TIMEOUT` | Timeout richieste API (ms) | `30000` |

### Esempi di Configurazione

**Configurazione per Rete Interna (endpoint internal)**:
```javascript
const CONFIG = {
    KEYSTONE_ENDPOINT: 'https://controller.internal:5000/v3',
    DEFAULT_DOMAIN: 'default',
    DEFAULT_PROJECT: 'admin',
    PREFILL_LOGIN_FORM: true,
    ENDPOINT_TYPE: 'internal',  // Usa endpoint interni
    DEBUG_MODE: false
};
```

**Configurazione con Endpoint Manuali**:
```javascript
const CONFIG = {
    KEYSTONE_ENDPOINT: 'https://192.168.1.100:5000/v3',
    ENDPOINT_TYPE: 'internal',
    // Override manuale degli endpoint (ignora service catalog)
    NOVA_ENDPOINT_OVERRIDE: 'http://192.168.1.10:8774/v2.1',
    GLANCE_ENDPOINT_OVERRIDE: 'http://192.168.1.10:9292',
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
└── README.md           # Documentazione
```

## Certificati SSL Autofirmati

Se il tuo ambiente OpenStack usa **certificati SSL autofirmati**, devi importare il certificato CA nel tuo sistema o browser. I browser moderni non permettono di accettare certificati non fidati tramite JavaScript per motivi di sicurezza.

### Opzione 1: Importa il Certificato CA nel Sistema (Raccomandato)

#### Linux (Ubuntu/Debian)

1. Copia il certificato CA in `/usr/local/share/ca-certificates/`:
```bash
sudo cp openstack-ca.crt /usr/local/share/ca-certificates/
```

2. Aggiorna i certificati di sistema:
```bash
sudo update-ca-certificates
```

3. Riavvia il browser

#### Linux (CentOS/RHEL/Fedora)

1. Copia il certificato in `/etc/pki/ca-trust/source/anchors/`:
```bash
sudo cp openstack-ca.crt /etc/pki/ca-trust/source/anchors/
```

2. Aggiorna i certificati di sistema:
```bash
sudo update-ca-trust
```

3. Riavvia il browser

#### macOS

1. Apri l'applicazione "Keychain Access"
2. Seleziona "System" nella barra laterale
3. Menu: File → Importa elementi
4. Seleziona il certificato CA
5. Doppio click sul certificato importato
6. Espandi "Trust" e imposta "When using this certificate" su "Always Trust"
7. Riavvia il browser

#### Windows

1. Doppio click sul file `.crt` del certificato CA
2. Click su "Installa certificato..."
3. Seleziona "Computer locale" e click "Avanti"
4. Seleziona "Posiziona tutti i certificati nel seguente archivio"
5. Click "Sfoglia" e seleziona "Autorità di certificazione radice attendibili"
6. Click "Avanti" e "Fine"
7. Riavvia il browser

### Opzione 2: Importa nel Browser (Firefox)

Firefox usa il proprio archivio certificati:

1. Apri Firefox
2. Menu → Impostazioni → Privacy e sicurezza
3. Scorri fino a "Certificati" e click su "Visualizza certificati"
4. Tab "Autorità" → Click "Importa..."
5. Seleziona il certificato CA
6. Spunta "Considera attendibile questa CA per l'identificazione di siti web"
7. Click OK

### Opzione 3: Usa Certificati Validi (Produzione)

In produzione, usa sempre certificati SSL validi firmati da una CA riconosciuta (es. Let's Encrypt):

```bash
# Esempio con certbot per Let's Encrypt
sudo certbot certonly --standalone -d controller.example.com
```

### Configurazione CORS

Se riscontri problemi CORS, configura OpenStack:

**In `keystone.conf`, `nova.conf`, `glance-api.conf`:**
```ini
[cors]
allowed_origin = http://localhost:8000,https://yourdomain.com
allow_credentials = true
expose_headers = X-Subject-Token,X-Auth-Token
```

Riavvia i servizi dopo la modifica:
```bash
sudo systemctl restart apache2  # o nginx
sudo systemctl restart nova-api
sudo systemctl restart glance-api
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
