#!/usr/bin/env node

/**
 * Proxy Server per OpenStack GUI
 *
 * Questo server proxy risolve i seguenti problemi:
 * 1. Certificati SSL autofirmati (disabilitando la verifica)
 * 2. Problemi CORS (aggiungendo gli header appropriati)
 *
 * ATTENZIONE: Questo server è pensato SOLO per ambienti di sviluppo/test.
 * NON usare in produzione senza adeguate misure di sicurezza.
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configurazione
const PORT = process.env.PORT || 3000;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';

// Disabilita la verifica dei certificati SSL (SOLO per certificati autofirmati in ambiente di test)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.warn('\n⚠️  ATTENZIONE: La verifica dei certificati SSL è disabilitata!');
console.warn('⚠️  Questo server è pensato SOLO per ambienti di sviluppo/test.\n');

// Server HTTP
const server = http.createServer((req, res) => {
    // Gestione CORS
    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, X-Subject-Token');
    res.setHeader('Access-Control-Expose-Headers', 'X-Subject-Token, X-Auth-Token');

    // Risposta alle richieste OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Solo POST è permesso per il proxy
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
        return;
    }

    // Leggi il body della richiesta
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const proxyRequest = JSON.parse(body);
            const { url: targetUrl, method, headers, body: requestBody } = proxyRequest;

            if (!targetUrl) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing target URL' }));
                return;
            }

            console.log(`[${new Date().toISOString()}] ${method || 'GET'} ${targetUrl}`);

            // Effettua la richiesta al servizio OpenStack
            const parsedUrl = url.parse(targetUrl);
            const isHttps = parsedUrl.protocol === 'https:';
            const httpModule = isHttps ? https : http;

            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.path,
                method: method || 'GET',
                headers: headers || {},
                rejectUnauthorized: false // Accetta certificati autofirmati
            };

            const proxyReq = httpModule.request(options, (proxyRes) => {
                let responseData = '';
                const isJson = proxyRes.headers['content-type']?.includes('application/json');
                const isBinary = proxyRes.headers['content-type']?.includes('application/octet-stream') ||
                                proxyRes.headers['content-type']?.includes('image/');

                // Per i dati binari, usa buffer
                if (isBinary) {
                    const chunks = [];
                    proxyRes.on('data', chunk => {
                        chunks.push(chunk);
                    });

                    proxyRes.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        const base64Data = buffer.toString('base64');

                        const response = {
                            status: proxyRes.statusCode,
                            headers: proxyRes.headers,
                            bodyBase64: base64Data
                        };

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                } else {
                    // Per JSON e testo
                    proxyRes.on('data', chunk => {
                        responseData += chunk.toString();
                    });

                    proxyRes.on('end', () => {
                        let responseBody;
                        try {
                            responseBody = isJson ? JSON.parse(responseData) : responseData;
                        } catch (e) {
                            responseBody = responseData;
                        }

                        const response = {
                            status: proxyRes.statusCode,
                            headers: proxyRes.headers,
                            body: responseBody
                        };

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                }
            });

            proxyReq.on('error', (error) => {
                console.error('Proxy request error:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Proxy request failed',
                    message: error.message
                }));
            });

            // Invia il body se presente
            if (requestBody) {
                if (typeof requestBody === 'string') {
                    proxyReq.write(requestBody);
                } else {
                    proxyReq.write(JSON.stringify(requestBody));
                }
            }

            proxyReq.end();

        } catch (error) {
            console.error('Error processing request:', error.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Invalid request',
                message: error.message
            }));
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n✅ Proxy server in esecuzione su http://localhost:${PORT}`);
    console.log(`   Endpoint proxy: http://localhost:${PORT}/proxy\n`);
    console.log('Per usare il proxy:');
    console.log('1. Modifica config.js e imposta USE_PROXY = true');
    console.log('2. Imposta PROXY_URL = \'http://localhost:' + PORT + '/proxy\'\n');
    console.log('Premi Ctrl+C per fermare il server.\n');
});

// Gestione errori del server
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Errore: La porta ${PORT} è già in uso.`);
        console.error('   Prova a usare una porta diversa: PORT=3001 node proxy-server.js\n');
    } else {
        console.error('\n❌ Errore del server:', error.message, '\n');
    }
    process.exit(1);
});

// Gestione shutdown graceful
process.on('SIGINT', () => {
    console.log('\n\n👋 Arresto del proxy server...');
    server.close(() => {
        console.log('✅ Server fermato correttamente.\n');
        process.exit(0);
    });
});
