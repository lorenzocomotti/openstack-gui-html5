// Configurazione OpenStack GUI
const CONFIG = {
    // ===== AUTENTICAZIONE =====

    // Endpoint di Keystone (lasciare vuoto per inserirlo manualmente al login)
    // Esempio: 'https://controller:5000/v3' oppure 'http://192.168.1.100:5000/v3'
    KEYSTONE_ENDPOINT: '',

    // Dominio di default
    DEFAULT_DOMAIN: 'default',

    // Progetto di default
    DEFAULT_PROJECT: 'admin',

    // Pre-compila il form di login con le impostazioni di default
    PREFILL_LOGIN_FORM: true,

    // ===== ENDPOINTS =====

    // Tipo di endpoint da usare dal service catalog di Keystone
    // Opzioni: 'public', 'internal', 'admin'
    // - 'public': Endpoint pubblici (default, per accesso da internet)
    // - 'internal': Endpoint interni (per accesso dalla rete interna)
    // - 'admin': Endpoint amministrativi
    ENDPOINT_TYPE: 'public',

    // Override manuale degli endpoint (opzionale)
    // Se specificati, questi endpoint verranno usati al posto di quelli dal service catalog
    // Lasciare vuoti ('') per usare il service catalog automaticamente
    NOVA_ENDPOINT_OVERRIDE: '',      // Esempio: 'http://192.168.1.10:8774/v2.1'
    GLANCE_ENDPOINT_OVERRIDE: '',    // Esempio: 'http://192.168.1.10:9292'

    // ===== CERTIFICATI SSL =====

    // NOTA: I browser non permettono di specificare certificati CA tramite JavaScript.
    // Per usare certificati autofirmati, devi importare il certificato CA nel tuo
    // sistema operativo o browser. Vedi README per istruzioni dettagliate.

    // Path del certificato CA (solo per documentazione/riferimento)
    // Questo valore NON viene usato dall'applicazione, serve solo come promemoria
    // di dove si trova il tuo certificato CA
    CA_CERT_PATH: '/etc/ssl/certs/openstack-ca.crt',

    // ===== ALTRE OPZIONI =====

    // Modalità di debug (mostra più informazioni nella console)
    DEBUG_MODE: false,

    // Timeout per le richieste API (in millisecondi)
    REQUEST_TIMEOUT: 30000,

    // Auto-refresh per la lista delle istanze e immagini (in secondi, 0 = disabilitato)
    AUTO_REFRESH_INTERVAL: 0
};

// NON MODIFICARE SOTTO QUESTA LINEA
// Esporta la configurazione per l'uso nell'applicazione
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
