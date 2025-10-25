// Configurazione OpenStack GUI
const CONFIG = {
    // Endpoint di Keystone (lasciare vuoto per inserirlo manualmente al login)
    // Esempio: 'https://controller:5000/v3' oppure 'http://192.168.1.100:5000/v3'
    KEYSTONE_ENDPOINT: '',

    // Dominio di default
    DEFAULT_DOMAIN: 'default',

    // Progetto di default
    DEFAULT_PROJECT: 'admin',

    // Pre-compila il form di login con le impostazioni di default
    PREFILL_LOGIN_FORM: true,

    // Usa un proxy locale per bypassare problemi CORS e certificati SSL
    // Se true, tutte le richieste saranno inoltrate tramite il proxy locale
    USE_PROXY: false,

    // URL del proxy locale (se USE_PROXY è true)
    // Il proxy deve essere in esecuzione e configurato per accettare certificati autofirmati
    PROXY_URL: 'http://localhost:3000/proxy',

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
